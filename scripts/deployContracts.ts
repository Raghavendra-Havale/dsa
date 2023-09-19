import hre from "hardhat";
const { ethers } = hre;
import addresses from "./constant/addresses";
import layerDeployContract from "./deployContract";

const networkType = process.env.networkType ?? "mainnet";
const LAYER_INDEX = addresses.LayerIndex[networkType];

export default async function () {
  const layerIndex = await ethers.getContractAt("LayerIndex", LAYER_INDEX);

  // const layerIndex = await layerDeployContract("LayerIndex", []);

  const layerConnectors = await layerDeployContract("LayerConnectors", [
    layerIndex.address,
  ]);

  const implementationsMapping = await layerDeployContract(
    "LayerImplementations",
    [layerIndex.address]
  );

  const layerAccountProxy = await layerDeployContract("LayerAccount", [
    implementationsMapping.address,
  ]);

  const layerAccountV2DefaultImpl = await layerDeployContract(
    "LayerDefaultImplementation",
    [layerIndex.address]
  );

  const layerAccountV2ImplM1 = await layerDeployContract(
    "LayerImplementationM1",
    [layerIndex.address, layerConnectors.address]
  );

  const layerAccountV2ImplM2 = await layerDeployContract(
    "LayerImplementationM2",
    [layerIndex.address, layerConnectors.address]
  );

  return {
    layerIndex,
    layerConnectors,
    implementationsMapping,
    layerAccountProxy,
    layerAccountV2DefaultImpl,
    layerAccountV2ImplM1,
    layerAccountV2ImplM2,
  };
}
