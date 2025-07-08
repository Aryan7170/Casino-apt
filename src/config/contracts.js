// Chain IDs
export const CHAIN_IDS = {
  LOCALHOST: 5003,
  MANTLE_SEPOLIA: 5003,
  PHAROS_DEVNET: 50002,
  // Add more chains here as needed
  // ARBITRUM: 42161,
  // OPTIMISM: 10,
  // BSC: 56,
  // etc...
};

// RPC URLs
export const RPC_URLS = {
  [CHAIN_IDS.LOCALHOST]: "http://127.0.0.1:8545",
  [CHAIN_IDS.MANTLE_SEPOLIA]: "https://rpc.sepolia.mantle.xyz",
  [CHAIN_IDS.PHAROS_DEVNET]: "https://devnet.dplabs-internal.com",
  // Add more RPCs here as needed
};

// Block Explorers
export const BLOCK_EXPLORERS = {
  [CHAIN_IDS.LOCALHOST]: "http://localhost:8545",
  [CHAIN_IDS.MANTLE_SEPOLIA]: "https://sepolia.mantlescan.xyz",
  [CHAIN_IDS.PHAROS_DEVNET]: "https://pharosscan.xyz",
  // Add more explorers here as needed
};

// Token Contracts
export const TOKEN_CONTRACTS = {
  [CHAIN_IDS.LOCALHOST]: {
      address: "0x60672ccafd719eb569858003ed3b0ac0f6e63954", // Updated local token address
      name: "APT-Casino",
      symbol: "APTC",
      decimals: 18
  },
  [CHAIN_IDS.MANTLE_SEPOLIA]: {
      address: "0x60672ccafd719eb569858003ed3b0ac0f6e63954",
      name: "APT-Casino",
      symbol: "APTC",
      decimals: 18
  },
  [CHAIN_IDS.PHAROS_DEVNET]: {
      address: "0x60672ccafd719eb569858003ed3b0ac0f6e63954",
      name: "APT-Casino",
      symbol: "APTC",
      decimals: 18
  },
  // Add more chain configurations here as needed
};

// Roulette Contracts
export const ROULETTE_CONTRACTS = {
  [CHAIN_IDS.LOCALHOST]: {
      address: "0xfa339164994ea5d08fd898af81ffa8a5c4982974", // Updated local roulette address
      treasuryAddress: "0xFfbfce3f171911044b6D91d700548AEd9A662420"
  },
  [CHAIN_IDS.MANTLE_SEPOLIA]: {
      address: "0xfa339164994ea5d08fd898af81ffa8a5c4982974",
      treasuryAddress: "0xFfbfce3f171911044b6D91d700548AEd9A662420"
  },
  [CHAIN_IDS.PHAROS_DEVNET]: {
      address: "0xfa339164994ea5d08fd898af81ffa8a5c4982974",
      treasuryAddress: "0xFfbfce3f171911044b6D91d700548AEd9A662420"
  },
  // Add more chain configurations here as needed
};

// Wheel Contracts
export const WHEEL_CONTRACTS = {
  [CHAIN_IDS.LOCALHOST]: {
      address: "0xcf4469d29aaae6f136b9cd171a01700895093c67", // Updated wheel contract address
      treasuryAddress: "0xFfbfce3f171911044b6D91d700548AEd9A662420"
  },
  [CHAIN_IDS.MANTLE_SEPOLIA]: {
      address: "0xcf4469d29aaae6f136b9cd171a01700895093c67",
      treasuryAddress: "0xFfbfce3f171911044b6D91d700548AEd9A662420"
  },
  [CHAIN_IDS.PHAROS_DEVNET]: {
      address: "0xcf4469d29aaae6f136b9cd171a01700895093c67",
      treasuryAddress: "0xFfbfce3f171911044b6D91d700548AEd9A662420"
  },
  // Add more chain configurations here as needed
};

