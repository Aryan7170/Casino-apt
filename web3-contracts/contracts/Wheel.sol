// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract WheelGame is ReentrancyGuard, Ownable {
    IERC20 public immutable token; // APTC Token (immutable after deployment)
    uint256 public minBet;
    address public constant TREASURY = 0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199;
    uint256 public constant TREASURY_FEE_RATE = 5; // 0.5% = 5 / 1000
    uint256 public constant MIN_WAIT_BLOCK = 1;

    uint256 public nonce;
    uint256 public lastBetBlock;
    uint256 public currentRound;

    enum RiskLevel {
        Low,    // 0
        Medium, // 1
        High    // 2
    }

    struct Bet {
        address player;
        uint256 amount;
        RiskLevel risk;
        uint8 segments;
        uint256 round;
        uint256 blockNumber;
    }

    struct WheelResult {
        uint256 multiplier; // multiplied by 100 (e.g., 150 = 1.5x)
        uint256 segmentIndex;
        bool isWin;
    }

    // Store multipliers multiplied by 100 to avoid decimals
    // Low Risk: 70% chance 0x, 20% chance 1.2x, 10% chance 1.5x
    struct LowRiskConfig {
        uint256[3] multipliers; // [0, 120, 150]
        uint256[3] probabilities; // [70, 20, 10] (out of 100)
    }

    // Medium Risk: 35% chance 0x, 20% chance 1.5x, 15% chance 1.7x, 15% chance 2.0x, 10% chance 3.0x, 5% chance 4.0x
    struct MediumRiskConfig {
        uint256[6] multipliers; // [0, 150, 170, 200, 300, 400]
        uint256[6] probabilities; // [35, 20, 15, 15, 10, 5] (out of 100)
    }

    // High Risk: Dynamic based on segments
    struct HighRiskConfig {
        uint256 lossMultiplier; // 0
        uint256 winMultiplier; // Dynamic based on segments
        uint256 winProbability; // Dynamic based on segments (out of 1000)
    }

    LowRiskConfig public lowRiskConfig;
    MediumRiskConfig public mediumRiskConfig;

    mapping(address => uint256) public lastBetTime;
    mapping(uint256 => Bet) public bets;
    mapping(uint256 => WheelResult) public results;

    event BetPlaced(
        address indexed player,
        uint256 indexed round,
        uint256 amount,
        RiskLevel risk,
        uint8 segments
    );

    event WheelSpun(
        address indexed player,
        uint256 indexed round,
        uint256 multiplier,
        uint256 segmentIndex,
        bool isWin,
        uint256 payout
    );

    event RequestAllowance(address indexed player, uint256 amount);

    constructor(IERC20 _token) Ownable(msg.sender) {
        require(address(_token) != address(0), "Invalid token");
        token = _token;
        minBet = 1 * 10**18; // 1 APTC
        currentRound = 1;

        // Initialize Low Risk Config
        lowRiskConfig.multipliers = [0, 120, 150]; // 0x, 1.2x, 1.5x
        lowRiskConfig.probabilities = [70, 20, 10]; // 70%, 20%, 10%

        // Initialize Medium Risk Config
        mediumRiskConfig.multipliers = [0, 150, 170, 200, 300, 400]; // 0x, 1.5x, 1.7x, 2.0x, 3.0x, 4.0x
        mediumRiskConfig.probabilities = [35, 20, 15, 15, 10, 5]; // 35%, 20%, 15%, 15%, 10%, 5%
    }

    function checkUserAllowance(address user) public view returns (uint256) {
        return token.allowance(user, address(this));
    }

    modifier hasEnoughBalance(uint256 amount) {
        uint256 balance = token.balanceOf(msg.sender);
        require(balance >= 1 * 10**18, "Must have >= 1 APTC to play");
        require(amount >= minBet, "Below minimum bet");
        require(amount <= balance, "Bet exceeds wallet balance");
        _;
    }

    function placeBet(
        RiskLevel risk,
        uint8 segments,
        uint256 amount
    ) external nonReentrant hasEnoughBalance(amount) {
        require(segments >= 10 && segments <= 50 && segments % 10 == 0, "Invalid segments count");
        
        uint256 currentAllowance = token.allowance(msg.sender, address(this));
        require(currentAllowance >= amount, "Insufficient allowance");
        
        uint256 timeSinceLastBet = block.timestamp - lastBetTime[msg.sender];
        require(timeSinceLastBet >= 3 seconds, "Must wait 3 seconds between bets");
        
        require(block.number > lastBetBlock + MIN_WAIT_BLOCK, "Must wait at least 1 block between bets");
        
        require(token.transferFrom(msg.sender, address(this), amount), "Token transfer failed");

        // Store bet
        bets[currentRound] = Bet({
            player: msg.sender,
            amount: amount,
            risk: risk,
            segments: segments,
            round: currentRound,
            blockNumber: block.number
        });

        lastBetTime[msg.sender] = block.timestamp;

        emit BetPlaced(msg.sender, currentRound, amount, risk, segments);

        // Process the spin immediately
        spinWheel(currentRound);
        
        currentRound++;
    }

    function spinWheel(uint256 roundId) internal {
        require(block.number > lastBetBlock + MIN_WAIT_BLOCK, "Wait at least 1 block");

        Bet memory bet = bets[roundId];
        require(bet.player != address(0), "Invalid bet");

        // Generate random number
        uint256 randomNumber = uint256(
            keccak256(
                abi.encodePacked(
                    blockhash(block.number - 1),
                    block.timestamp,
                    bet.player,
                    nonce,
                    block.prevrandao,
                    roundId
                )
            )
        );

        nonce++;
        lastBetBlock = block.number;

        // Calculate result based on risk level
        WheelResult memory result = calculateWheelResult(bet.risk, bet.segments, randomNumber);
        results[roundId] = result;

        // Process payout
        uint256 payout = 0;
        if (result.isWin && result.multiplier > 0) {
            uint256 winAmount = (bet.amount * result.multiplier) / 100;
            uint256 fee = (winAmount * TREASURY_FEE_RATE) / 1000;
            payout = winAmount - fee;

            require(token.transfer(bet.player, payout), "Player transfer failed");
            require(token.transfer(TREASURY, fee), "Treasury fee transfer failed");
        } else {
            // Loss - tokens already in contract, send to treasury
            require(token.transfer(TREASURY, bet.amount), "Loss transfer to treasury failed");
        }

        emit WheelSpun(
            bet.player,
            roundId,
            result.multiplier,
            result.segmentIndex,
            result.isWin,
            payout
        );
    }

    function calculateWheelResult(
        RiskLevel risk,
        uint8 segments,
        uint256 randomNumber
    ) internal view returns (WheelResult memory) {
        uint256 random100 = randomNumber % 100; // 0-99
        uint256 segmentIndex = randomNumber % segments;

        if (risk == RiskLevel.Low) {
            return calculateLowRiskResult(random100, segmentIndex);
        } else if (risk == RiskLevel.Medium) {
            return calculateMediumRiskResult(random100, segmentIndex);
        } else {
            return calculateHighRiskResult(segments, randomNumber, segmentIndex);
        }
    }

    function calculateLowRiskResult(
        uint256 random100,
        uint256 segmentIndex
    ) internal view returns (WheelResult memory) {
        uint256 cumulative = 0;
        
        for (uint256 i = 0; i < lowRiskConfig.multipliers.length; i++) {
            cumulative += lowRiskConfig.probabilities[i];
            if (random100 < cumulative) {
                bool isWin = lowRiskConfig.multipliers[i] > 0;
                return WheelResult({
                    multiplier: lowRiskConfig.multipliers[i],
                    segmentIndex: segmentIndex,
                    isWin: isWin
                });
            }
        }
        
        // Fallback (should never reach here)
        return WheelResult({
            multiplier: 0,
            segmentIndex: segmentIndex,
            isWin: false
        });
    }

    function calculateMediumRiskResult(
        uint256 random100,
        uint256 segmentIndex
    ) internal view returns (WheelResult memory) {
        uint256 cumulative = 0;
        
        for (uint256 i = 0; i < mediumRiskConfig.multipliers.length; i++) {
            cumulative += mediumRiskConfig.probabilities[i];
            if (random100 < cumulative) {
                bool isWin = mediumRiskConfig.multipliers[i] > 0;
                return WheelResult({
                    multiplier: mediumRiskConfig.multipliers[i],
                    segmentIndex: segmentIndex,
                    isWin: isWin
                });
            }
        }
        
        // Fallback (should never reach here)
        return WheelResult({
            multiplier: 0,
            segmentIndex: segmentIndex,
            isWin: false
        });
    }

    function calculateHighRiskResult(
        uint8 segments,
        uint256 randomNumber,
        uint256 segmentIndex
    ) internal pure returns (WheelResult memory) {
        HighRiskConfig memory config = getHighRiskConfig(segments);
        uint256 random1000 = randomNumber % 1000; // 0-999
        
        if (random1000 < config.winProbability) {
            // Win
            return WheelResult({
                multiplier: config.winMultiplier,
                segmentIndex: segmentIndex,
                isWin: true
            });
        } else {
            // Loss
            return WheelResult({
                multiplier: 0,
                segmentIndex: segmentIndex,
                isWin: false
            });
        }
    }

    function getHighRiskConfig(uint8 segments) internal pure returns (HighRiskConfig memory) {
        if (segments <= 10) {
            return HighRiskConfig({
                lossMultiplier: 0,
                winMultiplier: 990, // 9.90x
                winProbability: 100 // 10%
            });
        } else if (segments <= 20) {
            return HighRiskConfig({
                lossMultiplier: 0,
                winMultiplier: 1980, // 19.80x
                winProbability: 80 // 8%
            });
        } else if (segments <= 30) {
            return HighRiskConfig({
                lossMultiplier: 0,
                winMultiplier: 2970, // 29.70x
                winProbability: 60 // 6%
            });
        } else if (segments <= 40) {
            return HighRiskConfig({
                lossMultiplier: 0,
                winMultiplier: 3960, // 39.60x
                winProbability: 40 // 4%
            });
        } else {
            return HighRiskConfig({
                lossMultiplier: 0,
                winMultiplier: 4950, // 49.50x
                winProbability: 20 // 2%
            });
        }
    }

    // View functions for frontend
    function getBetInfo(uint256 roundId) external view returns (
        address player,
        uint256 amount,
        RiskLevel risk,
        uint8 segments,
        uint256 round,
        uint256 blockNumber
    ) {
        Bet memory bet = bets[roundId];
        return (bet.player, bet.amount, bet.risk, bet.segments, bet.round, bet.blockNumber);
    }

    function getResult(uint256 roundId) external view returns (
        uint256 multiplier,
        uint256 segmentIndex,
        bool isWin
    ) {
        WheelResult memory result = results[roundId];
        return (result.multiplier, result.segmentIndex, result.isWin);
    }

    function getLowRiskConfig() external view returns (
        uint256[3] memory multipliers,
        uint256[3] memory probabilities
    ) {
        return (lowRiskConfig.multipliers, lowRiskConfig.probabilities);
    }

    function getMediumRiskConfig() external view returns (
        uint256[6] memory multipliers,
        uint256[6] memory probabilities
    ) {
        return (mediumRiskConfig.multipliers, mediumRiskConfig.probabilities);
    }

    function getHighRiskMultiplier(uint8 segments) external pure returns (uint256 multiplier, uint256 probability) {
        HighRiskConfig memory config = getHighRiskConfig(segments);
        return (config.winMultiplier, config.winProbability);
    }

    // Admin functions
    function setMinBet(uint256 _minBet) external onlyOwner {
        require(_minBet > 0, "Min bet must be > 0");
        minBet = _minBet;
    }

    function updateLowRiskConfig(
        uint256[3] memory multipliers,
        uint256[3] memory probabilities
    ) external onlyOwner {
        require(probabilities[0] + probabilities[1] + probabilities[2] == 100, "Probabilities must sum to 100");
        lowRiskConfig.multipliers = multipliers;
        lowRiskConfig.probabilities = probabilities;
    }

    function updateMediumRiskConfig(
        uint256[6] memory multipliers,
        uint256[6] memory probabilities
    ) external onlyOwner {
        uint256 sum = 0;
        for (uint256 i = 0; i < probabilities.length; i++) {
            sum += probabilities[i];
        }
        require(sum == 100, "Probabilities must sum to 100");
        mediumRiskConfig.multipliers = multipliers;
        mediumRiskConfig.probabilities = probabilities;
    }

    function withdrawTokens(uint256 amount) external onlyOwner {
        require(token.transfer(msg.sender, amount), "Withdraw failed");
    }

    function requestAllowance(uint256 amount) external payable {
        emit RequestAllowance(msg.sender, amount);
    }

    // Emergency functions
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = token.balanceOf(address(this));
        require(token.transfer(msg.sender, balance), "Emergency withdraw failed");
    }
}