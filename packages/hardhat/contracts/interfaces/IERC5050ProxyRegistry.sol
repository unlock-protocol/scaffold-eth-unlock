// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

/// @title ERC-5050 Proxy Registry
interface IERC5050ProxyRegistry {
    /// @notice Query if an address implements an interface and through which contract.
    /// @param _addr Address being queried for the implementer of an interface.
    /// (If '_addr' is the zero address then 'msg.sender' is assumed.)
    /// @param _interfaceHash Keccak256 hash of the name of the interface as a string.
    /// E.g., 'web3.utils.keccak256("ERC777TokensRecipient")' for the 'ERC777TokensRecipient' interface.
    /// @return The address of the contract which implements the interface '_interfaceHash' for '_addr'
    /// or '0' if '_addr' did not register an implementer for this interface.
    function getInterfaceImplementer(address _addr, bytes4 _interfaceHash) external view returns (address);

    /// @notice Register a contract, an interfaceId and the contract which implements it.
    /// @param _contract Address of the contract whose interfaceId is being registered.
    /// @param interfaceId The interface which is implemented by the implementer contract.
    /// @param _implementer The address of the contract which implements the interface
    function registerInterfaceImplementer(address _contract, bytes4 interfaceId, address _implementer) external;

    /// @notice Removes the implementer of the specified interface from the record
    /// @param _contract Address of the contract whose interface implementer is to be removed.
    /// @param interfaceId The interfaceId which is being removed
    function deregisterInterfaceImplementer(address _contract, bytes4 interfaceId) external;
}