// Mines Contracts
export const MINES_CONTRACTS = {
  [CHAIN_IDS.LOCALHOST]: {
      address: "0xa534adf7A3B107f8bDF10CD042a309701Db71e6D",
      treasuryAddress: "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199"
  },
  [CHAIN_IDS.MANTLE_SEPOLIA]: {
      address: "0xa534adf7A3B107f8bDF10CD042a309701Db71e6D",
      treasuryAddress: "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199"
  },
  [CHAIN_IDS.PHAROS_DEVNET]: {
      address: "0xa534adf7A3B107f8bDF10CD042a309701Db71e6D",
      treasuryAddress: "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199"
  },
  // Add more chain configurations here as needed
};

// ABIs will be stored here after your Remix deployment
export const ABIS = {
  TOKEN: null, // Will be filled with your Remix deployment ABI
  ROULETTE: null, // Will be filled with your Remix deployment ABI
  WHEEL: null, // Will be filled with your Remix deployment ABI
  MINES: null // Will be filled with your Remix deployment ABI
};

// Chain Names for UI
export const CHAIN_NAMES = {
  [CHAIN_IDS.LOCALHOST]: "Local Hardhat",
  [CHAIN_IDS.MANTLE_SEPOLIA]: "Mantle Sepolia",
  [CHAIN_IDS.PHAROS_DEVNET]: "Pharos Devnet",
  // Add more chain names here as needed
};

// Chain Native Currencies
export const NATIVE_CURRENCIES = {
  [CHAIN_IDS.LOCALHOST]: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18
  },
  [CHAIN_IDS.MANTLE_SEPOLIA]: {
      name: "MNT",
      symbol: "MNT",
      decimals: 18
  },
  [CHAIN_IDS.PHAROS_DEVNET]: {
      name: "PHR",
      symbol: "PHR",
      decimals: 18
  },
  // Add more native currencies here as needed
};

// Supported Networks Configuration
export const SUPPORTED_NETWORKS = [
  {
      id: CHAIN_IDS.LOCALHOST,
      name: CHAIN_NAMES[CHAIN_IDS.LOCALHOST],
      rpcUrl: RPC_URLS[CHAIN_IDS.LOCALHOST],
      explorer: BLOCK_EXPLORERS[CHAIN_IDS.LOCALHOST],
      nativeCurrency: NATIVE_CURRENCIES[CHAIN_IDS.LOCALHOST],
      tokenContract: TOKEN_CONTRACTS[CHAIN_IDS.LOCALHOST],
      rouletteContract: ROULETTE_CONTRACTS[CHAIN_IDS.LOCALHOST]
  },
  {
      id: CHAIN_IDS.MANTLE_SEPOLIA,
      name: CHAIN_NAMES[CHAIN_IDS.MANTLE_SEPOLIA],
      rpcUrl: RPC_URLS[CHAIN_IDS.MANTLE_SEPOLIA],
      explorer: BLOCK_EXPLORERS[CHAIN_IDS.MANTLE_SEPOLIA],
      nativeCurrency: NATIVE_CURRENCIES[CHAIN_IDS.MANTLE_SEPOLIA],
      tokenContract: TOKEN_CONTRACTS[CHAIN_IDS.MANTLE_SEPOLIA],
      rouletteContract: ROULETTE_CONTRACTS[CHAIN_IDS.MANTLE_SEPOLIA]
  },
  {
      id: CHAIN_IDS.PHAROS_DEVNET,
      name: CHAIN_NAMES[CHAIN_IDS.PHAROS_DEVNET],
      rpcUrl: RPC_URLS[CHAIN_IDS.PHAROS_DEVNET],
      explorer: BLOCK_EXPLORERS[CHAIN_IDS.PHAROS_DEVNET],
      nativeCurrency: NATIVE_CURRENCIES[CHAIN_IDS.PHAROS_DEVNET],
      tokenContract: TOKEN_CONTRACTS[CHAIN_IDS.PHAROS_DEVNET],
      rouletteContract: ROULETTE_CONTRACTS[CHAIN_IDS.PHAROS_DEVNET]
  }
  // More networks will be added here as you deploy to them
];

