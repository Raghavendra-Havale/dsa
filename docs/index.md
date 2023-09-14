# Solidity API

## AccountInterface

_Main Contract For DeFi Smart Accounts. This is also a factory contract, Which deploys new Smart Account.
Also Registry for DeFi Smart Accounts._

### version

```solidity
function version() external view returns (uint256)
```

### enable

```solidity
function enable(address authority) external
```

### cast

```solidity
function cast(address[] _targets, bytes[] _datas, address _origin) external payable returns (bytes32[] responses)
```

## ListInterface

### init

```solidity
function init(address _account) external
```

## AddressIndex

_Contract to manage master address, connectors, checks, and account versions._

### LogNewMaster

```solidity
event LogNewMaster(address master)
```

### LogUpdateMaster

```solidity
event LogUpdateMaster(address master)
```

### LogNewCheck

```solidity
event LogNewCheck(uint256 accountVersion, address check)
```

### LogNewAccount

```solidity
event LogNewAccount(address _newAccount, address _connectors, address _check)
```

### master

```solidity
address master
```

### list

```solidity
address list
```

### connectors

```solidity
mapping(uint256 => address) connectors
```

### check

```solidity
mapping(uint256 => address) check
```

### account

```solidity
mapping(uint256 => address) account
```

### versionCount

```solidity
uint256 versionCount
```

### isMaster

```solidity
modifier isMaster()
```

_Throws if the sender not is Master Address._

### changeMaster

```solidity
function changeMaster(address _newMaster) external
```

_Change the Master Address._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _newMaster | address | New Master Address. |

### updateMaster

```solidity
function updateMaster() external
```

_Update the Master Address to the new master._

### changeCheck

```solidity
function changeCheck(uint256 accountVersion, address _newCheck) external
```

_Change the Check Address of a specific Account Module version._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| accountVersion | uint256 | Account Module version. |
| _newCheck | address | The New Check Address. |

### addNewAccount

```solidity
function addNewAccount(address _newAccount, address _connectors, address _check) external
```

_Add New Account Module._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _newAccount | address | The New Account Module Address. |
| _connectors | address | Connectors Registry Module Address. |
| _check | address | Check Module Address. |

## CloneFactory

_Contract to clone other contracts._

### createClone

```solidity
function createClone(uint256 version) internal returns (address result)
```

_Clone a new Account Module._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| version | uint256 | Account Module version to clone. |

### isClone

```solidity
function isClone(uint256 version, address query) external view returns (bool result)
```

_Check if Account Module is a clone._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| version | uint256 | Account Module version. |
| query | address | Account Module Address. |

## LayerIndex

_Main contract for creating and managing DeFi Smart Accounts._

### LogAccountCreated

```solidity
event LogAccountCreated(address sender, address owner, address account, address origin)
```

### buildWithCast

```solidity
function buildWithCast(address _owner, uint256 accountVersion, address[] _targets, bytes[] _datas, address _origin) external payable returns (address _account)
```

_Create a new DeFi Smart Account for a user and run cast function in the new Smart Account._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _owner | address | Owner of the Smart Account. |
| accountVersion | uint256 | Account Module version. |
| _targets | address[] | Array of Target to run cast function. |
| _datas | bytes[] | Array of Data(callData) to run cast function. |
| _origin | address | Where Smart Account is created. |

### build

```solidity
function build(address _owner, uint256 accountVersion, address _origin) public returns (address _account)
```

_Create a new DeFi Smart Account for a user._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _owner | address | Owner of the Smart Account. |
| accountVersion | uint256 | Account Module version. |
| _origin | address | Where Smart Account is created. |

### setBasics

```solidity
function setBasics(address _master, address _list, address _account, address _connectors) external
```

_Setup Initial things for LayerIndex, after its been deployed and can be only run once._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _master | address | The Master Address. |
| _list | address | The List Address. |
| _account | address | The Account Module Address. |
| _connectors | address | The Connectors Registry Module Address. |

## AccountInterface

_Registry for DeFi Smart Account authorized users._

### isAuth

```solidity
function isAuth(address _user) external view returns (bool)
```

## DSMath

_Library for basic arithmetic operations with overflow and underflow checks._

### add

```solidity
function add(uint64 x, uint64 y) internal pure returns (uint64 z)
```

_Adds two numbers, reverts on overflow._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| x | uint64 | First operand. |
| y | uint64 | Second operand. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| z | uint64 | Result of addition. |

### sub

```solidity
function sub(uint64 x, uint64 y) internal pure returns (uint64 z)
```

_Subtracts two numbers, reverts on underflow._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| x | uint64 | First operand. |
| y | uint64 | Second operand. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| z | uint64 | Result of subtraction. |

## Variables

_Contract to manage and store variables related to LayerList._

### layerIndex

```solidity
address layerIndex
```

### constructor

```solidity
constructor(address _layerIndex) public
```

### accounts

```solidity
uint64 accounts
```

### accountID

```solidity
mapping(address => uint64) accountID
```

### accountAddr

```solidity
mapping(uint64 => address) accountAddr
```

### userLink

```solidity
mapping(address => struct Variables.UserLink) userLink
```

### userList

```solidity
mapping(address => mapping(uint64 => struct Variables.UserList)) userList
```

### UserLink

```solidity
struct UserLink {
  uint64 first;
  uint64 last;
  uint64 count;
}
```

### UserList

```solidity
struct UserList {
  uint64 prev;
  uint64 next;
}
```

### accountLink

```solidity
mapping(uint64 => struct Variables.AccountLink) accountLink
```

### accountList

```solidity
mapping(uint64 => mapping(address => struct Variables.AccountList)) accountList
```

### AccountLink

```solidity
struct AccountLink {
  address first;
  address last;
  uint64 count;
}
```

### AccountList

```solidity
struct AccountList {
  address prev;
  address next;
}
```

## Configure

_Contract for configuring and managing the LayerList._

### constructor

```solidity
constructor(address _layerIndex) public
```

### addAccount

```solidity
function addAccount(address _owner, uint64 _account) internal
```

_Add a Smart Account to the linked list of a user._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _owner | address | Address of the user. |
| _account | uint64 | ID of the Smart Account. |

### removeAccount

```solidity
function removeAccount(address _owner, uint64 _account) internal
```

_Remove a Smart Account from the linked list of a user._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _owner | address | Address of the user. |
| _account | uint64 | ID of the Smart Account. |

### addUser

```solidity
function addUser(address _owner, uint64 _account) internal
```

_Add a user to the linked list of a Smart Account._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _owner | address | Address of the user. |
| _account | uint64 | ID of the Smart Account. |

### removeUser

```solidity
function removeUser(address _owner, uint64 _account) internal
```

_Remove a user from the linked list of a Smart Account._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _owner | address | Address of the user. |
| _account | uint64 | ID of the Smart Account. |

## LayerList

