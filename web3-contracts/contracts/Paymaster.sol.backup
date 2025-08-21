// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title GamePaymaster
 * @notice Sponsors gas fees for APT Casino users
 * @dev Allows users to pay gas fees in tokens instead of ETH/native currency
 */
contract GamePaymaster is Ownable, ReentrancyGuard {
    
    IERC20 public immutable paymentToken;
    
    // Gas pricing (how many tokens per unit of gas)
    uint256 public tokenPerGas = 1e12; // 1 token = 1e12 wei of gas
    
    // Limits
    uint256 public maxGasPerTransaction = 500000;
    uint256 public dailyGasLimitPerUser = type(uint256).max; // No daily limit - unlimited gas
    
    // Auto-whitelist settings for new users - now all users get free gas
    bool public autoWhitelistEnabled = true;
    uint256 public newUserFreeGasAmount = type(uint256).max; // Unlimited free gas for all users
    uint256 public freeGasDuration = type(uint256).max; // Free gas valid forever
    
    // Tracking
    mapping(address => uint256) public userDailyGasUsed;
    mapping(address => uint256) public lastResetDay;
    mapping(address => bool) public whitelistedUsers;
    mapping(address => bool) public approvedContracts;
    mapping(address => uint256) public userFirstInteraction; // Track when user first used gasless
    mapping(address => uint256) public userFreeGasUsed; // Track free gas usage
    mapping(address => bool) public hasUsedGaslessTransaction; // Track if user ever used gasless
    
    uint256 public totalGasSponsored;
    uint256 public paymasterBalance;
    
    // Events
    event GasSponsored(
        address indexed user,
        address indexed targetContract,
        uint256 gasUsed,
        uint256 tokensCost,
        bytes32 txHash
    );
    event PaymasterFunded(address indexed funder, uint256 amount);
    event WhitelistUpdated(address indexed user, bool whitelisted);
    event ContractApproved(address indexed contractAddr, bool approved);
    event GasPriceUpdated(uint256 newTokenPerGas);
    event NewUserAutoWhitelisted(address indexed user, uint256 freeGasAmount);
    event AutoWhitelistSettingsUpdated(bool enabled, uint256 freeGasAmount, uint256 duration);

    modifier onlyApprovedContract() {
        require(approvedContracts[msg.sender], "Contract not approved for gasless");
        _;
    }

    constructor(IERC20 _paymentToken) Ownable(msg.sender) {
        paymentToken = _paymentToken;
    }

    /**
     * @notice Sponsor gas for a user transaction
     * @param user User address
     * @param gasUsed Amount of gas used
     * @param targetContract Contract being called
     */
    function sponsorGas(
        address user,
        uint256 gasUsed,
        address targetContract
    ) external onlyApprovedContract nonReentrant {
        require(gasUsed <= maxGasPerTransaction, "Gas limit exceeded");
        require(approvedContracts[targetContract], "Target contract not approved");
        
        // Auto-whitelist all users if enabled (which is now always true)
        if (autoWhitelistEnabled && !hasUsedGaslessTransaction[user]) {
            _autoWhitelistNewUser(user);
        }
        
        // Remove daily limit check - all users have unlimited gas
        // No daily limit checking needed anymore
        
        // Calculate token cost
        uint256 tokenCost = gasUsed * tokenPerGas;
        bool shouldChargeUser = false; // All users get free gas now
        
        // All users qualify for free gas - no charging needed
        if (true) { // Always free gas
            shouldChargeUser = false;
            userFreeGasUsed[user] += gasUsed;
        }
        
        // Remove token charging logic since all gas is free now
        // if (shouldChargeUser) { ... } - This block is removed
        
        // Update tracking
        userDailyGasUsed[user] += gasUsed; // Keep for analytics even though no limits
        totalGasSponsored += gasUsed;
        // No token balance updates needed since all gas is free
        hasUsedGaslessTransaction[user] = true;
        
        emit GasSponsored(user, targetContract, gasUsed, 0, blockhash(block.number - 1)); // 0 cost for all users
    }

    /**
     * @notice Fund the paymaster with native currency for gas payments
     */
    function fundPaymaster() external payable onlyOwner {
        emit PaymasterFunded(msg.sender, msg.value);
    }

    /**
     * @notice Withdraw native currency from paymaster
     */
    function withdrawNative(uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Insufficient balance");
        payable(owner()).transfer(amount);
    }

    /**
     * @notice Withdraw tokens collected as gas payments
     */
    function withdrawTokens(uint256 amount) external onlyOwner {
        require(paymasterBalance >= amount, "Insufficient token balance");
        paymasterBalance -= amount;
        require(paymentToken.transfer(owner(), amount), "Token transfer failed");
    }

    /**
     * @notice Update gas pricing
     */
    function updateGasPrice(uint256 _tokenPerGas) external onlyOwner {
        tokenPerGas = _tokenPerGas;
        emit GasPriceUpdated(_tokenPerGas);
    }

    /**
     * @notice Update gas limits
     */
    function updateGasLimits(
        uint256 _maxGasPerTransaction,
        uint256 _dailyGasLimitPerUser
    ) external onlyOwner {
        maxGasPerTransaction = _maxGasPerTransaction;
        dailyGasLimitPerUser = _dailyGasLimitPerUser;
    }

    /**
     * @notice Update auto-whitelist settings
     */
    function updateAutoWhitelistSettings(
        bool _enabled,
        uint256 _freeGasAmount,
        uint256 _duration
    ) external onlyOwner {
        autoWhitelistEnabled = _enabled;
        newUserFreeGasAmount = _freeGasAmount;
        freeGasDuration = _duration;
        emit AutoWhitelistSettingsUpdated(_enabled, _freeGasAmount, _duration);
    }

    /**
     * @notice Whitelist users for free gas
     */
    function setUserWhitelist(address user, bool whitelisted) external onlyOwner {
        whitelistedUsers[user] = whitelisted;
        emit WhitelistUpdated(user, whitelisted);
    }

    /**
     * @notice Batch whitelist users
     */
    function batchWhitelistUsers(address[] calldata users, bool whitelisted) external onlyOwner {
        for (uint256 i = 0; i < users.length; i++) {
            whitelistedUsers[users[i]] = whitelisted;
            emit WhitelistUpdated(users[i], whitelisted);
        }
    }

    /**
     * @notice Approve contracts for gasless transactions
     */
    function setContractApproval(address contractAddr, bool approved) external onlyOwner {
        approvedContracts[contractAddr] = approved;
        emit ContractApproved(contractAddr, approved);
    }

    /**
     * @notice Check if user can perform gasless transaction
     * @dev Now always returns true since all users get unlimited free gas
     */
    function canSponsorGas(
        address user,
        uint256 gasEstimate,
        address targetContract
    ) external view returns (bool canSponsor, string memory reason) {
        if (!approvedContracts[targetContract]) {
            return (false, "Contract not approved");
        }
        
        if (gasEstimate > maxGasPerTransaction) {
            return (false, "Gas estimate too high");
        }
        
        // All users can now use gasless transactions without any limits
        return (true, "Free gas available for all users");
    }
    }

    /**
     * @notice Get user's remaining daily gas allowance
     * @dev Returns max uint256 since there are no daily limits anymore
     */
    function getUserDailyGasRemaining(address user) external view returns (uint256) {
        return type(uint256).max; // Unlimited gas for all users
    }

    /**
     * @notice Get user's gasless transaction status
     * @dev Updated to reflect unlimited free gas for all users
     */
    function getUserGaslessStatus(address user) external view returns (
        bool hasUsedGasless,
        bool isWhitelisted,
        bool qualifiesForFreeGas,
        uint256 freeGasRemaining,
        uint256 dailyGasRemaining
    ) {
        hasUsedGasless = hasUsedGaslessTransaction[user];
        isWhitelisted = true; // All users are effectively whitelisted now
        qualifiesForFreeGas = true; // All users qualify for free gas
        freeGasRemaining = type(uint256).max; // Unlimited free gas
        dailyGasRemaining = type(uint256).max; // No daily limits
    }

    // ============ INTERNAL FUNCTIONS ============

    /**
     * @notice Auto-whitelist a new user for free gas
     */
    function _autoWhitelistNewUser(address user) internal {
        userFirstInteraction[user] = block.timestamp;
        emit NewUserAutoWhitelisted(user, newUserFreeGasAmount);
    }

    /**
     * @notice Check if user qualifies for free gas
     * @dev Now always returns true since all users get unlimited free gas
     */
    function _qualifiesForFreeGas(address user) internal view returns (bool) {
        return true; // All users always qualify for free gas
    }
}
