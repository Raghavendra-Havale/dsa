import { BytesLike } from "ethers";
import hre from "hardhat";
const { web3, ethers } = hre;
import layerDeployContract from "./deployContract";

async function main() {
  const [deployer] = await ethers.getSigners();
  const deployerAddress = deployer.address;

  console.log(`Deployer Address: ${deployerAddress}`);

  console.log(" Deploying Contracts to", hre.network.name, "...");

  const layerIndex = await layerDeployContract("LayerIndex", []);

  const layerList = await layerDeployContract("LayerList", [
    layerIndex.address,
  ]);

  const layerAccount = await layerDeployContract("LayerAccount", [
    layerIndex.address,
  ]);

  const layerConnectors = await layerDeployContract("LayerConnectors", [
    layerIndex.address,
  ]);

  const layerEvent = await layerDeployContract("LayerEvent", [
    layerList.address,
  ]);

  const layerMemory = await layerDeployContract("LayerMemory", []);

  const layerConnectorsV2Impl = await layerDeployContract(
    "LayerConnectorsV2Impl",
    []
  );

  const layerConnectorsV2Proxy = await layerDeployContract(
    "LayerConnectorsV2Proxy",
    [
      layerConnectorsV2Impl.address,
      "0x9800020b610194dBa52CF606E8Aa142F9F256166",
      "0x",
    ]
  );

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

  console.log("\n########### setBasics ########");

  const setBasicsArgs: [string, string, string, string] = [
    deployerAddress,
    layerList.address,
    layerAccount.address,
    layerConnectors.address,
  ];

  const tx = await layerIndex.setBasics(...setBasicsArgs);
  const txDetails = await tx.wait();
  console.log(`
          status: ${txDetails.status == 1},
          tx: ${txDetails.transactionHash},
        `);
  console.log("###########");

  console.log("\n########### Add DSAv2 Implementations ########");
  let txSetDefaultImplementation = await implementationsMapping.setDefaultImplementation(
    layerAccountV2DefaultImpl.address
  );
  let txSetDefaultImplementationDetails = await txSetDefaultImplementation.wait();

  const implementationV1Args: [string, BytesLike[]] = [
    layerAccountV2ImplM1.address,
    ["cast(string[],bytes[],address)"].map((a) =>
      web3.utils.keccak256(a).slice(0, 10)
    ),
  ];
  const txAddImplementation = await implementationsMapping.addImplementation(
    ...implementationV1Args
  );
  const txAddImplementationDetails = await txAddImplementation.wait();
  console.log(`
        status: ${txAddImplementationDetails.status == 1},
        tx: ${txAddImplementationDetails.transactionHash},
      `);
  console.log("###########\n");

  console.log("\n\n########### Add DSAv2 ########");
  const addNewAccountArgs: [string, string, string] = [
    layerAccountV2Proxy.address,
    layerConnectorsV2Proxy.address,
    ethers.constants.AddressZero,
  ];
  const txAddNewAccount = await layerIndex.addNewAccount(...addNewAccountArgs);
  const txDetailsAddNewAccount = await txAddNewAccount.wait();

  console.log(`
          status: ${txDetailsAddNewAccount.status == 1},
          tx: ${txDetailsAddNewAccount.transactionHash},
      `);
  console.log("###########\n");

  if (hre.network.name === "mainnet" || hre.network.name === "kovan") {
    await hre.run("verify:verify", {
      address: layerConnectorsV2Impl.address,
      constructorArguments: [],
      contract:
        "contracts/v2/proxy/dummyConnectorsImpl.sol:LayerConnectorsV2Impl",
    });
    await hre.run("verify:verify", {
      address: layerConnectorsV2Proxy.address,
      constructorArguments: [
        layerConnectorsV2Impl.address,
        "0x9800020b610194dBa52CF606E8Aa142F9F256166",
        "0x",
      ],
      contract: "contracts/v2/proxy/connectorsProxy.sol:LayerConnectorsV2Proxy",
    });

    await hre.run("verify:verify", {
      address: layerConnectorsV2.address,
      constructorArguments: [],
    });

    await hre.run("verify:verify", {
      address: implementationsMapping.address,
      constructorArguments: [],
    });

    await hre.run("verify:verify", {
      address: layerAccountV2DefaultImpl.address,
      constructorArguments: [],
    });

    await hre.run("verify:verify", {
      address: layerAccountV2ImplM1.address,
      constructorArguments: [layerConnectorsV2.address],
    });

    await hre.run("verify:verify", {
      address: layerAccountV2Proxy.address,
      constructorArguments: [implementationsMapping.address],
    });
  } else {
    console.log("Contracts deployed to", hre.network.name);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
