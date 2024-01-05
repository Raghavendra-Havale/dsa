import { BytesLike } from "ethers";
import hre from "hardhat";
const { web3, ethers } = hre;
import layerDeployContract from "./deployContract";

async function main() {
  const [deployer] = await ethers.getSigners();
  const deployerAddress = deployer.address;

  console.log(`Deployer Address: ${deployerAddress}`);

  console.log("Verifying LayerIndex", hre.network.name, "...");

  // const layerIndex = await layerDeployContract("LayerIndex", []);
  const layerIndex ="0x42a60209FE4F619424BBF798986D210591180FdE" ;

  const layerList = "0xD320d195a2d7A2F320CC1a5F1d9Ac3AA2FfE6A4D";

  const implementationsMapping ="0xac485461C02D869D1b5FFF1352cd01aD9c086523";

  const layerAccount = "0x77D5908d9Fe7E6B90e12Cbb3Fab148c831016E4C";

  const layerConnectors = "0xDB4D94eb02906A0c6796825a5372E0dAbfA73F1F";


  const layerConnectorsImpl = "0x331cF11b0b4C3A8521aDA3cbdedA7dCF1B5E1003";

  const layerConnectorsProxy ="0xc4009098c6cB2D23c525d068F00AF8520E7B7876";

  const layerAccountDefaultImpl = "0xaF49dDA64308957360f16525E81A41CE6f3F3Be7";

  const layerAccountImplM1 = "0x25604B42e559FaC688C98E8557Aaf7e7bb783f77";

  const layerEvent="0xDE39fF3D352ed659c0d728Ab063e03e075405Ce2";
  const layerMemory="0x04Ce9Aa544C02E3c60B3Db25402AB70d29d33aE1";

  console.log("\n########### setBasics ########");

  const setBasicsArgs: [string, string, string, string] = [
    deployerAddress,
    layerList,
    layerAccount,
    layerConnectors,
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

     // await hre.run("verify:verify", {
    //   address: layerList.address,
    //   constructorArguments: ["0x42a60209FE4F619424BBF798986D210591180FdE"],
    //   contract:
    //   "contracts/registry/list.sol:LayerList",
    // });

    // await hre.run("verify:verify", {
    //   address: layerAccountImplM1.address,
    //   constructorArguments: [layerIndex.address,layerConnectors.address],
    //   contract:
    //   "contracts/main/accounts/module1/Implementation_m1.sol:LayerImplementationM1",
    // });

    // await hre.run("verify:verify", {
    //   address: layerEvent.address,
    //   constructorArguments: [layerList.address],
    //   contract:
    //     "contracts/main/misc/event.sol:LayerEvent",
    // });

    // await hre.run("verify:verify", {
    //   address: layerMemory.address,
    //   constructorArguments: [],
    //   contract:
    //     "contracts/main/misc/memory.sol:LayerMemory",
    // });
   
    // await hre.run("verify:verify", {
    //   address: implementationsMapping.address,
    //   constructorArguments: [layerIndex],
    //   contract:
    //   "contracts/main/registry/implementations.sol:LayerImplementations",
    // });
    
    // await hre.run("verify:verify", {
    //   address: layerConnectorsImpl.address,
    //   constructorArguments: [],
    //   contract:
    //     "contracts/main/proxy/dummyConnectorsImpl.sol:LayerConnectorsImpl",
    // });


    // await hre.run("verify:verify", {
    //   address: layerConnectors.address,
    //   constructorArguments: [layerIndex],
    //   contract:
    //     "contracts/main/registry/connectors.sol:LayerConnectors",
    // });

    // await hre.run("verify:verify", {
    //   address: layerConnectorsProxy.address,
    //   constructorArguments: [layerConnectorsImpl.address,"0x5dBA78D25000c19E543E7f628eB42776b1498ff7","0x"],
    //   contract:
    //     "contracts/main/proxy/connectorsProxy.sol:LayerConnectorsProxy",
    // });

    // await hre.run("verify:verify", {
    //   address: layerAccountDefaultImpl.address,
    //   constructorArguments: [layerIndex.address],
    //   contract:
    //     "contracts/main/accounts/default/implementation_default.sol:LayerDefaultImplementation",
    // });

  
    // await hre.run("verify:verify", {
    //   address: layerIndex.address,
    //   constructorArguments: [],
    //   contract:
    //   "contracts/registry/index.sol:LayerIndex",
    // });

    // await hre.run("verify:verify", {
    //   address: layerList.address,
    //   constructorArguments: ["0x42a60209FE4F619424BBF798986D210591180FdE"],
    //   contract:
    //   "contracts/registry/list.sol:LayerList",
    // });

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
