// Buidler
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-web3";
import "@nomiclabs/hardhat-etherscan";
import "@tenderly/hardhat-tenderly";
import "hardhat-deploy";
import "hardhat-deploy-ethers";
import "@openzeppelin/hardhat-upgrades";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "solidity-docgen";

import { resolve } from "path";
import { config as dotenvConfig } from "dotenv";
import { utils } from "ethers";
import Web3 from "web3";

dotenvConfig({ path: resolve(__dirname, "./.env") });

const ALCHEMY_ID = process.env.ALCHEMY_ID;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ETHERSCAN_API = process.env.ETHERSCAN_API_KEY;
const POLYGONSCAN_API = process.env.POLYGON_API_KEY;
const ARBISCAN_API = process.env.ARBISCAN_API_KEY;
const SNOWTRACE_API = process.env.SNOWTRACE_API_KEY;
const mnemonic = process.env.MNEMONIC ?? "test test test test test test test test test test test junk";

function getNetworkUrl(networkType: string) {
  if (networkType === "manta") return "https://pacific-rpc.manta.network/http";
  else if (networkType === "polygon") return `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_ID}`;
  else if (networkType === "arbitrum") return `https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_ID}`;
  else if (networkType === "goerli") return `https://eth-goerli.g.alchemy.com/v2/${ALCHEMY_ID}`;
  else return `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_ID}`;
}

const INSTA_MASTER = "0x5A2d0610027bADBd47FD199a2C0Fe742A2315FAb";

// ================================= CONFIG =========================================
const config = {
  defaultNetwork: "hardhat",
  gasReporter: {
    enabled: true,
    currency: "ETH",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY
  },
  tenderly: {
    project: "team-development",
    username: "InstaDApp",
    forkNetwork: "1",
  },
  networks: {
    hardhat: {
      forking: {
        url: String(getNetworkUrl(String(process.env.networkType))),
        blockNumber: 15010000,
      },
      blockGasLimit: 12000000,
      masterAddress: INSTA_MASTER,
    },
    goerli: {
      url: getNetworkUrl("goerli"),
      accounts: !!PRIVATE_KEY ? [`0x${PRIVATE_KEY}`] : { mnemonic },
      timeout: 150000,
    },
    mainnet: {
      url: getNetworkUrl("mainnet"),
      accounts: !!PRIVATE_KEY ? [`0x${PRIVATE_KEY}`] : { mnemonic },
      timeout: 150000,
    },
    polygon: {
      url: getNetworkUrl("polygon"),
      accounts: !!PRIVATE_KEY ? [`0x${PRIVATE_KEY}`] : { mnemonic },
      timeout: 150000,
      // Polygon network configurations...
    },
    manta: {
      url: getNetworkUrl("manta"),
      accounts: !!PRIVATE_KEY ? [`0x${PRIVATE_KEY}`] : { mnemonic },
      timeout: 150000,
      maxPriorityFeePerGas:2000,
      maxFeePerGas: 20,
    },
    arbitrum: {
      url: getNetworkUrl("arbitrum"),
      accounts: !!PRIVATE_KEY ? [`0x${PRIVATE_KEY}`] : { mnemonic },
      timeout: 150000,
      // Arbitrum network configurations...
    },
    // ... other network configurations
  },
  solidity: {
    compilers: [
      {
        version: "0.8.0",
        settings: {
          optimizer: { enabled: false },
        },
      },
    ],
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test",
  },
  etherscan: {
    apiKey:  {
      manta: ETHERSCAN_API
    },
    customChains: [
      {
        network: "manta",
        chainId: 169,
        urls: {
          apiURL: "https://pacific-rpc.manta.network/http",
          browserURL: "wss://pacific-rpc.manta.network/ws"
        }
      }
    ]
  },
  typechain: {
    outDir: "typechain",
    target: "ethers-v5",
  },
  mocha: {
    timeout: 10000 * 1000, // 10,000 seconds
  },
};
export default config;