export const NETWORKS = {
  MANTLE_SEPOLIA: {
      id: CHAIN_IDS.MANTLE_SEPOLIA,
      name: CHAIN_NAMES[CHAIN_IDS.MANTLE_SEPOLIA],
      rpcUrl: RPC_URLS[CHAIN_IDS.MANTLE_SEPOLIA],
      explorer: BLOCK_EXPLORERS[CHAIN_IDS.MANTLE_SEPOLIA],
      nativeCurrency: NATIVE_CURRENCIES[CHAIN_IDS.MANTLE_SEPOLIA],
      tokenContract: TOKEN_CONTRACTS[CHAIN_IDS.MANTLE_SEPOLIA],
      rouletteContract: ROULETTE_CONTRACTS[CHAIN_IDS.MANTLE_SEPOLIA]
  },
  PHAROS_DEVNET: {
      id: CHAIN_IDS.PHAROS_DEVNET,
      name: CHAIN_NAMES[CHAIN_IDS.PHAROS_DEVNET],
      rpcUrl: RPC_URLS[CHAIN_IDS.PHAROS_DEVNET],
      explorer: BLOCK_EXPLORERS[CHAIN_IDS.PHAROS_DEVNET],
      nativeCurrency: NATIVE_CURRENCIES[CHAIN_IDS.PHAROS_DEVNET],
      tokenContract: TOKEN_CONTRACTS[CHAIN_IDS.PHAROS_DEVNET],
      rouletteContract: ROULETTE_CONTRACTS[CHAIN_IDS.PHAROS_DEVNET]
  }
};

