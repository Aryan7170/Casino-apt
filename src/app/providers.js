"use client";

import * as React from 'react';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, http, createConfig } from 'wagmi';
import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { WalletStatusProvider } from '@/hooks/useWalletStatus';
import { NotificationProvider } from '@/components/NotificationSystem';
import { ThemeProvider } from 'next-themes';

// Development mode flag - set to false to enable real wallet connections
const isDevelopmentMode = false;

// Define Mantle Sepolia chain
const mantleSepolia = {
  id: 5003,
  name: "Mantle Sepolia",
  network: "mantle-sepolia",
  nativeCurrency: {
    decimals: 18,
    name: "Mantle",
    symbol: "MNT",
  },
  rpcUrls: {
    default: { http: ["https://rpc.sepolia.mantle.xyz"] },
    public: { http: ["https://rpc.sepolia.mantle.xyz"] },
  },
  blockExplorers: {
    default: { name: "Mantle Sepolia Explorer", url: "https://sepolia.mantlescan.xyz" },
  },
  testnet: true,
};

// Define Pharos Devnet chain
const pharosDevnet = {
  id: 50002,
  name: "Pharos Devnet",
  network: "pharos-devnet",
  nativeCurrency: {
    decimals: 18,
    name: "Pharos",
    symbol: "PHR",
  },
  rpcUrls: {
    default: { http: ["https://devnet.dplabs-internal.com"] },
    public: { http: ["https://devnet.dplabs-internal.com"] },
  },
  blockExplorers: {
    default: { name: "Pharos Explorer", url: "https://pharosscan.xyz" },
  },
  testnet: true,
};

// Define Binance Smart Chain Testnet
const binanceTestnet = {
  id: 97,
  name: "Binance Smart Chain Testnet",
  network: "bsc-testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Binance Coin",
    symbol: "BNB",
  },
  rpcUrls: {
    default: { http: ["https://data-seed-prebsc-1-s1.binance.org:8545"] },
    public: { http: ["https://data-seed-prebsc-1-s1.binance.org:8545"] },
  },
  blockExplorers: {
    default: { name: "BscScan Testnet", url: "https://testnet.bscscan.com" },
  },
  testnet: true,
};

// Define Ethereum Sepolia chain
const ethereumSepolia = {
  id: 11155111,
  name: "Ethereum Sepolia",
  network: "ethereum-sepolia",
  nativeCurrency: {
    decimals: 18,
    name: "Ethereum",
    symbol: "ETH",
  },
  rpcUrls: {
    default: { http: ["https://sepolia.infura.io/v3/56e934eec4ad458ea26313f91e15cec3"] },
    public: { http: ["https://sepolia.infura.io/v3/56e934eec4ad458ea26313f91e15cec3"] },
  },
  blockExplorers: {
    default: { name: "Etherscan Sepolia", url: "https://sepolia.etherscan.io" },
  },
  testnet: true,
};

// Hardcoded project ID as a fallback
const fallbackProjectId = "64df6621925fa7d0680ba510ac3788df";
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || fallbackProjectId;

// Create wagmi config
export const config = getDefaultConfig({
  appName: 'APT Casino',
  projectId: projectId,
  chains: [mantleSepolia, pharosDevnet, binanceTestnet, ethereumSepolia], // Add Ethereum Sepolia here
  transports: {
    [mantleSepolia.id]: http(mantleSepolia.rpcUrls.default.http[0]),
    [pharosDevnet.id]: http(pharosDevnet.rpcUrls.default.http[0]),
    [binanceTestnet.id]: http(binanceTestnet.rpcUrls.default.http[0]), // Add Binance Testnet transport
    [ethereumSepolia.id]: http(ethereumSepolia.rpcUrls.default.http[0]), // Add Ethereum Sepolia transport
  },
});

// Create React Query client
const queryClient = new QueryClient();

export default function Providers({ children }) {
  const [mounted, setMounted] = React.useState(false);
  const [showDevWarning, setShowDevWarning] = React.useState(isDevelopmentMode);
  const [connectionError, setConnectionError] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    
    // Check for previously dismissed warning
    if (isDevelopmentMode && localStorage.getItem('dev-warning-dismissed') === 'true') {
      setShowDevWarning(false);
    }
    
    // Reset connection error when component mounts
    setConnectionError(false);
    
    // Setup global error handler for wallet connections
    const handleConnectionError = (error) => {
      console.warn("Wallet connection issue detected:", error);
      setConnectionError(true);
    };
    
    // Global error handler for uncaught errors and promise rejections
    const handleGlobalError = (event) => {
      const errorMsg = event.reason?.message || event.message || '';
      
      if (errorMsg.includes('wallet') || 
          errorMsg.includes('provider') ||
          errorMsg.includes('chain') ||
          errorMsg.includes('connection')) {
            
        handleConnectionError(event.reason || event);
        
        // Prevent the error from bubbling up
        if (event.preventDefault) {
          event.preventDefault();
        }
        if (event.stopPropagation) {
          event.stopPropagation();
        }
        
        return true;
      }
      
      return false;
    };

    // Add wallet connection event listeners
    const handleWalletConnect = () => {
      console.log('Wallet connected');
      setConnectionError(false);
    };

    const handleWalletDisconnect = () => {
      console.log('Wallet disconnected');
      setConnectionError(true);
    };

    const handleChainChange = (chainId) => {
      console.log('Chain changed:', chainId);
      // Check if the new chain is supported
      const supportedChainIds = [mantleSepolia.id, pharosDevnet.id, binanceTestnet.id, ethereumSepolia.id];
      if (!supportedChainIds.includes(Number(chainId))) {
        setConnectionError(true);
      } else {
        setConnectionError(false);
      }
    };
    
    window.addEventListener('unhandledrejection', handleGlobalError);
    window.addEventListener('error', handleGlobalError);

    if (window.ethereum) {
      window.ethereum.on('connect', handleWalletConnect);
      window.ethereum.on('disconnect', handleWalletDisconnect);
      window.ethereum.on('chainChanged', handleChainChange);
    }
    
    return () => {
      window.removeEventListener('unhandledrejection', handleGlobalError);
      window.removeEventListener('error', handleGlobalError);
      
      if (window.ethereum) {
        window.ethereum.removeListener('connect', handleWalletConnect);
        window.ethereum.removeListener('disconnect', handleWalletDisconnect);
        window.ethereum.removeListener('chainChanged', handleChainChange);
      }
    };
  }, []);

  // Show warning if no project ID
  if (!projectId && !isDevelopmentMode) {
    console.error("No WalletConnect project ID found. Using fallback ID.");
  }

  // Return early if not mounted to avoid hydration issues
  if (!mounted) return null;

  // Normal production mode with wallet providers and our custom provider
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <NotificationProvider>
            <WalletStatusProvider>
              <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
                {children}
              </ThemeProvider>
            </WalletStatusProvider>
          </NotificationProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}