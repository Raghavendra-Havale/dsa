// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title Variables
 * @dev This contract manages the authorization settings for the platform.
 */
contract Variables {
    
    /// @dev Mapping of address to boolean indicating authorization status.
    mapping (address => bool) internal _auth;
    
}
