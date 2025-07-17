// Chain IDs
export const CHAIN_IDS = {
  LOCALHOST: 31337,
  MANTLE_SEPOLIA: 5003,
  PHAROS_DEVNET: 50002,
  BINANCE_TESTNET: 97,
  ETHEREUM_SEPOLIA: 11155111,
  // Add more chains here as needed
};

export const CHAIN_ID = {
  MANTLE_SEPOLIA: 5003, // 5003
  PHAROS_DEVNET: 50002, // 50002
  BINANCE_TESTNET: 97, // 97
  ETHEREUM_SEPOLIA: 11155111, // 11155111
  // Add more chains here as needed
};

export const treasuryAddress = '0xFfbfce3f171911044b6D91d700548AEd9A662420';

// Chain Names
export const CHAIN_NAMES = {
  [CHAIN_IDS.LOCALHOST]: "Localhost",
  [CHAIN_IDS.MANTLE_SEPOLIA]: "Mantle Sepolia",
  [CHAIN_IDS.PHAROS_DEVNET]: "Pharos Devnet",
  [CHAIN_IDS.BINANCE_TESTNET]: "Binance Smart Chain Testnet",
  [CHAIN_IDS.ETHEREUM_SEPOLIA]: "Ethereum Sepolia",
  // Add more chain names here as needed
};

// RPC URLs
export const RPC_URLS = {
  [CHAIN_IDS.LOCALHOST]: "http://127.0.0.1:8545",
  [CHAIN_IDS.MANTLE_SEPOLIA]: "https://rpc.sepolia.mantle.xyz",
  [CHAIN_IDS.PHAROS_DEVNET]: "https://devnet.dplabs-internal.com",
  [CHAIN_IDS.BINANCE_TESTNET]: "https://data-seed-prebsc-1-s1.binance.org:8545",
  [CHAIN_IDS.ETHEREUM_SEPOLIA]: "https://sepolia.infura.io/v3/56e934eec4ad458ea26313f91e15cec3",
  // Add more RPCs here as needed
};

// Block Explorers
export const BLOCK_EXPLORERS = {
  [CHAIN_IDS.LOCALHOST]: "http://localhost:8545",
  [CHAIN_IDS.MANTLE_SEPOLIA]: "https://sepolia.mantlescan.xyz",
  [CHAIN_IDS.PHAROS_DEVNET]: "https://pharosscan.xyz",
  [CHAIN_IDS.BINANCE_TESTNET]: "https://testnet.bscscan.com",
  [CHAIN_IDS.ETHEREUM_SEPOLIA]: "https://sepolia.etherscan.io",
  // Add more explorers here as needed
};

// Token Contracts (e.g., your game's ERC20 token)
export const TOKEN_CONTRACTS = {
  [CHAIN_IDS.LOCALHOST]: {
      address: "0xB67aD31D42c13c4Bc3c96BeB89D288162f5a9D61", // Updated local token address
      name: "APT-Casino",
      symbol: "APTC",
      decimals: 18
  },
  [CHAIN_IDS.MANTLE_SEPOLIA]: {
      address: "0x3044BbF8d8F14D26E339fEC301f6e558a1967a10",
      name: "APT-Casino",
      symbol: "APTC",
      decimals: 18
  },
  [CHAIN_IDS.PHAROS_DEVNET]: {
      address: "0xB67aD31D42c13c4Bc3c96BeB89D288162f5a9D61",
      name: "APT-Casino",
      symbol: "APTC",
      decimals: 18
  },
  [CHAIN_IDS.BINANCE_TESTNET]: {
      address: "0x1DE498144F2A7A4c7D85d09C0B12999FD1a435c2",
      name: "APT-Casino",
      symbol: "APTC",
      decimals: 18
  },
  [CHAIN_IDS.ETHEREUM_SEPOLIA]: {
      address: "0xB67aD31D42c13c4Bc3c96BeB89D288162f5a9D61",
      name: "APT-Casino",
      symbol: "APTC",
      decimals: 18
  },
  // Add more chain configurations here as needed
};

// Roulette Contracts
export const ROULETTE_CONTRACTS = {
  [CHAIN_IDS.LOCALHOST]: {
      address: "0xc3e58B9Dc37Fa64cBe18DAC234465E2B5CCF80a1", // Updated local roulette address
  },
  [CHAIN_IDS.MANTLE_SEPOLIA]: {
      address: "0xfa339164994ea5d08fd898af81ffa8a5c4982974",
  },
  [CHAIN_IDS.PHAROS_DEVNET]: {
      address: "0xc3e58B9Dc37Fa64cBe18DAC234465E2B5CCF80a1",
  },
  [CHAIN_IDS.BINANCE_TESTNET]: {
    address: "0x18B5E45eFEd35c55a67316b45968242C82d2523E",
  },
  [CHAIN_IDS.ETHEREUM_SEPOLIA]: {
    address: "0xc3e58B9Dc37Fa64cBe18DAC234465E2B5CCF80a1",
  },
  // Add more chain configurations here as needed
};

// Wheel Contracts
export const WHEEL_CONTRACTS = {
  [CHAIN_IDS.LOCALHOST]: {
      address: "0xcf4469d29aaae6f136b9cd171a01700895093c67", // Updated wheel contract address
  },
  [CHAIN_IDS.MANTLE_SEPOLIA]: {
      address: "0x5d0F17a1f21B3F9Dac8C78a54EE7764993a5Cacd",
  },
  [CHAIN_IDS.PHAROS_DEVNET]: {
      address: "0x6d55c17495E176a16700D101596f543D00972481",
  },
  [CHAIN_IDS.BINANCE_TESTNET]: {
    address: "0xcf4469d29aaae6f136b9cd171a01700895093c67",
  },
  [CHAIN_IDS.ETHEREUM_SEPOLIA]: {
    address: "0xeb9F5df0e73f6e8C4337FC20c3f6Dd8Cf2841bA0", // You'll need to deploy your wheel contract here
  },
  // Add more chain configurations here as needed
};

