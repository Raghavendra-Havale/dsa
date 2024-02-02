// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title Interface for List contract
/// @notice Interface used to get the account ID associated with an address
interface ListInterface {
    /// @notice Retrieves the account ID associated with the provided address
    /// @param addr The address to lookup
    /// @return The account ID as uint64
    function accountID(address addr) external view returns (uint64);
}

/// @title Layer Event Logging Contract
/// @notice This contract allows emitting events for layer actions with a specific structure.
/// @dev The contract utilizes an external List contract to associate addresses with account IDs.
contract LayerEvent {

    /// @notice Address of the List contract used to get account IDs
    address public immutable layerList;

    /// @notice Emits when an event is recorded by the contract
    /// @param connectorType The type of connector that triggered the event
    /// @param connectorID The ID of the connector that triggered the event
    /// @param accountID The account ID associated with the event
    /// @param eventCode A code representing the type of event
    /// @param eventData Additional data associated with the event
    event LogEvent(uint64 connectorType, uint64 indexed connectorID, uint64 indexed accountID, bytes32 indexed eventCode, bytes eventData);

    /// @notice Creates a new LayerEvent contract instance
    /// @param _layerList The address of the List contract to use for account ID lookups
    constructor(address _layerList) {
        layerList = _layerList;
    }

    /// @notice Emits an event with the provided details, requires the sender to be associated with an account ID in the List contract
    /// @dev The function fetches the account ID for msg.sender from the List contract and requires it to be non-zero
    /// @param _connectorType The type of the connector
    /// @param _connectorID The ID of the connector
    /// @param _eventCode The event code to emit
    /// @param _eventData The data associated with the event
    function emitEvent(uint _connectorType, uint _connectorID, bytes32 _eventCode, bytes calldata _eventData) external {
        uint64 _ID = ListInterface(layerList).accountID(msg.sender);
        require(_ID != 0, "not-SA"); // not-Specified-Account error message
        emit LogEvent(uint64(_connectorType), uint64(_connectorID), _ID, _eventCode, _eventData);
    }

}