_Main contract for managing and interacting with LayerList._

### constructor

```solidity
constructor(address _layerIndex) public
```

### addAuth

```solidity
function addAuth(address _owner) external
```

_Authorize a Smart Account for a user._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _owner | address | Address of the user. |

### removeAuth

```solidity
function removeAuth(address _owner) external
```

_Deauthorize a Smart Account for a user._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _owner | address | Address of the user. |

### init

```solidity
function init(address _account) external
```

_Initialize the configuration for a Smart Account._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _account | address | Address of the Smart Account. |

## IndexInterface

_DeFi Smart Account Wallet._

### connectors

```solidity
function connectors(uint256 version) external view returns (address)
```

### check

```solidity
function check(uint256 version) external view returns (address)
```

### list

```solidity
function list() external view returns (address)
```

## ConnectorsInterface

### isConnector

```solidity
function isConnector(address[] logicAddr) external view returns (bool)
```

### isStaticConnector

```solidity
function isStaticConnector(address[] logicAddr) external view returns (bool)
```

## CheckInterface

### isOk

```solidity
function isOk() external view returns (bool)
```

## ListInterface

### addAuth

```solidity
function addAuth(address user) external
```

### removeAuth

```solidity
function removeAuth(address user) external
```

## Record

### LogEnable

```solidity
event LogEnable(address user)
```

### LogDisable

```solidity
event LogDisable(address user)
```

### LogSwitchShield

```solidity
event LogSwitchShield(bool _shield)
```

### layerIndex

```solidity
address layerIndex
```

### version

```solidity
uint256 version
```

### shield

```solidity
bool shield
```

### constructor

```solidity
constructor(address _layerIndex) public
```

### isAuth

```solidity
function isAuth(address user) public view returns (bool)
```

_Check for Auth if enabled._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| user | address | address/user/owner. |

### switchShield

```solidity
function switchShield(bool _shield) external
```

_Change Shield State._

### enable

```solidity
function enable(address user) public
```

_Enable New User._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| user | address | Owner of the Smart Account. |

### disable

```solidity
function disable(address user) public
```

_Disable User._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| user | address | Owner of the Smart Account. |

## LayerAccount

### constructor

```solidity
constructor(address _layerIndex) public
```

### LogCast

```solidity
event LogCast(address origin, address sender, uint256 value)
```

### receive

```solidity
receive() external payable
```

### spell

```solidity
function spell(address _target, bytes _data) internal
```

_Delegate the calls to Connector And this function is ran by cast()._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _target | address | Target to of Connector. |
| _data | bytes | CallData of function in Connector. |

### cast

```solidity
function cast(address[] _targets, bytes[] _datas, address _origin) external payable
```

_This is the main function, Where all the different functions are called
from Smart Account._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _targets | address[] | Array of Target(s) to of Connector. |
| _datas | bytes[] | Array of Calldata(S) of function. |
| _origin | address |  |

## IndexInterface

_Registry for Connectors._

### master

```solidity
function master() external view returns (address)
```

## ConnectorInterface

### connectorID

```solidity
function connectorID() external view returns (uint256 _type, uint256 _id)
```

### name

```solidity
function name() external view returns (string)
```

## DSMath

### add

```solidity
function add(uint256 x, uint256 y) internal pure returns (uint256 z)
```

### sub

```solidity
function sub(uint256 x, uint256 y) internal pure returns (uint256 z)
```

## Controllers

### LogAddController

```solidity
event LogAddController(address addr)
```

### LogRemoveController

```solidity
event LogRemoveController(address addr)
```

### layerIndex

```solidity
address layerIndex
```

### constructor

```solidity
constructor(address _layerIndex) public
```

### chief

```solidity
mapping(address => bool) chief
```

### connectors

```solidity
mapping(address => bool) connectors
```

### staticConnectors

```solidity
mapping(address => bool) staticConnectors
```

### isChief

```solidity
modifier isChief()
```

_Throws if the sender not is Master Address from LayerIndex
or Enabled Chief._

### enableChief

```solidity
function enableChief(address _userAddress) external
```

_Enable a Chief._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _userAddress | address | Chief Address. |

### disableChief

```solidity
function disableChief(address _userAddress) external
```

_Disables a Chief._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _userAddress | address | Chief Address. |

## Listings

### constructor

```solidity
constructor(address _layerIndex) public
```

### connectorArray

```solidity
address[] connectorArray
```

### connectorCount

```solidity
uint256 connectorCount
```

### addToArr

```solidity
function addToArr(address _connector) internal
```

_Add Connector to Connector's array._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _connector | address | Connector Address. |

### staticConnectorArray

```solidity
address[] staticConnectorArray
```

### addToArrStatic

```solidity
function addToArrStatic(address _connector) internal
```

_Add Connector to Static Connector's array._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _connector | address | Static Connector Address. |

## LayerConnectors

### constructor

```solidity
constructor(address _layerIndex) public
```

### LogEnable

```solidity
event LogEnable(address connector)
```

### LogDisable

```solidity
event LogDisable(address connector)
```

### LogEnableStatic

```solidity
event LogEnableStatic(address connector)
```

### enable

```solidity
function enable(address _connector) external
```

_Enable Connector._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _connector | address | Connector Address. |

### disable

```solidity
function disable(address _connector) external
```

_Disable Connector._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _connector | address | Connector Address. |

### enableStatic

```solidity
function enableStatic(address _connector) external
```

_Enable Static Connector._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _connector | address | Static Connector Address. |

### isConnector

```solidity
function isConnector(address[] _connectors) external view returns (bool isOk)
```

_Check if Connector addresses are enabled._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _connectors | address[] | Array of Connector Addresses. |

### isStaticConnector

```solidity
function isStaticConnector(address[] _connectors) external view returns (bool isOk)
```

_Check if Connector addresses are static enabled._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _connectors | address[] | Array of Connector Addresses. |

### connectorLength

```solidity
function connectorLength() external view returns (uint256)
```

_get Connector's Array length._

### staticConnectorLength

```solidity
function staticConnectorLength() external view returns (uint256)
```

_get Static Connector's Array length._

## AccountInterface

_Connector For Adding Auth._

### enable

```solidity
function enable(address user) external
```

### disable

```solidity
function disable(address user) external
```

## EventInterface

### emitEvent

```solidity
function emitEvent(uint256 _connectorType, uint256 _connectorID, bytes32 _eventCode, bytes _eventData) external
```

## Basics

### layerEventAddress

```solidity
address layerEventAddress
```

_LayerEvent Address._

### constructor

```solidity
constructor(address _layerEventAddress) public
```

### connectorID

```solidity
function connectorID() public pure returns (uint256 _type, uint256 _id)
```

_Connector ID and Type._

## Auth

### constructor

```solidity
constructor(address _layerEventAddress) public
```

### LogAddAuth

