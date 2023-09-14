pragma solidity ^0.8.0;

/**
 * @title ConnectAuth.
 * @dev Connector For Adding Auth.
 */

interface AccountInterface {
    function enable(address user) external;
    function disable(address user) external;
}

interface EventInterface {
    function emitEvent(uint _connectorType, uint _connectorID, bytes32 _eventCode, bytes calldata _eventData) external;
}


contract Basics {

    /**
     * @dev LayerEvent Address.
     */
    address public immutable layerEventAddress;
    constructor (address _layerEventAddress) {
        layerEventAddress = _layerEventAddress;
    }

     /**
     * @dev Connector ID and Type.
     */
    function connectorID() public pure returns(uint _type, uint _id) {
        (_type, _id) = (1, 1);
    }

}


contract Auth is Basics {

    constructor (address _layerEventAddress) Basics(_layerEventAddress) {}

    event LogAddAuth(address indexed _msgSender, address indexed _auth);
    event LogRemoveAuth(address indexed _msgSender, address indexed _auth);

    /**
     * @dev Add New Owner
     * @param user User Address.
     */
    function addModule(address user) public payable {
        AccountInterface(address(this)).enable(user);

        emit LogAddAuth(msg.sender, user);

        bytes32 _eventCode = keccak256("LogAddAuth(address,address)");
        bytes memory _eventParam = abi.encode(msg.sender, user);
        (uint _type, uint _id) = connectorID();
        EventInterface(layerEventAddress).emitEvent(_type, _id, _eventCode, _eventParam);
    }

    /**
     * @dev Remove New Owner
     * @param user User Address.
     */
    function removeModule(address user) public payable {
        AccountInterface(address(this)).disable(user);

        emit LogRemoveAuth(msg.sender, user);

        bytes32 _eventCode = keccak256("LogRemoveAuth(address,address)");
        bytes memory _eventParam = abi.encode(msg.sender, user);
        (uint _type, uint _id) = connectorID();
        EventInterface(layerEventAddress).emitEvent(_type, _id, _eventCode, _eventParam);
    }

}


contract ConnectAuth is Auth {

    constructor (address _layerEventAddress) public Auth(_layerEventAddress) {}
    string constant public name = "Auth-v1";
}