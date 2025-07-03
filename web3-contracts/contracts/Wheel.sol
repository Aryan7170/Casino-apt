// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract WheelGame is ReentrancyGuard, Ownable {
    IERC20 public immutable token;
    uint256 public minBet;
    address public constant TREASURY = 0xFfbfce3f171911044b6D91d700548AEd9A662420;
    uint256 public constant TREASURY_FEE_RATE = 5;
    uint256 public constant MIN_WAIT_BLOCK = 1;

    uint256 public nonce;
    uint256 public lastBetBlock;
    uint256 public currentRound;

    enum RiskLevel {
        Low,
        Medium,
        High
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
        uint256 multiplier;
        uint256 segmentIndex;
        bool isWin;
    }

    struct LowRiskConfig {
        uint256[3] multipliers;
        uint256[3] probabilities;
    }

    struct MediumRiskConfig {
        uint256[6] multipliers;
        uint256[6] probabilities;
    }

    struct HighRiskConfig {
        uint256 lossMultiplier;
        uint256 winMultiplier;
        uint256 winProbability;
    }

    LowRiskConfig private lowRiskConfig;
    MediumRiskConfig private mediumRiskConfig;

    mapping(address => uint256) public lastBetTime;
    mapping(uint256 => Bet) public bets;
    mapping(uint256 => WheelResult) public results;

    event BetPlaced(address indexed player, uint256 indexed round, uint256 amount, RiskLevel risk, uint8 segments);
    event WheelSpun(address indexed player, uint256 indexed round, uint256 multiplier, uint256 segmentIndex, bool isWin, uint256 payout);
    event RequestAllowance(address indexed player, uint256 amount);
    event DebugLog(string message, address player, uint256 amount, uint8 segments, uint256 allowance, uint256 balance, uint256 minBet, uint256 timeSinceLastBet, uint256 blockNumber, uint256 lastBetBlock);

    constructor(IERC20 _token) Ownable(msg.sender) {
        require(address(_token) != address(0), "Invalid token");
        token = _token;
        minBet = 1 * 10**18;
        currentRound = 1;

        lowRiskConfig.multipliers = [120, 0, 150];
        lowRiskConfig.probabilities = [20, 70, 10];

        mediumRiskConfig.multipliers = [150, 0, 170, 0, 200, 0];
        mediumRiskConfig.probabilities = [20, 35, 15, 0, 15, 15];
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

    function placeBet(RiskLevel risk, uint8 segments, uint256 amount) external nonReentrant hasEnoughBalance(amount) {
        uint256 balance = token.balanceOf(msg.sender);
        uint256 minBet_ = minBet;
        uint256 currentAllowance = token.allowance(msg.sender, address(this));
        uint256 timeSinceLastBet = block.timestamp - lastBetTime[msg.sender];

        emit DebugLog("Before segments check", msg.sender, amount, segments, currentAllowance, balance, minBet_, timeSinceLastBet, block.number, lastBetBlock);
        require(segments >= 10 && segments <= 50 && segments % 10 == 0, "Invalid segments count");
        require(currentAllowance >= amount, "Insufficient allowance");
        require(timeSinceLastBet >= 3 seconds, "Must wait 3 seconds between bets");
        require(block.number > lastBetBlock + MIN_WAIT_BLOCK, "Must wait at least 1 block between bets");
        require(token.transferFrom(msg.sender, address(this), amount), "Token transfer failed");

        bets[currentRound] = Bet({ player: msg.sender, amount: amount, risk: risk, segments: segments, round: currentRound, blockNumber: block.number });

        lastBetTime[msg.sender] = block.timestamp;
        emit BetPlaced(msg.sender, currentRound, amount, risk, segments);

        spinWheel(currentRound);
        currentRound++;
    }

    function spinWheel(uint256 roundId) internal {
        require(block.number > lastBetBlock + MIN_WAIT_BLOCK, "Wait at least 1 block");
        Bet memory bet = bets[roundId];
        require(bet.player != address(0), "Invalid bet");

        uint256 randomNumber = uint256(keccak256(abi.encodePacked(blockhash(block.number - 1), block.timestamp, bet.player, nonce, block.prevrandao, roundId)));

        nonce++;
        lastBetBlock = block.number;

        WheelResult memory result = calculateWheelResult(bet.risk, bet.segments, randomNumber);
        results[roundId] = result;

        uint256 payout = 0;
        if (result.isWin && result.multiplier > 0) {
            uint256 winAmount = (bet.amount * result.multiplier) / 100;
            uint256 fee = (winAmount * TREASURY_FEE_RATE) / 1000;
            payout = winAmount - fee;

            require(token.transfer(bet.player, payout), "Player transfer failed");
            require(token.transfer(TREASURY, fee), "Treasury fee transfer failed");
        } else {
            require(token.transfer(TREASURY, bet.amount), "Loss transfer to treasury failed");
        }

        emit WheelSpun(bet.player, roundId, result.multiplier, result.segmentIndex, result.isWin, payout);
    }

    function calculateWheelResult(RiskLevel risk, uint8 segments, uint256 randomNumber) internal view returns (WheelResult memory) {
        uint256 segmentIndex = randomNumber % segments;

        if (risk == RiskLevel.Low) {
            return calculateSegmentResultWithZeros(toDynamicArray(lowRiskConfig.multipliers), toDynamicArray(lowRiskConfig.probabilities), segments, segmentIndex);
        } else if (risk == RiskLevel.Medium) {
            return calculateSegmentResultWithZeros(toDynamicArray(mediumRiskConfig.multipliers), toDynamicArray(mediumRiskConfig.probabilities), segments, segmentIndex);
        } else {
            return calculateHighRiskResult(segments, randomNumber, segmentIndex);
        }
    }

    function calculateSegmentResultWithZeros(
        uint256[] memory multipliers,
        uint256[] memory probabilities,
        uint8 segments,
        uint256 segmentIndex
    ) internal pure returns (WheelResult memory) {
        uint256[] memory segmentMultipliers = new uint256[](segments);
        uint256 totalProb = 0;
        for (uint256 i = 0; i < probabilities.length; i++) {
            totalProb += probabilities[i];
        }

        uint256 idx = 0;
        for (uint256 i = 0; i < multipliers.length && idx + 1 <= segments; i++) {
            uint256 count = (segments * probabilities[i]) / totalProb;
            for (uint256 j = 0; j < count && idx + 1 <= segments; j += 2) {
                segmentMultipliers[idx++] = multipliers[i];
                if (idx < segments) segmentMultipliers[idx++] = 0;
            }
        }

        while (idx < segments) {
            segmentMultipliers[idx++] = 0;
        }

        uint256 multiplier = segmentMultipliers[segmentIndex];
        bool isWin = multiplier > 0;
        return WheelResult(multiplier, segmentIndex, isWin);
    }

    function toDynamicArray(uint256[3] memory arr) internal pure returns (uint256[] memory result) {
        result = new uint256[](3);
        for (uint256 i = 0; i < 3; i++) {
            result[i] = arr[i];
        }
    }

    function toDynamicArray(uint256[6] memory arr) internal pure returns (uint256[] memory result) {
        result = new uint256[](6);
        for (uint256 i = 0; i < 6; i++) {
            result[i] = arr[i];
        }
    }

    function calculateHighRiskResult(uint8 segments, uint256 randomNumber, uint256 segmentIndex) internal pure returns (WheelResult memory) {
        HighRiskConfig memory config = getHighRiskConfig(segments);
        uint256 random1000 = randomNumber % 1000;
        if (random1000 < config.winProbability) {
            return WheelResult(config.winMultiplier, segmentIndex, true);
        } else {
            return WheelResult(0, segmentIndex, false);
        }
    }

    function getHighRiskConfig(uint8 segments) internal pure returns (HighRiskConfig memory) {
        if (segments <= 10) return HighRiskConfig(0, 990, 100);
        if (segments <= 20) return HighRiskConfig(0, 1980, 80);
        if (segments <= 30) return HighRiskConfig(0, 2970, 60);
        if (segments <= 40) return HighRiskConfig(0, 3960, 40);
        return HighRiskConfig(0, 4950, 20);
    }

    function getBetInfo(uint256 roundId) external view returns (address, uint256, RiskLevel, uint8, uint256, uint256) {
        Bet memory bet = bets[roundId];
        return (bet.player, bet.amount, bet.risk, bet.segments, bet.round, bet.blockNumber);
    }

    function getResult(uint256 roundId) external view returns (uint256, uint256, bool) {
        WheelResult memory result = results[roundId];
        return (result.multiplier, result.segmentIndex, result.isWin);
    }

    function getLowRiskConfig() external view returns (uint256[3] memory, uint256[3] memory) {
        return (lowRiskConfig.multipliers, lowRiskConfig.probabilities);
    }

    function getMediumRiskConfig() external view returns (uint256[6] memory, uint256[6] memory) {
        return (mediumRiskConfig.multipliers, mediumRiskConfig.probabilities);
    }

    function getHighRiskMultiplier(uint8 segments) external pure returns (uint256, uint256) {
        HighRiskConfig memory config = getHighRiskConfig(segments);
        return (config.winMultiplier, config.winProbability);
    }

    function setMinBet(uint256 _minBet) external onlyOwner {
        require(_minBet > 0, "Min bet must be > 0");
        minBet = _minBet;
    }

    function updateLowRiskConfig(uint256[3] memory multipliers, uint256[3] memory probabilities) external onlyOwner {
        require(probabilities[0] + probabilities[1] + probabilities[2] == 100, "Invalid probabilities");
        lowRiskConfig.multipliers = multipliers;
        lowRiskConfig.probabilities = probabilities;
    }

    function updateMediumRiskConfig(uint256[6] memory multipliers, uint256[6] memory probabilities) external onlyOwner {
        uint256 total = 0;
        for (uint256 i = 0; i < probabilities.length; i++) total += probabilities[i];
        require(total == 100, "Invalid probabilities");
        mediumRiskConfig.multipliers = multipliers;
        mediumRiskConfig.probabilities = probabilities;
    }

    function withdrawTokens(uint256 amount) external onlyOwner {
        require(token.transfer(msg.sender, amount), "Withdraw failed");
    }

    function requestAllowance(uint256 amount) external payable {
        emit RequestAllowance(msg.sender, amount);
    }

    function emergencyWithdraw() external onlyOwner {
        uint256 balance = token.balanceOf(address(this));
        require(token.transfer(msg.sender, balance), "Emergency withdraw failed");
    }
}