```solidity
event LogAddAuth(address _msgSender, address _auth)
```

### LogRemoveAuth

```solidity
event LogRemoveAuth(address _msgSender, address _auth)
```

### addModule

```solidity
function addModule(address user) public payable
```

_Add New Owner_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| user | address | User Address. |

### removeModule

```solidity
function removeModule(address user) public payable
```

_Remove New Owner_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| user | address | User Address. |

## ConnectAuth

### constructor

```solidity
constructor(address _layerEventAddress) public
```

### name

```solidity
string name
```

## ERC20Interface

_Connector to deposit/withdraw assets._

### allowance

```solidity
function allowance(address, address) external view returns (uint256)
```

### balanceOf

```solidity
function balanceOf(address) external view returns (uint256)
```

### approve

```solidity
function approve(address, uint256) external
```

### transfer

```solidity
function transfer(address, uint256) external returns (bool)
```

### transferFrom

```solidity
function transferFrom(address, address, uint256) external returns (bool)
```

## AccountInterface

### isAuth

```solidity
function isAuth(address _user) external view returns (bool)
```

## MemoryInterface

### getUint

```solidity
function getUint(uint256 _id) external returns (uint256 _num)
```

### setUint

```solidity
function setUint(uint256 _id, uint256 _val) external
```

## EventInterface

### emitEvent

```solidity
function emitEvent(uint256 _connectorType, uint256 _connectorID, bytes32 _eventCode, bytes _eventData) external
```

## Memory

### layerMemoryAddress

```solidity
address layerMemoryAddress
```

_LayerMemory Address._

### constructor

```solidity
constructor(address _layerMemoryAddress) public
```

### getUint

```solidity
function getUint(uint256 getId, uint256 val) internal returns (uint256 returnVal)
```

_Get Stored Uint Value From LayerMemory._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| getId | uint256 | Storage ID. |
| val | uint256 | if any value. |

### setUint

```solidity
function setUint(uint256 setId, uint256 val) internal
```

_Store Uint Value In LayerMemory._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| setId | uint256 | Storage ID. |
| val | uint256 | Value To store. |

### connectorID

```solidity
function connectorID() public pure returns (uint256 _type, uint256 _id)
```

_Connector ID and Type._

## BasicResolver

### LogDeposit

```solidity
event LogDeposit(address erc20, uint256 tokenAmt, uint256 getId, uint256 setId)
```

### LogWithdraw

```solidity
event LogWithdraw(address erc20, uint256 tokenAmt, address to, uint256 getId, uint256 setId)
```

### layerEventAddress

```solidity
address layerEventAddress
```

_LayerEvent Address._

### constructor

```solidity
constructor(address _layerEventAddress, address _layerMemoryAddress) public
```

### getEthAddr

```solidity
function getEthAddr() public pure returns (address)
```

_ETH Address._

### deposit

```solidity
function deposit(address erc20, uint256 tokenAmt, uint256 getId, uint256 setId) public payable
```

_Deposit Assets To Smart Account._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| erc20 | address | Token Address. |
| tokenAmt | uint256 | Token Amount. |
| getId | uint256 | Get Storage ID. |
| setId | uint256 | Set Storage ID. |

### withdraw

```solidity
function withdraw(address erc20, uint256 tokenAmt, address payable to, uint256 getId, uint256 setId) public payable
```

_Withdraw Assets To Smart Account._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| erc20 | address | Token Address. |
| tokenAmt | uint256 | Token Amount. |
| to | address payable | Withdraw token address. |
| getId | uint256 | Get Storage ID. |
| setId | uint256 | Set Storage ID. |

## ConnectBasic

### constructor

```solidity
constructor(address _layerEventAddress, address _layerMemoryAddress) public
```

### name

```solidity
string name
```

## ListInterface

### accountID

```solidity
function accountID(address) external view returns (uint64)
```

## LayerEvent

### layerList

```solidity
address layerList
```

### constructor

```solidity
constructor(address _layerList) public
```

### LogEvent

```solidity
event LogEvent(uint64 connectorType, uint64 connectorID, uint64 accountID, bytes32 eventCode, bytes eventData)
```

### emitEvent

```solidity
function emitEvent(uint256 _connectorType, uint256 _connectorID, bytes32 _eventCode, bytes _eventData) external
```

## LayerMemory

_Store Data For Cast Function._

### mbytes

```solidity
mapping(address => mapping(uint256 => bytes32)) mbytes
```

### muint

```solidity
mapping(address => mapping(uint256 => uint256)) muint
```

### maddr

```solidity
mapping(address => mapping(uint256 => address)) maddr
```

### setBytes

```solidity
function setBytes(uint256 _id, bytes32 _byte) public
```

_Store Bytes._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _id | uint256 | Storage ID. |
| _byte | bytes32 | bytes data to store. |

### getBytes

```solidity
function getBytes(uint256 _id) public returns (bytes32 _byte)
```

_Get Stored Bytes._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _id | uint256 | Storage ID. |

### setUint

```solidity
function setUint(uint256 _id, uint256 _num) public
```

_Store Uint._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _id | uint256 | Storage ID. |
| _num | uint256 | uint data to store. |

### getUint

```solidity
function getUint(uint256 _id) public returns (uint256 _num)
```

_Get Stored Uint._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _id | uint256 | Storage ID. |

### setAddr

```solidity
function setAddr(uint256 _id, address _addr) public
```

_Store Address._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _id | uint256 | Storage ID. |
| _addr | address | Address data to store. |

### getAddr

```solidity
function getAddr(uint256 _id) public returns (address _addr)
```

_Get Stored Address._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _id | uint256 | Storage ID. |

## Record

_DeFi Smart Account Wallet._

### version

```solidity
uint256 version
```

## LayerAccountV3

### receive

```solidity
receive() external payable
```

## Record

_DeFi Smart Account Wallet._

### version

```solidity
uint256 version
```

## LayerAccountV4

### receive

```solidity
receive() external payable
```

## Change

### status

```solidity
bool status
```

### change

```solidity
function change(bool _status) public
```

## LayerCheck

### isOk

```solidity
function isOk() external view returns (bool ok)
```

## IndexInterface

_Registry for Connectors._

### master

```solidity
function master() external view returns (address)
```

## ConnectorInterface

### connectorID

```solidity
function connectorID() external view returns (uint256 _type, uint256 _id)
```

### name

```solidity
function name() external view returns (string)
```

## DSMath

### add

```solidity
function add(uint256 x, uint256 y) internal pure returns (uint256 z)
```

### sub

```solidity
function sub(uint256 x, uint256 y) internal pure returns (uint256 z)
```

## Controllers

### LogAddController

```solidity
event LogAddController(address addr)
```

### LogRemoveController

```solidity
event LogRemoveController(address addr)
```

### layerIndex

```solidity
address layerIndex
```

### constructor

```solidity
constructor(address _layerIndex) public
```

