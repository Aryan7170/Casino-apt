"use client";
import { useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';

/**
 * Component to handle wallet persistence across page reloads
 * This ensures wallet stays connected when navigating between pages
 */
export function WalletPersistence() {
  const { isConnected, address, isReconnecting } = useAccount();
  const reconnectionAttemptedRef = useRef(false);

  // Store connection state when wallet connects/disconnects
  useEffect(() => {
    if (isConnected && address) {
      console.log("✅ WalletPersistence: Storing connection state:", `${address.slice(0, 6)}...${address.slice(-4)}`);
      localStorage.setItem("walletConnected", "true");
      localStorage.setItem("walletAddress", address);
      sessionStorage.setItem("walletConnected", "true");
      sessionStorage.setItem("walletAddress", address);
    } else if (!isConnected && !isReconnecting) {
      console.log("❌ WalletPersistence: Clearing connection state");
      localStorage.removeItem("walletConnected");
      localStorage.removeItem("walletAddress");
      sessionStorage.removeItem("walletConnected");
      sessionStorage.removeItem("walletAddress");
    }
  }, [isConnected, address, isReconnecting]);

  // Check for stored wallet connection on mount and attempt reconnection
  useEffect(() => {
    const checkStoredConnection = async () => {
      if (typeof window === 'undefined' || reconnectionAttemptedRef.current) return;
      
      const wasConnected = localStorage.getItem("walletConnected") === "true";
      const savedAddress = localStorage.getItem("walletAddress");
      
      console.log("🔄 WalletPersistence: Checking stored connection:", {
        wasConnected,
        currentlyConnected: isConnected,
        isReconnecting,
        savedAddress: savedAddress ? `${savedAddress.slice(0, 6)}...${savedAddress.slice(-4)}` : null,
        currentAddress: address ? `${address.slice(0, 6)}...${address.slice(-4)}` : null,
      });

      // If we have a saved connection but aren't connected, try to reconnect
      if (wasConnected && savedAddress && !isConnected && !isReconnecting) {
        console.log("🔄 WalletPersistence: Attempting to restore connection...");
        reconnectionAttemptedRef.current = true;
        
        try {
          // Check if wallet is available
          if (window.ethereum) {
            // Request accounts to check if wallet is accessible
            const accounts = await window.ethereum.request({ 
              method: 'eth_accounts' 
            });
            
            if (accounts && accounts.length > 0) {
              console.log("🔄 WalletPersistence: Found accounts, waiting for auto-reconnection");
              
              // Give the wallet some time to auto-reconnect
              setTimeout(() => {
                if (!isConnected) {
                  console.log("🔄 WalletPersistence: Auto-reconnection taking longer than expected, attempting manual trigger");
                  
                  // Try to manually trigger a connection request
                  window.ethereum.request({ method: 'eth_requestAccounts' })
                    .then((accounts) => {
                      if (accounts && accounts.length > 0) {
                        console.log("✅ WalletPersistence: Manual reconnection successful");
                      }
                    })
                    .catch((error) => {
                      console.warn("❌ WalletPersistence: Manual reconnection failed:", error);
                      // Clear stored data on failure
                      localStorage.removeItem("walletConnected");
                      localStorage.removeItem("walletAddress");
                      sessionStorage.removeItem("walletConnected");
                      sessionStorage.removeItem("walletAddress");
                    });
                }
              }, 4000); // Increased timeout for manual trigger
            } else {
              console.log("🔄 WalletPersistence: No accounts found, clearing stored connection");
              localStorage.removeItem("walletConnected");
              localStorage.removeItem("walletAddress");
              sessionStorage.removeItem("walletConnected");
              sessionStorage.removeItem("walletAddress");
            }
          } else {
            console.log("🔄 WalletPersistence: No wallet provider found");
            localStorage.removeItem("walletConnected");
            localStorage.removeItem("walletAddress");
            sessionStorage.removeItem("walletConnected");
            sessionStorage.removeItem("walletAddress");
          }
        } catch (error) {
          console.warn("🔄 WalletPersistence: Error checking wallet connection:", error);
          localStorage.removeItem("walletConnected");
          localStorage.removeItem("walletAddress");
          sessionStorage.removeItem("walletConnected");
          sessionStorage.removeItem("walletAddress");
        }
      }
    };

    // Delay the check to allow providers to initialize
    const timer = setTimeout(checkStoredConnection, 1500);
    return () => clearTimeout(timer);
  }, [isConnected, address, isReconnecting]);

  // Listen for wallet events to maintain persistence
  useEffect(() => {
    if (typeof window === 'undefined' || !window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      console.log("🔄 WalletPersistence: Accounts changed:", accounts.length);
      
      if (accounts.length === 0) {
        // Wallet disconnected
        console.log("🔄 WalletPersistence: Clearing connection data due to account disconnection");
        localStorage.removeItem("walletConnected");
        localStorage.removeItem("walletAddress");
        sessionStorage.removeItem("walletConnected");
        sessionStorage.removeItem("walletAddress");
      } else if (accounts.length > 0 && accounts[0]) {
        // Account changed, update stored address
        console.log("🔄 WalletPersistence: Account changed, updating stored address");
        localStorage.setItem("walletAddress", accounts[0]);
        sessionStorage.setItem("walletAddress", accounts[0]);
      }
    };

    const handleChainChanged = (chainId) => {
      console.log("🔄 WalletPersistence: Chain changed to:", chainId);
      // Don't clear connection data on chain change, just log it
    };

    const handleConnect = (connectInfo) => {
      console.log("🔄 WalletPersistence: Wallet connected event:", connectInfo);
    };

    const handleDisconnect = (error) => {
      console.log("🔄 WalletPersistence: Wallet disconnected event:", error);
      localStorage.removeItem("walletConnected");
      localStorage.removeItem("walletAddress");
      sessionStorage.removeItem("walletConnected");
      sessionStorage.removeItem("walletAddress");
    };

    // Add event listeners
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('connect', handleConnect);
    window.ethereum.on('disconnect', handleDisconnect);

    return () => {
      // Remove event listeners
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('connect', handleConnect);
        window.ethereum.removeListener('disconnect', handleDisconnect);
      }
    };
  }, []);

  // Listen for page visibility changes (navigation detection)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const wasConnected = localStorage.getItem("walletConnected") === "true";
        const storedAddress = localStorage.getItem("walletAddress");
        
        console.log("🔍 WalletPersistence: Page became visible, checking wallet state", {
          wasConnected,
          storedAddress: storedAddress ? `${storedAddress.slice(0, 6)}...${storedAddress.slice(-4)}` : null,
          currentlyConnected: isConnected,
        });

        // If we should be connected but aren't, reset the reconnection flag
        if (wasConnected && storedAddress && !isConnected && !isReconnecting) {
          console.log("🔄 WalletPersistence: Page navigation detected, resetting reconnection flag");
          reconnectionAttemptedRef.current = false;
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isConnected, isReconnecting]);

  // Listen for storage changes (from other tabs)
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "walletConnected" && event.newValue === null) {
        console.log("🔄 WalletPersistence: Wallet disconnected in another tab");
        // The wallet disconnect will be handled by the accountsChanged event
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return null; // This component doesn't render anything
}

export default WalletPersistence;
