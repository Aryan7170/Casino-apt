// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title SimplePaymaster
 * @notice Simple paymaster for APT Casino gasless transactions
 */
contract Paymaster is Ownable, ReentrancyGuard {
    
    IERC20 public immutable paymentToken;
    
    // Gas pricing and limits
    uint256 public tokenPerGas = 1e12; // 1 token per gas unit (adjustable)
    uint256 public maxGasLimit = 500000; // Maximum gas limit per transaction
    uint256 public minGasLimit = 21000; // Minimum gas limit per transaction
    
    // Contract whitelisting
    mapping(address => bool) public approvedContracts;
    
    // Events
    event GasSponsored(
        address indexed user,
        address indexed targetContract,
        uint256 gasAmount,
        uint256 tokensCost
    );
    event ContractApproved(address indexed contractAddr, bool approved);
    event ParametersUpdated(uint256 tokenPerGas, uint256 maxGasLimit, uint256 minGasLimit);

    constructor(address _paymentToken) Ownable(msg.sender) {
        require(_paymentToken != address(0), "Invalid token address");
        paymentToken = IERC20(_paymentToken);
    }

    /**
     * @notice Sponsor gas for a transaction
     * @param user User address
     * @param targetContract Target contract address
     * @param gasAmount Gas amount needed
     */
    function sponsorGas(
        address user,
        address targetContract,
        uint256 gasAmount
    ) external nonReentrant {
        require(approvedContracts[targetContract], "Contract not approved");
        require(gasAmount >= minGasLimit && gasAmount <= maxGasLimit, "Invalid gas amount");
        
        uint256 tokensCost = gasAmount * tokenPerGas;
        
        // Transfer tokens from user to this contract
        require(
            paymentToken.transferFrom(user, address(this), tokensCost),
            "Token transfer failed"
        );
        
        emit GasSponsored(user, targetContract, gasAmount, tokensCost);
    }

    /**
     * @notice Fund the paymaster with native currency
     */
    function fundPaymaster() external payable onlyOwner {
        require(msg.value > 0, "Must send native currency");
    }

    /**
     * @notice Withdraw native currency
     */
    function withdrawNative(uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Insufficient balance");
        payable(owner()).transfer(amount);
    }

    /**
     * @notice Withdraw tokens
     */
    function withdrawTokens(uint256 amount) external onlyOwner {
        require(paymentToken.balanceOf(address(this)) >= amount, "Insufficient token balance");
        require(paymentToken.transfer(owner(), amount), "Token transfer failed");
    }

    /**
     * @notice Update gas pricing
     */
    function updateGasPrice(uint256 _tokenPerGas) external onlyOwner {
        require(_tokenPerGas > 0, "Invalid gas price");
        tokenPerGas = _tokenPerGas;
        emit ParametersUpdated(tokenPerGas, maxGasLimit, minGasLimit);
    }

    /**
     * @notice Update gas limits
     */
    function updateGasLimits(uint256 _minGasLimit, uint256 _maxGasLimit) external onlyOwner {
        require(_minGasLimit > 0 && _maxGasLimit > _minGasLimit, "Invalid gas limits");
        minGasLimit = _minGasLimit;
        maxGasLimit = _maxGasLimit;
        emit ParametersUpdated(tokenPerGas, maxGasLimit, minGasLimit);
    }

    /**
     * @notice Approve or disapprove a contract for gasless transactions
     */
    function setContractApproval(address contractAddr, bool approved) external onlyOwner {
        require(contractAddr != address(0), "Invalid contract address");
        approvedContracts[contractAddr] = approved;
        emit ContractApproved(contractAddr, approved);
    }

    /**
     * @notice Check if a contract is approved
     */
    function isContractApproved(address contractAddr) external view returns (bool) {
        return approvedContracts[contractAddr];
    }

    /**
     * @notice Get contract balance in native currency
     */
    function getNativeBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @notice Get contract balance in payment tokens
     */
    function getTokenBalance() external view returns (uint256) {
        return paymentToken.balanceOf(address(this));
    }
}