// Mines Contracts
export const MINES_CONTRACTS = {
  [CHAIN_IDS.LOCALHOST]: {
      address: "0xa534adf7A3B107f8bDF10CD042a309701Db71e6D",
  },
  [CHAIN_IDS.MANTLE_SEPOLIA]: {
      address: "0xa534adf7A3B107f8bDF10CD042a309701Db71e6D",
  },
  [CHAIN_IDS.PHAROS_DEVNET]: {
      address: "0xa534adf7A3B107f8bDF10CD042a309701Db71e6D",
  },
  [CHAIN_IDS.BINANCE_TESTNET]: {
    address: "0xa534adf7A3B107f8bDF10CD042a309701Db71e6D",
  },
  [CHAIN_IDS.ETHEREUM_SEPOLIA]: {
    address: "0xa534adf7A3B107f8bDF10CD042a309701Db71e6D", // You'll need to deploy your mines contract here
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
  [CHAIN_IDS.BINANCE_TESTNET]: {
    name: "tBNB",
    symbol: "tBNB",
    decimals: 18
  },
  [CHAIN_IDS.ETHEREUM_SEPOLIA]: {
    name: "ETH",
    symbol: "ETH",
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
    rouletteContract: ROULETTE_CONTRACTS[CHAIN_IDS.LOCALHOST],
    minesContract: MINES_CONTRACTS[CHAIN_IDS.LOCALHOST],
    wheelContract: WHEEL_CONTRACTS[CHAIN_IDS.LOCALHOST],
  },
  {
    id: CHAIN_IDS.MANTLE_SEPOLIA,
    name: CHAIN_NAMES[CHAIN_IDS.MANTLE_SEPOLIA],
    rpcUrl: RPC_URLS[CHAIN_IDS.MANTLE_SEPOLIA],
    explorer: BLOCK_EXPLORERS[CHAIN_IDS.MANTLE_SEPOLIA],
    nativeCurrency: NATIVE_CURRENCIES[CHAIN_IDS.MANTLE_SEPOLIA],
    tokenContract: TOKEN_CONTRACTS[CHAIN_IDS.MANTLE_SEPOLIA],
    rouletteContract: ROULETTE_CONTRACTS[CHAIN_IDS.MANTLE_SEPOLIA],
    minesContract: MINES_CONTRACTS[CHAIN_IDS.MANTLE_SEPOLIA],
    wheelContract: WHEEL_CONTRACTS[CHAIN_IDS.MANTLE_SEPOLIA],
  },
  {
    id: CHAIN_IDS.BINANCE_TESTNET,
    name: CHAIN_NAMES[CHAIN_IDS.BINANCE_TESTNET],
    rpcUrl: RPC_URLS[CHAIN_IDS.BINANCE_TESTNET],
    explorer: BLOCK_EXPLORERS[CHAIN_IDS.BINANCE_TESTNET],
    nativeCurrency: NATIVE_CURRENCIES[CHAIN_IDS.BINANCE_TESTNET],
    tokenContract: TOKEN_CONTRACTS[CHAIN_IDS.BINANCE_TESTNET],
    wheelContract: WHEEL_CONTRACTS[CHAIN_IDS.BINANCE_TESTNET],
    minesContract: MINES_CONTRACTS[CHAIN_IDS.BINANCE_TESTNET],
  },
  {
    id: CHAIN_IDS.ETHEREUM_SEPOLIA,
    name: CHAIN_NAMES[CHAIN_IDS.ETHEREUM_SEPOLIA],
    rpcUrl: RPC_URLS[CHAIN_IDS.ETHEREUM_SEPOLIA],
    explorer: BLOCK_EXPLORERS[CHAIN_IDS.ETHEREUM_SEPOLIA],
    nativeCurrency: NATIVE_CURRENCIES[CHAIN_IDS.ETHEREUM_SEPOLIA],
    tokenContract: TOKEN_CONTRACTS[CHAIN_IDS.ETHEREUM_SEPOLIA],
    rouletteContract: ROULETTE_CONTRACTS[CHAIN_IDS.ETHEREUM_SEPOLIA],
    minesContract: MINES_CONTRACTS[CHAIN_IDS.ETHEREUM_SEPOLIA],
    wheelContract: WHEEL_CONTRACTS[CHAIN_IDS.ETHEREUM_SEPOLIA],
  },
  {
    id: CHAIN_IDS.PHAROS_DEVNET,
    name: CHAIN_NAMES[CHAIN_IDS.PHAROS_DEVNET],
    rpcUrl: RPC_URLS[CHAIN_IDS.PHAROS_DEVNET],
    explorer: BLOCK_EXPLORERS[CHAIN_IDS.PHAROS_DEVNET],
    nativeCurrency: NATIVE_CURRENCIES[CHAIN_IDS.PHAROS_DEVNET],
    tokenContract: TOKEN_CONTRACTS[CHAIN_IDS.PHAROS_DEVNET],
    rouletteContract: ROULETTE_CONTRACTS[CHAIN_IDS.PHAROS_DEVNET],
    minesContract: MINES_CONTRACTS[CHAIN_IDS.PHAROS_DEVNET],
    wheelContract: WHEEL_CONTRACTS[CHAIN_IDS.PHAROS_DEVNET],
  },
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
      rouletteContract: ROULETTE_CONTRACTS[CHAIN_IDS.MANTLE_SEPOLIA],
      minesContract: MINES_CONTRACTS[CHAIN_IDS.MANTLE_SEPOLIA],
      wheelContract: WHEEL_CONTRACTS[CHAIN_IDS.MANTLE_SEPOLIA],
  },
  PHAROS_DEVNET: {
      id: CHAIN_IDS.PHAROS_DEVNET,
      name: CHAIN_NAMES[CHAIN_IDS.PHAROS_DEVNET],
      rpcUrl: RPC_URLS[CHAIN_IDS.PHAROS_DEVNET],
      explorer: BLOCK_EXPLORERS[CHAIN_IDS.PHAROS_DEVNET],
      nativeCurrency: NATIVE_CURRENCIES[CHAIN_IDS.PHAROS_DEVNET],
      tokenContract: TOKEN_CONTRACTS[CHAIN_IDS.PHAROS_DEVNET],
      rouletteContract: ROULETTE_CONTRACTS[CHAIN_IDS.PHAROS_DEVNET],
      minesContract: MINES_CONTRACTS[CHAIN_IDS.PHAROS_DEVNET],
      wheelContract: WHEEL_CONTRACTS[CHAIN_IDS.PHAROS_DEVNET],      
  },
  BINANCE_TESTNET: {
      id: CHAIN_IDS.BINANCE_TESTNET,
      name: CHAIN_NAMES[CHAIN_IDS.BINANCE_TESTNET],
      rpcUrl: RPC_URLS[CHAIN_IDS.BINANCE_TESTNET],
      explorer: BLOCK_EXPLORERS[CHAIN_IDS.BINANCE_TESTNET],
      nativeCurrency: NATIVE_CURRENCIES[CHAIN_IDS.BINANCE_TESTNET],
      tokenContract: TOKEN_CONTRACTS[CHAIN_IDS.BINANCE_TESTNET],
      rouletteContract: ROULETTE_CONTRACTS[CHAIN_IDS.BINANCE_TESTNET],
      minesContract: MINES_CONTRACTS[CHAIN_IDS.BINANCE_TESTNET],
      wheelContract: WHEEL_CONTRACTS[CHAIN_IDS.BINANCE_TESTNET],      
  },
  ETHEREUM_SEPOLIA: {
      id: CHAIN_IDS.ETHEREUM_SEPOLIA,
      name: CHAIN_NAMES[CHAIN_IDS.ETHEREUM_SEPOLIA],
      rpcUrl: RPC_URLS[CHAIN_IDS.ETHEREUM_SEPOLIA],
      explorer: BLOCK_EXPLORERS[CHAIN_IDS.ETHEREUM_SEPOLIA],
      nativeCurrency: NATIVE_CURRENCIES[CHAIN_IDS.ETHEREUM_SEPOLIA],
      tokenContract: TOKEN_CONTRACTS[CHAIN_IDS.ETHEREUM_SEPOLIA],
      rouletteContract: ROULETTE_CONTRACTS[CHAIN_IDS.ETHEREUM_SEPOLIA],
      minesContract: MINES_CONTRACTS[CHAIN_IDS.ETHEREUM_SEPOLIA],
      wheelContract: WHEEL_CONTRACTS[CHAIN_IDS.ETHEREUM_SEPOLIA],      
  },
};

