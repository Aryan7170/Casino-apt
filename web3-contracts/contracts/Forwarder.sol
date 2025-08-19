// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/metatx/MinimalForwarder.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title GameForwarder
 * @notice Forwarder contract for gasless transactions in APT Casino games
 * @dev Extends OpenZeppelin's MinimalForwarder with additional features
 */
contract GameForwarder is MinimalForwarder, Ownable {
    
    // Mapping to track approved relayers who can submit transactions
    mapping(address => bool) public approvedRelayers;
    
    // Events
    event RelayerApproved(address indexed relayer, bool approved);
    event GaslessTransactionExecuted(
        address indexed from,
        address indexed to,
        uint256 value,
        uint256 gas,
        uint256 nonce,
        bytes data,
        bytes32 domainSeparator,
        bytes32 requestTypeHash
    );

    modifier onlyApprovedRelayer() {
        require(approvedRelayers[msg.sender] || msg.sender == owner(), "Not approved relayer");
        _;
    }

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Execute a meta-transaction
     * @param req The ForwardRequest containing transaction details
     * @param signature The user's signature
     */
    function execute(ForwardRequest calldata req, bytes calldata signature)
        public
        payable
        override
        onlyApprovedRelayer
        returns (bool, bytes memory)
    {
        (bool success, bytes memory returndata) = super.execute(req, signature);
        
        if (success) {
            emit GaslessTransactionExecuted(
                req.from,
                req.to,
                req.value,
                req.gas,
                req.nonce,
                req.data,
                _domainSeparatorV4(),
                _TYPEHASH
            );
        }
        
        return (success, returndata);
    }

    /**
     * @notice Approve or revoke relayer permissions
     * @param relayer Address of the relayer
     * @param approved Whether to approve or revoke
     */
    function setRelayerApproval(address relayer, bool approved) external onlyOwner {
        approvedRelayers[relayer] = approved;
        emit RelayerApproved(relayer, approved);
    }

    /**
     * @notice Batch approve multiple relayers
     * @param relayers Array of relayer addresses
     * @param approved Whether to approve or revoke all
     */
    function batchSetRelayerApproval(address[] calldata relayers, bool approved) external onlyOwner {
        for (uint256 i = 0; i < relayers.length; i++) {
            approvedRelayers[relayers[i]] = approved;
            emit RelayerApproved(relayers[i], approved);
        }
    }

    /**
     * @notice Emergency function to pause relayer operations
     */
    function emergencyRevokeAllRelayers(address[] calldata relayers) external onlyOwner {
        for (uint256 i = 0; i < relayers.length; i++) {
            approvedRelayers[relayers[i]] = false;
            emit RelayerApproved(relayers[i], false);
        }
    }

    /**
     * @notice Get domain separator for off-chain signature generation
     */
    function getDomainSeparator() external view returns (bytes32) {
        return _domainSeparatorV4();
    }

    /**
     * @notice Get type hash for off-chain signature generation
     */
    function getRequestTypeHash() external pure returns (bytes32) {
        return _TYPEHASH;
    }
}
