pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

/**
 * @title Test InstaAccount.
 * @dev DeFi Smart Account Wallet.
 */

contract Record {
    uint256 public constant version = 3;
}

contract LayerAccountTestV3 is Record {
    receive() external payable {}
}
