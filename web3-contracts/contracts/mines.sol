// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";

/**
 * @title Mines Game Contract with Advanced Treasury Protection
 * @notice A provably fair Mines game with comprehensive risk management
 * @dev Implements multiple layers of protection: payout caps, daily limits, circuit breakers, and insurance pools
 */
contract SecureMines is ReentrancyGuard, Ownable, Pausable, ERC2771Context {
    using Math for uint256;

    // ============ STATE VARIABLES ============

    // Token and Treasury
    IERC20 public immutable token;
    address public treasury;
    
    // Game Constants
    uint256 public constant MAX_MINES = 24;
    uint256 public constant GRID_SIZE = 25;
    uint256 public constant MIN_WAIT_BLOCKS = 1;
    
    // Fee Structure (basis points - 10000 = 100%)
    uint256 public constant TREASURY_FEE_RATE = 50;    // 0.5%
    uint256 public constant INSURANCE_FEE_RATE = 30;   // 0.3%
    uint256 public constant TOTAL_FEE_RATE = 80;       // 0.8%
    
    // Risk Management Parameters
    uint256 public maxPayoutMultiplier = 1000;         // 1000x maximum payout
    uint256 public treasuryRiskPercentage = 5;         // 5% of treasury per game
    uint256 public dailyPayoutLimit = 10000 * 10**18;  // 10K tokens daily
    uint256 public emergencyReserveRate = 10;          // 10% emergency reserve
    uint256 public circuitBreakerThreshold = 50;       // 50% payout triggers breaker
    
    // Betting Limits
    uint256 public minBet = 1 * 10**18;               // 1 token minimum
    uint256 public maxBet = 1000 * 10**18;            // 1000 tokens global max
    
    // Game State
    uint256 public nonce;
    uint256 public lastBetBlock;
    
    // Financial Tracking
    uint256 public insurancePool;
    uint256 public totalBetsPlaced;
    uint256 public totalPayouts;
    uint256 public dailyPayoutUsed;
    uint256 public lastDayReset;
    
    // Risk Management
    mapping(uint8 => uint256) public maxBetForMines;
    mapping(address => uint256) public dailyWinnings;
    mapping(address => uint256) public lastWinningsReset;
    mapping(address => uint256) public playerTotalWinnings;
    mapping(address => uint256) public playerTotalBets;
    
    // Circuit Breaker
    bool public circuitBreakerActive;
    uint256 public hourlyPayoutUsed;
    uint256 public lastHourReset;
    
    // VIP System
    mapping(address => bool) public vipPlayers;
    uint256 public vipMultiplierBonus = 10; // 1% bonus for VIP players

    // ============ STRUCTS ============

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
        uint256 maxPossiblePayout;
        uint256 seed; // Store seed for transparency
    }

    struct RiskMetrics {
        uint256 currentTreasuryBalance;
        uint256 availableForPayout;
        uint256 dailyLimitRemaining;
        uint256 hourlyLimitRemaining;
        uint256 emergencyReserve;
        bool circuitBreakerTriggered;
    }

    // ============ MAPPINGS ============

    mapping(address => Game) public games;
    mapping(address => uint256) public lastBetTime;
    mapping(address => uint256) public consecutiveWins;
    mapping(address => uint256) public consecutiveLosses;

    // ============ EVENTS ============

    // Game Events
    event GameStarted(
        address indexed player, 
        uint256 betAmount, 
        uint8 mines, 
        uint256 maxPayout, 
        uint256 seed
    );
    event TileRevealed(
        address indexed player, 
        uint8 tile, 
        bool isMine, 
        uint256 revealedCount, 
        uint256 currentMultiplier
    );
    event CashedOut(
        address indexed player, 
        uint256 payout, 
        uint256 revealedCount, 
        uint256 multiplier
    );
    event GameLost(address indexed player, uint256 betAmount, uint8 revealedCount);
    event GameReset(address indexed player, string reason);

    // Risk Management Events
    event RiskParametersUpdated(
        uint256 maxPayoutMultiplier,
        uint256 treasuryRiskPercentage,
        uint256 dailyPayoutLimit
    );
    event CircuitBreakerTriggered(string reason, uint256 triggerAmount);
    event CircuitBreakerReset(address indexed admin);
    event PayoutCapped(address indexed player, uint256 originalAmount, uint256 cappedAmount);
    event InsurancePoolUsed(uint256 amount, string reason);
    event TreasuryRefilled(uint256 amount, address indexed refiller);

    // Financial Events
    event TreasuryDeposit(address indexed player, uint256 amount);
    event InsurancePoolFunded(uint256 amount, address indexed contributor);
    event FeesCollected(uint256 treasuryFee, uint256 insuranceFee);
    event VIPStatusUpdated(address indexed player, bool isVIP);

    // ============ MODIFIERS ============

    modifier validGame() {
        Game storage game = games[msg.sender];
        require(game.active && !game.finished, "No active game");
        _;
    }

    modifier circuitBreakerCheck() {
        require(!circuitBreakerActive, "Circuit breaker active");
        _checkCircuitBreaker();
        _;
    }

    modifier riskValidation() {
        _resetTimePeriods();
        _;
    }

    // ============ CONSTRUCTOR ============

    constructor(
        IERC20 _token,
        address _treasury,
        address _initialOwner,
        address _trustedForwarder
    ) Ownable(_initialOwner) ERC2771Context(_trustedForwarder) {
        require(address(_token) != address(0), "Invalid token address");
        require(_treasury != address(0), "Invalid treasury address");
        
        token = _token;
        treasury = _treasury;
        lastDayReset = block.timestamp;
        lastHourReset = block.timestamp;
        
        _initializeRiskParameters();
    }

    // ============ MAIN GAME FUNCTIONS ============

    /**
     * @notice Start a new Mines game
     * @param mines Number of mines to place (1-24)
     * @param betAmount Amount to bet in tokens
     */
    function startGame(uint8 mines, uint256 betAmount) 
        external 
        nonReentrant 
        whenNotPaused 
        riskValidation 
        circuitBreakerCheck 
    {
        // Input validation
        require(mines > 0 && mines <= MAX_MINES, "Invalid mine count");
        require(betAmount >= minBet, "Bet below minimum");
        require(betAmount <= maxBet, "Bet exceeds global maximum");
        require(betAmount <= maxBetForMines[mines], "Bet exceeds limit for mine count");
        require(block.number > lastBetBlock + MIN_WAIT_BLOCKS, "Must wait between bets");
        
        // Game state validation
        Game storage existingGame = games[msg.sender];
        require(!existingGame.active, "Finish current game first");
        
        // Financial validation
        require(token.balanceOf(msg.sender) >= betAmount, "Insufficient balance");
        require(token.allowance(msg.sender, address(this)) >= betAmount, "Insufficient allowance");
        
        // Risk assessment
        uint256 maxPossiblePayout = _calculateMaxPossiblePayout(betAmount, mines);
        require(_canTreasuryHandlePayout(maxPossiblePayout), "Treasury cannot handle potential payout");
        require(dailyPayoutUsed + maxPossiblePayout <= dailyPayoutLimit, "Would exceed daily limit");
        require(hourlyPayoutUsed + maxPossiblePayout <= dailyPayoutLimit / 24, "Would exceed hourly limit");
        
        // Transfer bet amount
        require(token.transferFrom(msg.sender, address(this), betAmount), "Transfer failed");
        
        // Generate secure randomness
        uint256 seed = _generateSecureRandomness();
        
        // Create minefield
        bool[] memory minefield = _createMinefield(mines, seed);
        bool[] memory revealed = new bool[](GRID_SIZE);
        
        // Create game
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
            lastActionBlock: block.number,
            maxPossiblePayout: maxPossiblePayout,
            seed: seed
        });
        
        // Update tracking
        lastBetTime[msg.sender] = block.timestamp;
        lastBetBlock = block.number;
        nonce++;
        totalBetsPlaced += betAmount;
        playerTotalBets[msg.sender] += betAmount;
        
        // Fund insurance pool
        uint256 insuranceContribution = (betAmount * INSURANCE_FEE_RATE) / 10000;
        insurancePool += insuranceContribution;
        
        emit GameStarted(msg.sender, betAmount, mines, maxPossiblePayout, seed);
        emit InsurancePoolFunded(insuranceContribution, msg.sender);
    }

    /**
     * @notice Reveal a tile in the current game
     * @param tile Tile index to reveal (0-24)
     */
    function revealTile(uint8 tile) 
        external 
        nonReentrant 
        whenNotPaused 
        validGame 
        circuitBreakerCheck 
    {
        Game storage game = games[msg.sender];
        require(tile < GRID_SIZE, "Invalid tile index");
        require(!game.revealed[tile], "Tile already revealed");
        
        // Reveal tile
        game.revealed[tile] = true;
        game.revealedCount++;
        game.lastActionBlock = block.number;
        
        if (game.minefield[tile]) {
            // Hit mine - game over
            _processGameLoss(game);
        } else {
            // Safe tile revealed
            uint256 currentMultiplier = _calculateCurrentMultiplier(game.betAmount, game.mines, game.revealedCount);
            
            // Check if all safe tiles revealed
            uint8 maxRevealable = uint8(GRID_SIZE) - game.mines;
            if (game.revealedCount == maxRevealable) {
                _processAutoCashout(game);
            }
            
            emit TileRevealed(msg.sender, tile, false, game.revealedCount, currentMultiplier);
        }
    }

    /**
     * @notice Cash out current game
     */
    function cashOut() 
        external 
        nonReentrant 
        whenNotPaused 
        validGame 
        circuitBreakerCheck 
    {
        Game storage game = games[msg.sender];
        require(game.revealedCount > 0, "Must reveal at least one tile");
        
        _processCashout(game);
    }

    /**
     * @notice Reset/abandon current game (forfeit bet)
     */
    function resetGame() external nonReentrant whenNotPaused validGame {
        Game storage game = games[msg.sender];
        
        // Transfer bet to treasury
        require(token.transfer(treasury, game.betAmount), "Treasury transfer failed");
        
        // Reset game state
        game.active = false;
        game.finished = true;
        
        // Update tracking
        totalBetsPlaced += game.betAmount;
        consecutiveLosses[msg.sender]++;
        consecutiveWins[msg.sender] = 0;
        
        emit GameReset(msg.sender, "Player reset");
        emit TreasuryDeposit(msg.sender, game.betAmount);
    }

    // ============ INTERNAL GAME LOGIC ============

    function _processGameLoss(Game storage game) internal {
        game.active = false;
        game.finished = true;
        
        // Send bet to treasury
        require(token.transfer(treasury, game.betAmount), "Treasury transfer failed");
        
        // Update player stats
        consecutiveLosses[game.player]++;
        consecutiveWins[game.player] = 0;
        
        emit TileRevealed(game.player, type(uint8).max, true, game.revealedCount, 0);
        emit GameLost(game.player, game.betAmount, game.revealedCount);
        emit TreasuryDeposit(game.player, game.betAmount);
    }

    function _processAutoCashout(Game storage game) internal {
        _processCashout(game);
    }

    function _processCashout(Game storage game) internal {
        // Calculate payout
        uint256 rawPayout = calculatePayout(game.betAmount, game.mines, game.revealedCount);
        
        // Apply VIP bonus if applicable
        if (vipPlayers[game.player]) {
            rawPayout = (rawPayout * (10000 + vipMultiplierBonus)) / 10000;
        }
        
        // Apply caps and get final payout
        uint256 finalPayout = _applyPayoutCaps(rawPayout, game.betAmount, game.player);
        
        // Calculate fees
        uint256 treasuryFee = (finalPayout * TREASURY_FEE_RATE) / 10000;
        uint256 insuranceFee = (finalPayout * INSURANCE_FEE_RATE) / 10000;
        uint256 playerPayout = finalPayout - treasuryFee - insuranceFee;
        
        // Update game state
        game.active = false;
        game.finished = true;
        
        // Verify treasury can pay
        if (!_verifyTreasuryPayout(playerPayout + treasuryFee + insuranceFee)) {
            _handleInsufficientTreasury(game, playerPayout);
            return;
        }
        
        // Process payments
        require(token.transferFrom(treasury, game.player, playerPayout), "Payout transfer failed");
        
        if (treasuryFee > 0) {
            require(token.transferFrom(treasury, address(this), treasuryFee), "Treasury fee failed");
        }
        
        if (insuranceFee > 0) {
            insurancePool += insuranceFee;
            require(token.transferFrom(treasury, address(this), insuranceFee), "Insurance fee failed");
        }
        
        // Update tracking
        _updatePayoutTracking(game.player, playerPayout);
        
        // Update player stats
        consecutiveWins[game.player]++;
        consecutiveLosses[game.player] = 0;
        
        emit CashedOut(game.player, playerPayout, game.revealedCount, finalPayout * 1e18 / game.betAmount);
        emit FeesCollected(treasuryFee, insuranceFee);
        
        if (rawPayout > finalPayout) {
            emit PayoutCapped(game.player, rawPayout, finalPayout);
        }
    }

    function _handleInsufficientTreasury(Game storage game, uint256 requiredPayout) internal {
        // Try to use insurance pool
        if (insurancePool >= requiredPayout) {
            insurancePool -= requiredPayout;
            require(token.transfer(game.player, requiredPayout), "Insurance payout failed");
            emit InsurancePoolUsed(requiredPayout, "Treasury insufficient");
        } else {
            // Emergency refund
            require(token.transfer(game.player, game.betAmount), "Emergency refund failed");
            emit GameReset(game.player, "Emergency refund - insufficient funds");
        }
    }

    // ============ PAYOUT CALCULATIONS ============

    /**
     * @notice Calculate payout for given parameters
     * @param betAmount Original bet amount
     * @param mines Number of mines in game
     * @param revealedCount Number of safe tiles revealed
     * @return Calculated payout amount
     */
    function calculatePayout(uint256 betAmount, uint8 mines, uint8 revealedCount) 
        public 
        pure 
        returns (uint256) 
    {
        require(revealedCount > 0, "Must reveal at least one tile");
        require(revealedCount <= GRID_SIZE - mines, "Cannot reveal more than safe tiles");
        
        uint256 multiplier = 1e18;
        uint256 safeTiles = GRID_SIZE - mines;
        
        // Calculate multiplier based on probability
        for (uint8 i = 0; i < revealedCount; i++) {
            multiplier = (multiplier * safeTiles) / (safeTiles - i);
        }
        
        return (betAmount * multiplier) / 1e18;
    }

    function _calculateCurrentMultiplier(uint256 betAmount, uint8 mines, uint8 revealedCount) 
        internal 
        pure 
        returns (uint256) 
    {
        if (revealedCount == 0) return 1e18;
        uint256 payout = calculatePayout(betAmount, mines, revealedCount);
        return (payout * 1e18) / betAmount;
    }

    function _calculateMaxPossiblePayout(uint256 betAmount, uint8 mines) internal view returns (uint256) {
        uint8 maxRevealable = uint8(GRID_SIZE) - mines;
        uint256 maxRawPayout = calculatePayout(betAmount, mines, maxRevealable);
        return _applyPayoutCaps(maxRawPayout, betAmount, msg.sender);
    }

    function _applyPayoutCaps(uint256 rawPayout, uint256 betAmount, address player) 
        internal 
        view 
        returns (uint256) 
    {
        // Cap 1: Maximum multiplier
        uint256 maxByMultiplier = betAmount * maxPayoutMultiplier;
        
        // Cap 2: Treasury risk percentage
        uint256 treasuryBalance = token.balanceOf(treasury);
        uint256 maxByTreasuryRisk = (treasuryBalance * treasuryRiskPercentage) / 100;
        
        // Cap 3: Daily limit remaining
        uint256 dailyRemaining = dailyPayoutLimit - dailyPayoutUsed;
        
        // Cap 4: Hourly limit remaining
        uint256 hourlyLimit = dailyPayoutLimit / 24;
        uint256 hourlyRemaining = hourlyLimit - hourlyPayoutUsed;
        
        // Cap 5: Player daily limit (anti-whale mechanism)
        uint256 playerDailyLimit = dailyPayoutLimit / 10; // 10% of daily limit per player
        uint256 playerDailyRemaining = playerDailyLimit - dailyWinnings[player];
        
        // Return minimum of all caps
        return Math.min(
            rawPayout,
            Math.min(
                Math.min(maxByMultiplier, maxByTreasuryRisk),
                Math.min(dailyRemaining, Math.min(hourlyRemaining, playerDailyRemaining))
            )
        );
    }

    // ============ RISK MANAGEMENT ============

    function _canTreasuryHandlePayout(uint256 payoutAmount) internal view returns (bool) {
        uint256 treasuryBalance = token.balanceOf(treasury);
        uint256 emergencyReserve = (treasuryBalance * emergencyReserveRate) / 100;
        uint256 availableBalance = treasuryBalance - emergencyReserve;
        
        return availableBalance >= payoutAmount;
    }

    function _verifyTreasuryPayout(uint256 amount) internal view returns (bool) {
        uint256 treasuryBalance = token.balanceOf(treasury);
        uint256 treasuryAllowance = token.allowance(treasury, address(this));
        
        return treasuryBalance >= amount && treasuryAllowance >= amount;
    }

    function _checkCircuitBreaker() internal {
        uint256 treasuryBalance = token.balanceOf(treasury);
        
        // Check hourly payout threshold
        if (hourlyPayoutUsed > (treasuryBalance * circuitBreakerThreshold) / 100) {
            circuitBreakerActive = true;
            emit CircuitBreakerTriggered("Hourly payout threshold exceeded", hourlyPayoutUsed);
        }
        
        // Check rapid succession of large payouts
        if (dailyPayoutUsed > (treasuryBalance * 80) / 100) {
            circuitBreakerActive = true;
            emit CircuitBreakerTriggered("Daily payout approaching treasury limit", dailyPayoutUsed);
        }
    }

    function _updatePayoutTracking(address player, uint256 amount) internal {
        totalPayouts += amount;
        dailyPayoutUsed += amount;
        hourlyPayoutUsed += amount;
        
        // Update player tracking
        if (lastWinningsReset[player] < lastDayReset) {
            dailyWinnings[player] = 0;
            lastWinningsReset[player] = block.timestamp;
        }
        dailyWinnings[player] += amount;
        playerTotalWinnings[player] += amount;
    }

    function _resetTimePeriods() internal {
        // Reset daily limits
        if (block.timestamp >= lastDayReset + 1 days) {
            dailyPayoutUsed = 0;
            lastDayReset = block.timestamp;
        }
        
        // Reset hourly limits
        if (block.timestamp >= lastHourReset + 1 hours) {
            hourlyPayoutUsed = 0;
            lastHourReset = block.timestamp;
        }
    }

    // ============ RANDOMNESS ============

    function _generateSecureRandomness() internal view returns (uint256) {
        return uint256(
            keccak256(
                abi.encodePacked(
                    blockhash(block.number - 1),
                    block.timestamp,
                    block.prevrandao,
                    msg.sender,
                    nonce,
                    tx.gasprice,
                    tx.origin,
                    block.coinbase,
                    gasleft()
                )
            )
        );
    }

    function _createMinefield(uint8 mines, uint256 seed) internal pure returns (bool[] memory) {
        bool[] memory minefield = new bool[](GRID_SIZE);
        uint8 placedMines = 0;
        uint256 attempts = 0;
        uint256 maxAttempts = mines * 20; // Increased attempts for better distribution
        
        while (placedMines < mines && attempts < maxAttempts) {
            uint256 position = uint256(keccak256(abi.encodePacked(seed, placedMines, attempts))) % GRID_SIZE;
            
            if (!minefield[position]) {
                minefield[position] = true;
                placedMines++;
            }
            attempts++;
        }
        
        require(placedMines == mines, "Failed to place all mines");
        return minefield;
    }

    // ============ INITIALIZATION ============

    function _initializeRiskParameters() internal {
        // Set progressive max bets based on mine count
        for (uint8 i = 1; i <= MAX_MINES; i++) {
            if (i <= 3) {
                maxBetForMines[i] = 1000 * 10**18;  // Low risk: 1000 tokens
            } else if (i <= 6) {
                maxBetForMines[i] = 500 * 10**18;   // Medium risk: 500 tokens
            } else if (i <= 12) {
                maxBetForMines[i] = 200 * 10**18;   // High risk: 200 tokens
            } else if (i <= 18) {
                maxBetForMines[i] = 50 * 10**18;    // Very high risk: 50 tokens
            } else {
                maxBetForMines[i] = 10 * 10**18;    // Extreme risk: 10 tokens
            }
        }
    }

    // ============ OWNER FUNCTIONS ============

    function updateRiskParameters(
        uint256 _maxPayoutMultiplier,
        uint256 _treasuryRiskPercentage,
        uint256 _dailyPayoutLimit,
        uint256 _emergencyReserveRate
    ) external onlyOwner {
        require(_maxPayoutMultiplier <= 10000, "Multiplier too high");
        require(_treasuryRiskPercentage <= 25, "Risk percentage too high");
        require(_emergencyReserveRate <= 50, "Emergency reserve too high");
        
        maxPayoutMultiplier = _maxPayoutMultiplier;
        treasuryRiskPercentage = _treasuryRiskPercentage;
        dailyPayoutLimit = _dailyPayoutLimit;
        emergencyReserveRate = _emergencyReserveRate;
        
        emit RiskParametersUpdated(_maxPayoutMultiplier, _treasuryRiskPercentage, _dailyPayoutLimit);
    }

    function updateBettingLimits(uint256 _minBet, uint256 _maxBet) external onlyOwner {
        require(_minBet > 0, "Min bet must be positive");
        require(_maxBet > _minBet, "Max bet must exceed min bet");
        
        minBet = _minBet;
        maxBet = _maxBet;
    }

    function updateMaxBetForMines(uint8 mines, uint256 newMaxBet) external onlyOwner {
        require(mines > 0 && mines <= MAX_MINES, "Invalid mine count");
        require(newMaxBet <= maxBet, "Cannot exceed global max bet");
        
        maxBetForMines[mines] = newMaxBet;
    }

    function updateTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Invalid treasury address");
        treasury = newTreasury;
    }

    function resetCircuitBreaker() external onlyOwner {
        circuitBreakerActive = false;
        emit CircuitBreakerReset(msg.sender);
    }

    function emergencyPause() external onlyOwner {
        _pause();
    }

    function emergencyUnpause() external onlyOwner {
        _unpause();
    }

    function setVIPStatus(address player, bool isVIP) external onlyOwner {
        vipPlayers[player] = isVIP;
        emit VIPStatusUpdated(player, isVIP);
    }

    function updateVIPBonus(uint256 newBonus) external onlyOwner {
        require(newBonus <= 100, "VIP bonus too high"); // Max 10%
        vipMultiplierBonus = newBonus;
    }

    // ============ TREASURY MANAGEMENT ============

    function withdrawInsurancePool(uint256 amount) external onlyOwner {
        require(amount <= insurancePool, "Insufficient insurance pool");
        insurancePool -= amount;
        require(token.transfer(owner(), amount), "Insurance withdrawal failed");
    }

    function refillTreasury(uint256 amount) external onlyOwner {
        require(token.transferFrom(msg.sender, treasury, amount), "Treasury refill failed");
        emit TreasuryRefilled(amount, msg.sender);
    }

    function donateToInsurancePool(uint256 amount) external {
        require(token.transferFrom(msg.sender, address(this), amount), "Donation failed");
        insurancePool += amount;
        emit InsurancePoolFunded(amount, msg.sender);
    }

    // ============ VIEW FUNCTIONS ============

    // Override _msgSender to support meta-transactions
    function _msgSender() internal view override(Context, ERC2771Context) returns (address) {
        return ERC2771Context._msgSender();
    }

    function _msgData() internal view override(Context, ERC2771Context) returns (bytes calldata) {
        return ERC2771Context._msgData();
    }

    function getRiskMetrics() external view returns (RiskMetrics memory) {
        uint256 treasuryBalance = token.balanceOf(treasury);
        uint256 emergencyReserve = (treasuryBalance * emergencyReserveRate) / 100;
        
        return RiskMetrics({
            currentTreasuryBalance: treasuryBalance,
            availableForPayout: treasuryBalance - emergencyReserve,
            dailyLimitRemaining: dailyPayoutLimit - dailyPayoutUsed,
            hourlyLimitRemaining: (dailyPayoutLimit / 24) - hourlyPayoutUsed,
            emergencyReserve: emergencyReserve,
            circuitBreakerTriggered: circuitBreakerActive
        });
    }

    function getPlayerStats(address player) external view returns (
        uint256 totalBets,
        uint256 totalWinnings,
        uint256 dailyWinnings_,
        uint256 consecutiveWins_,
        uint256 consecutiveLosses_,
        bool isVIP
    ) {
        return (
            playerTotalBets[player],
            playerTotalWinnings[player],
            dailyWinnings[player],
            consecutiveWins[player],
            consecutiveLosses[player],
            vipPlayers[player]
        );
    }

    function getGameInfo(address player) external view returns (
        bool hasActiveGame,
        uint256 betAmount,
        uint8 mines,
        uint8 revealedCount,
        uint256 currentMultiplier,
        uint256 maxPossiblePayout,
        bool[] memory revealed
    ) {
        Game storage game = games[player];
        
        if (!game.active) {
            return (false, 0, 0, 0, 0, 0, new bool[](0));
        }
        
        uint256 multiplier = game.revealedCount > 0 
            ? _calculateCurrentMultiplier(game.betAmount, game.mines, game.revealedCount)
            : 1e18;
        
        return (
            game.active,
            game.betAmount,
            game.mines,
            game.revealedCount,
            multiplier,
            game.maxPossiblePayout,
            game.revealed
        );
    }

   function canStartGame(address player, uint8 mines, uint256 betAmount) 
        external 
        view 
        returns (bool canStart, string memory reason) 
    {
        if (paused()) return (false, "Contract is paused");
        if (circuitBreakerActive) return (false, "Circuit breaker active");
        if (mines == 0 || mines > MAX_MINES) return (false, "Invalid mine count");
        if (betAmount < minBet) return (false, "Bet below minimum");
        if (betAmount > maxBet) return (false, "Bet exceeds global max");
        if (betAmount > maxBetForMines[mines]) return (false, "Bet exceeds mine-level max");

        Game storage game = games[player];
        if (game.active) return (false, "Finish current game first");
        if (block.number <= lastBetBlock + MIN_WAIT_BLOCKS) return (false, "Must wait between bets");

        uint256 maxPossiblePayout = _calculateMaxPossiblePayout(betAmount, mines);
        if (!_canTreasuryHandlePayout(maxPossiblePayout)) return (false, "Treasury cannot handle potential payout");

        if (dailyPayoutUsed + maxPossiblePayout > dailyPayoutLimit) return (false, "Daily payout limit exceeded");
        if (hourlyPayoutUsed + maxPossiblePayout > dailyPayoutLimit / 24) return (false, "Hourly payout limit exceeded");

        return (true, "Eligible to start game");
    }
}