export const CONTRACTS = {
MANTLE_SEPOLIA: {
  chainId: CHAIN_IDS.MANTLE_SEPOLIA,
  chainName: 'Mantle Sepolia',
  token: {
    address: '0x3044BbF8d8F14D26E339fEC301f6e558a1967a10',
    abi: [
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
			"inputs": [],
			"name": "EnforcedPause",
			"type": "error"
		},
		{
			"inputs": [],
			"name": "ExpectedPause",
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
					"name": "oldContract",
					"type": "address"
				},
				{
					"indexed": true,
					"internalType": "address",
					"name": "newContract",
					"type": "address"
				}
			],
			"name": "RouletteContractUpdated",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "address",
					"name": "burner",
					"type": "address"
				},
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "amount",
					"type": "uint256"
				}
			],
			"name": "TokensBurned",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "address",
					"name": "to",
					"type": "address"
				},
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "amount",
					"type": "uint256"
				}
			],
			"name": "TokensMinted",
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
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "address",
					"name": "oldTreasury",
					"type": "address"
				},
				{
					"indexed": true,
					"internalType": "address",
					"name": "newTreasury",
					"type": "address"
				}
			],
			"name": "TreasuryUpdated",
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
			"name": "Unpaused",
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
			"inputs": [
				{
					"internalType": "uint256",
					"name": "amount",
					"type": "uint256"
				}
			],
			"name": "burn",
			"outputs": [],
			"stateMutability": "nonpayable",
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
					"name": "amount",
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
			"name": "pause",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "paused",
			"outputs": [
				{
					"internalType": "bool",
					"name": "",
					"type": "bool"
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
			"inputs": [],
			"name": "rouletteContract",
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
					"internalType": "address",
					"name": "_rouletteContract",
					"type": "address"
				}
			],
			"name": "setRouletteContract",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "_treasury",
					"type": "address"
				}
			],
			"name": "setTreasury",
			"outputs": [],
			"stateMutability": "nonpayable",
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
		},
		{
			"inputs": [],
			"name": "treasury",
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
			"name": "unpause",
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
      { "inputs": [ { "internalType": "enum Roulette.BetType[]", "name": "betTypes", "type": "uint8[]" }, { "internalType": "uint8[]", "name": "betValues", "type": "uint8[]" }, { "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }, { "internalType": "uint256[][]", "name": "betNumbers", "type": "uint256[][]" } ], "name": "placeMultipleBets", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
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
    address: '0x5d0F17a1f21B3F9Dac8C78a54EE7764993a5Cacd',
    abi: [
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "_amount",
					"type": "uint256"
				}
			],
			"name": "depositForPayouts",
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
			"name": "emergencyRefund",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "_token",
					"type": "address"
				},
				{
					"internalType": "uint256",
					"name": "_amount",
					"type": "uint256"
				}
			],
			"name": "emergencyWithdraw",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "contract IERC20",
					"name": "_token",
					"type": "address"
				},
				{
					"internalType": "address",
					"name": "_gameOperator",
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
				}
			],
			"name": "BetRefunded",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "address",
					"name": "newOperator",
					"type": "address"
				}
			],
			"name": "GameOperatorUpdated",
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
			"inputs": [
				{
					"internalType": "uint256",
					"name": "round",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "frontendMultiplier",
					"type": "uint256"
				}
			],
			"name": "processResult",
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
					"internalType": "address",
					"name": "_newOperator",
					"type": "address"
				}
			],
			"name": "updateGameOperator",
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
			"name": "updateMinBet",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
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
				},
				{
					"internalType": "bool",
					"name": "isActive",
					"type": "bool"
				},
				{
					"internalType": "uint256",
					"name": "timestamp",
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
			"name": "gameOperator",
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
					"internalType": "uint256",
					"name": "round",
					"type": "uint256"
				}
			],
			"name": "getBet",
			"outputs": [
				{
					"components": [
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
						},
						{
							"internalType": "bool",
							"name": "isActive",
							"type": "bool"
						},
						{
							"internalType": "uint256",
							"name": "timestamp",
							"type": "uint256"
						}
					],
					"internalType": "struct WheelGame.Bet",
					"name": "",
					"type": "tuple"
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
			"inputs": [],
			"name": "getGameOperator",
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
					"internalType": "uint256",
					"name": "round",
					"type": "uint256"
				}
			],
			"name": "getResult",
			"outputs": [
				{
					"components": [
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
					"internalType": "struct WheelGame.WheelResult",
					"name": "",
					"type": "tuple"
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
			"name": "getValidMultipliers",
			"outputs": [
				{
					"internalType": "uint256[]",
					"name": "",
					"type": "uint256[]"
				}
			],
			"stateMutability": "pure",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint8",
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
					"internalType": "uint256[]",
					"name": "multipliers",
					"type": "uint256[]"
				},
				{
					"internalType": "string[]",
					"name": "colors",
					"type": "string[]"
				},
				{
					"internalType": "uint256[]",
					"name": "probabilities",
					"type": "uint256[]"
				}
			],
			"stateMutability": "pure",
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
			"name": "isRoundProcessed",
			"outputs": [
				{
					"internalType": "bool",
					"name": "",
					"type": "bool"
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
					"name": "",
					"type": "uint256"
				}
			],
			"name": "roundProcessed",
			"outputs": [
				{
					"internalType": "bool",
					"name": "",
					"type": "bool"
				}
			],
			"stateMutability": "view",
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
    address: '0x6d55c17495E176a16700D101596f543D00972481',
    abi: [
			{
				"inputs": [
					{
						"internalType": "contract IERC20",
						"name": "_token",
						"type": "address"
					},
					{
						"internalType": "address",
						"name": "_gameOperator",
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
					}
				],
				"name": "BetRefunded",
				"type": "event"
			},
			{
				"anonymous": false,
				"inputs": [
					{
						"indexed": true,
						"internalType": "address",
						"name": "newOperator",
						"type": "address"
					}
				],
				"name": "GameOperatorUpdated",
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
					},
					{
						"internalType": "bool",
						"name": "isActive",
						"type": "bool"
					},
					{
						"internalType": "uint256",
						"name": "timestamp",
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
				"inputs": [
					{
						"internalType": "uint256",
						"name": "_amount",
						"type": "uint256"
					}
				],
				"name": "depositForPayouts",
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
				"name": "emergencyRefund",
				"outputs": [],
				"stateMutability": "nonpayable",
				"type": "function"
			},
			{
				"inputs": [
					{
						"internalType": "address",
						"name": "_token",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "_amount",
						"type": "uint256"
					}
				],
				"name": "emergencyWithdraw",
				"outputs": [],
				"stateMutability": "nonpayable",
				"type": "function"
			},
			{
				"inputs": [],
				"name": "gameOperator",
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
						"internalType": "uint256",
						"name": "round",
						"type": "uint256"
					}
				],
				"name": "getBet",
				"outputs": [
					{
						"components": [
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
							},
							{
								"internalType": "bool",
								"name": "isActive",
								"type": "bool"
							},
							{
								"internalType": "uint256",
								"name": "timestamp",
								"type": "uint256"
							}
						],
						"internalType": "struct WheelGame.Bet",
						"name": "",
						"type": "tuple"
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
				"inputs": [],
				"name": "getGameOperator",
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
						"internalType": "uint256",
						"name": "round",
						"type": "uint256"
					}
				],
				"name": "getResult",
				"outputs": [
					{
						"components": [
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
						"internalType": "struct WheelGame.WheelResult",
						"name": "",
						"type": "tuple"
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
				"name": "getValidMultipliers",
				"outputs": [
					{
						"internalType": "uint256[]",
						"name": "",
						"type": "uint256[]"
					}
				],
				"stateMutability": "pure",
				"type": "function"
			},
			{
				"inputs": [
					{
						"internalType": "uint8",
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
						"internalType": "uint256[]",
						"name": "multipliers",
						"type": "uint256[]"
					},
					{
						"internalType": "string[]",
						"name": "colors",
						"type": "string[]"
					},
					{
						"internalType": "uint256[]",
						"name": "probabilities",
						"type": "uint256[]"
					}
				],
				"stateMutability": "pure",
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
				"name": "isRoundProcessed",
				"outputs": [
					{
						"internalType": "bool",
						"name": "",
						"type": "bool"
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
				"inputs": [
					{
						"internalType": "uint256",
						"name": "round",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "frontendMultiplier",
						"type": "uint256"
					}
				],
				"name": "processResult",
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
						"name": "",
						"type": "uint256"
					}
				],
				"name": "roundProcessed",
				"outputs": [
					{
						"internalType": "bool",
						"name": "",
						"type": "bool"
					}
				],
				"stateMutability": "view",
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
						"internalType": "address",
						"name": "_newOperator",
						"type": "address"
					}
				],
				"name": "updateGameOperator",
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
				"name": "updateMinBet",
				"outputs": [],
				"stateMutability": "nonpayable",
				"type": "function"
			}
		]
  },
  mines: {
    address: '0xa534adf7A3B107f8bDF10CD042a309701Db71e6D',
    abi: [
      // ... existing code ...
    ]
  }
},

