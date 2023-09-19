// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import {TimelockController} from "@openzeppelin/contracts/access/TimelockController.sol";
import { Initializable } from "@openzeppelin/contracts/proxy/Initializable.sol";

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
 * @title LayerTimelockContract
 * @dev This contract extends the OpenZeppelin TimelockController and Initializable to implement a timelock mechanism for the Layer.
 */
contract LayerTimelockContract is Initializable, TimelockController {

    // LayerIndex constant address.
    IndexInterface constant public layerIndex = IndexInterface(0x2971AdFa57b20E5a416aE5a708A8655A9c74f723);
    // Governance timelock constant address.
    address constant public governanceTimelock = 0xC7Cb1dE2721BFC0E0DA1b9D526bCdC54eF1C0eFC;

    /**
     * @notice Initializes the LayerTimelockContract with a specified master signature address.
     * @param masterSig Array containing the address of the master signature.
     */
    constructor (address[] memory masterSig) public TimelockController(10 days, masterSig, masterSig){
    }

    /**
     * @notice Initializes the contract and updates the master address in the LayerIndex.
     * Then proposes the governance timelock as the new master.
     */
    function initialize() external initializer {
        layerIndex.updateMaster();
        layerIndex.changeMaster(governanceTimelock);
    }
}
