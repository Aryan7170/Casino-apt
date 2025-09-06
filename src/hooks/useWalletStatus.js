"use client";
import {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
} from "react";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import useWalletReconnect from "./useWalletReconnect";

// Create context to share wallet state throughout the app
const WalletStatusContext = createContext(null);

// Provider component to wrap the app with
export function WalletStatusProvider({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDev] = useState(process.env.NODE_ENV === "development");
  const [currentChain, setCurrentChain] = useState(null);
  const [hasCheckedStoredConnection, setHasCheckedStoredConnection] =
    useState(false);

  // Use wagmi hooks directly
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  
  // Use wallet reconnection hook
  const { attemptReconnection } = useWalletReconnect();

  // Check for previously stored connection on mount
  useEffect(() => {
    if (hasCheckedStoredConnection) return;

    const wasConnected = localStorage.getItem("walletConnected") === "true";
    const savedAddress = localStorage.getItem("walletAddress");

    console.log("🔗 Checking stored wallet connection:", {
      wasConnected,
      currentlyConnected: isConnected,
      savedAddress: savedAddress ? `${savedAddress.slice(0, 6)}...` : null,
      currentAddress: address ? `${address.slice(0, 6)}...` : null,
    });

    setHasCheckedStoredConnection(true);

    // If wallet was connected before but isn't now, and we're not in dev mode
    if (wasConnected && !isConnected && !isDev) {
      console.log("🔗 Attempting to restore wallet connection...");
      // Trigger automatic reconnection after a short delay
      setTimeout(() => {
        if (openConnectModal && !isConnected) {
          console.log("🔗 Auto-triggering wallet reconnection");
          // Don't actually open the modal, just trigger the connection check
          // RainbowKit should handle auto-reconnection
        }
      }, 1000);
    }
  }, [isConnected, address, hasCheckedStoredConnection, isDev, openConnectModal]);

  // Check current chain
  useEffect(() => {
    const checkChain = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          const chainId = await window.ethereum.request({
            method: "eth_chainId",
          });
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
      console.log("🔗 Development mode: Skipping real wallet connection");
      return true;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (openConnectModal) {
        console.log("🔗 Opening RainbowKit connect modal");
        openConnectModal();
        return true;
      } else {
        throw new Error("RainbowKit connect modal not available");
      }
    } catch (error) {
      console.error("🔗 Wallet connection error:", error);
      setError(error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isDev, openConnectModal]);

  // Function to disconnect wallet
  const disconnectWallet = useCallback(async () => {
    if (isDev) {
      return true;
    }

    try {
      const { disconnect } = await import("wagmi");
      if (disconnect) {
        disconnect();
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to disconnect wallet:", err);
      setError("Failed to disconnect wallet");
      return false;
    }
  }, [isDev]);

  // Reset any errors
  const resetError = useCallback(() => {
    setError(null);
  }, []);

  // Update loading state when connection state changes
  useEffect(() => {
    console.log("🔗 Wallet connection state changed:", {
      isConnected,
      address,
      currentChain,
      isDev,
    });

    setIsLoading(false);

    // Store connection state in localStorage for persistence
    if (typeof window !== "undefined") {
      if (isConnected && address) {
        localStorage.setItem("walletConnected", "true");
        localStorage.setItem("walletAddress", address);
        console.log("🔗 Wallet connection state saved to localStorage");
      } else {
        localStorage.removeItem("walletConnected");
        localStorage.removeItem("walletAddress");
        console.log("🔗 Wallet connection state cleared from localStorage");
      }
    }
  }, [isConnected, address, currentChain, isDev]);

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
    resetError,
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
    throw new Error(
      "useWalletStatus must be used within a WalletStatusProvider"
    );
  }

  return context;
}
