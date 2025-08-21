// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/metatx/ERC2771Forwarder.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title GameForwarder
 * @notice Forwarder contract for gasless transactions in APT Casino games
 * @dev Extends OpenZeppelin's ERC2771Forwarder with additional features
 */
contract GameForwarder is ERC2771Forwarder, Ownable {
    
    // Mapping to track approved relayers who can submit transactions
    mapping(address => bool) public approvedRelayers;
    
    // Events
    event RelayerApproved(address indexed relayer, bool approved);

    modifier onlyApprovedRelayer() {
        require(approvedRelayers[msg.sender] || msg.sender == owner(), "Not approved relayer");
        _;
    }

    constructor() ERC2771Forwarder("APTCasinoForwarder") Ownable(msg.sender) {}

    /**
     * @notice Execute a meta-transaction with access control
     * @param request The ForwardRequestData containing transaction details
     */
    function execute(ForwardRequestData calldata request)
        public
        payable
        override
        onlyApprovedRelayer
    {
        super.execute(request);
    }

    /**
     * @notice Execute multiple meta-transactions with access control
     * @param requests Array of ForwardRequestData
     * @param refundReceiver Address to receive refunds for failed transactions
     */
    function executeBatch(
        ForwardRequestData[] calldata requests,
        address payable refundReceiver
    )
        public
        payable
        override
        onlyApprovedRelayer
    {
        super.executeBatch(requests, refundReceiver);
    }

    /**
     * @notice Approve or revoke relayer permissions
     * @param relayer Address of the relayer
     * @param approved Whether to approve or revoke
     */
    function setRelayerApproval(address relayer, bool approved) external onlyOwner {
        require(relayer != address(0), "Invalid relayer address");
        approvedRelayers[relayer] = approved;
        emit RelayerApproved(relayer, approved);
    }

    /**
     * @notice Check if an address is an approved relayer
     * @param relayer Address to check
     * @return bool Whether the address is approved
     */
    function isApprovedRelayer(address relayer) external view returns (bool) {
        return approvedRelayers[relayer] || relayer == owner();
    }

    /**
     * @notice Batch approve multiple relayers
     * @param relayers Array of relayer addresses
     * @param approved Whether to approve or revoke all
     */
    function batchSetRelayerApproval(address[] calldata relayers, bool approved) external onlyOwner {
        for (uint256 i = 0; i < relayers.length; i++) {
            require(relayers[i] != address(0), "Invalid relayer address");
            approvedRelayers[relayers[i]] = approved;
            emit RelayerApproved(relayers[i], approved);
        }
    }

    /**
     * @notice Emergency function to revoke all relayers
     */
    function emergencyRevokeAllRelayers(address[] calldata relayers) external onlyOwner {
        for (uint256 i = 0; i < relayers.length; i++) {
            approvedRelayers[relayers[i]] = false;
            emit RelayerApproved(relayers[i], false);
        }
    }
}
