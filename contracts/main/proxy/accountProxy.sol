// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title AccountImplementations
 * @dev Interface for fetching the implementation address for a given function signature.
 */
interface AccountImplementations {
    function getImplementation(bytes4 _sig) external view returns (address);
}

/**
 * @title LayerAccount
 * @dev This contract provides a mechanism to delegate calls to other contracts based on function signatures.
 * It uses a registry (AccountImplementations) to determine which contract should handle a given call.
 */
contract LayerAccount {

    // Reference to the implementations registry.
    AccountImplementations public immutable implementations;

    /**
     * @dev Initializes the contract with the address of the implementations registry.
     * @param _implementations Address of the implementations registry.
     */
    constructor(address _implementations) {
        implementations = AccountImplementations(_implementations);
    }

    /**
     * @dev Delegates the current call to the provided implementation address.
     * @param implementation Address of the contract to which the call should be delegated.
     * 
     * Note: This function does not return to its internal call site. It returns directly to the external caller.
     */
    function _delegate(address implementation) internal {
        // solhint-disable-next-line no-inline-assembly
        assembly {
            calldatacopy(0, 0, calldatasize())
            let result := delegatecall(gas(), implementation, 0, calldatasize(), 0, 0)
            returndatacopy(0, 0, returndatasize())
            switch result
            case 0 { revert(0, returndatasize()) }
            default { return(0, returndatasize()) }
        }
    }

    /**
     * @dev Delegates the current call based on the function signature to the address returned by the Implementations registry.
     * @param _sig Function signature of the current call.
     * 
     * Note: This function does not return to its internal call site. It returns directly to the external caller.
     */
    function _fallback(bytes4 _sig) internal {
        address _implementation = implementations.getImplementation(_sig);
        require(_implementation != address(0), "LayerAccountV2: No implementation found for the given signature");
        _delegate(_implementation);
    }

    /**
     * @dev Fallback function that delegates calls based on their function signature to the address returned by the Implementations registry.
     */
    fallback () external payable {
        _fallback(msg.sig);
    }

    /**
     * @dev Receive function that handles incoming ether. If a function signature is provided, it delegates the call based on the signature.
     */
    receive () external payable {
        if (msg.sig != 0x00000000) {
            _fallback(msg.sig);
        }
    }
}
