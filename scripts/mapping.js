async function main() {
    require('dotenv').config();
    const { ETH_NODE_URL, PRIVATE_KEY } = process.env;
    const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
    const web3 = createAlchemyWeb3(ETH_NODE_URL);
    const ABI = require('./abi.json');
    
    const account = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);
    web3.eth.accounts.wallet.add(account);
    const deployerAddress = account.address;

    const implementationsMapping = new web3.eth.Contract(ABI, '0xac485461C02D869D1b5FFF1352cd01aD9c086523');
    console.log("\n########### Add DSA Implementations ########");

    // const estimatedGas = await implementationsMapping.methods.setDefaultImplementation("0xaF49dDA64308957360f16525E81A41CE6f3F3Be7").estimateGas({ from: deployerAddress });
    // // Set Default Implementation
    // implementationsMapping.methods.setDefaultImplementation("0xaF49dDA64308957360f16525E81A41CE6f3F3Be7")
    // .send({ from: deployerAddress, gas: estimatedGas})
    // .on('transactionHash', function(hash){
    //     console.log(`Transaction hash: ${hash}`);
    // })
    // .on('receipt', function(receipt){
    //     console.log(`Transaction receipt: `, receipt);
    // })
    // .on('error', console.error);
    
    // Prepare Arguments for Adding Implementation
    const implementationV1Args = [
      "0x25604B42e559FaC688C98E8557Aaf7e7bb783f77",
      ["cast(string[],bytes[],address)"].map(a => web3.utils.keccak256(a).slice(0, 10)),
    ];
    
    const estimatedGas1 = await implementationsMapping.methods.addImplementation(...implementationV1Args).estimateGas({ from: deployerAddress });
    // Add Implementation
    implementationsMapping.methods.addImplementation(...implementationV1Args)
    .send({ from: deployerAddress,gas: estimatedGas1 })
    .on('transactionHash', function(hash){
        console.log(`Transaction hash: ${hash}`);
    })
    .on('receipt', function(receipt){
        console.log(`Transaction receipt: `, receipt);
    })
    .on('error', console.error);
    
    console.log("###########\n");
}

main();