### chief

```solidity
mapping(address => bool) chief
```

### connectors

```solidity
mapping(address => bool) connectors
```

### staticConnectors

```solidity
mapping(address => bool) staticConnectors
```

### isChief

```solidity
modifier isChief()
```

_Throws if the sender not is Master Address from LayerIndex
or Enabled Chief._

### enableChief

```solidity
function enableChief(address _userAddress) external
```

_Enable a Chief._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _userAddress | address | Chief Address. |

### disableChief

```solidity
function disableChief(address _userAddress) external
```

_Disables a Chief._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _userAddress | address | Chief Address. |

## Listings

### constructor

```solidity
constructor(address _layerIndex) public
```

### connectorArray

```solidity
address[] connectorArray
```

### connectorCount

```solidity
uint256 connectorCount
```

### addToArr

```solidity
function addToArr(address _connector) internal
```

_Add Connector to Connector's array._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _connector | address | Connector Address. |

### staticConnectorArray

```solidity
address[] staticConnectorArray
```

### addToArrStatic

```solidity
function addToArrStatic(address _connector) internal
```

_Add Connector to Static Connector's array._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _connector | address | Static Connector Address. |

## LayerConnectorsTest

### constructor

```solidity
constructor(address _layerIndex) public
```

### LogEnable

```solidity
event LogEnable(address connector)
```

### LogDisable

```solidity
event LogDisable(address connector)
```

### LogEnableStatic

```solidity
event LogEnableStatic(address connector)
```

### enable

```solidity
function enable(address _connector) external
```

_Enable Connector._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _connector | address | Connector Address. |

### disable

```solidity
function disable(address _connector) external
```

_Disable Connector._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _connector | address | Connector Address. |

### enableStatic

```solidity
function enableStatic(address _connector) external
```

_Enable Static Connector._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _connector | address | Static Connector Address. |

### isConnector

```solidity
function isConnector(address[] _connectors) external view returns (bool isOk)
```

_Check if Connector addresses are enabled._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _connectors | address[] | Array of Connector Addresses. |

### isStaticConnector

```solidity
function isStaticConnector(address[] _connectors) external view returns (bool isOk)
```

_Check if Connector addresses are static enabled._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _connectors | address[] | Array of Connector Addresses. |

### connectorLength

```solidity
function connectorLength() external view returns (uint256)
```

_get Connector's Array length._

### staticConnectorLength

```solidity
function staticConnectorLength() external view returns (uint256)
```

_get Static Connector's Array length._

## StaticTest

_Connector For Testing Static connectors._

### connectorID

```solidity
function connectorID() public pure returns (uint256 _type, uint256 _id)
```

_Connector ID and Type._

## IndexInterface

### list

```solidity
function list() external view returns (address)
```

## ListInterface

### addAuth

```solidity
function addAuth(address user) external
```

### removeAuth

```solidity
function removeAuth(address user) external
```

## Constants

### implementationVersion

```solidity
uint256 implementationVersion
```

### layerIndex

```solidity
address layerIndex
```

### version

```solidity
uint256 version
```

### constructor

```solidity
constructor(address _layerIndex) public
```

## Record

### constructor

```solidity
constructor(address _layerIndex) public
```

### LogEnableUser

```solidity
event LogEnableUser(address user)
```

### LogDisableUser

```solidity
event LogDisableUser(address user)
```

### LogBetaMode

```solidity
event LogBetaMode(bool beta)
```

### isAuth

```solidity
function isAuth(address user) public view returns (bool)
```

_Check for Auth if enabled._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| user | address | address/user/owner. |

### isBeta

```solidity
function isBeta() public view returns (bool)
```

_Check if Beta mode is enabled or not_

### enable

```solidity
function enable(address user) public
```

_Enable New User._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| user | address | Owner address |

### disable

```solidity
function disable(address user) public
```

_Disable User._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| user | address | Owner address |

### toggleBeta

```solidity
function toggleBeta() public
```

### onERC721Received

```solidity
function onERC721Received(address, address, uint256, bytes) external returns (bytes4)
```

_ERC721 token receiver_

### onERC1155Received

```solidity
function onERC1155Received(address, address, uint256, uint256, bytes) external returns (bytes4)
```

_ERC1155 token receiver_

### onERC1155BatchReceived

```solidity
function onERC1155BatchReceived(address, address, uint256[], uint256[], bytes) external returns (bytes4)
```

_ERC1155 token receiver_

## LayerDefaultImplementation

### constructor

```solidity
constructor(address _layerIndex) public
```

### receive

```solidity
receive() external payable
```

## ConnectorsInterface

_DeFi Smart Account Wallet._

### isConnectors

```solidity
function isConnectors(string[] connectorNames) external view returns (bool, address[])
```

## Constants

### layerIndex

```solidity
address layerIndex
```

### connectorsM1

```solidity
address connectorsM1
```

### constructor

```solidity
constructor(address _layerIndex, address _connectors) public
```

## LayerImplementationM1

### constructor

```solidity
constructor(address _layerIndex, address _connectors) public
```

### decodeEvent

```solidity
function decodeEvent(bytes response) internal pure returns (string _eventCode, bytes _eventParams)
```

### LogCast

```solidity
event LogCast(address origin, address sender, uint256 value, string[] targetsNames, address[] targets, string[] eventNames, bytes[] eventParams)
```

### receive

```solidity
receive() external payable
```

### spell

```solidity
function spell(address _target, bytes _data) internal returns (bytes response)
```

_Delegate the calls to Connector._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _target | address | Connector address |
| _data | bytes | CallData of function. |

### cast

```solidity
function cast(string[] _targetNames, bytes[] _datas, address _origin) external payable returns (bytes32)
```

_This is the main function, Where all the different functions are called
from Smart Account._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _targetNames | string[] | Array of Connector address. |
| _datas | bytes[] | Array of Calldata. |
| _origin | address |  |

## TokenTest

ERC1155 Token contract
For testing purpose.

### constructor

```solidity
constructor() public
```

### _token1

```solidity
uint256 _token1
```

### _token2

```solidity
uint256 _token2
```

### LogTransferERC1155

```solidity
event LogTransferERC1155(address from, address to, uint256 tokenId, uint256 amount)
```

### LogTransferBatchERC1155

```solidity
event LogTransferBatchERC1155(address from, address to, uint256[] tokenIds, uint256[] amounts)
```

### transfer1155

```solidity
function transfer1155(address _to, uint256 id, uint256 amount) public
```

### transferBatch1155

```solidity
function transferBatch1155(address _to, uint256[] ids, uint256[] amounts) public
```

## ConnectorsInterface

_DeFi Smart Account Wallet._

### isConnectors

```solidity
function isConnectors(string[] connectorNames) external view returns (bool, address[])
```

## Constants

### layerIndex

```solidity
address layerIndex
```

### connectorsM1

