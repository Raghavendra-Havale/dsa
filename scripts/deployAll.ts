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

  const implementationsMapping = await layerDeployContract(
    "LayerImplementations",
    [layerIndex.address]
  );

  const layerAccount = await layerDeployContract("LayerAccount", [
    implementationsMapping.address,
  ]);

  const layerConnectors = await layerDeployContract("LayerConnectors", [
    layerIndex.address,
  ]);


  const layerConnectorsImpl = await layerDeployContract(
    "LayerConnectorsImpl",
    []
  );

  const layerConnectorsProxy = await layerDeployContract(
    "LayerConnectorsProxy",
    [
      layerConnectorsImpl.address,
      "0x5dBA78D25000c19E543E7f628eB42776b1498ff7",
      "0x",
    ]
  );

  const layerAccountDefaultImpl = await layerDeployContract(
    "LayerDefaultImplementation",
    [layerIndex.address]
  );

  const layerAccountImplM1 = await layerDeployContract(
    "LayerImplementationM1",
    [layerIndex.address, layerConnectors.address]
  );

  const layerEvent=await layerDeployContract("LayerEvent",[layerList.address]);
  const layerMemory=await layerDeployContract("LayerMemory",[]);

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

  console.log("\n########### Add DSA Implementations ########");
  let txSetDefaultImplementation = await implementationsMapping.setDefaultImplementation(
    layerAccountDefaultImpl.address
  );
  let txSetDefaultImplementationDetails = await txSetDefaultImplementation.wait();

  const implementationV1Args: [string, BytesLike[]] = [
    layerAccountImplM1.address,
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


  if (hre.network.name === "arbitrum" || hre.network.name === "manta") {

    await hre.run("verify:verify", {
      address: layerAccountImplM1.address,
      constructorArguments: [layerIndex.address,layerConnectors.address],
      contract:
      "contracts/main/accounts/module1/Implementation_m1.sol:LayerImplementationM1",
    });

    await hre.run("verify:verify", {
      address: layerEvent.address,
      constructorArguments: [layerList.address],
      contract:
        "contracts/main/misc/event.sol:LayerEvent",
    });

    await hre.run("verify:verify", {
      address: layerMemory.address,
      constructorArguments: [],
      contract:
        "contracts/main/misc/memory.sol:LayerMemory",
    });
   
    await hre.run("verify:verify", {
      address: implementationsMapping.address,
      constructorArguments: [layerIndex.address],
      contract:
      "contracts/main/registry/implementations.sol:LayerImplementations",
    });
    
    await hre.run("verify:verify", {
      address: layerConnectorsImpl.address,
      constructorArguments: [],
      contract:
        "contracts/main/proxy/dummyConnectorsImpl.sol:LayerConnectorsImpl",
    });


    await hre.run("verify:verify", {
      address: layerConnectors.address,
      constructorArguments: [layerIndex.address],
      contract:
        "contracts/main/registry/connectors.sol:LayerConnectors",
    });

    await hre.run("verify:verify", {
      address: layerConnectorsProxy.address,
      constructorArguments: [layerConnectorsImpl.address,"0x5dBA78D25000c19E543E7f628eB42776b1498ff7","0x"],
      contract:
        "contracts/main/proxy/connectorsProxy.sol:LayerConnectorsProxy",
    });

    await hre.run("verify:verify", {
      address: layerAccountDefaultImpl.address,
      constructorArguments: [layerIndex.address],
      contract:
        "contracts/main/accounts/default/implementation_default.sol:LayerDefaultImplementation",
    });

  
    await hre.run("verify:verify", {
      address: layerIndex.address,
      constructorArguments: [],
      contract:
      "contracts/registry/index.sol:LayerIndex",
    });

    await hre.run("verify:verify", {
      address: layerList.address,
      constructorArguments: [layerIndex.address],
      contract:
      "contracts/registry/list.sol:LayerList",
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
