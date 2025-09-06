"use client";
import { useEffect, useCallback } from 'react';
import { useAccount, useReconnect } from 'wagmi';

/**
 * Hook to handle automatic wallet reconnection
 * This helps maintain wallet connection across page reloads
 */
export function useWalletReconnect() {
  const { isConnected, address } = useAccount();
  const { reconnect, connectors } = useReconnect();

  const attemptReconnection = useCallback(async () => {
    // Check if we should attempt reconnection
    const wasConnected = localStorage.getItem("walletConnected") === "true";
    const savedAddress = localStorage.getItem("walletAddress");

    console.log("🔄 Checking for wallet reconnection:", {
      wasConnected,
      currentlyConnected: isConnected,
      savedAddress: savedAddress ? `${savedAddress.slice(0, 6)}...` : null,
      currentAddress: address ? `${address.slice(0, 6)}...` : null,
    });

    // If we were connected before but aren't now, try to reconnect
    if (wasConnected && !isConnected && connectors.length > 0) {
      console.log("🔄 Attempting automatic wallet reconnection...");
      
      try {
        // Try to reconnect with the first available connector
        await reconnect({ connectors });
        console.log("🔄 Wallet reconnection attempted");
      } catch (error) {
        console.warn("🔄 Wallet reconnection failed:", error);
        // Clear stored connection if reconnection fails
        localStorage.removeItem("walletConnected");
        localStorage.removeItem("walletAddress");
      }
    }
  }, [isConnected, address, reconnect, connectors]);

  // Attempt reconnection on mount
  useEffect(() => {
    // Wait a bit for the providers to initialize
    const timer = setTimeout(() => {
      attemptReconnection();
    }, 1000);

    return () => clearTimeout(timer);
  }, [attemptReconnection]);

  // Listen for wallet events to maintain state
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleAccountsChanged = (accounts) => {
      console.log("🔄 Accounts changed:", accounts);
      if (accounts.length === 0) {
        // Wallet disconnected
        localStorage.removeItem("walletConnected");
        localStorage.removeItem("walletAddress");
      }
    };

    const handleChainChanged = (chainId) => {
      console.log("🔄 Chain changed:", chainId);
      // Chain change might temporarily disconnect the wallet
      // Give it a moment then check connection status
      setTimeout(() => {
        if (!isConnected) {
          attemptReconnection();
        }
      }, 1000);
    };

    const handleConnect = (connectInfo) => {
      console.log("🔄 Wallet connected:", connectInfo);
    };

    const handleDisconnect = (error) => {
      console.log("🔄 Wallet disconnected:", error);
      localStorage.removeItem("walletConnected");
      localStorage.removeItem("walletAddress");
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('connect', handleConnect);
      window.ethereum.on('disconnect', handleDisconnect);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('connect', handleConnect);
        window.ethereum.removeListener('disconnect', handleDisconnect);
      };
    }
  }, [isConnected, attemptReconnection]);

  return {
    attemptReconnection,
    isConnected,
    address
  };
}

export default useWalletReconnect;
