// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Change {
    bool public status;

    function change(bool _status) public {
        status = _status;
    }
}

contract LayerCheck is Change {
    function isOk() external view returns (bool ok) {
        return status;
    }
}
