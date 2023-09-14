import hre from "hardhat";
const { ethers } = hre;
import addresses from "./constant/addresses";

const networkType = process.env.networkType ?? "mainnet";
const LAYER_INDEX = addresses.LayerIndex[networkType];

export default async function () {
  const layerIndex = await ethers.getContractAt("LayerIndex", LAYER_INDEX);

  const masterAddress = await layerIndex.master(); // TODO: make it constant?
  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [masterAddress],
  });

  return ethers.provider.getSigner(masterAddress);
}
