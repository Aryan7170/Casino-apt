// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Roulette is ReentrancyGuard, Ownable {
    IERC20 public immutable token;
    uint256 public minBet;
    uint256 public maxBet;
    address public constant TREASURY = 0xFfbfce3f171911044b6D91d700548AEd9A662420;
    uint256 public constant TREASURY_FEE_RATE = 5; // 0.5%
    uint256 public constant MIN_WAIT_BLOCK = 1;

    uint256 public nonce;
    uint256 public lastBetBlock;
    uint256 public randomResult;
    uint256 public currentRound;

    enum BetType {
        Number, Color, OddEven, HighLow, Dozen, Column,
        Split, Street, Corner, Line
    }

    struct Bet {
        address player;
        uint256 amount;
        BetType betType;
        uint8 betValue;
        uint256[] numbers;
        uint256 round;
    }

    Bet[] public bets;
    mapping(address => uint256) public lastBetTime;

    event BetPlaced(address indexed player, uint256 amount, BetType betType, uint8 betValue, uint256 round);
    event BetResult(address indexed player, uint256 amount, bool won, uint256 winnings, uint256 round);
    event RandomGenerated(uint256 randomNumber, uint256 round);

    constructor(IERC20 _token) Ownable(msg.sender) {
        require(address(_token) != address(0), "Invalid token");
        token = _token;
        minBet = 1 * 10**18;
        maxBet = type(uint256).max;
        nonce = 0;
        lastBetBlock = 0;
        currentRound = 1;
    }

    function placeMultipleBets(
        BetType[] calldata betTypes,
        uint8[] calldata betValues,
        uint256[] calldata amounts,
        uint256[][] calldata betNumbers
    ) external nonReentrant {
        require(
            betTypes.length == betValues.length &&
            betTypes.length == amounts.length &&
            betTypes.length == betNumbers.length,
            "Array length mismatch"
        );

        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            uint256 amt = amounts[i];
            require(amt > 0, "Bet amount must be greater than 0");
            require(amt <= maxBet, "Bet exceeds max limit");
            totalAmount += amt;
        }

        require(totalAmount >= minBet, "Total bet below minimum");

        require(block.number > lastBetBlock + MIN_WAIT_BLOCK, "Wait at least 1 block");
        require(token.allowance(msg.sender, address(this)) >= totalAmount, "Insufficient allowance");
        require(token.balanceOf(msg.sender) >= totalAmount, "Insufficient balance");
        require(token.transferFrom(msg.sender, address(this), totalAmount), "Token transfer failed");

        for (uint256 i = 0; i < betTypes.length; i++) {
            validateBet(betTypes[i], betValues[i], betNumbers[i]);

            bets.push(Bet({
                player: msg.sender,
                amount: amounts[i],
                betType: betTypes[i],
                betValue: betValues[i],
                numbers: betNumbers[i],
                round: currentRound
            }));
            emit BetPlaced(msg.sender, amounts[i], betTypes[i], betValues[i], currentRound);
        }

        lastBetTime[msg.sender] = block.timestamp;
        generateRandomNumber();
        processBets();
    }

    function validateBet(BetType betType, uint8 betValue, uint256[] calldata numbers) internal pure {
        if (betType == BetType.Number) {
            require(betValue <= 36, "Invalid Number betValue");
            require(numbers.length == 0, "Number bets must not include numbers array");
        } else if (
            betType == BetType.Color ||
            betType == BetType.OddEven ||
            betType == BetType.HighLow
        ) {
            require(betValue <= 1, "Invalid betValue for simple type");
            require(numbers.length == 0, "Simple bets must not include numbers");
        } else if (betType == BetType.Dozen || betType == BetType.Column) {
            require(betValue <= 2, "Invalid betValue for Dozen/Column");
            require(numbers.length == 0, "Dozen/Column bets must not include numbers");
        } else if (betType == BetType.Split) {
            require(numbers.length == 2, "Split must have 2 numbers");
            validateNumbers(numbers, 2);
        } else if (betType == BetType.Street) {
            require(numbers.length == 3, "Street must have 3 numbers");
            validateNumbers(numbers, 3);
        } else if (betType == BetType.Corner) {
            require(numbers.length == 4, "Corner must have 4 numbers");
            validateNumbers(numbers, 4);
        } else if (betType == BetType.Line) {
            require(numbers.length == 6, "Line must have 6 numbers");
            validateNumbers(numbers, 6);
        } else {
            revert("Invalid betType");
        }
    }

    function validateNumbers(uint256[] calldata numbers, uint256 count) internal pure {
        require(numbers.length == count, "Incorrect number count");
        for (uint256 i = 0; i < count; i++) {
            require(numbers[i] <= 36, "Invalid number in list");
        }
    }

    function generateRandomNumber() internal {
        require(block.number > lastBetBlock + MIN_WAIT_BLOCK, "Wait at least 1 block");

        uint256 randomNumber = uint256(
            keccak256(
                abi.encodePacked(
                    blockhash(block.number - 1),
                    block.timestamp,
                    msg.sender,
                    nonce,
                    block.prevrandao
                )
            )
        );

        nonce++;
        lastBetBlock = block.number;
        randomResult = randomNumber % 37;
        emit RandomGenerated(randomResult, currentRound);
    }

    function processBets() internal {
        uint256 totalPayout = 0;
        uint256 totalFees = 0;
        uint256 totalLosses = 0;

        address[] memory players = new address[](bets.length);
        uint256[] memory payouts = new uint256[](bets.length);
        uint256 payoutCount = 0;

        for (uint256 i = 0; i < bets.length; i++) {
            Bet memory bet = bets[i];
            if (bet.round != currentRound) continue;

            (bool won, uint256 winnings) = calculateWinnings(bet);
            if (won) {
                uint256 fee = (winnings * TREASURY_FEE_RATE) / 1000;
                uint256 payout = winnings - fee;

                players[payoutCount] = bet.player;
                payouts[payoutCount] = payout;
                payoutCount++;
                
                totalFees += fee;
                emit BetResult(bet.player, bet.amount, true, payout, bet.round);
            } else {
                totalLosses += bet.amount;
                emit BetResult(bet.player, bet.amount, false, 0, bet.round);
            }
        }

        for (uint256 i = 0; i < payoutCount; i++) {
            require(token.transfer(players[i], payouts[i]), "Payout failed");
        }

        uint256 totalToTreasury = totalFees + totalLosses;
        if (totalToTreasury > 0) {
            require(token.transfer(TREASURY, totalToTreasury), "Treasury transfer failed");
        }

        delete bets;
        currentRound++;
    }

    function calculateWinnings(Bet memory bet) internal view returns (bool, uint256) {
        if (bet.betType == BetType.Number && bet.betValue == randomResult) {
            return (true, bet.amount * 36);
        } else if (bet.betType == BetType.Color) {
            bool isRed = isRedNumber(randomResult);
            if ((bet.betValue == 0 && isRed) || (bet.betValue == 1 && !isRed))
                return (true, bet.amount * 2);
        } else if (bet.betType == BetType.OddEven && randomResult != 0) {
            bool isEven = randomResult % 2 == 0;
            if ((bet.betValue == 0 && !isEven) || (bet.betValue == 1 && isEven))
                return (true, bet.amount * 2);
        } else if (bet.betType == BetType.HighLow && randomResult != 0) {
            bool isHigh = randomResult >= 19;
            if ((bet.betValue == 0 && !isHigh) || (bet.betValue == 1 && isHigh))
                return (true, bet.amount * 2);
        } else if (bet.betType == BetType.Dozen && randomResult != 0) {
            uint8 dozen = uint8((randomResult - 1) / 12);
            if (bet.betValue == dozen) return (true, bet.amount * 3);
        } else if (bet.betType == BetType.Column && randomResult != 0) {
            uint8 column = uint8((randomResult - 1) % 3);
            if (bet.betValue == column) return (true, bet.amount * 3);
        } else if (
            (bet.betType == BetType.Split || bet.betType == BetType.Street ||
            bet.betType == BetType.Corner || bet.betType == BetType.Line) &&
            containsNumber(bet.numbers, randomResult)
        ) {
            uint8 multiplier = bet.betType == BetType.Split ? 18 :
                               bet.betType == BetType.Street ? 12 :
                               bet.betType == BetType.Corner ? 9 : 6;
            return (true, bet.amount * multiplier);
        }

        return (false, 0);
    }

    function containsNumber(uint256[] memory numbers, uint256 target) internal pure returns (bool) {
        for (uint256 i = 0; i < numbers.length; i++) {
            if (numbers[i] == target) return true;
        }
        return false;
    }

    function isRedNumber(uint256 number) internal pure returns (bool) {
    uint256[18] memory redNumbers = [
        uint256(1), uint256(3), uint256(5), uint256(7), uint256(9),
        uint256(12), uint256(14), uint256(16), uint256(18), uint256(19),
        uint256(21), uint256(23), uint256(25), uint256(27), uint256(30),
        uint256(32), uint256(34), uint256(36)
    ];
    for (uint256 i = 0; i < redNumbers.length; i++) {
        if (redNumbers[i] == number) return true;
    }
    return false;

    }

    function setMinBet(uint256 _minBet) external onlyOwner {
        require(_minBet > 0, "Min must be > 0");
        minBet = _minBet;
    }

    function setMaxBet(uint256 _maxBet) external onlyOwner {
        require(_maxBet > 0, "Max must be > 0");
        maxBet = _maxBet;
    }

    function withdrawTokens(uint256 amount) external onlyOwner {
        require(token.transfer(msg.sender, amount), "Withdraw failed");
    }
}
