"use client";
import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';

// Create context to share wallet state throughout the app
const WalletStatusContext = createContext(null);

// Provider component to wrap the app with
export function WalletStatusProvider({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDev] = useState(process.env.NODE_ENV === 'development');
  const [currentChain, setCurrentChain] = useState(null);
  
  // Use wagmi hooks directly
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  
  // Check current chain
  useEffect(() => {
    const checkChain = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          const chainId = await window.ethereum.request({ method: "eth_chainId" });
          setCurrentChain(chainId);
        } catch (error) {
          console.error("Error checking chain:", error);
          setCurrentChain(null);
        }
      }
    };

    checkChain();

    // Listen for chain changes
    if (window.ethereum) {
      window.ethereum.on("chainChanged", checkChain);
      return () => {
        window.ethereum.removeListener("chainChanged", checkChain);
      };
    }
  }, []);
  
  // Function to connect wallet
  const connectWallet = useCallback(async () => {
    if (isDev) {
      return true;
    }
    
    try {
      if (openConnectModal) {
        openConnectModal();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to open connect modal:', err);
      setError('Failed to open wallet connection dialog');
      return false;
    }
  }, [isDev, openConnectModal]);
  
  // Function to disconnect wallet
  const disconnectWallet = useCallback(async () => {
    if (isDev) {
      return true;
    }
    
    try {
      const { disconnect } = await import('wagmi');
      if (disconnect) {
        disconnect();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to disconnect wallet:', err);
      setError('Failed to disconnect wallet');
      return false;
    }
  }, [isDev]);
  
  // Reset any errors
  const resetError = useCallback(() => {
    setError(null);
  }, []);
  
  // Update loading state when connection state changes
  useEffect(() => {
    setIsLoading(false);
  }, [isConnected]);
  
  // The value we'll provide to consumers
  const value = {
    isConnected,
    address,
    chain: currentChain,
    isLoading,
    error,
    isDev,
    connectWallet,
    disconnectWallet,
    resetError
  };
  
  return (
    <WalletStatusContext.Provider value={value}>
      {children}
    </WalletStatusContext.Provider>
  );
}

// Hook for components to consume
export default function useWalletStatus() {
  const context = useContext(WalletStatusContext);
  
  if (!context) {
    throw new Error('useWalletStatus must be used within a WalletStatusProvider');
  }
  
  return context;
} 