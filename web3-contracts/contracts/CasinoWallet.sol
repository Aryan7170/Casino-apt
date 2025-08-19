// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

/**
 * @title CasinoWallet - Gasless Off-chain Gaming with Meta-Transactions
 * @notice Handles gasless deposits and withdrawals - all game balance tracking off-chain
 * @dev Game logic, RNG, and balance updates handled off-chain, gasless transactions via meta-transactions
 */
contract CasinoWallet is ReentrancyGuard, Ownable, EIP712 {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    IERC20Permit public immutable token;
    address public serverSigner;
    address public gaslessRelayer; // Address that pays gas for meta-transactions
    address public constant TREASURY = 0xFF9582E3898599D2cF0Abdc06321789dc345e529;

    // Nonces for meta-transactions to prevent replay attacks
    mapping(address => uint256) public nonces;

    // Only track deposits and withdrawals on-chain
    mapping(address => uint256) public totalDeposits;
    mapping(address => uint256) public totalWithdraws;
    
    // Track net deposits (deposits - withdrawals) for security
    mapping(address => uint256) public netDeposits;
    
    // Prevent replay attacks for withdrawals
    mapping(bytes32 => bool) public processedWithdrawals;

    // Minimum balances and limits
    uint256 public minDeposit = 1 * 10**18;
    uint256 public maxWithdraw = 10000 * 10**18;

    // EIP-712 Type Hashes for meta-transactions
    bytes32 private constant DEPOSIT_TYPEHASH = keccak256(
        "Deposit(address player,uint256 amount,uint256 nonce,uint256 deadline)"
    );
    
    bytes32 private constant WITHDRAWAL_TYPEHASH = keccak256(
        "Withdrawal(address player,uint256 amount,uint256 nonce,uint256 deadline,string offChainBalanceProof)"
    );

    struct DepositRequest {
        address player;
        uint256 amount;
        uint256 nonce;
        uint256 deadline;
    }

    struct WithdrawalRequest {
        address player;
        uint256 amount;
        uint256 nonce;
        uint256 deadline;
        string offChainBalanceProof; // Off-chain balance verification
    }

    // Events
    event Deposit(address indexed player, uint256 amount, uint256 totalDeposited);
    event GaslessDeposit(address indexed player, uint256 amount, uint256 totalDeposited, address indexed relayer);
    event Withdraw(address indexed player, uint256 amount, uint256 totalWithdrawn);
    event GaslessWithdraw(address indexed player, uint256 amount, uint256 totalWithdrawn, address indexed relayer);
    event WithdrawalProcessed(
        address indexed player, 
        uint256 amount, 
        string offChainBalanceProof,
        uint256 timestamp
    );

    modifier onlyServerSigner() {
        require(msg.sender == serverSigner, "Only server can call this");
        _;
    }

    modifier onlyRelayer() {
        require(msg.sender == gaslessRelayer, "Only relayer can call this");
        _;
    }

    constructor(
        IERC20Permit _token, 
        address _serverSigner, 
        address _gaslessRelayer
    ) Ownable(msg.sender) EIP712("CasinoWallet", "1") {
        require(address(_token) != address(0), "Invalid token");
        require(_serverSigner != address(0), "Invalid server signer");
        require(_gaslessRelayer != address(0), "Invalid relayer");
        token = _token;
        serverSigner = _serverSigner;
        gaslessRelayer = _gaslessRelayer;
    }

    /**
     * @notice Deposit tokens to play games (regular transaction)
     * @param amount Amount to deposit
     */
    function deposit(uint256 amount) external nonReentrant {
        require(amount >= minDeposit, "Deposit too small");
        require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        totalDeposits[msg.sender] += amount;
        netDeposits[msg.sender] += amount;

        emit Deposit(msg.sender, amount, totalDeposits[msg.sender]);
    }

    /**
     * @notice Gasless deposit using meta-transaction and permit
     * @param depositRequest Deposit request struct
     * @param signature User's signature for the deposit
     * @param permitDeadline Permit deadline
     * @param permitV Permit signature v
     * @param permitR Permit signature r
     * @param permitS Permit signature s
     */
    function gaslessDeposit(
        DepositRequest calldata depositRequest,
        bytes calldata signature,
        uint256 permitDeadline,
        uint8 permitV,
        bytes32 permitR,
        bytes32 permitS
    ) external nonReentrant onlyRelayer {
        require(block.timestamp <= depositRequest.deadline, "Signature expired");
        require(depositRequest.amount >= minDeposit, "Deposit too small");
        require(depositRequest.nonce == nonces[depositRequest.player], "Invalid nonce");

        // Verify EIP-712 signature
        bytes32 structHash = keccak256(abi.encode(
            DEPOSIT_TYPEHASH,
            depositRequest.player,
            depositRequest.amount,
            depositRequest.nonce,
            depositRequest.deadline
        ));
        bytes32 hash = _hashTypedDataV4(structHash);
        require(hash.recover(signature) == depositRequest.player, "Invalid signature");

        // Use permit to approve and transfer in one transaction
        token.permit(
            depositRequest.player,
            address(this),
            depositRequest.amount,
            permitDeadline,
            permitV,
            permitR,
            permitS
        );

        require(token.transferFrom(depositRequest.player, address(this), depositRequest.amount), "Transfer failed");

        // Update state
        nonces[depositRequest.player]++;
        totalDeposits[depositRequest.player] += depositRequest.amount;
        netDeposits[depositRequest.player] += depositRequest.amount;

        emit GaslessDeposit(depositRequest.player, depositRequest.amount, totalDeposits[depositRequest.player], msg.sender);
    }

    /**
     * @notice Process withdrawal based on off-chain balance (server signed)
     * @param withdrawalRequest Withdrawal request with off-chain balance proof
     * @param signature Server signature verifying the withdrawal request
     */
    function processWithdrawal(
        WithdrawalRequest calldata withdrawalRequest,
        bytes calldata signature
    ) external nonReentrant onlyServerSigner {
        // Verify withdrawal hasn't been processed
        bytes32 withdrawalHash = keccak256(abi.encode(withdrawalRequest));
        require(!processedWithdrawals[withdrawalHash], "Withdrawal already processed");
        require(block.timestamp <= withdrawalRequest.deadline, "Request expired");

        // Verify signature
        bytes32 messageHash = keccak256(abi.encode(withdrawalRequest)).toEthSignedMessageHash();
        require(messageHash.recover(signature) == serverSigner, "Invalid signature");

        // Security check: ensure withdrawal doesn't exceed limits
        require(withdrawalRequest.amount <= maxWithdraw, "Withdraw too large");
        require(withdrawalRequest.amount > 0, "Invalid withdrawal amount");

        // Mark as processed
        processedWithdrawals[withdrawalHash] = true;
        totalWithdraws[withdrawalRequest.player] += withdrawalRequest.amount;
        
        // Update net deposits (can go negative if player won more than deposited)
        if (netDeposits[withdrawalRequest.player] >= withdrawalRequest.amount) {
            netDeposits[withdrawalRequest.player] -= withdrawalRequest.amount;
        } else {
            netDeposits[withdrawalRequest.player] = 0;
        }

        // Transfer tokens to player
        require(token.transfer(withdrawalRequest.player, withdrawalRequest.amount), "Transfer failed");

        emit WithdrawalProcessed(
            withdrawalRequest.player,
            withdrawalRequest.amount,
            withdrawalRequest.offChainBalanceProof,
            block.timestamp
        );
        
        emit Withdraw(withdrawalRequest.player, withdrawalRequest.amount, totalWithdraws[withdrawalRequest.player]);
    }

    /**
     * @notice Gasless withdrawal using meta-transaction
     * @param withdrawalRequest Withdrawal request struct
     * @param userSignature User's signature for the withdrawal
     * @param serverSignature Server's signature verifying the withdrawal
     */
    function gaslessWithdrawal(
        WithdrawalRequest calldata withdrawalRequest,
        bytes calldata userSignature,
        bytes calldata serverSignature
    ) external nonReentrant onlyRelayer {
        require(block.timestamp <= withdrawalRequest.deadline, "Request expired");
        require(withdrawalRequest.nonce == nonces[withdrawalRequest.player], "Invalid nonce");
        require(withdrawalRequest.amount <= maxWithdraw, "Withdraw too large");
        require(withdrawalRequest.amount > 0, "Invalid withdrawal amount");

        // Verify user's EIP-712 signature
        bytes32 structHash = keccak256(abi.encode(
            WITHDRAWAL_TYPEHASH,
            withdrawalRequest.player,
            withdrawalRequest.amount,
            withdrawalRequest.nonce,
            withdrawalRequest.deadline,
            keccak256(bytes(withdrawalRequest.offChainBalanceProof))
        ));
        bytes32 hash = _hashTypedDataV4(structHash);
        require(hash.recover(userSignature) == withdrawalRequest.player, "Invalid user signature");

        // Verify server signature
        bytes32 serverHash = keccak256(abi.encode(withdrawalRequest)).toEthSignedMessageHash();
        require(serverHash.recover(serverSignature) == serverSigner, "Invalid server signature");

        // Check for replay attacks
        bytes32 withdrawalHash = keccak256(abi.encode(withdrawalRequest));
        require(!processedWithdrawals[withdrawalHash], "Withdrawal already processed");

        // Mark as processed and update nonce
        processedWithdrawals[withdrawalHash] = true;
        nonces[withdrawalRequest.player]++;
        totalWithdraws[withdrawalRequest.player] += withdrawalRequest.amount;
        
        // Update net deposits
        if (netDeposits[withdrawalRequest.player] >= withdrawalRequest.amount) {
            netDeposits[withdrawalRequest.player] -= withdrawalRequest.amount;
        } else {
            netDeposits[withdrawalRequest.player] = 0;
        }

        // Transfer tokens to player
        require(token.transfer(withdrawalRequest.player, withdrawalRequest.amount), "Transfer failed");

        emit GaslessWithdraw(withdrawalRequest.player, withdrawalRequest.amount, totalWithdraws[withdrawalRequest.player], msg.sender);
        emit WithdrawalProcessed(
            withdrawalRequest.player,
            withdrawalRequest.amount,
            withdrawalRequest.offChainBalanceProof,
            block.timestamp
        );
    }

    /**
     * @notice Emergency withdrawal for player (owner only)
     */
    function emergencyWithdraw(address player, uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be positive");
        require(token.balanceOf(address(this)) >= amount, "Insufficient contract balance");
        
        totalWithdraws[player] += amount;
        require(token.transfer(player, amount), "Transfer failed");
        
        emit Withdraw(player, amount, totalWithdraws[player]);
    }

    /**
     * @notice Update server signer and relayer
     */
    function updateServerSigner(address newSigner) external onlyOwner {
        require(newSigner != address(0), "Invalid signer");
        serverSigner = newSigner;
    }

    function updateGaslessRelayer(address newRelayer) external onlyOwner {
        require(newRelayer != address(0), "Invalid relayer");
        gaslessRelayer = newRelayer;
    }

    /**
     * @notice Update limits
     */
    function updateLimits(
        uint256 _minDeposit,
        uint256 _maxWithdraw
    ) external onlyOwner {
        minDeposit = _minDeposit;
        maxWithdraw = _maxWithdraw;
    }

    /**
     * @notice Get player deposit/withdrawal summary
     */
    function getPlayerSummary(address player) external view returns (
        uint256 deposits,
        uint256 withdraws,
        uint256 netDeposited,
        uint256 currentNonce
    ) {
        return (
            totalDeposits[player],
            totalWithdraws[player],
            netDeposits[player],
            nonces[player]
        );
    }

    /**
     * @notice Get domain separator for EIP-712
     */
    function getDomainSeparator() external view returns (bytes32) {
        return _domainSeparatorV4();
    }

    /**
     * @notice Get deposit type hash for EIP-712
     */
    function getDepositTypeHash() external pure returns (bytes32) {
        return DEPOSIT_TYPEHASH;
    }

    /**
     * @notice Get withdrawal type hash for EIP-712
     */
    function getWithdrawalTypeHash() external pure returns (bytes32) {
        return WITHDRAWAL_TYPEHASH;
    }

    /**
     * @notice Check if withdrawal was processed
     */
    function isWithdrawalProcessed(WithdrawalRequest calldata withdrawalRequest) external view returns (bool) {
        bytes32 withdrawalHash = keccak256(abi.encode(withdrawalRequest));
        return processedWithdrawals[withdrawalHash];
    }

    /**
     * @notice Get contract token balance
     */
    function getContractBalance() external view returns (uint256) {
        return token.balanceOf(address(this));
    }
}
