pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

/**
 * @title Test LayerAccount.
 * @dev DeFi Smart Account Wallet.
 */

contract Record {
    uint256 public constant version = 4;
}

contract LayerAccountV4 is Record {
    receive() external payable {}
}
