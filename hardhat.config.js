require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const MANTLE_SEPOLIA_RPC = "https://rpc.sepolia.mantle.xyz";
const PHAROS_DEVNET_RPC = "https://devnet.dplabs-internal.com";
const BINANCE_TESTNET_RPC = "https://data-seed-prebsc-1-s1.binance.org:8545"; // Fill your Binance Testnet RPC URL

const MANTLE_SEPOLIA_EXPLORER_API = process.env.MANTLE_SEPOLIA_EXPLORER_API;
const PHAROS_DEVNET_EXPLORER_API = process.env.PHAROS_DEVNET_EXPLORER_API;
const BINANCE_TESTNET_EXPLORER_API = process.env.BINANCE_TESTNET_EXPLORER_API; // Fill your Binance Testnet Etherscan API Key

const PRIVATE_KEY = process.env.PRIVATE_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: { // Add hardhat network configuration
      chainId: 31337,
    },
    mantleSepolia: {
      url: MANTLE_SEPOLIA_RPC,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 5003,
    },
    pharosDevnet: {
      url: PHAROS_DEVNET_RPC,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 50002,
    },
    binanceTestnet: {
      url: BINANCE_TESTNET_RPC,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 97,
    },
  },
  etherscan: {
    apiKey: {
      mantleSepolia: MANTLE_SEPOLIA_EXPLORER_API,
      pharosDevnet: PHAROS_DEVNET_EXPLORER_API,
      bscTestnet: BINANCE_TESTNET_EXPLORER_API, // Etherscan API Key for Binance Testnet
    },
    customChains: [
      {
        network: "mantleSepolia",
        chainId: 5003,
        urls: {
          apiURL: "https://api-sepolia.mantlescan.xyz/api",
          browserURL: "https://sepolia.mantlescan.xyz",
        },
      },
      {
        network: "pharosDevnet",
        chainId: 50002,
        urls: {
          apiURL: "https://pharosscan.xyz/api",
          browserURL: "https://pharosscan.xyz",
        },
      },
      {
        network: "bscTestnet", // Must match the network name used in apiKey
        chainId: 97,
        urls: {
          apiURL: "https://api-testnet.bscscan.com/api",
          browserURL: "https://testnet.bscscan.com",
        },
      },
    ],
  },
}; 