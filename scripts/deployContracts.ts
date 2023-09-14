import hre from "hardhat";
const { ethers } = hre;
import addresses from "./constant/addresses";
import layerDeployContract from "./deployContract";

const networkType = process.env.networkType ?? "mainnet";
const LAYER_INDEX = addresses.LayerIndex[networkType];

export default async function () {
  const layerIndex = await ethers.getContractAt("LayerIndex", LAYER_INDEX);

  // const layerIndex = await layerDeployContract("LayerIndex", []);

  const layerConnectorsV2 = await layerDeployContract("LayerConnectorsV2", [
    layerIndex.address,
  ]);

  const implementationsMapping = await layerDeployContract(
    "LayerImplementations",
    [layerIndex.address]
  );

  const layerAccountV2Proxy = await layerDeployContract("LayerAccountV2", [
    implementationsMapping.address,
  ]);

  const layerAccountV2DefaultImpl = await layerDeployContract(
    "LayerDefaultImplementation",
    [layerIndex.address]
  );

  const layerAccountV2ImplM1 = await layerDeployContract(
    "LayerImplementationM1",
    [layerIndex.address, layerConnectorsV2.address]
  );

  const layerAccountV2ImplM2 = await layerDeployContract(
    "LayerImplementationM2",
    [layerIndex.address, layerConnectorsV2.address]
  );

  return {
    layerIndex,
    layerConnectorsV2,
    implementationsMapping,
    layerAccountV2Proxy,
    layerAccountV2DefaultImpl,
    layerAccountV2ImplM1,
    layerAccountV2ImplM2,
  };
}
