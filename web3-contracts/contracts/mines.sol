// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Mines is ReentrancyGuard, Ownable {
    IERC20 public immutable token;
    uint256 public minBet;
    uint256 public maxBet;
    address public constant TREASURY = 0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199;
    uint256 public constant TREASURY_FEE_RATE = 5; // 0.5%
    uint256 public constant MAX_MINES = 24;
    uint256 public constant GRID_SIZE = 25;
    uint256 public constant MIN_WAIT_BLOCK = 1;
    uint256 public nonce;
    uint256 public lastBetBlock;

    bool public emergencyPaused = false;

    struct Game {
        address player;
        uint256 betAmount;
        uint8 mines;
        bool[] minefield;
        bool[] revealed;
        uint8 revealedCount;
        bool active;
        bool finished;
        uint256 createdAt;
        uint256 lastActionBlock;
    }

    mapping(address => Game) public games;
    mapping(address => uint256) public lastBetTime;

    event GameStarted(address indexed player, uint256 betAmount, uint8 mines);
    event TileRevealed(address indexed player, uint8 tile, bool isMine, uint256 revealedCount);
    event CashedOut(address indexed player, uint256 payout, uint256 revealedCount);
    event GameLost(address indexed player, uint256 betAmount, uint8 revealedCount);
    event GameReset(address indexed player);
    event PayoutWarning(string reason, uint256 required, uint256 available);
    event TreasuryDeposit(address indexed player, uint256 amount);

    modifier whenNotPaused() {
        require(!emergencyPaused, "Contract is paused");
        _;
    }

    modifier validGame() {
        Game storage game = games[msg.sender];
        require(game.active && !game.finished, "No active game");
        _;
    }

    constructor(IERC20 _token) Ownable(msg.sender) {
        require(address(_token) != address(0), "Invalid token");
        token = _token;
        minBet = 1 * 10 ** 18;
        maxBet = type(uint256).max;
        nonce = 0;
        lastBetBlock = 0;
    }

    function startGame(uint8 mines, uint256 betAmount) external nonReentrant whenNotPaused {
        require(mines > 0 && mines <= MAX_MINES, "Invalid number of mines");
        require(betAmount >= minBet && betAmount <= maxBet, "Bet out of range");
        require(block.number > lastBetBlock + MIN_WAIT_BLOCK, "Wait at least 1 block");

        Game storage existingGame = games[msg.sender];
        require(!existingGame.active, "Finish previous game first");

        require(token.allowance(msg.sender, address(this)) >= betAmount, "Insufficient allowance");
        require(token.balanceOf(msg.sender) >= betAmount, "Insufficient balance");
        require(token.transferFrom(msg.sender, address(this), betAmount), "Token transfer failed");

        uint256 seed = uint256(
            keccak256(
                abi.encodePacked(
                    blockhash(block.number - 1),
                    block.timestamp,
                    msg.sender,
                    nonce,
                    block.prevrandao,
                    tx.gasprice
                )
            )
        );
        nonce++;
        lastBetBlock = block.number;

        bool[] memory minefield = new bool[](GRID_SIZE);
        uint8 placedMines = 0;
        uint256 attempts = 0;
        uint256 maxAttempts = mines * 10;

        while (placedMines < mines && attempts < maxAttempts) {
            uint8 pos = uint8(uint256(keccak256(abi.encodePacked(seed, placedMines, attempts))) % GRID_SIZE);
            if (!minefield[pos]) {
                minefield[pos] = true;
                placedMines++;
            }
            attempts++;
        }
        require(placedMines == mines, "Mine placement failed");

        bool[] memory revealed = new bool[](GRID_SIZE);

        games[msg.sender] = Game({
            player: msg.sender,
            betAmount: betAmount,
            mines: mines,
            minefield: minefield,
            revealed: revealed,
            revealedCount: 0,
            active: true,
            finished: false,
            createdAt: block.timestamp,
            lastActionBlock: block.number
        });

        lastBetTime[msg.sender] = block.timestamp;
        emit GameStarted(msg.sender, betAmount, mines);
    }

    function revealTile(uint8 tile) external nonReentrant whenNotPaused validGame {
        Game storage game = games[msg.sender];
        require(tile < GRID_SIZE, "Invalid tile");
        require(!game.revealed[tile], "Tile already revealed");

        game.revealed[tile] = true;
        game.revealedCount++;
        game.lastActionBlock = block.number;

        if (game.minefield[tile]) {
            game.active = false;
            game.finished = true;
            require(token.transfer(TREASURY, game.betAmount), "Treasury transfer failed");
            emit TileRevealed(msg.sender, tile, true, game.revealedCount);
            emit GameLost(msg.sender, game.betAmount, game.revealedCount);
            emit TreasuryDeposit(msg.sender, game.betAmount);
        } else {
            uint8 maxRevealable = uint8(GRID_SIZE) - game.mines;
            if (game.revealedCount == maxRevealable) {
                _processCashOut(game);
            }
            emit TileRevealed(msg.sender, tile, false, game.revealedCount);
        }
    }

    function cashOut() external nonReentrant whenNotPaused validGame {
        Game storage game = games[msg.sender];
        require(game.revealedCount > 0, "Reveal at least one tile");
        _processCashOut(game);
    }

    function _processCashOut(Game storage game) internal {
        uint256 payout = calculatePayout(game.betAmount, game.mines, game.revealedCount);
        uint256 fee = (payout * TREASURY_FEE_RATE) / 1000;
        uint256 toPlayer = payout - fee;

        game.active = false;
        game.finished = true;

        uint256 allowance = token.allowance(TREASURY, address(this));
        uint256 balance = token.balanceOf(TREASURY);

        if (allowance < toPlayer + fee) {
            emit PayoutWarning("Insufficient allowance", toPlayer + fee, allowance);
        }
        if (balance < toPlayer + fee) {
            emit PayoutWarning("Insufficient balance", toPlayer + fee, balance);
        }

        if (allowance < toPlayer + fee || balance < toPlayer + fee) {
            require(token.transfer(game.player, game.betAmount), "Refund failed");
            emit PayoutWarning("Bet refunded due to insufficient treasury", game.betAmount, balance);
            return;
        }

        require(token.transferFrom(TREASURY, msg.sender, toPlayer), "Payout failed");

        if (fee > 0) {
            require(token.transferFrom(TREASURY, address(this), fee), "Fee transfer failed");
        }

        emit CashedOut(msg.sender, toPlayer, game.revealedCount);
    }

    function calculatePayout(uint256 betAmount, uint8 mines, uint8 revealedCount) public pure returns (uint256) {
        require(revealedCount > 0 && revealedCount <= GRID_SIZE - mines, "Invalid revealed count");

        uint256 multiplier = 1e18;
        uint256 safe = GRID_SIZE - mines;

        for (uint8 i = 0; i < revealedCount; i++) {
            multiplier = (multiplier * (safe - i)) / (GRID_SIZE - i);
        }

        multiplier = (1e18 * 1e18) / multiplier;
        return (betAmount * multiplier) / 1e18;
    }

    function getContractBalance() external view returns (uint256) {
        return token.balanceOf(address(this));
    }

    function getPlayerGame(address player) external view returns (
        address playerAddress,
        uint256 betAmount,
        uint8 mines,
        bool[] memory minefield,
        bool[] memory revealed,
        uint8 revealedCount,
        bool active,
        bool finished,
        uint256 createdAt,
        uint256 lastActionBlock
    ) {
        Game storage game = games[player];
        return (
            game.player,
            game.betAmount,
            game.mines,
            game.minefield,
            game.revealed,
            game.revealedCount,
            game.active,
            game.finished,
            game.createdAt,
            game.lastActionBlock
        );
    }
} 
