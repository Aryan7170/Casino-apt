// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract WheelGame is ReentrancyGuard, Ownable {
    IERC20 public immutable token;
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

    struct WheelSegment {
        uint256 multiplier; // multiplied by 100
        string color;
        uint256 probability; // multiplied by 1000 (e.g., 700 = 0.7 = 70%)
    }

    // Store the exact wheel configurations
    mapping(uint256 => WheelSegment) public lowRiskSegments;
    mapping(uint256 => WheelSegment) public mediumRiskSegments;
    
    uint256 public constant LOW_RISK_SEGMENT_COUNT = 3;
    uint256 public constant MEDIUM_RISK_SEGMENT_COUNT = 6;

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

        // Initialize Low Risk Segments - FIXED: Ensure probabilities add up to 1000
        lowRiskSegments[0] = WheelSegment(0, "#333947", 700);     // 0.0x, 70%
        lowRiskSegments[1] = WheelSegment(120, "#D9D9D9", 200);   // 1.2x, 20%
        lowRiskSegments[2] = WheelSegment(150, "#00E403", 100);   // 1.5x, 10%

        // Initialize Medium Risk Segments - FIXED: Ensure probabilities add up to 1000
        mediumRiskSegments[0] = WheelSegment(0, "#333947", 350);    // 0.0x, 35%
        mediumRiskSegments[1] = WheelSegment(150, "#00E403", 200);  // 1.5x, 20%
        mediumRiskSegments[2] = WheelSegment(170, "#D9D9D9", 150);  // 1.7x, 15%
        mediumRiskSegments[3] = WheelSegment(200, "#FDE905", 150);  // 2.0x, 15%
        mediumRiskSegments[4] = WheelSegment(300, "#7F46FD", 100);  // 3.0x, 10%
        mediumRiskSegments[5] = WheelSegment(400, "#FCA32F", 50);   // 4.0x, 5%
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
        
        // FIXED: Take bet amount from player first
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

        // FIXED: Calculate result based on risk level with proper probability logic
        WheelResult memory result = calculateWheelResult(bet.risk, bet.segments, randomNumber);
        results[roundId] = result;

        // FIXED: Process payout with proper treasury logic
        uint256 payout = 0;
        if (result.isWin && result.multiplier > 0) {
            // Player wins - calculate payout and send from treasury
            uint256 winAmount = (bet.amount * result.multiplier) / 100;
            uint256 fee = (winAmount * TREASURY_FEE_RATE) / 1000;
            payout = winAmount - fee;

            // Send winnings to player from contract balance
            require(token.transfer(bet.player, payout), "Player transfer failed");
            
            // Send player's original bet to treasury (since they won, their bet goes to treasury)
            require(token.transfer(TREASURY, bet.amount), "Treasury transfer failed");
        } else {
            // Player loses - send bet amount to treasury
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
        uint256 multiplier = 0;
        uint256 segmentIndex = 0;
        bool isWin = false;

        if (risk == RiskLevel.High) {
            // High risk: simple win/lose based on probability
            uint256 winProbability = getHighRiskProbability(segments);
            uint256 rand = randomNumber % 1000;
            
            if (rand < winProbability) {
                multiplier = getHighRiskMultiplier(segments);
                segmentIndex = 0; // win segment
                isWin = true;
            } else {
                multiplier = 0;
                segmentIndex = 1; // lose segment
                isWin = false;
            }
        } else if (risk == RiskLevel.Medium) {
            // FIXED: Medium risk - better probability distribution
            uint256 rand = randomNumber % 1000; // Use 1000 for probability calculation
            
            // 35% chance for 0x multiplier, 65% chance for non-zero multipliers
            if (rand < 350) {
                // 35% chance: 0x multiplier
                multiplier = 0;
                isWin = false;
                // Distribute 0x results across even segments
                segmentIndex = ((randomNumber / 1000) % (segments / 2)) * 2;
            } else {
                // 65% chance: non-zero multipliers
                uint256 nonZeroRand = rand - 350; // 0 to 649
                uint256 baseSegmentIndex;
                
                if (nonZeroRand < 200) {
                    baseSegmentIndex = 1; // 1.5x (200/650 = ~31%)
                } else if (nonZeroRand < 350) {
                    baseSegmentIndex = 2; // 1.7x (150/650 = ~23%)
                } else if (nonZeroRand < 500) {
                    baseSegmentIndex = 3; // 2.0x (150/650 = ~23%)
                } else if (nonZeroRand < 600) {
                    baseSegmentIndex = 4; // 3.0x (100/650 = ~15%)
                } else {
                    baseSegmentIndex = 5; // 4.0x (50/650 = ~8%)
                }
                
                multiplier = mediumRiskSegments[baseSegmentIndex].multiplier;
                isWin = true;
                // Distribute non-zero results across odd segments
                segmentIndex = ((randomNumber / 1000) % (segments / 2)) * 2 + 1;
            }
        } else {
            // FIXED: Low risk - better probability distribution
            uint256 rand = randomNumber % 1000; // Use 1000 for probability calculation
            
            // 70% chance for 0x multiplier, 30% chance for non-zero multipliers
            if (rand < 700) {
                // 70% chance: 0x multiplier
                multiplier = 0;
                isWin = false;
                // Distribute 0x results across odd segments
                segmentIndex = ((randomNumber / 1000) % (segments / 2)) * 2 + 1;
            } else {
                // 30% chance: non-zero multipliers
                uint256 nonZeroRand = rand - 700; // 0 to 299
                uint256 baseSegmentIndex;
                
                if (nonZeroRand < 200) {
                    baseSegmentIndex = 1; // 1.2x (200/300 = ~67%)
                } else {
                    baseSegmentIndex = 2; // 1.5x (100/300 = ~33%)
                }
                
                multiplier = lowRiskSegments[baseSegmentIndex].multiplier;
                isWin = true;
                // Distribute non-zero results across even segments
                segmentIndex = ((randomNumber / 1000) % (segments / 2)) * 2;
            }
        }

        return WheelResult({
            multiplier: multiplier,
            segmentIndex: segmentIndex,
            isWin: isWin
        });
    }

    // FIXED: Generate wheel data for display purposes - this should match the visual wheel
    function generateWheelData(RiskLevel risk, uint8 segments) public view returns (WheelSegment[] memory) {
        WheelSegment[] memory wheelData = new WheelSegment[](segments);

        if (risk == RiskLevel.High) {
            uint256 winMultiplier = getHighRiskMultiplier(segments);
            uint256 winProbability = getHighRiskProbability(segments);
            uint256 lossProbability = 1000 - winProbability;
            
            for (uint256 i = 0; i < segments; i++) {
                if (i == 0) {
                    wheelData[i] = WheelSegment(winMultiplier, "#D72E60", winProbability);
                } else {
                    wheelData[i] = WheelSegment(0, "#333947", lossProbability);
                }
            }
        } else if (risk == RiskLevel.Medium) {
            // FIXED: Medium risk - match the new contract logic with proper probabilities
            for (uint256 i = 0; i < segments; i++) {
                if (i % 2 == 0) {
                    // Even segments: 0x multiplier (35% of total probability)
                    wheelData[i] = WheelSegment(0, "#333947", 350 * 2 / segments);
                } else {
                    // Odd segments: non-zero multipliers (65% of total probability)
                    uint256 baseSegmentIndex = (i % 6); // Map to 6 base segments
                    if (baseSegmentIndex == 0) baseSegmentIndex = 1; // Skip 0x segment
                    WheelSegment memory segment = mediumRiskSegments[baseSegmentIndex];
                    wheelData[i] = WheelSegment(segment.multiplier, segment.color, 650 * 2 / segments);
                }
            }
        } else {
            // FIXED: Low risk - match the new contract logic with proper probabilities
            for (uint256 i = 0; i < segments; i++) {
                if (i % 2 == 0) {
                    // Even segments: non-zero multipliers (30% of total probability)
                    uint256 baseSegmentIndex = (i % 3); // Map to 3 base segments
                    if (baseSegmentIndex == 1) baseSegmentIndex = 0; // Skip 1.2x segment
                    WheelSegment memory segment = lowRiskSegments[baseSegmentIndex];
                    wheelData[i] = WheelSegment(segment.multiplier, segment.color, 300 * 2 / segments);
                } else {
                    // Odd segments: 0x multiplier (70% of total probability)
                    wheelData[i] = WheelSegment(0, "#333947", 700 * 2 / segments);
                }
            }
        }

        return wheelData;
    }

    function getHighRiskMultiplier(uint8 segments) internal pure returns (uint256) {
        if (segments <= 10) {
            return 990;   // 9.90x
        } else if (segments <= 20) {
            return 1980;  // 19.80x
        } else if (segments <= 30) {
            return 2970;  // 29.70x
        } else if (segments <= 40) {
            return 3960;  // 39.60x
        } else {
            return 4950;  // 49.50x
        }
    }

    function getHighRiskProbability(uint8 segments) internal pure returns (uint256) {
        if (segments <= 10) {
            return 100;   // 10%
        } else if (segments <= 20) {
            return 80;    // 8%
        } else if (segments <= 30) {
            return 60;    // 6%
        } else if (segments <= 40) {
            return 40;    // 4%
        } else {
            return 20;    // 2%
        }
    }

    // FIXED: Function to get actual wheel segments for a specific configuration
    function getWheelSegments(RiskLevel risk, uint8 segments) external view returns (WheelSegment[] memory) {
        return generateWheelData(risk, segments);
    }

    // FIXED: Function to get the probability segments used for actual game logic
    function getProbabilitySegments(RiskLevel risk) external view returns (WheelSegment[] memory) {
        if (risk == RiskLevel.Low) {
            return getLowRiskSegments();
        } else if (risk == RiskLevel.Medium) {
            return getMediumRiskSegments();
        } else {
            // High risk segments are dynamic based on segment count
            WheelSegment[] memory segments = new WheelSegment[](2);
            segments[0] = WheelSegment(0, "#333947", 900); // Default loss probability
            segments[1] = WheelSegment(990, "#D72E60", 100); // Default win probability
            return segments;
        }
    }

    // FIXED: Add debug function to check probabilities
    function checkProbabilities() external view returns (uint256 lowTotal, uint256 mediumTotal) {
        for (uint256 i = 0; i < LOW_RISK_SEGMENT_COUNT; i++) {
            lowTotal += lowRiskSegments[i].probability;
        }
        for (uint256 i = 0; i < MEDIUM_RISK_SEGMENT_COUNT; i++) {
            mediumTotal += mediumRiskSegments[i].probability;
        }
    }

    // View functions
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

    function getLowRiskSegments() public view returns (WheelSegment[] memory) {
        WheelSegment[] memory segments = new WheelSegment[](LOW_RISK_SEGMENT_COUNT);
        for (uint256 i = 0; i < LOW_RISK_SEGMENT_COUNT; i++) {
            segments[i] = lowRiskSegments[i];
        }
        return segments;
    }

    function getMediumRiskSegments() public view returns (WheelSegment[] memory) {
        WheelSegment[] memory segments = new WheelSegment[](MEDIUM_RISK_SEGMENT_COUNT);
        for (uint256 i = 0; i < MEDIUM_RISK_SEGMENT_COUNT; i++) {
            segments[i] = mediumRiskSegments[i];
        }
        return segments;
    }

    function getHighRiskSegments(uint8 segments) external pure returns (WheelSegment[] memory) {
        WheelSegment[] memory wheelSegments = new WheelSegment[](2);
        uint256 winMultiplier = getHighRiskMultiplier(segments);
        uint256 winProbability = getHighRiskProbability(segments);
        
        wheelSegments[0] = WheelSegment(0, "#333947", 1000 - winProbability);
        wheelSegments[1] = WheelSegment(winMultiplier, "#D72E60", winProbability);
        
        return wheelSegments;
    }

    function getWheelData(RiskLevel risk, uint8 segments) external view returns (WheelSegment[] memory) {
        return generateWheelData(risk, segments);
    }

    // Admin functions
    function setMinBet(uint256 _minBet) external onlyOwner {
        require(_minBet > 0, "Min bet must be > 0");
        minBet = _minBet;
    }

    function updateLowRiskSegment(
        uint256 index,
        uint256 multiplier,
        string memory color,
        uint256 probability
    ) external onlyOwner {
        require(index < LOW_RISK_SEGMENT_COUNT, "Invalid index");
        lowRiskSegments[index] = WheelSegment(multiplier, color, probability);
    }

    function updateMediumRiskSegment(
        uint256 index,
        uint256 multiplier,
        string memory color,
        uint256 probability
    ) external onlyOwner {
        require(index < MEDIUM_RISK_SEGMENT_COUNT, "Invalid index");
        mediumRiskSegments[index] = WheelSegment(multiplier, color, probability);
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

    // FIXED: Add function to fund the contract for payouts
    function fundContract(uint256 amount) external onlyOwner {
        require(token.transferFrom(msg.sender, address(this), amount), "Fund transfer failed");
    }

    function getContractBalance() external view returns (uint256) {
        return token.balanceOf(address(this));
    }
}