```solidity
address connectorsM1
```

### constructor

```solidity
constructor(address _layerIndex, address _connectors) public
```

## LayerImplementationBetaTest

### constructor

```solidity
constructor(address _layerIndex, address _connectors) public
```

### decodeEvent

```solidity
function decodeEvent(bytes response) internal pure returns (string _eventCode, bytes _eventParams)
```

### LogCast

```solidity
event LogCast(address origin, address sender, uint256 value, string[] targetsNames, address[] targets, string[] eventNames, bytes[] eventParams)
```

### receive

```solidity
receive() external payable
```

### spell

```solidity
function spell(address _target, bytes _data) internal returns (bytes response)
```

_Delegate the calls to Connector._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _target | address | Connector address |
| _data | bytes | CallData of function. |

### castBeta

```solidity
function castBeta(string[] _targetNames, bytes[] _datas, address _origin) external payable returns (bytes32)
```

_This is the main function, Where all the different functions are called
from Smart Account._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _targetNames | string[] | Array of Connector address. |
| _datas | bytes[] | Array of Calldata. |
| _origin | address |  |

## DefaultImplementation

_DeFi Smart Account Wallet._

### version

```solidity
function version() external view returns (uint256)
```

### isAuth

```solidity
function isAuth(address) external view returns (bool)
```

## IndexInterface

### connectors

```solidity
function connectors(uint256 version) external view returns (address)
```

### check

```solidity
function check(uint256 version) external view returns (address)
```

## ConnectorsInterface

### isConnectors

```solidity
function isConnectors(string[] connectorNames) external view returns (bool, address[])
```

## CheckInterface

### isOk

```solidity
function isOk() external view returns (bool)
```

## LayerImplementationM2

### layerIndex

```solidity
address layerIndex
```

### connectorsM2

```solidity
address connectorsM2
```

### constructor

```solidity
constructor(address _layerIndex, address _connectors) public
```

### decodeEvent

```solidity
function decodeEvent(bytes response) internal pure returns (string _eventCode, bytes _eventParams)
```

### LogCast

```solidity
event LogCast(address origin, address sender, uint256 value, string[] targetsNames, address[] targets, string[] eventNames, bytes[] eventParams)
```

### receive

```solidity
receive() external payable
```

### spell

```solidity
function spell(address _target, bytes _data) internal returns (bytes response)
```

_Delegate the calls to Connector And this function is ran by cast()._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _target | address | Target to of Connector. |
| _data | bytes | CallData of function in Connector. |

### castWithFlashloan

```solidity
function castWithFlashloan(string[] _targetNames, bytes[] _datas, address _origin) external payable returns (bytes32)
```

_This is the main function, Where all the different functions are called
from Smart Account._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _targetNames | string[] | Array of Target(s) to of Connector. |
| _datas | bytes[] | Array of Calldata(S) of function. |
| _origin | address |  |

## IndexInterface

Test ImplementationM0
Defi Smart Account
Not a complete or correct contract.

### list

```solidity
function list() external view returns (address)
```

## ListInterface

### addAuth

```solidity
function addAuth(address user) external
```

## CommonSetup

### auth

```solidity
mapping(address => bool) auth
```

## Record

### layerIndex

```solidity
address layerIndex
```

### constructor

```solidity
constructor(address _layerIndex) public
```

### LogEnableUser

```solidity
event LogEnableUser(address user)
```

### LogPayEther

```solidity
event LogPayEther(uint256 amt)
```

### handlePayment

```solidity
function handlePayment(address payable _account) public payable
```

_Test function to check transfer of ether, should not be used._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _account | address payable | account module address. |

## LayerImplementationM0Test

### constructor

```solidity
constructor(address _layerIndex) public
```

## NFTTest

ERC721 Token contract
For testing purpose.

### constructor

```solidity
constructor() public
```

### _tokenIds

```solidity
uint256 _tokenIds
```

### LogTransferERC721

```solidity
event LogTransferERC721(address from, address to, uint256 tokenId)
```

### transferNFT

```solidity
function transferNFT(address _to) public
```

## IndexInterface

### list

```solidity
function list() external view returns (address)
```

## CheckInterface

### isOk

```solidity
function isOk() external view returns (bool)
```

## ListInterface

### addAuth

```solidity
function addAuth(address user) external
```

### removeAuth

```solidity
function removeAuth(address user) external
```

## CommonSetup

### implementationVersion

```solidity
uint256 implementationVersion
```

### layerIndex

```solidity
address layerIndex
```

### version

```solidity
uint256 version
```

### auth

```solidity
mapping(address => bool) auth
```

### shield

```solidity
bool shield
```

### checkMapping

```solidity
mapping(address => bool) checkMapping
```

## Record

### LogReceiveEther

```solidity
event LogReceiveEther(uint256 amt)
```

### LogEnableUser

```solidity
event LogEnableUser(address user)
```

### LogDisableUser

```solidity
event LogDisableUser(address user)
```

### LogSwitchShield

```solidity
event LogSwitchShield(bool _shield)
```

### LogCheckMapping

```solidity
event LogCheckMapping(address user, bool check)
```

### isAuth

```solidity
function isAuth(address user) public view returns (bool)
```

_Check for Auth if enabled._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| user | address | address/user/owner. |

### switchShield

```solidity
function switchShield(bool _shield) external
```

_Change Shield State._

### editCheckMapping

```solidity
function editCheckMapping(address user, bool _bool) public
```

### enable

```solidity
function enable(address user) public
```

_Enable New User._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| user | address | Owner of the Smart Account. |

### disable

```solidity
function disable(address user) public
```

_Disable User._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| user | address | Owner of the Smart Account. |

### receiveEther

```solidity
function receiveEther() public payable
```

_Test function to check receival of ether to contract._

## LayerDefaultImplementationV2

### receive

```solidity
receive() external payable
```

## Variables

_This contract manages the authorization and beta mode settings for the platform._

### _auth

```solidity
mapping(address => bool) _auth
```

_Mapping of address to boolean indicating authorization status._

### _beta

```solidity
bool _beta
```

_Boolean flag to enable or disable beta features._

## AccountInterface

_Connector For Adding Authorities._

### enable

```solidity
function enable(address) external
```

### disable

```solidity
function disable(address) external
```

## ListInterface

### UserLink

```solidity
struct UserLink {
  uint64 first;
  uint64 last;
  uint64 count;
}
```

### UserList

```solidity
struct UserList {
  uint64 prev;
  uint64 next;
}
```

### AccountLink

```solidity
struct AccountLink {
  address first;
  address last;
  uint64 count;
}
```

### AccountList

```solidity
struct AccountList {
  address prev;
  address next;
}
```

### accounts

```solidity
function accounts() external view returns (uint256)
```

### accountID

```solidity
function accountID(address) external view returns (uint64)
```

### accountAddr