BINANCE_TESTNET: {
  chainId: CHAIN_IDS.BINANCE_TESTNET,
  chainName: 'Binance Smart Chain Testnet',
  token: {
    address: '0x1DE498144F2A7A4c7D85d09C0B12999FD1a435c2',
    abi: [
      {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "inputs": [
          { "internalType": "address", "name": "spender", "type": "address" },
          { "internalType": "uint256", "name": "allowance", "type": "uint256" },
          { "internalType": "uint256", "name": "needed", "type": "uint256" }
        ],
        "name": "ERC20InsufficientAllowance",
        "type": "error"
      },
      {
        "inputs": [
          { "internalType": "address", "name": "sender", "type": "address" },
          { "internalType": "uint256", "name": "balance", "type": "uint256" },
          { "internalType": "uint256", "name": "needed", "type": "uint256" }
        ],
        "name": "ERC20InsufficientBalance",
        "type": "error"
      },
      {
        "inputs": [
          { "internalType": "address", "name": "approver", "type": "address" }
        ],
        "name": "ERC20InvalidApprover",
        "type": "error"
      },
      {
        "inputs": [
          { "internalType": "address", "name": "receiver", "type": "address" }
        ],
        "name": "ERC20InvalidReceiver",
        "type": "error"
      },
      {
        "inputs": [
          { "internalType": "address", "name": "sender", "type": "address" }
        ],
        "name": "ERC20InvalidSender",
        "type": "error"
      },
      {
        "inputs": [
          { "internalType": "address", "name": "spender", "type": "address" }
        ],
        "name": "ERC20InvalidSpender",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "EnforcedPause",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "ExpectedPause",
        "type": "error"
      },
      {
        "inputs": [
          { "internalType": "address", "name": "owner", "type": "address" }
        ],
        "name": "OwnableInvalidOwner",
        "type": "error"
      },
      {
        "inputs": [
          { "internalType": "address", "name": "account", "type": "address" }
        ],
        "name": "OwnableUnauthorizedAccount",
        "type": "error"
      },
      {
        "anonymous": false,
        "inputs": [
          { "indexed": true, "internalType": "address", "name": "owner", "type": "address" },
          { "indexed": true, "internalType": "address", "name": "spender", "type": "address" },
          { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }
        ],
        "name": "Approval",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          { "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" },
          { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          { "indexed": false, "internalType": "address", "name": "account", "type": "address" }
        ],
        "name": "Paused",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          { "indexed": true, "internalType": "address", "name": "oldContract", "type": "address" },
          { "indexed": true, "internalType": "address", "name": "newContract", "type": "address" }
        ],
        "name": "RouletteContractUpdated",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          { "indexed": true, "internalType": "address", "name": "burner", "type": "address" },
          { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
        ],
        "name": "TokensBurned",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          { "indexed": true, "internalType": "address", "name": "to", "type": "address" },
          { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
        ],
        "name": "TokensMinted",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          { "indexed": true, "internalType": "address", "name": "from", "type": "address" },
          { "indexed": true, "internalType": "address", "name": "to", "type": "address" },
          { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }
        ],
        "name": "Transfer",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          { "indexed": true, "internalType": "address", "name": "oldTreasury", "type": "address" },
          { "indexed": true, "internalType": "address", "name": "newTreasury", "type": "address" }
        ],
        "name": "TreasuryUpdated",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          { "indexed": false, "internalType": "address", "name": "account", "type": "address" }
        ],
        "name": "Unpaused",
        "type": "event"
      },
      {
        "inputs": [
          { "internalType": "address", "name": "owner", "type": "address" },
          { "internalType": "address", "name": "spender", "type": "address" }
        ],
        "name": "allowance",
        "outputs": [
          { "internalType": "uint256", "name": "", "type": "uint256" }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          { "internalType": "address", "name": "spender", "type": "address" },
          { "internalType": "uint256", "name": "value", "type": "uint256" }
        ],
        "name": "approve",
        "outputs": [
          { "internalType": "bool", "name": "", "type": "bool" }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          { "internalType": "address", "name": "account", "type": "address" }
        ],
        "name": "balanceOf",
        "outputs": [
          { "internalType": "uint256", "name": "", "type": "uint256" }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          { "internalType": "uint256", "name": "amount", "type": "uint256" }
        ],
        "name": "burn",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "decimals",
        "outputs": [
          { "internalType": "uint8", "name": "", "type": "uint8" }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          { "internalType": "address", "name": "to", "type": "address" },
          { "internalType": "uint256", "name": "amount", "type": "uint256" }
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
          { "internalType": "string", "name": "", "type": "string" }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "owner",
        "outputs": [
          { "internalType": "address", "name": "", "type": "address" }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "pause",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "paused",
        "outputs": [
          { "internalType": "bool", "name": "", "type": "bool" }
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
        "inputs": [],
        "name": "rouletteContract",
        "outputs": [
          { "internalType": "address", "name": "", "type": "address" }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          { "internalType": "address", "name": "_rouletteContract", "type": "address" }
        ],
        "name": "setRouletteContract",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          { "internalType": "address", "name": "_treasury", "type": "address" }
        ],
        "name": "setTreasury",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "symbol",
        "outputs": [
          { "internalType": "string", "name": "", "type": "string" }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
          { "internalType": "uint256", "name": "", "type": "uint256" }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          { "internalType": "address", "name": "to", "type": "address" },
          { "internalType": "uint256", "name": "value", "type": "uint256" }
        ],
        "name": "transfer",
        "outputs": [
          { "internalType": "bool", "name": "", "type": "bool" }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          { "internalType": "address", "name": "from", "type": "address" },
          { "internalType": "address", "name": "to", "type": "address" },
          { "internalType": "uint256", "name": "value", "type": "uint256" }
        ],
        "name": "transferFrom",
        "outputs": [
          { "internalType": "bool", "name": "", "type": "bool" }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          { "internalType": "address", "name": "newOwner", "type": "address" }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "treasury",
        "outputs": [
          { "internalType": "address", "name": "", "type": "address" }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "unpause",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ]
  },
  roulette: {
    address: '0x18B5E45eFEd35c55a67316b45968242C82d2523E',
    abi: [
      { "inputs": [ { "internalType": "contract IERC20", "name": "_token", "type": "address" } ], "stateMutability": "nonpayable", "type": "constructor" },
      { "inputs": [ { "internalType": "address", "name": "owner", "type": "address" } ], "name": "OwnableInvalidOwner", "type": "error" },
      { "inputs": [ { "internalType": "address", "name": "account", "type": "address" } ], "name": "OwnableUnauthorizedAccount", "type": "error" },
      { "inputs": [], "name": "ReentrancyGuardReentrantCall", "type": "error" },
      { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "player", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "enum Roulette.BetType", "name": "betType", "type": "uint8" }, { "indexed": false, "internalType": "uint8", "name": "betValue", "type": "uint8" }, { "indexed": false, "internalType": "uint256", "name": "round", "type": "uint256" } ], "name": "BetPlaced", "type": "event" },
      { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "player", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "bool", "name": "won", "type": "bool" }, { "indexed": false, "internalType": "uint256", "name": "winnings", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "round", "type": "uint256" } ], "name": "BetResult", "type": "event" },
      { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "OwnershipTransferred", "type": "event" },
      { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "uint256", "name": "randomNumber", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "round", "type": "uint256" } ], "name": "RandomGenerated", "type": "event" },
      { "inputs": [], "name": "MIN_WAIT_BLOCK", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" },
      { "inputs": [], "name": "TREASURY", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" },
      { "inputs": [], "name": "TREASURY_FEE_RATE", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" },
      { "inputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "name": "bets", "outputs": [ { "internalType": "address", "name": "player", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "enum Roulette.BetType", "name": "betType", "type": "uint8" }, { "internalType": "uint8", "name": "betValue", "type": "uint8" }, { "internalType": "uint256", "name": "round", "type": "uint256" } ], "stateMutability": "view", "type": "function" },
      { "inputs": [], "name": "currentRound", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" },
      { "inputs": [], "name": "lastBetBlock", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" },
      { "inputs": [ { "internalType": "address", "name": "", "type": "address" } ], "name": "lastBetTime", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" },
      { "inputs": [], "name": "maxBet", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" },
      { "inputs": [], "name": "minBet", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" },
      { "inputs": [], "name": "nonce", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" },
      { "inputs": [], "name": "owner", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" },
      { "inputs": [ { "internalType": "enum Roulette.BetType[]", "name": "betTypes", "type": "uint8[]" }, { "internalType": "uint8[]", "name": "betValues", "type": "uint8[]" }, { "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }, { "internalType": "uint256[][]", "name": "betNumbers", "type": "uint256[][]" } ], "name": "placeMultipleBets", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [], "name": "randomResult", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" },
      { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [ { "internalType": "uint256", "name": "_maxBet", "type": "uint256" } ], "name": "setMaxBet", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [ { "internalType": "uint256", "name": "_minBet", "type": "uint256" } ], "name": "setMinBet", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [], "name": "token", "outputs": [ { "internalType": "contract IERC20", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" },
      { "inputs": [ { "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [ { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "withdrawTokens", "outputs": [], "stateMutability": "nonpayable", "type": "function" }
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
					},
					{
						"internalType": "address",
						"name": "_gameOperator",
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
					}
				],
				"name": "BetRefunded",
				"type": "event"
			},
			{
				"anonymous": false,
				"inputs": [
					{
						"indexed": true,
						"internalType": "address",
						"name": "newOperator",
						"type": "address"
					}
				],
				"name": "GameOperatorUpdated",
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
					},
					{
						"internalType": "bool",
						"name": "isActive",
						"type": "bool"
					},
					{
						"internalType": "uint256",
						"name": "timestamp",
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
				"inputs": [
					{
						"internalType": "uint256",
						"name": "_amount",
						"type": "uint256"
					}
				],
				"name": "depositForPayouts",
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
				"name": "emergencyRefund",
				"outputs": [],
				"stateMutability": "nonpayable",
				"type": "function"
			},
			{
				"inputs": [
					{
						"internalType": "address",
						"name": "_token",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "_amount",
						"type": "uint256"
					}
				],
				"name": "emergencyWithdraw",
				"outputs": [],
				"stateMutability": "nonpayable",
				"type": "function"
			},
			{
				"inputs": [],
				"name": "gameOperator",
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
						"internalType": "uint256",
						"name": "round",
						"type": "uint256"
					}
				],
				"name": "getBet",
				"outputs": [
					{
						"components": [
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
							},
							{
								"internalType": "bool",
								"name": "isActive",
								"type": "bool"
							},
							{
								"internalType": "uint256",
								"name": "timestamp",
								"type": "uint256"
							}
						],
						"internalType": "struct WheelGame.Bet",
						"name": "",
						"type": "tuple"
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
				"inputs": [],
				"name": "getGameOperator",
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
						"internalType": "uint256",
						"name": "round",
						"type": "uint256"
					}
				],
				"name": "getResult",
				"outputs": [
					{
						"components": [
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
						"internalType": "struct WheelGame.WheelResult",
						"name": "",
						"type": "tuple"
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
				"name": "getValidMultipliers",
				"outputs": [
					{
						"internalType": "uint256[]",
						"name": "",
						"type": "uint256[]"
					}
				],
				"stateMutability": "pure",
				"type": "function"
			},
			{
				"inputs": [
					{
						"internalType": "uint8",
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
						"internalType": "uint256[]",
						"name": "multipliers",
						"type": "uint256[]"
					},
					{
						"internalType": "string[]",
						"name": "colors",
						"type": "string[]"
					},
					{
						"internalType": "uint256[]",
						"name": "probabilities",
						"type": "uint256[]"
					}
				],
				"stateMutability": "pure",
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
				"name": "isRoundProcessed",
				"outputs": [
					{
						"internalType": "bool",
						"name": "",
						"type": "bool"
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
				"inputs": [
					{
						"internalType": "uint256",
						"name": "round",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "frontendMultiplier",
						"type": "uint256"
					}
				],
				"name": "processResult",
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
						"name": "",
						"type": "uint256"
					}
				],
				"name": "roundProcessed",
				"outputs": [
					{
						"internalType": "bool",
						"name": "",
						"type": "bool"
					}
				],
				"stateMutability": "view",
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
						"internalType": "address",
						"name": "_newOperator",
						"type": "address"
					}
				],
				"name": "updateGameOperator",
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
				"name": "updateMinBet",
				"outputs": [],
				"stateMutability": "nonpayable",
				"type": "function"
			}
		]
  },
},

ETHEREUM_SEPOLIA: {
  token: {
    address: '0xB67aD31D42c13c4Bc3c96BeB89D288162f5a9D61',
    abi: [
      { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" },
      { "inputs": [ { "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "allowance", "type": "uint256" }, { "internalType": "uint256", "name": "needed", "type": "uint256" } ], "name": "ERC20InsufficientAllowance", "type": "error" },
      { "inputs": [ { "internalType": "address", "name": "sender", "type": "address" }, { "internalType": "uint256", "name": "balance", "type": "uint256" }, { "internalType": "uint256", "name": "needed", "type": "uint256" } ], "name": "ERC20InsufficientBalance", "type": "error" },
      { "inputs": [ { "internalType": "address", "name": "approver", "type": "address" } ], "name": "ERC20InvalidApprover", "type": "error" },
      { "inputs": [ { "internalType": "address", "name": "receiver", "type": "address" } ], "name": "ERC20InvalidReceiver", "type": "error" },
      { "inputs": [ { "internalType": "address", "name": "sender", "type": "address" } ], "name": "ERC20InvalidSender", "type": "error" },
      { "inputs": [ { "internalType": "address", "name": "spender", "type": "address" } ], "name": "ERC20InvalidSpender", "type": "error" },
      { "inputs": [], "name": "EnforcedPause", "type": "error" },
      { "inputs": [], "name": "ExpectedPause", "type": "error" },
      { "inputs": [ { "internalType": "address", "name": "owner", "type": "address" } ], "name": "OwnableInvalidOwner", "type": "error" },
      { "inputs": [ { "internalType": "address", "name": "account", "type": "address" } ], "name": "OwnableUnauthorizedAccount", "type": "error" },
      { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "Approval", "type": "event" },
      { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "OwnershipTransferred", "type": "event" },
      { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address", "name": "account", "type": "address" } ], "name": "Paused", "type": "event" },
      { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "oldContract", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newContract", "type": "address" } ], "name": "RouletteContractUpdated", "type": "event" },
      { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "burner", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "TokensBurned", "type": "event" },
      { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "TokensMinted", "type": "event" },
      { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "Transfer", "type": "event" },
      { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "oldTreasury", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newTreasury", "type": "address" } ], "name": "TreasuryUpdated", "type": "event" },
      { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address", "name": "account", "type": "address" } ], "name": "Unpaused", "type": "event" },
      { "inputs": [ { "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" } ], "name": "allowance", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" },
      { "inputs": [ { "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "approve", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [ { "internalType": "address", "name": "account", "type": "address" } ], "name": "balanceOf", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" },
      { "inputs": [ { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "burn", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [], "name": "decimals", "outputs": [ { "internalType": "uint8", "name": "", "type": "uint8" } ], "stateMutability": "view", "type": "function" },
      { "inputs": [ { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "mint", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [], "name": "name", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function" },
      { "inputs": [], "name": "owner", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" },
      { "inputs": [], "name": "pause", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [], "name": "paused", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" },
      { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [], "name": "rouletteContract", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" },
      { "inputs": [ { "internalType": "address", "name": "_rouletteContract", "type": "address" } ], "name": "setRouletteContract", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [ { "internalType": "address", "name": "_treasury", "type": "address" } ], "name": "setTreasury", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [], "name": "symbol", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function" },
      { "inputs": [], "name": "totalSupply", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" },
      { "inputs": [ { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "transfer", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [ { "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "transferFrom", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [ { "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [], "name": "treasury", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" },
      { "inputs": [], "name": "unpause", "outputs": [], "stateMutability": "nonpayable", "type": "function" }
    ]
  },
  roulette: {
    address: '0xc3e58B9Dc37Fa64cBe18DAC234465E2B5CCF80a1',
    abi: [
      { "inputs": [ { "internalType": "contract IERC20", "name": "_token", "type": "address" } ], "stateMutability": "nonpayable", "type": "constructor" },
      { "inputs": [ { "internalType": "address", "name": "owner", "type": "address" } ], "name": "OwnableInvalidOwner", "type": "error" },
      { "inputs": [ { "internalType": "address", "name": "account", "type": "address" } ], "name": "OwnableUnauthorizedAccount", "type": "error" },
      { "inputs": [], "name": "ReentrancyGuardReentrantCall", "type": "error" },
      { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "player", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "enum Roulette.BetType", "name": "betType", "type": "uint8" }, { "indexed": false, "internalType": "uint8", "name": "betValue", "type": "uint8" }, { "indexed": false, "internalType": "uint256", "name": "round", "type": "uint256" } ], "name": "BetPlaced", "type": "event" },
      { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "player", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "bool", "name": "won", "type": "bool" }, { "indexed": false, "internalType": "uint256", "name": "winnings", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "round", "type": "uint256" } ], "name": "BetResult", "type": "event" },
      { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "OwnershipTransferred", "type": "event" },
      { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "uint256", "name": "randomNumber", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "round", "type": "uint256" } ], "name": "RandomGenerated", "type": "event" },
      { "inputs": [], "name": "MIN_WAIT_BLOCK", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" },
      { "inputs": [], "name": "TREASURY", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" },
      { "inputs": [], "name": "TREASURY_FEE_RATE", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" },
      { "inputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "name": "bets", "outputs": [ { "internalType": "address", "name": "player", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "enum Roulette.BetType", "name": "betType", "type": "uint8" }, { "internalType": "uint8", "name": "betValue", "type": "uint8" }, { "internalType": "uint256", "name": "round", "type": "uint256" } ], "stateMutability": "view", "type": "function" },
      { "inputs": [], "name": "currentRound", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" },
      { "inputs": [], "name": "lastBetBlock", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" },
      { "inputs": [ { "internalType": "address", "name": "", "type": "address" } ], "name": "lastBetTime", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" },
      { "inputs": [], "name": "maxBet", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" },
      { "inputs": [], "name": "minBet", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" },
      { "inputs": [], "name": "nonce", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" },
      { "inputs": [], "name": "owner", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" },
      { "inputs": [ { "internalType": "enum Roulette.BetType[]", "name": "betTypes", "type": "uint8[]" }, { "internalType": "uint8[]", "name": "betValues", "type": "uint8[]" }, { "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }, { "internalType": "uint256[][]", "name": "betNumbers", "type": "uint256[][]" } ], "name": "placeMultipleBets", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [], "name": "randomResult", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" },
      { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [ { "internalType": "uint256", "name": "_maxBet", "type": "uint256" } ], "name": "setMaxBet", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [ { "internalType": "uint256", "name": "_minBet", "type": "uint256" } ], "name": "setMinBet", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [], "name": "token", "outputs": [ { "internalType": "contract IERC20", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" },
      { "inputs": [ { "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [ { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "withdrawTokens", "outputs": [], "stateMutability": "nonpayable", "type": "function" }
    ]
  },
  wheel: { 
    address: '0xeb9F5df0e73f6e8C4337FC20c3f6Dd8Cf2841bA0', 
    abi: [
			{
				"inputs": [
					{
						"internalType": "contract IERC20",
						"name": "_token",
						"type": "address"
					},
					{
						"internalType": "address",
						"name": "_gameOperator",
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
					}
				],
				"name": "BetRefunded",
				"type": "event"
			},
			{
				"anonymous": false,
				"inputs": [
					{
						"indexed": true,
						"internalType": "address",
						"name": "newOperator",
						"type": "address"
					}
				],
				"name": "GameOperatorUpdated",
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
					},
					{
						"internalType": "bool",
						"name": "isActive",
						"type": "bool"
					},
					{
						"internalType": "uint256",
						"name": "timestamp",
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
				"inputs": [
					{
						"internalType": "uint256",
						"name": "_amount",
						"type": "uint256"
					}
				],
				"name": "depositForPayouts",
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
				"name": "emergencyRefund",
				"outputs": [],
				"stateMutability": "nonpayable",
				"type": "function"
			},
			{
				"inputs": [
					{
						"internalType": "address",
						"name": "_token",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "_amount",
						"type": "uint256"
					}
				],
				"name": "emergencyWithdraw",
				"outputs": [],
				"stateMutability": "nonpayable",
				"type": "function"
			},
			{
				"inputs": [],
				"name": "gameOperator",
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
						"internalType": "uint256",
						"name": "round",
						"type": "uint256"
					}
				],
				"name": "getBet",
				"outputs": [
					{
						"components": [
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
							},
							{
								"internalType": "bool",
								"name": "isActive",
								"type": "bool"
							},
							{
								"internalType": "uint256",
								"name": "timestamp",
								"type": "uint256"
							}
						],
						"internalType": "struct WheelGame.Bet",
						"name": "",
						"type": "tuple"
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
				"inputs": [],
				"name": "getGameOperator",
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
						"internalType": "uint256",
						"name": "round",
						"type": "uint256"
					}
				],
				"name": "getResult",
				"outputs": [
					{
						"components": [
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
						"internalType": "struct WheelGame.WheelResult",
						"name": "",
						"type": "tuple"
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
				"name": "getValidMultipliers",
				"outputs": [
					{
						"internalType": "uint256[]",
						"name": "",
						"type": "uint256[]"
					}
				],
				"stateMutability": "pure",
				"type": "function"
			},
			{
				"inputs": [
					{
						"internalType": "uint8",
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
						"internalType": "uint256[]",
						"name": "multipliers",
						"type": "uint256[]"
					},
					{
						"internalType": "string[]",
						"name": "colors",
						"type": "string[]"
					},
					{
						"internalType": "uint256[]",
						"name": "probabilities",
						"type": "uint256[]"
					}
				],
				"stateMutability": "pure",
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
				"name": "isRoundProcessed",
				"outputs": [
					{
						"internalType": "bool",
						"name": "",
						"type": "bool"
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
				"inputs": [
					{
						"internalType": "uint256",
						"name": "round",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "frontendMultiplier",
						"type": "uint256"
					}
				],
				"name": "processResult",
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
						"name": "",
						"type": "uint256"
					}
				],
				"name": "roundProcessed",
				"outputs": [
					{
						"internalType": "bool",
						"name": "",
						"type": "bool"
					}
				],
				"stateMutability": "view",
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
						"internalType": "address",
						"name": "_newOperator",
						"type": "address"
					}
				],
				"name": "updateGameOperator",
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
				"name": "updateMinBet",
				"outputs": [],
				"stateMutability": "nonpayable",
				"type": "function"
			}
		]
  },
},

}; 