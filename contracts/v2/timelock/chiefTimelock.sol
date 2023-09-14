// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import { TimelockController } from "@openzeppelin/contracts/access/TimelockController.sol";

/**
 * @title IndexInterface
 * @dev Interface for managing the master address.
 */
interface IndexInterface {
    /**
     * @notice Fetches the current master address.
     * @return Address of the current master.
     */
    function master() external view returns (address);

    /**
     * @notice Proposes a new master address.
     * @param _newMaster Address of the proposed new master.
     */
    function changeMaster(address _newMaster) external;

    /**
     * @notice Updates the master address to the proposed address.
     */
    function updateMaster() external;
}

/**
 * @title LayerChiefTimelockContract
 * @dev This contract extends the OpenZeppelin TimelockController to implement a timelock mechanism for the LayerChief.
 */
contract LayerChiefTimelockContract is TimelockController {

    /**
     * @notice Initializes the LayerChiefTimelockContract with a specified chief multi-signature address.
     * @param chiefMultiSig Array containing the address of the chief multi-signature. Must have a length of 1.
     */
    constructor (address[] memory chiefMultiSig) public TimelockController(2 days, chiefMultiSig, chiefMultiSig) {
        require(chiefMultiSig.length == 1, "chiefMultiSig length != 1");
    }
}