```solidity
function accountAddr(uint64) external view returns (address)
```

### userLink

```solidity
function userLink(address) external view returns (struct ListInterface.UserLink)
```

### userList

```solidity
function userList(address, uint64) external view returns (struct ListInterface.UserList)
```

### accountLink

```solidity
function accountLink(uint64) external view returns (struct ListInterface.AccountLink)
```

### accountList

```solidity
function accountList(uint64, address) external view returns (struct ListInterface.AccountList)
```

## Basics

### layerList

```solidity
address layerList
```

_Return Address._

### constructor

```solidity
constructor(address _layerList) public
```

## Helpers

### constructor

```solidity
constructor(address _layerList) public
```

### checkAuthCount

```solidity
function checkAuthCount() internal view returns (uint256 count)
```

## Auth

### constructor

```solidity
constructor(address _layerList) public
```

### LogAddAuth

```solidity
event LogAddAuth(address _msgSender, address _authority)
```

### LogRemoveAuth

```solidity
event LogRemoveAuth(address _msgSender, address _authority)
```

### add

```solidity
function add(address authority) external payable returns (string _eventName, bytes _eventParam)
```

_Add New authority_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| authority | address | authority Address. |

### remove

```solidity
function remove(address authority) external payable returns (string _eventName, bytes _eventParam)
```

_Remove authority_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| authority | address | authority Address. |

## ConnectV2Auth

### constructor

```solidity
constructor(address _layerList) public
```

### name

```solidity
string name
```

## AccountInterface

_betamode connect_

### enable

```solidity
function enable(address) external
```

### disable

```solidity
function disable(address) external
```

### isAuth

```solidity
function isAuth(address) external view returns (bool)
```

### isBeta

```solidity
function isBeta() external view returns (bool)
```

### toggleBeta

```solidity
function toggleBeta() external
```

## Events

### LogEnableBeta

```solidity
event LogEnableBeta()
```

### LogDisableBeta

```solidity
event LogDisableBeta()
```

## Resolver

### enable

```solidity
function enable() external payable returns (string _eventName, bytes _eventParam)
```

enabling beta mode gives early access to new/risky features

_Enable beta mode_

### disable

```solidity
function disable() external payable returns (string _eventName, bytes _eventParam)
```

disabling beta mode removes early access to new/risky features

_Disable beta mode_

## ConnectV2Beta

### name

```solidity
string name
```

## CTokenInterface

### mint

```solidity
function mint(uint256 mintAmount) external returns (uint256)
```

### redeem

```solidity
function redeem(uint256 redeemTokens) external returns (uint256)
```

### borrow

```solidity
function borrow(uint256 borrowAmount) external returns (uint256)
```

### repayBorrow

```solidity
function repayBorrow(uint256 repayAmount) external returns (uint256)
```

### repayBorrowBehalf

```solidity
function repayBorrowBehalf(address borrower, uint256 repayAmount) external returns (uint256)
```

### liquidateBorrow

```solidity
function liquidateBorrow(address borrower, uint256 repayAmount, address cTokenCollateral) external returns (uint256)
```

### borrowBalanceCurrent

```solidity
function borrowBalanceCurrent(address account) external returns (uint256)
```

### redeemUnderlying

```solidity
function redeemUnderlying(uint256 redeemAmount) external returns (uint256)
```

### exchangeRateCurrent

```solidity
function exchangeRateCurrent() external returns (uint256)
```

### balanceOf

```solidity
function balanceOf(address owner) external view returns (uint256 balance)
```

## CETHInterface

### mint

```solidity
function mint() external payable
```

### repayBorrow

```solidity
function repayBorrow() external payable
```

### repayBorrowBehalf

```solidity
function repayBorrowBehalf(address borrower) external payable
```

### liquidateBorrow

```solidity
function liquidateBorrow(address borrower, address cTokenCollateral) external payable
```

## TokenInterface

### allowance

```solidity
function allowance(address, address) external view returns (uint256)
```

### balanceOf

```solidity
function balanceOf(address) external view returns (uint256)
```

### approve

```solidity
function approve(address, uint256) external
```

### transfer

```solidity
function transfer(address, uint256) external returns (bool)
```

### transferFrom

```solidity
function transferFrom(address, address, uint256) external returns (bool)
```

## ComptrollerInterface

### enterMarkets

```solidity
function enterMarkets(address[] cTokens) external returns (uint256[])
```

### exitMarket

```solidity
function exitMarket(address cTokenAddress) external returns (uint256)
```

### getAssetsIn

```solidity
function getAssetsIn(address account) external view returns (address[])
```

### getAccountLiquidity

```solidity
function getAccountLiquidity(address account) external view returns (uint256, uint256, uint256)
```

### claimComp

```solidity
function claimComp(address) external
```

## layerMapping

### cTokenMapping

```solidity
function cTokenMapping(address) external view returns (address)
```

## MemoryInterface

### getUint

```solidity
function getUint(uint256 _id) external returns (uint256 _num)
```

### setUint

```solidity
function setUint(uint256 _id, uint256 _val) external
```

## DSMath

### add

```solidity
function add(uint256 x, uint256 y) internal pure returns (uint256 z)
```

### mul

```solidity
function mul(uint256 x, uint256 y) internal pure returns (uint256 z)
```

### WAD

```solidity
uint256 WAD
```

### wmul

```solidity
function wmul(uint256 x, uint256 y) internal pure returns (uint256 z)
```

### wdiv

```solidity
function wdiv(uint256 x, uint256 y) internal pure returns (uint256 z)
```

### sub

```solidity
function sub(uint256 x, uint256 y) internal pure returns (uint256 z)
```

## Helpers

### getAddressETH

```solidity
function getAddressETH() internal pure returns (address)
```

_Return ethereum address_

### getMemoryAddr

```solidity
function getMemoryAddr() internal pure returns (address)
```

_Return Memory Variable Address_

### getUint

```solidity
function getUint(uint256 getId, uint256 val) internal returns (uint256 returnVal)
```

_Get Uint value from layerMemory Contract._

### setUint

```solidity
function setUint(uint256 setId, uint256 val) internal
```

_Set Uint value in layerMemory Contract._

## CompoundHelpers

### getComptrollerAddress

```solidity
function getComptrollerAddress() internal pure returns (address)
```

_Return Compound Comptroller Address_

### getCompTokenAddress

```solidity
function getCompTokenAddress() internal pure returns (address)
```

_Return COMP Token Address._

### getMappingAddr

```solidity
function getMappingAddr() internal pure returns (address)
```

_Return layerDApp Mapping Addresses_

### enterMarket

```solidity
function enterMarket(address cToken) internal
```

_enter compound market_

## BasicResolver

### LogDeposit

```solidity
event LogDeposit(address token, address cToken, uint256 tokenAmt, uint256 getId, uint256 setId)
```

### LogWithdraw

