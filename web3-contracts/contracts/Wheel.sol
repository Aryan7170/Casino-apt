// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract WheelGame is ReentrancyGuard, Ownable {
    IERC20 public immutable token;
    uint256 public minBet;
    address public constant TREASURY = 0xFF9582E3898599D2cF0Abdc06321789dc345e529;
    uint256 public constant TREASURY_FEE_RATE = 5;
    uint256 public constant MIN_WAIT_BLOCK = 1;

    uint256 public lastBetBlock;
    uint256 public currentRound;
    address public gameOperator;

    enum RiskLevel { Low, Medium, High }

    struct Bet {
        address player;
        uint256 amount;
        RiskLevel risk;
        uint8 segments;
        uint256 round;
        uint256 blockNumber;
        bool isActive;
        uint256 timestamp;
    }

    struct WheelResult {
        uint256 multiplier;
        uint256 segmentIndex;
        bool isWin;
    }

    mapping(address => uint256) public lastBetTime;
    mapping(uint256 => Bet) public bets;
    mapping(uint256 => WheelResult) public results;
    mapping(uint256 => bool) public roundProcessed;

    event BetPlaced(address indexed player, uint256 indexed round, uint256 amount, RiskLevel risk, uint8 segments);
    event WheelSpun(address indexed player, uint256 indexed round, uint256 multiplier, uint256 segmentIndex, bool isWin, uint256 payout);
    event GameOperatorUpdated(address indexed newOperator);
    event BetRefunded(address indexed player, uint256 indexed round, uint256 amount);

    modifier onlyGameOperator() {
        require(msg.sender == gameOperator, "Only game operator can call this");
        _;
    }

    constructor(
        IERC20 _token,
        address _gameOperator
    ) Ownable(msg.sender) {
        require(address(_token) != address(0), "Invalid token");
        require(_gameOperator != address(0), "Invalid game operator");
        
        token = _token;
        gameOperator = _gameOperator;
        minBet = 1 * 10**18;
        currentRound = 1;
    }

    function updateGameOperator(address _newOperator) external onlyOwner {
        require(_newOperator != address(0), "Invalid operator address");
        gameOperator = _newOperator;
        emit GameOperatorUpdated(_newOperator);
    }

    function placeBet(RiskLevel risk, uint8 segments, uint256 amount) external nonReentrant {
        require(segments >= 10 && segments <= 50 && segments % 10 == 0, "Invalid segments count");
        require(amount >= minBet, "Bet amount too low");
        require(token.allowance(msg.sender, address(this)) >= amount, "Insufficient allowance");
        require(block.timestamp - lastBetTime[msg.sender] >= 3, "Wait 3 seconds");
        require(block.number > lastBetBlock + MIN_WAIT_BLOCK, "Wait 1 block");
        
        uint256 maxPayout = _calculateMaxPayout(amount, risk, segments);
        require(token.balanceOf(address(this)) >= maxPayout, "Contract insufficient balance");
        
        require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        bets[currentRound] = Bet({
            player: msg.sender,
            amount: amount,
            risk: risk,
            segments: segments,
            round: currentRound,
            blockNumber: block.number,
            isActive: true,
            timestamp: block.timestamp
        });
        
        lastBetTime[msg.sender] = block.timestamp;
        lastBetBlock = block.number;

        emit BetPlaced(msg.sender, currentRound, amount, risk, segments);
        currentRound++;
    }

    function processResult(uint256 round, uint256 frontendMultiplier) external onlyGameOperator nonReentrant {
        Bet storage bet = bets[round];
        require(bet.isActive, "Bet is not active");
        require(bet.player != address(0), "Invalid bet");
        require(!roundProcessed[round], "Round already processed");
        
        require(_isValidMultiplier(frontendMultiplier, bet.risk, bet.segments), "Invalid multiplier for risk/segments");

        roundProcessed[round] = true;
        bet.isActive = false;

        WheelResult memory result = WheelResult({
            multiplier: frontendMultiplier,
            segmentIndex: 0,
            isWin: frontendMultiplier > 0
        });

        results[round] = result;

        uint256 payout = 0;
        if (result.isWin && result.multiplier > 0) {
            uint256 winAmount = (bet.amount * result.multiplier) / 100;
            uint256 fee = (winAmount * TREASURY_FEE_RATE) / 1000;
            payout = winAmount - fee;
            
            require(token.transfer(bet.player, payout), "Payout failed");
            require(token.transfer(TREASURY, fee), "Treasury fee transfer failed");
        } else {
            require(token.transfer(TREASURY, bet.amount), "Loss transfer failed");
        }

        emit WheelSpun(bet.player, round, result.multiplier, 0, result.isWin, payout);
    }

    function _isValidMultiplier(uint256 multiplier, RiskLevel risk, uint8 segments) internal pure returns (bool) {
        if (multiplier == 0) return true;
        
        if (risk == RiskLevel.Low) {
            return multiplier == 120 || multiplier == 150;
        } else if (risk == RiskLevel.Medium) {
            return multiplier == 150 || multiplier == 170 || multiplier == 200 || multiplier == 300 || multiplier == 400;
        } else {
            uint256 expectedMultiplier = _getHighRiskMultiplier(segments);
            // Allow for small rounding errors (±1)
            return multiplier >= expectedMultiplier - 1 && multiplier <= expectedMultiplier + 1;
        }
    }

    function _getHighRiskMultiplier(uint8 segments) internal pure returns (uint256) {
        if (segments <= 10) return 990;
        if (segments <= 20) return 1980;
        if (segments <= 30) return 2970;
        if (segments <= 40) return 3960;
        return 4950;
    }

    function _calculateMaxPayout(uint256 amount, RiskLevel risk, uint8 segments) internal pure returns (uint256) {
        uint256 maxMultiplier;
        if (risk == RiskLevel.Low) {
            maxMultiplier = 150;
        } else if (risk == RiskLevel.Medium) {
            maxMultiplier = 400;
        } else {
            maxMultiplier = _getHighRiskMultiplier(segments);
        }
        return (amount * maxMultiplier) / 100;
    }

    function emergencyRefund(uint256 round) external onlyOwner {
        Bet storage bet = bets[round];
        require(bet.isActive, "Bet is not active");
        require(bet.player != address(0), "Invalid bet");
        
        bet.isActive = false;
        roundProcessed[round] = true;
        
        require(token.transfer(bet.player, bet.amount), "Refund failed");
        emit BetRefunded(bet.player, round, bet.amount);
    }

    function emergencyWithdraw(address _token, uint256 _amount) external onlyOwner {
        IERC20(_token).transfer(owner(), _amount);
    }

    function depositForPayouts(uint256 _amount) external {
        require(token.transferFrom(msg.sender, address(this), _amount), "Deposit failed");
    }

    function updateMinBet(uint256 _minBet) external onlyOwner {
        minBet = _minBet;
    }

    // View functions
    function getContractBalance() external view returns (uint256) {
        return token.balanceOf(address(this));
    }

    function checkUserAllowance(address user) public view returns (uint256) {
        return token.allowance(user, address(this));
    }

    function getBet(uint256 round) external view returns (Bet memory) {
        return bets[round];
    }

    function getResult(uint256 round) external view returns (WheelResult memory) {
        return results[round];
    }

    function isRoundProcessed(uint256 round) external view returns (bool) {
        return roundProcessed[round];
    }

    function getGameOperator() external view returns (address) {
        return gameOperator;
    }

    function getValidMultipliers(RiskLevel risk, uint8 segments) external pure returns (uint256[] memory) {
        if (risk == RiskLevel.Low) {
            uint256[] memory lowMultipliers = new uint256[](3);
            lowMultipliers[0] = 0;
            lowMultipliers[1] = 120;
            lowMultipliers[2] = 150;
            return lowMultipliers;
        } else if (risk == RiskLevel.Medium) {
            uint256[] memory mediumMultipliers = new uint256[](6);
            mediumMultipliers[0] = 0;
            mediumMultipliers[1] = 150;
            mediumMultipliers[2] = 170;
            mediumMultipliers[3] = 200;
            mediumMultipliers[4] = 300;
            mediumMultipliers[5] = 400;
            return mediumMultipliers;
        } else {
            uint256[] memory highMultipliers = new uint256[](2);
            highMultipliers[0] = 0;
            highMultipliers[1] = _getHighRiskMultiplier(segments);
            return highMultipliers;
        }
    }

    // Add the missing getWheelData function that your frontend is calling
    function getWheelData(uint8 risk, uint8 segments) external pure returns (
        uint256[] memory multipliers,
        string[] memory colors,
        uint256[] memory probabilities
    ) {
        require(segments >= 10 && segments <= 50 && segments % 10 == 0, "Invalid segments count");
        require(risk <= 2, "Invalid risk level");
        
        RiskLevel riskLevel = RiskLevel(risk);
        multipliers = new uint256[](segments);
        colors = new string[](segments);
        probabilities = new uint256[](segments);
        
        // Define colors array
        string[6] memory colorPalette = ["#00E403", "#D9D9D9", "#FDE905", "#7F46FD", "#FCA32F", "#D72E60"];
        string memory lossColor = "#333947";
        
        for (uint256 i = 0; i < segments; i++) {
            if (i % 2 == 0) { // Even segments are winning segments
                if (riskLevel == RiskLevel.Low) {
                    multipliers[i] = (i % 4 == 0) ? 120 : 150; // Alternate between 1.2x and 1.5x
                } else if (riskLevel == RiskLevel.Medium) {
                    // Distribute medium risk multipliers
                    uint256 pattern = i % 10;
                    if (pattern == 0) multipliers[i] = 400; // 4.0x
                    else if (pattern == 2) multipliers[i] = 300; // 3.0x
                    else if (pattern == 4) multipliers[i] = 200; // 2.0x
                    else if (pattern == 6) multipliers[i] = 170; // 1.7x
                    else multipliers[i] = 150; // 1.5x
                } else { // High risk
                    multipliers[i] = _getHighRiskMultiplier(segments);
                }
                colors[i] = colorPalette[i % 6];
                probabilities[i] = 50; // 50% probability for winning segments
            } else { // Odd segments are losing segments
                multipliers[i] = 0;
                colors[i] = lossColor;
                probabilities[i] = 50; // 50% probability for losing segments
            }
        }
        
        return (multipliers, colors, probabilities);
    }
}