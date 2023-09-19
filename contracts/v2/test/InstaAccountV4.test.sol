pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

/**
 * @title Test InstaAccount.
 * @dev DeFi Smart Account Wallet.
 */

contract Record {
    uint256 public constant version = 4;
}

contract LayerAccountTestV4 is Record {
    receive() external payable {}
}