```solidity
event LogWithdraw(address token, address cToken, uint256 tokenAmt, uint256 getId, uint256 setId)
```

### LogBorrow

```solidity
event LogBorrow(address token, address cToken, uint256 tokenAmt, uint256 getId, uint256 setId)
```

### LogPayback

```solidity
event LogPayback(address token, address cToken, uint256 tokenAmt, uint256 getId, uint256 setId)
```

### deposit

```solidity
function deposit(address token, uint256 amt, uint256 getId, uint256 setId) external payable returns (string _eventName, bytes _eventParam)
```

_Deposit ETH/ERC20_Token._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | address | token address to deposit.(For ETH: 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE) |
| amt | uint256 | token amount to deposit. |
| getId | uint256 | Get token amount at this ID from `layerMemory` Contract. |
| setId | uint256 | Set token amount at this ID in `layerMemory` Contract. |

### withdraw

```solidity
function withdraw(address token, uint256 amt, uint256 getId, uint256 setId) external payable returns (string _eventName, bytes _eventParam)
```

_Withdraw ETH/ERC20_Token._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | address | token address to withdraw.(For ETH: 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE) |
| amt | uint256 | token amount to withdraw. |
| getId | uint256 | Get token amount at this ID from `layerMemory` Contract. |
| setId | uint256 | Set token amount at this ID in `layerMemory` Contract. |

### borrow

```solidity
function borrow(address token, uint256 amt, uint256 getId, uint256 setId) external payable returns (string _eventName, bytes _eventParam)
```

_Borrow ETH/ERC20_Token._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | address | token address to borrow.(For ETH: 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE) |
| amt | uint256 | token amount to borrow. |
| getId | uint256 | Get token amount at this ID from `layerMemory` Contract. |
| setId | uint256 | Set token amount at this ID in `layerMemory` Contract. |

### payback

```solidity
function payback(address token, uint256 amt, uint256 getId, uint256 setId) external payable returns (string _eventName, bytes _eventParam)
```

_Payback borrowed ETH/ERC20_Token._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | address | token address to payback.(For ETH: 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE) |
| amt | uint256 | token amount to payback. |
| getId | uint256 | Get token amount at this ID from `layerMemory` Contract. |
| setId | uint256 | Set token amount at this ID in `layerMemory` Contract. |

## ConnectCompound

### name

```solidity
string name
```

## IndexInterface

_Registry for Connectors._

### master

```solidity
function master() external view returns (address)
```

## ConnectorInterface

### name

```solidity
function name() external view returns (string)
```

## Controllers

### LogController

```solidity
event LogController(address addr, bool isChief)
```

### layerIndex

```solidity
address layerIndex
```

### constructor

```solidity
constructor(address _layerIndex) public
```

### chief

```solidity
mapping(address => bool) chief
```

### connectors

```solidity
mapping(string => address) connectors
```

### isChief

```solidity
modifier isChief()
```

_Throws if the sender not is Master Address from layerIndex
or Enabled Chief._

### toggleChief

```solidity
function toggleChief(address _chiefAddress) external
```

_Toggle a Chief. Enable if disable & vice versa_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _chiefAddress | address | Chief Address. |

## LayerConnectorsV2Test

### LogConnectorAdded

```solidity
event LogConnectorAdded(bytes32 connectorNameHash, string connectorName, address connector)
```

### LogConnectorUpdated

```solidity
event LogConnectorUpdated(bytes32 connectorNameHash, string connectorName, address oldConnector, address newConnector)
```

### LogConnectorRemoved

```solidity
event LogConnectorRemoved(bytes32 connectorNameHash, string connectorName, address connector)
```

### constructor

```solidity
constructor(address _layerIndex) public
```

### addConnectors

```solidity
function addConnectors(string[] _connectorNames, address[] _connectors) external
```

_Add Connectors_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _connectorNames | string[] | Array of Connector Names. |
| _connectors | address[] | Array of Connector Address. |

### updateConnectors

```solidity
function updateConnectors(string[] _connectorNames, address[] _connectors) external
```

_Update Connectors_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _connectorNames | string[] | Array of Connector Names. |
| _connectors | address[] | Array of Connector Address. |

### removeConnectors

```solidity
function removeConnectors(string[] _connectorNames) external
```

_Remove Connectors_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _connectorNames | string[] | Array of Connector Names. |

### isConnectors

```solidity
function isConnectors(string[] _connectorNames) external view returns (bool isOk, address[] _connectors)
```

_Check if Connector addresses are enabled._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _connectorNames | string[] |  |

## ConnectV2EmitEvent

### LogEmitEvent

```solidity
event LogEmitEvent(address dsaAddress, address _sender)
```

### emitEvent

```solidity
function emitEvent() public payable returns (string _eventName, bytes _eventParam)
```

### name

```solidity
string name
```

## AccountImplementations

_Interface for fetching the implementation address for a given function signature._

### getImplementation

```solidity
function getImplementation(bytes4 _sig) external view returns (address)
```

## LayerAccountV2

_This contract provides a mechanism to delegate calls to other contracts based on function signatures.
It uses a registry (AccountImplementations) to determine which contract should handle a given call._

### implementations

```solidity
contract AccountImplementations implementations
```

### constructor

```solidity
constructor(address _implementations) public
```

_Initializes the contract with the address of the implementations registry._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _implementations | address | Address of the implementations registry. |

### _delegate

```solidity
function _delegate(address implementation) internal
```

_Delegates the current call to the provided implementation address._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| implementation | address | Address of the contract to which the call should be delegated. Note: This function does not return to its internal call site. It returns directly to the external caller. |

### _fallback

```solidity
function _fallback(bytes4 _sig) internal
```

_Delegates the current call based on the function signature to the address returned by the Implementations registry._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _sig | bytes4 | Function signature of the current call. Note: This function does not return to its internal call site. It returns directly to the external caller. |

### fallback

```solidity
fallback() external payable
```

_Fallback function that delegates calls based on their function signature to the address returned by the Implementations registry._

### receive

```solidity
receive() external payable
```

_Receive function that handles incoming ether. If a function signature is provided, it delegates the call based on the signature._

## LayerConnectorsV2Proxy

_This contract is a transparent upgradeable proxy for the LayerConnectorsV2 contract.
It allows for the logic contract (LayerConnectorsV2) to be upgraded while maintaining the same storage and address._

### constructor

```solidity
constructor(address _logic, address admin_, bytes _data) public
```

_Initializes the proxy with the initial logic contract, admin address, and any initial data._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _logic | address | Address of the initial logic contract. |
| admin_ | address | Address of the admin who can upgrade the proxy. |
| _data | bytes | Data to be passed as msg.data to the logic contract for any initialization. |

## LayerConnectorsV2Impl

_This contract serves as the implementation for the LayerConnectorsV2._

## IndexInterface

_Interface for the LayerIndex contract to fetch the master address._

