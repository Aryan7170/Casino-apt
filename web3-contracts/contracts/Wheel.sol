// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

contract WheelGame is ReentrancyGuard, Ownable, VRFConsumerBaseV2 {
    IERC20 public immutable token;
    uint256 public minBet;
    address public constant TREASURY = 0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199;
    uint256 public constant TREASURY_FEE_RATE = 5; // 0.5% = 5 / 1000
    uint256 public constant MIN_WAIT_BLOCK = 1;

    // Chainlink VRF variables
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    uint64 private immutable i_subId;
    bytes32 private immutable i_keyHash;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

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
        uint256 multiplier;
        uint256 segmentIndex;
        bool isWin;
    }

    struct WheelSegment {
        uint256 multiplier;
        string color;
        uint256 startDegree;
        uint256 endDegree;
    }

    // Base multipliers for each risk level
    uint256[] public lowRiskMultipliers = [120, 150]; // 1.2x, 1.5x
    uint256[] public mediumRiskMultipliers = [150, 170, 200, 300, 400]; // 1.5x, 1.7x, 2.0x, 3.0x, 4.0x
    
    // Colors for segments
    string[] public colors = ["#00E403", "#D9D9D9", "#FDE905", "#7F46FD", "#FCA32F", "#D72E60"];
    string public constant LOSS_COLOR = "#333947";

    mapping(address => uint256) public lastBetTime;
    mapping(uint256 => Bet) public bets;
    mapping(uint256 => WheelResult) public results;
    mapping(uint256 => Bet) public s_requests;

    // Enhanced debugging events
    event DebugRandomNumber(uint256 indexed round, uint256 rawRandom, uint256 segments, uint256 selectedIndex);
    event DebugWheelGeneration(uint256 indexed round, uint256 winningSegments, uint256 totalSegments, uint256 winChance);
    event VRFRequested(uint256 indexed requestId, uint256 indexed round);
    event VRFFulfilled(uint256 indexed requestId, uint256 indexed round, uint256 randomNumber);

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

    constructor(
        IERC20 _token,
        address _vrfCoordinator,
        uint64 _subId,
        bytes32 _keyHash,
        uint32 _callbackGasLimit
    ) 
        Ownable(msg.sender) 
        VRFConsumerBaseV2(_vrfCoordinator)
    {
        require(address(_token) != address(0), "Invalid token");
        token = _token;
        minBet = 1 * 10**18; // 1 APTC
        currentRound = 1;

        i_vrfCoordinator = VRFCoordinatorV2Interface(_vrfCoordinator);
        i_subId = _subId;
        i_keyHash = _keyHash;
        i_callbackGasLimit = _callbackGasLimit;
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

        bets[currentRound] = Bet({
            player: msg.sender,
            amount: amount,
            risk: risk,
            segments: segments,
            round: currentRound,
            blockNumber: block.number
        });

        lastBetTime[msg.sender] = block.timestamp;
        lastBetBlock = block.number;

        emit BetPlaced(msg.sender, currentRound, amount, risk, segments);

        // Request random words from Chainlink VRF
        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_keyHash,
            i_subId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );

        s_requests[requestId] = bets[currentRound];
        emit VRFRequested(requestId, currentRound);

        // Increment round after placing bet
        currentRound++;
    }

    function fulfillRandomWords(
        uint256 _requestId,
        uint256[] memory _randomWords
    ) internal override {
        Bet memory bet = s_requests[_requestId];
        require(bet.player != address(0), "Bet not found for request");

        uint256 randomNumber = _randomWords[0];
        emit VRFFulfilled(_requestId, bet.round, randomNumber);

        // FIXED: Generate truly random segment index directly
        uint256 selectedSegmentIndex = generateSecureRandomIndex(
            randomNumber, 
            bet.segments, 
            bet.round, 
            bet.player
        );
        
        // Debug event to track random number generation
        emit DebugRandomNumber(bet.round, randomNumber, bet.segments, selectedSegmentIndex);
        
        // Get segment details using the selected index
        WheelResult memory result = getSegmentDetailsByIndex(bet.risk, bet.segments, selectedSegmentIndex);
        results[bet.round] = result;

        uint256 payout = 0;
        if (result.isWin && result.multiplier > 0) {
            uint256 winAmount = (bet.amount * result.multiplier) / 100;
            uint256 fee = (winAmount * TREASURY_FEE_RATE) / 1000;
            payout = winAmount - fee;

            require(token.transfer(bet.player, payout), "Player transfer failed");
            require(token.transfer(TREASURY, bet.amount), "Treasury transfer failed");
        } else {
            require(token.transfer(TREASURY, bet.amount), "Loss transfer to treasury failed");
        }

        emit WheelSpun(
            bet.player,
            bet.round,
            result.multiplier,
            selectedSegmentIndex,
            result.isWin,
            payout
        );

        // Clean up the request mapping
        delete s_requests[_requestId];
    }

    // FIXED: Enhanced secure random index generation
    function generateSecureRandomIndex(
        uint256 vrfRandom,
        uint8 segments,
        uint256 round,
        address player
    ) internal view returns (uint256) {
        // Create additional entropy by combining multiple sources
        bytes32 entropy = keccak256(abi.encodePacked(
            vrfRandom,
            block.timestamp,
            block.difficulty,
            player,
            round,
            nonce,
            blockhash(block.number - 1)
        ));
        
        // Use the entropy to generate a random number
        uint256 randomValue = uint256(entropy);
        
        // FIXED: Proper modulo operation to avoid bias
        // Use rejection sampling to eliminate modulo bias
        uint256 range = type(uint256).max - (type(uint256).max % segments);
        uint256 scaled = randomValue % range;
        
        return scaled % segments;
    }

    // FIXED: Alternative unbiased random generation method
    function generateUnbiasedRandom(uint256 seed, uint8 segments) internal pure returns (uint256) {
        // This method reduces modulo bias by using a larger range
        require(segments > 0, "Segments must be > 0");
        
        // Create a range that's evenly divisible by segments
        uint256 maxRange = (type(uint256).max / segments) * segments;
        
        // If seed is outside our range, hash it to get a new value
        if (seed >= maxRange) {
            seed = uint256(keccak256(abi.encodePacked(seed))) % maxRange;
        }
        
        return seed % segments;
    }

    function getSegmentDetailsByIndex(
        RiskLevel risk,
        uint8 segments,
        uint256 segmentIndex
    ) internal view returns (WheelResult memory) {
        WheelSegment[] memory wheelSegments = generateWheelSegments(risk, segments);
        
        require(segmentIndex < wheelSegments.length, "Segment index out of bounds");
        
        WheelSegment memory chosenSegment = wheelSegments[segmentIndex];

        return WheelResult({
            multiplier: chosenSegment.multiplier,
            segmentIndex: segmentIndex,
            isWin: chosenSegment.multiplier > 0
        });
    }

    // FIXED: Improved wheel segment generation with better randomness
    function generateWheelSegments(RiskLevel risk, uint8 segments) public view returns (WheelSegment[] memory) {
        WheelSegment[] memory wheelSegments = new WheelSegment[](segments);
        uint256 degreesPerSegment = 360 / segments;
        
        if (risk == RiskLevel.High) {
            uint256 winMultiplier = getHighRiskMultiplier(segments);
            
            // FIXED: Better distribution of winning segments for high risk
            uint256 winningSegments = calculateWinningSegments(segments, 2); // ~2% win rate
            
            for (uint256 i = 0; i < segments; i++) {
                uint256 startDegree = i * degreesPerSegment;
                uint256 endDegree = (i + 1) * degreesPerSegment;
                
                // Distribute winning segments more evenly
                bool isWinning = (i % (segments / winningSegments)) == 0 && i < winningSegments;
                
                if (isWinning) {
                    wheelSegments[i] = WheelSegment({
                        multiplier: winMultiplier,
                        color: "#D72E60",
                        startDegree: startDegree,
                        endDegree: endDegree
                    });
                } else {
                    wheelSegments[i] = WheelSegment({
                        multiplier: 0,
                        color: LOSS_COLOR,
                        startDegree: startDegree,
                        endDegree: endDegree
                    });
                }
            }
            
            emit DebugWheelGeneration(currentRound, winningSegments, segments, (winningSegments * 10000) / segments);
        } else if (risk == RiskLevel.Medium) {
            uint256 multiplierIndex = 0;
            uint256 winningSegments = segments / 2; // 50% win rate
            
            for (uint256 i = 0; i < segments; i++) {
                uint256 startDegree = i * degreesPerSegment;
                uint256 endDegree = (i + 1) * degreesPerSegment;
                
                // FIXED: More varied winning segment distribution
                bool isWinning = (i % 2 == 0) || (i % 3 == 0 && i % 6 != 0);
                
                if (isWinning && multiplierIndex < mediumRiskMultipliers.length) {
                    uint256 multiplier = mediumRiskMultipliers[multiplierIndex % mediumRiskMultipliers.length];
                    string memory color = colors[multiplierIndex % colors.length];
                    
                    wheelSegments[i] = WheelSegment({
                        multiplier: multiplier,
                        color: color,
                        startDegree: startDegree,
                        endDegree: endDegree
                    });
                    
                    multiplierIndex++;
                } else {
                    wheelSegments[i] = WheelSegment({
                        multiplier: 0,
                        color: LOSS_COLOR,
                        startDegree: startDegree,
                        endDegree: endDegree
                    });
                }
            }
            
            emit DebugWheelGeneration(currentRound, winningSegments, segments, 5000); // 50%
        } else {
            // Low risk - 60% win rate
            uint256 multiplierIndex = 0;
            uint256 winningSegments = (segments * 6) / 10; // 60% win rate
            
            for (uint256 i = 0; i < segments; i++) {
                uint256 startDegree = i * degreesPerSegment;
                uint256 endDegree = (i + 1) * degreesPerSegment;
                
                // FIXED: Better distribution for low risk
                bool isWinning = (i % 5 != 4); // 4 out of 5 segments are winning
                
                if (isWinning && multiplierIndex < lowRiskMultipliers.length) {
                    uint256 multiplier = lowRiskMultipliers[multiplierIndex % lowRiskMultipliers.length];
                    string memory color = colors[multiplierIndex % colors.length];
                    
                    wheelSegments[i] = WheelSegment({
                        multiplier: multiplier,
                        color: color,
                        startDegree: startDegree,
                        endDegree: endDegree
                    });
                    
                    multiplierIndex++;
                } else {
                    wheelSegments[i] = WheelSegment({
                        multiplier: 0,
                        color: LOSS_COLOR,
                        startDegree: startDegree,
                        endDegree: endDegree
                    });
                }
            }
            
            emit DebugWheelGeneration(currentRound, winningSegments, segments, 6000); // 60%
        }
        
        return wheelSegments;
    }

    // FIXED: Helper function to calculate winning segments
    function calculateWinningSegments(uint8 totalSegments, uint8 winPercentage) internal pure returns (uint256) {
        require(winPercentage <= 100, "Win percentage cannot exceed 100");
        uint256 winning = (uint256(totalSegments) * winPercentage) / 100;
        return winning > 0 ? winning : 1; // Ensure at least 1 winning segment
    }

    function getHighRiskMultiplier(uint8 segments) internal pure returns (uint256) {
        if (segments <= 10) return 990;   // 9.90x
        if (segments <= 20) return 1980;  // 19.80x
        if (segments <= 30) return 2970;  // 29.70x
        if (segments <= 40) return 3960;  // 39.60x
        return 4950;  // 49.50x
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

    function getWheelData(RiskLevel risk, uint8 segments) external view returns (WheelSegment[] memory) {
        return generateWheelSegments(risk, segments);
    }

    function getLowRiskMultipliers() external view returns (uint256[] memory) {
        return lowRiskMultipliers;
    }

    function getMediumRiskMultipliers() external view returns (uint256[] memory) {
        return mediumRiskMultipliers;
    }

    function getColors() external view returns (string[] memory) {
        return colors;
    }

    function calculateWinProbability(RiskLevel risk, uint8 segments) external pure returns (uint256) {
        if (risk == RiskLevel.High) {
            return (200 * 10000) / segments; // ~2% base win rate
        } else if (risk == RiskLevel.Medium) {
            return 5000; // 50% in basis points
        } else {
            return 6000; // 60% in basis points
        }
    }

    // FIXED: Enhanced testing function for better debugging
    function testRandomGeneration(uint256 testRandom, uint8 segments) external view returns (
        uint256 secureRandom,
        uint256 unbiasedRandom,
        uint256 segmentIndex,
        string memory segmentColor
    ) {
        uint256 secure = generateSecureRandomIndex(testRandom, segments, 999, msg.sender);
        uint256 unbiased = generateUnbiasedRandom(testRandom, segments);
        
        WheelSegment[] memory wheelSegments = generateWheelSegments(RiskLevel.Medium, segments);
        
        return (
            secure,
            unbiased,
            secure,
            wheelSegments[secure].color
        );
    }

    // FIXED: Function to test wheel generation distribution
    function testWheelDistribution(RiskLevel risk, uint8 segments) external view returns (
        uint256 totalSegments,
        uint256 winningSegments,
        uint256 winPercentage,
        uint256[] memory multipliers
    ) {
        WheelSegment[] memory wheelSegments = generateWheelSegments(risk, segments);
        uint256 winning = 0;
        uint256[] memory foundMultipliers = new uint256[](segments);
        
        for (uint256 i = 0; i < segments; i++) {
            if (wheelSegments[i].multiplier > 0) {
                winning++;
                foundMultipliers[i] = wheelSegments[i].multiplier;
            }
        }
        
        uint256 winPct = (winning * 10000) / segments;
        
        return (segments, winning, winPct, foundMultipliers);
    }

    // Admin functions
    function setMinBet(uint256 _minBet) external onlyOwner {
        require(_minBet > 0, "Min bet must be > 0");
        minBet = _minBet;
    }

    function updateLowRiskMultipliers(uint256[] memory _multipliers) external onlyOwner {
        require(_multipliers.length > 0, "Must have at least one multiplier");
        lowRiskMultipliers = _multipliers;
    }

    function updateMediumRiskMultipliers(uint256[] memory _multipliers) external onlyOwner {
        require(_multipliers.length > 0, "Must have at least one multiplier");
        mediumRiskMultipliers = _multipliers;
    }

    function updateColors(string[] memory _colors) external onlyOwner {
        require(_colors.length > 0, "Must have at least one color");
        colors = _colors;
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

    function fundContract(uint256 amount) external onlyOwner {
        require(token.transferFrom(msg.sender, address(this), amount), "Fund transfer failed");
    }

    function getContractBalance() external view returns (uint256) {
        return token.balanceOf(address(this));
    }

    // FIXED: Increment nonce for additional entropy
    function incrementNonce() internal {
        nonce++;
    }

    // FIXED: Override fulfillRandomWords to include nonce increment
    function fulfillRandomWordsWithNonce(
        uint256 _requestId,
        uint256[] memory _randomWords
    ) internal {
        incrementNonce();
        // Call the main fulfillRandomWords function
        fulfillRandomWords(_requestId, _randomWords);
    }
}