export const CONTRACTS = {
MANTLE_SEPOLIA: {
  chainId: CHAIN_IDS.MANTLE_SEPOLIA,
  chainName: 'Mantle Sepolia',
  token: {
    address: '0x60672ccafd719eb569858003ed3b0ac0f6e63954',
    abi: [
      // Token ABI - same as PHAROS_DEVNET
      {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "allowance",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "needed",
            "type": "uint256"
          }
        ],
        "name": "ERC20InsufficientAllowance",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "sender",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "balance",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "needed",
            "type": "uint256"
          }
        ],
        "name": "ERC20InsufficientBalance",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "approver",
            "type": "address"
          }
        ],
        "name": "ERC20InvalidApprover",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "receiver",
            "type": "address"
          }
        ],
        "name": "ERC20InvalidReceiver",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "sender",
            "type": "address"
          }
        ],
        "name": "ERC20InvalidSender",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          }
        ],
        "name": "ERC20InvalidSpender",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          }
        ],
        "name": "OwnableInvalidOwner",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "OwnableUnauthorizedAccount",
        "type": "error"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "spender",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "Approval",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "previousOwner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "Paused",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "Transfer",
        "type": "event"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          }
        ],
        "name": "allowance",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "approve",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "balanceOf",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "decimals",
        "outputs": [
          {
            "internalType": "uint8",
            "name": "",
            "type": "uint8"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "mint",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "name",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "owner",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "symbol",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "transfer",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "transferFrom",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ]
  },
  roulette: {
    address: '0xfa339164994ea5d08fd898af81ffa8a5c4982974',
    abi: [
      // Roulette ABI - same as PHAROS_DEVNET
      {
        "inputs": [
          {
            "internalType": "contract IERC20",
            "name": "_token",
            "type": "address"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          }
        ],
        "name": "OwnableInvalidOwner",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "OwnableUnauthorizedAccount",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "ReentrancyGuardReentrantCall",
        "type": "error"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "player",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "enum Roulette.BetType",
            "name": "betType",
            "type": "uint8"
          },
          {
            "indexed": false,
            "internalType": "uint8",
            "name": "betValue",
            "type": "uint8"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "round",
            "type": "uint256"
          }
        ],
        "name": "BetPlaced",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "player",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "bool",
            "name": "won",
            "type": "bool"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "winnings",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "round",
            "type": "uint256"
          }
        ],
        "name": "BetResult",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "previousOwner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "randomNumber",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "round",
            "type": "uint256"
          }
        ],
        "name": "RandomGenerated",
        "type": "event"
      },
      {
        "inputs": [],
        "name": "MIN_WAIT_BLOCK",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "TREASURY",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "TREASURY_FEE_RATE",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "enum Roulette.BetType",
            "name": "betType",
            "type": "uint8"
          },
          {
            "internalType": "uint8",
            "name": "betValue",
            "type": "uint8"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "placeBet",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "round",
            "type": "uint256"
          }
        ],
        "name": "resolveBet",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "player",
            "type": "address"
          }
        ],
        "name": "getPlayerBet",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "enum Roulette.BetType",
            "name": "betType",
            "type": "uint8"
          },
          {
            "internalType": "uint8",
            "name": "betValue",
            "type": "uint8"
          },
          {
            "internalType": "uint256",
            "name": "round",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "resolved",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "getCurrentRound",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "round",
            "type": "uint256"
          }
        ],
        "name": "getRoundResult",
        "outputs": [
          {
            "internalType": "uint8",
            "name": "",
            "type": "uint8"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "getContractBalance",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "withdrawTokens",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ]
  },
  wheel: {
    address: '0xab8527d3d9ee60319e7cd013cb1964bcc6b37286',
    abi: [
      // Wheel ABI - same as PHAROS_DEVNET
      {
        "inputs": [
          {
            "internalType": "contract IERC20",
            "name": "_token",
            "type": "address"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          }
        ],
        "name": "OwnableInvalidOwner",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "OwnableUnauthorizedAccount",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "ReentrancyGuardReentrantCall",
        "type": "error"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "player",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "round",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "enum WheelGame.RiskLevel",
            "name": "risk",
            "type": "uint8"
          },
          {
            "indexed": false,
            "internalType": "uint8",
            "name": "segments",
            "type": "uint8"
          }
        ],
        "name": "BetPlaced",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "previousOwner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "player",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "RequestAllowance",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "player",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "round",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "multiplier",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "segmentIndex",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "bool",
            "name": "isWin",
            "type": "bool"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "payout",
            "type": "uint256"
          }
        ],
        "name": "WheelSpun",
        "type": "event"
      }
    ]
  },
  mines: {
    address: '0xa534adf7A3B107f8bDF10CD042a309701Db71e6D',
    abi: [
      {
        "inputs": [
          {
            "internalType": "contract IERC20",
            "name": "_token",
            "type": "address"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          }
        ],
        "name": "OwnableInvalidOwner",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "OwnableUnauthorizedAccount",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "ReentrancyGuardReentrantCall",
        "type": "error"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "player",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "betAmount",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint8",
            "name": "mines",
            "type": "uint8"
          }
        ],
        "name": "GameStarted",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "player",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint8",
            "name": "tile",
            "type": "uint8"
          },
          {
            "indexed": false,
            "internalType": "bool",
            "name": "isMine",
            "type": "bool"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "revealedCount",
            "type": "uint256"
          }
        ],
        "name": "TileRevealed",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "player",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "payout",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "revealedCount",
            "type": "uint256"
          }
        ],
        "name": "CashedOut",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "player",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "betAmount",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint8",
            "name": "revealedCount",
            "type": "uint8"
          }
        ],
        "name": "GameLost",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "player",
            "type": "address"
          }
        ],
        "name": "GameReset",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "string",
            "name": "reason",
            "type": "string"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "required",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "available",
            "type": "uint256"
          }
        ],
        "name": "PayoutWarning",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "player",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "TreasuryDeposit",
        "type": "event"
      },
      {
        "inputs": [
          {
            "internalType": "uint8",
            "name": "mines",
            "type": "uint8"
          },
          {
            "internalType": "uint256",
            "name": "betAmount",
            "type": "uint256"
          }
        ],
        "name": "startGame",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint8",
            "name": "tile",
            "type": "uint8"
          }
        ],
        "name": "revealTile",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "cashOut",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "betAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint8",
            "name": "mines",
            "type": "uint8"
          },
          {
            "internalType": "address",
            "name": "player",
            "type": "address"
          }
        ],
        "name": "calculatePayout",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "getContractBalance",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "player",
            "type": "address"
          }
        ],
        "name": "getPlayerGame",
        "outputs": [
          {
            "internalType": "address",
            "name": "playerAddress",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "betAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint8",
            "name": "mines",
            "type": "uint8"
          },
          {
            "internalType": "bool[]",
            "name": "minefield",
            "type": "bool[]"
          },
          {
            "internalType": "bool[]",
            "name": "revealed",
            "type": "bool[]"
          },
          {
            "internalType": "uint8",
            "name": "revealedCount",
            "type": "uint8"
          },
          {
            "internalType": "bool",
            "name": "active",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "finished",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "createdAt",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "lastActionBlock",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ]
  }
},
PHAROS_DEVNET: {
  chainId: CHAIN_IDS.PHAROS_DEVNET,
  chainName: 'Pharos Devnet',
  token: {
    address: '0x60672ccafd719eb569858003ed3b0ac0f6e63954',
    abi: [
      // Token ABI
      {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "allowance",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "needed",
            "type": "uint256"
          }
        ],
        "name": "ERC20InsufficientAllowance",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "sender",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "balance",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "needed",
            "type": "uint256"
          }
        ],
        "name": "ERC20InsufficientBalance",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "approver",
            "type": "address"
          }
        ],
        "name": "ERC20InvalidApprover",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "receiver",
            "type": "address"
          }
        ],
        "name": "ERC20InvalidReceiver",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "sender",
            "type": "address"
          }
        ],
        "name": "ERC20InvalidSender",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          }
        ],
        "name": "ERC20InvalidSpender",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          }
        ],
        "name": "OwnableInvalidOwner",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "OwnableUnauthorizedAccount",
        "type": "error"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "spender",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "Approval",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "previousOwner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "Paused",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "Transfer",
        "type": "event"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          }
        ],
        "name": "allowance",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "approve",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "balanceOf",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "decimals",
        "outputs": [
          {
            "internalType": "uint8",
            "name": "",
            "type": "uint8"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "name",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "symbol",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "transfer",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "transferFrom",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ]
  },
  roulette: {
    address: '0xfa339164994ea5d08fd898af81ffa8a5c4982974',
    abi: [
      {
        "inputs": [
          {
            "internalType": "contract IERC20",
            "name": "_token",
            "type": "address"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          }
        ],
        "name": "OwnableInvalidOwner",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "OwnableUnauthorizedAccount",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "ReentrancyGuardReentrantCall",
        "type": "error"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "player",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "enum Roulette.BetType",
            "name": "betType",
            "type": "uint8"
          },
          {
            "indexed": false,
            "internalType": "uint8",
            "name": "betValue",
            "type": "uint8"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "round",
            "type": "uint256"
          }
        ],
        "name": "BetPlaced",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "player",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "bool",
            "name": "won",
            "type": "bool"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "winnings",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "round",
            "type": "uint256"
          }
        ],
        "name": "BetResult",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "previousOwner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "randomNumber",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "round",
            "type": "uint256"
          }
        ],
        "name": "RandomGenerated",
        "type": "event"
      },
      {
        "inputs": [],
        "name": "MIN_WAIT_BLOCK",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "TREASURY",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "TREASURY_FEE_RATE",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "bets",
        "outputs": [
          {
            "internalType": "address",
            "name": "player",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "enum Roulette.BetType",
            "name": "betType",
            "type": "uint8"
          },
          {
            "internalType": "uint8",
            "name": "betValue",
            "type": "uint8"
          },
          {
            "internalType": "uint256",
            "name": "round",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "currentRound",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "lastBetBlock",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "name": "lastBetTime",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "maxBet",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "minBet",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "nonce",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "owner",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "enum Roulette.BetType[]",
            "name": "betTypes",
            "type": "uint8[]"
          },
          {
            "internalType": "uint8[]",
            "name": "betValues",
            "type": "uint8[]"
          },
          {
            "internalType": "uint256[]",
            "name": "amounts",
            "type": "uint256[]"
          },
          {
            "internalType": "uint256[][]",
            "name": "betNumbers",
            "type": "uint256[][]"
          }
        ],
        "name": "placeMultipleBets",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "randomResult",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_maxBet",
            "type": "uint256"
          }
        ],
        "name": "setMaxBet",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_minBet",
            "type": "uint256"
          }
        ],
        "name": "setMinBet",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "token",
        "outputs": [
          {
            "internalType": "contract IERC20",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "withdrawTokens",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ]
  },
  wheel: {
    address: '0xcf4469d29aaae6f136b9cd171a01700895093c67',
    abi: [
	{
		"inputs": [
			{
				"internalType": "contract IERC20",
				"name": "_token",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "OwnableInvalidOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "OwnableUnauthorizedAccount",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "ReentrancyGuardReentrantCall",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "player",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "round",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "enum WheelGame.RiskLevel",
				"name": "risk",
				"type": "uint8"
			},
			{
				"indexed": false,
				"internalType": "uint8",
				"name": "segments",
				"type": "uint8"
			}
		],
		"name": "BetPlaced",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "player",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "RequestAllowance",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "player",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "round",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "multiplier",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "segmentIndex",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "isWin",
				"type": "bool"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "payout",
				"type": "uint256"
			}
		],
		"name": "WheelSpun",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "LOW_RISK_SEGMENT_COUNT",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "MEDIUM_RISK_SEGMENT_COUNT",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "MIN_WAIT_BLOCK",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "TREASURY",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "TREASURY_FEE_RATE",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "bets",
		"outputs": [
			{
				"internalType": "address",
				"name": "player",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"internalType": "enum WheelGame.RiskLevel",
				"name": "risk",
				"type": "uint8"
			},
			{
				"internalType": "uint8",
				"name": "segments",
				"type": "uint8"
			},
			{
				"internalType": "uint256",
				"name": "round",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "blockNumber",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "checkUserAllowance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "currentRound",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "emergencyWithdraw",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "roundId",
				"type": "uint256"
			}
		],
		"name": "getBetInfo",
		"outputs": [
			{
				"internalType": "address",
				"name": "player",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"internalType": "enum WheelGame.RiskLevel",
				"name": "risk",
				"type": "uint8"
			},
			{
				"internalType": "uint8",
				"name": "segments",
				"type": "uint8"
			},
			{
				"internalType": "uint256",
				"name": "round",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "blockNumber",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint8",
				"name": "segments",
				"type": "uint8"
			}
		],
		"name": "getHighRiskSegments",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "multiplier",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "color",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "probability",
						"type": "uint256"
					}
				],
				"internalType": "struct WheelGame.WheelSegment[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "pure",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getLowRiskSegments",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "multiplier",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "color",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "probability",
						"type": "uint256"
					}
				],
				"internalType": "struct WheelGame.WheelSegment[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getMediumRiskSegments",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "multiplier",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "color",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "probability",
						"type": "uint256"
					}
				],
				"internalType": "struct WheelGame.WheelSegment[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "roundId",
				"type": "uint256"
			}
		],
		"name": "getResult",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "multiplier",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "segmentIndex",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "isWin",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "enum WheelGame.RiskLevel",
				"name": "risk",
				"type": "uint8"
			},
			{
				"internalType": "uint8",
				"name": "segments",
				"type": "uint8"
			}
		],
		"name": "getWheelData",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "multiplier",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "color",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "probability",
						"type": "uint256"
					}
				],
				"internalType": "struct WheelGame.WheelSegment[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "lastBetBlock",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "lastBetTime",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "lowRiskSegments",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "multiplier",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "color",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "probability",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "mediumRiskSegments",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "multiplier",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "color",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "probability",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "minBet",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "nonce",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "enum WheelGame.RiskLevel",
				"name": "risk",
				"type": "uint8"
			},
			{
				"internalType": "uint8",
				"name": "segments",
				"type": "uint8"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "placeBet",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "requestAllowance",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "results",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "multiplier",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "segmentIndex",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "isWin",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_minBet",
				"type": "uint256"
			}
		],
		"name": "setMinBet",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "token",
		"outputs": [
			{
				"internalType": "contract IERC20",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "index",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "multiplier",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "color",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "probability",
				"type": "uint256"
			}
		],
		"name": "updateLowRiskSegment",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "index",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "multiplier",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "color",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "probability",
				"type": "uint256"
			}
		],
		"name": "updateMediumRiskSegment",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "withdrawTokens",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
    ]
  },
  mines: {
    address: '0xa534adf7A3B107f8bDF10CD042a309701Db71e6D',
    abi: [
      {
        "inputs": [
          {
            "internalType": "contract IERC20",
            "name": "_token",
            "type": "address"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          }
        ],
        "name": "OwnableInvalidOwner",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "OwnableUnauthorizedAccount",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "ReentrancyGuardReentrantCall",
        "type": "error"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "player",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "betAmount",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint8",
            "name": "mines",
            "type": "uint8"
          }
        ],
        "name": "GameStarted",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "player",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint8",
            "name": "tile",
            "type": "uint8"
          },
          {
            "indexed": false,
            "internalType": "bool",
            "name": "isMine",
            "type": "bool"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "revealedCount",
            "type": "uint256"
          }
        ],
        "name": "TileRevealed",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "player",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "payout",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "revealedCount",
            "type": "uint256"
          }
        ],
        "name": "CashedOut",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "player",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "betAmount",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint8",
            "name": "revealedCount",
            "type": "uint8"
          }
        ],
        "name": "GameLost",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "player",
            "type": "address"
          }
        ],
        "name": "GameReset",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "string",
            "name": "reason",
            "type": "string"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "required",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "available",
            "type": "uint256"
          }
        ],
        "name": "PayoutWarning",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "player",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "TreasuryDeposit",
        "type": "event"
      },
      {
        "inputs": [
          {
            "internalType": "uint8",
            "name": "mines",
            "type": "uint8"
          },
          {
            "internalType": "uint256",
            "name": "betAmount",
            "type": "uint256"
          }
        ],
        "name": "startGame",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint8",
            "name": "tile",
            "type": "uint8"
          }
        ],
        "name": "revealTile",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "cashOut",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "betAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint8",
            "name": "mines",
            "type": "uint8"
          },
          {
            "internalType": "uint8",
            "name": "revealedCount",
            "type": "uint8"
          }
        ],
        "name": "calculatePayout",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "pure",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "getContractBalance",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "player",
            "type": "address"
          }
        ],
        "name": "getPlayerGame",
        "outputs": [
          {
            "internalType": "address",
            "name": "playerAddress",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "betAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint8",
            "name": "mines",
            "type": "uint8"
          },
          {
            "internalType": "bool[]",
            "name": "minefield",
            "type": "bool[]"
          },
          {
            "internalType": "bool[]",
            "name": "revealed",
            "type": "bool[]"
          },
          {
            "internalType": "uint8",
            "name": "revealedCount",
            "type": "uint8"
          },
          {
            "internalType": "bool",
            "name": "active",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "finished",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "createdAt",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "lastActionBlock",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ]
  }
}
}; 