### master

```solidity
function master() external view returns (address)
```

## ConnectorInterface

_Interface for the Connector to fetch its name._

### name

```solidity
function name() external view returns (string)
```

## Controllers

_This contract manages the chief controllers who have the authority to add, update, or remove connectors._

### LogController

```solidity
event LogController(address addr, bool isChief)
```

### layerIndex

```solidity
address layerIndex
```

### constructor

```solidity
constructor(address _layerIndex) public
```

### chief

```solidity
mapping(address => bool) chief
```

### connectors

```solidity
mapping(string => address) connectors
```

### isChief

```solidity
modifier isChief()
```

_Modifier to ensure the caller is a chief or the master of the LayerIndex._

### toggleChief

```solidity
function toggleChief(address _chiefAddress) external
```

_Enables or disables a chief controller._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _chiefAddress | address | Address of the chief to be toggled. |

## LayerConnectorsV2

_Main contract for managing and interacting with connectors._

### LogConnectorAdded

```solidity
event LogConnectorAdded(bytes32 connectorNameHash, string connectorName, address connector)
```

### LogConnectorUpdated

```solidity
event LogConnectorUpdated(bytes32 connectorNameHash, string connectorName, address oldConnector, address newConnector)
```

### LogConnectorRemoved

```solidity
event LogConnectorRemoved(bytes32 connectorNameHash, string connectorName, address connector)
```

### constructor

```solidity
constructor(address _layerIndex) public
```

### addConnectors

```solidity
function addConnectors(string[] _connectorNames, address[] _connectors) external
```

_Adds new connectors to the registry._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _connectorNames | string[] | Names of the connectors to be added. |
| _connectors | address[] | Addresses of the connectors to be added. |

### updateConnectors

```solidity
function updateConnectors(string[] _connectorNames, address[] _connectors) external
```

_Updates existing connectors in the registry._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _connectorNames | string[] | Names of the connectors to be updated. |
| _connectors | address[] | New addresses for the connectors. |

### removeConnectors

```solidity
function removeConnectors(string[] _connectorNames) external
```

_Removes connectors from the registry._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _connectorNames | string[] | Names of the connectors to be removed. |

### isConnectors

```solidity
function isConnectors(string[] _connectorNames) external view returns (bool isOk, address[] _connectors)
```

_Checks if the provided connector names are registered and returns their addresses._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _connectorNames | string[] | Names of the connectors to be checked. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| isOk | bool | Boolean indicating if all connectors are registered. |
| _connectors | address[] | Addresses of the checked connectors. |

## IndexInterface

### master

```solidity
function master() external view returns (address)
```

Get the master address from the Index contract.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | The address of the master. |

## Setup

### defaultImplementation

```solidity
address defaultImplementation
```

The default implementation address.

### sigImplementations

```solidity
mapping(bytes4 => address) sigImplementations
```

### implementationSigs

```solidity
mapping(address => bytes4[]) implementationSigs
```

## Implementations

### LogSetDefaultImplementation

```solidity
event LogSetDefaultImplementation(address oldImplementation, address newImplementation)
```

Event emitted when the default implementation is set.

### LogAddImplementation

```solidity
event LogAddImplementation(address implementation, bytes4[] sigs)
```

Event emitted when a new implementation is added.

### LogRemoveImplementation

```solidity
event LogRemoveImplementation(address implementation, bytes4[] sigs)
```

Event emitted when an implementation is removed.

### layerIndex

```solidity
contract IndexInterface layerIndex
```

The Index contract interface.

### constructor

```solidity
constructor(address _layerIndex) public
```

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _layerIndex | address | The address of the Index contract. |

### isMaster

```solidity
modifier isMaster()
```

Modifier to check if the caller is the master address.

### setDefaultImplementation

```solidity
function setDefaultImplementation(address _defaultImplementation) external
```

Set the default implementation address.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _defaultImplementation | address | The address of the new default implementation. |

### addImplementation

```solidity
function addImplementation(address _implementation, bytes4[] _sigs) external
```

Add a new implementation.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _implementation | address | The address of the new implementation. |
| _sigs | bytes4[] | The function signatures that should use this implementation. |

### removeImplementation

```solidity
function removeImplementation(address _implementation) external
```

Remove an implementation.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _implementation | address | The address of the implementation to remove. |

## LayerImplementations

### constructor

```solidity
constructor(address _layerIndex) public
```

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _layerIndex | address | The address of the Index contract. |

### getImplementation

```solidity
function getImplementation(bytes4 _sig) external view returns (address)
```

Get the implementation address for a function signature.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _sig | bytes4 | The function signature to query. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | The address of the implementation. |

### getImplementationSigs

```solidity
function getImplementationSigs(address _impl) external view returns (bytes4[])
```

Get all function signatures for a given implementation address.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _impl | address | The implementation address to query. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bytes4[] | An array of function signatures. |

### getSigImplementation

```solidity
function getSigImplementation(bytes4 _sig) external view returns (address)
```

Get the implementation address for a given function signature.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _sig | bytes4 | The function signature to query. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | The address of the implementation. |

## IndexInterface

_Interface for managing the master address._

### master

```solidity
function master() external view returns (address)
```

Fetches the current master address.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | Address of the current master. |

### changeMaster

```solidity
function changeMaster(address _newMaster) external
```

Proposes a new master address.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _newMaster | address | Address of the proposed new master. |

### updateMaster

```solidity
function updateMaster() external
```

Updates the master address to the proposed address.

## LayerChiefTimelockContract

_This contract extends the OpenZeppelin TimelockController to implement a timelock mechanism for the LayerChief._

### constructor

```solidity
constructor(address[] chiefMultiSig) public
```

Initializes the LayerChiefTimelockContract with a specified chief multi-signature address.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| chiefMultiSig | address[] | Array containing the address of the chief multi-signature. Must have a length of 1. |

## IndexInterface

_Interface for managing the master address._

### master

```solidity
function master() external view returns (address)
```

Fetches the current master address.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | Address of the current master. |

### changeMaster

```solidity
function changeMaster(address _newMaster) external
```

Proposes a new master address.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _newMaster | address | Address of the proposed new master. |

### updateMaster

```solidity
function updateMaster() external
```

Updates the master address to the proposed address.

## LayerTimelockContract

_This contract extends the OpenZeppelin TimelockController and Initializable to implement a timelock mechanism for the Layer._

### layerIndex

```solidity
contract IndexInterface layerIndex
```

### governanceTimelock

```solidity
address governanceTimelock
```

### constructor

```solidity
constructor(address[] masterSig) public
```

Initializes the LayerTimelockContract with a specified master signature address.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| masterSig | address[] | Array containing the address of the master signature. |

### initialize

```solidity
function initialize() external
```

Initializes the contract and updates the master address in the LayerIndex.
Then proposes the governance timelock as the new master.

