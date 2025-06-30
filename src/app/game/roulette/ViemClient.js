"use client";
import { createPublicClient, http, createWalletClient, custom } from 'viem'
import { polygon, mainnet, mantleSepoliaTestnet } from 'viem/chains'
import dynamic from 'next/dynamic';

// Define Mantle Sepolia chain
const mantleSepolia = {
  id: 5003,
  name: 'Mantle Sepolia',
  network: 'mantle-sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Mantle',
    symbol: 'MNT',
  },
  rpcUrls: {
    default: { http: ['https://rpc.sepolia.mantle.xyz'] },
    public: { http: ['https://rpc.sepolia.mantle.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Mantle Sepolia Explorer', url: 'https://sepolia.mantlescan.xyz' },
  },
  testnet: true,
};

// Define Pharos Devnet chain
const pharosDevnet = {
  id: 50002,
  name: 'Pharos Devnet',
  network: 'pharos-devnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Pharos',
    symbol: 'PHR',
  },
  rpcUrls: {
    default: { http: ['https://devnet.dplabs-internal.com'] },
    public: { http: ['https://devnet.dplabs-internal.com'] },
  },
  blockExplorers: {
    default: { name: 'Pharos Explorer', url: 'https://pharosscan.xyz' },
  },
  testnet: true,
};

// Configure transport with improved settings
const configureTransport = (url) => http(url, {
  batch: { batchSize: 1 },  // Disable batching for more reliable connections
  fetchOptions: {
    cache: 'no-store',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    method: 'POST', // Blockchain JSON-RPC calls require POST
  },
  timeout: 30000, // 30 seconds timeout
  retryCount: 3,
  retryDelay: 1000,
});

export const publicMainnetClient = createPublicClient({
  chain: mainnet,
  transport: configureTransport('https://eth.llamarpc.com'),
});

export const publicPolygonClient = createPublicClient({
  chain: polygon,
  transport: configureTransport('https://polygon.llamarpc.com'),
});

export const publicMantleSepoliaClient = createPublicClient({
  chain: mantleSepolia,
  transport: configureTransport('https://rpc.sepolia.mantle.xyz'),
});

// Comment out Pharos Devnet - using Mantle Sepolia instead
// export const publicPharosSepoliaClient = createPublicClient({
//   chain: pharosDevnet,
//   transport: configureTransport('https://devnet.dplabs-internal.com'),
// });

// Use Mantle Sepolia as the primary client
export const publicPharosSepoliaClient = publicMantleSepoliaClient;

let walletClient = null;

export const getWalletClient = async () => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('No ethereum provider found');
  }

  try {
    // Request account access if needed
    await window.ethereum.request({ method: 'eth_requestAccounts' });

    // Create wallet client if not already created
    if (!walletClient) {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      // Prefer Mantle Sepolia (0x138b), fallback to Pharos Devnet
      const chain = chainId === '0x138b' ? mantleSepolia : pharosDevnet;
      
      walletClient = createWalletClient({
        chain,
        transport: custom(window.ethereum),
      });
    }

    return walletClient;
  } catch (error) {
    console.error('Failed to get wallet client:', error);
    walletClient = null; // Reset for next attempt
    throw error;
  }
};

export const createCustomWalletClient = (account) => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('No ethereum provider found');
  }
  
  return createWalletClient({
    account,
    chain: pharosDevnet,
    transport: custom(window.ethereum)
  });
};

export const checkNetwork = async () => {
  if (typeof window === 'undefined' || !window.ethereum) {
    return false;
  }
  
  try {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    if (chainId !== '0x138b' && chainId !== '0xc352') { // Mantle or Pharos Devnet chainId
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x138b' }], // Default to Mantle Sepolia
        });
      } catch (switchError) {
        if (switchError.code === 4902) {
          try {
            // Add Mantle Sepolia network
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0x138b',
                chainName: 'Mantle Sepolia',
                nativeCurrency: {
                  name: 'Mantle',
                  symbol: 'MNT',
                  decimals: 18
                },
                rpcUrls: ['https://rpc.sepolia.mantle.xyz'],
                blockExplorerUrls: ['https://sepolia.mantlescan.xyz']
              }],
            });
            
            // Comment out Pharos Devnet network addition
            // await window.ethereum.request({
            //   method: 'wallet_addEthereumChain',
            //   params: [{
            //     chainId: '0xc352',
            //     chainName: 'Pharos Devnet',
            //     nativeCurrency: {
            //       name: 'Pharos',
            //       symbol: 'PHR',
            //       decimals: 18
            //     },
            //     rpcUrls: ['https://devnet.dplabs-internal.com'],
            //     blockExplorerUrls: ['https://pharosscan.xyz']
            //   }],
            // });
          } catch (addError) {
            console.error('Error adding networks:', addError);
            return false;
          }
        } else {
          console.error('Error switching network:', switchError);
          return false;
        }
      }
    }
    return true;
  } catch (error) {
    console.error('Error checking network:', error);
    return false;
  }
};