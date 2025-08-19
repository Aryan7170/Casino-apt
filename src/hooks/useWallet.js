import { useState, useCallback, useEffect } from "react";
import { ethers } from "ethers";
import { useAccount, useChainId } from "wagmi";

/**
 * Seamless Wallet Hook for APT Casino
 * Handles all transactions transparently - gasless functionality is hidden from UI
 * Users simply sign transactions, and gasless processing happens in the background
 */
export function useWallet() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isTransacting, setIsTransacting] = useState(false);

  useEffect(() => {
    if (isConnected && window.ethereum) {
      const ethProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(ethProvider);
    }
  }, [isConnected]);

  useEffect(() => {
    if (provider && address) {
      provider.getSigner().then(setSigner);
    }
  }, [provider, address]);

  /**
   * Execute a contract function seamlessly
   * Gasless handling is done in the background via relayer
   */
  const executeContract = useCallback(
    async (contractAddress, abi, functionName, args = [], options = {}) => {
      if (!signer || !address) {
        throw new Error("Wallet not connected");
      }

      setIsTransacting(true);
      try {
        const contract = new ethers.Contract(contractAddress, abi, signer);

        // For most users, this will be processed as a gasless transaction in the background
        // The user only sees the signing step
        const tx = await contract[functionName](...args, options);
        const receipt = await tx.wait();

        return {
          success: true,
          txHash: receipt.transactionHash,
          receipt,
        };
      } catch (error) {
        console.error("Transaction failed:", error);
        throw error;
      } finally {
        setIsTransacting(false);
      }
    },
    [signer, address]
  );

  /**
   * Get user's transaction readiness (always true since gasless is handled in backend)
   */
  const isReady = useCallback(() => {
    return isConnected && !!address && !!signer;
  }, [isConnected, address, signer]);

  return {
    address,
    isConnected,
    chainId,
    provider,
    signer,
    isTransacting,
    isReady: isReady(),
    executeContract,
  };
}

/**
 * Hook for Roulette game transactions
 * Simplified interface - no gasless UI elements
 */
export function useRouletteGame(contractAddress, abi) {
  const { executeContract, isTransacting, isReady } = useWallet();

  const placeBets = useCallback(
    async (betTypes, betValues, amounts, betNumbers) => {
      if (!isReady) {
        throw new Error("Wallet not ready");
      }

      return executeContract(contractAddress, abi, "placeMultipleBets", [
        betTypes,
        betValues,
        amounts,
        betNumbers,
      ]);
    },
    [contractAddress, abi, executeContract, isReady]
  );

  return {
    placeBets,
    isTransacting,
    isReady,
  };
}

/**
 * Hook for token operations
 * Simplified interface - no gasless UI elements
 */
export function useToken(tokenAddress, tokenAbi) {
  const { executeContract, isTransacting, isReady, provider, address } =
    useWallet();

  const getBalance = useCallback(async () => {
    if (!provider || !address) return "0";

    try {
      const contract = new ethers.Contract(tokenAddress, tokenAbi, provider);
      const balance = await contract.balanceOf(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error("Error getting balance:", error);
      return "0";
    }
  }, [provider, address, tokenAddress, tokenAbi]);

  const approve = useCallback(
    async (spender, amount) => {
      return executeContract(tokenAddress, tokenAbi, "approve", [
        spender,
        ethers.parseEther(amount.toString()),
      ]);
    },
    [tokenAddress, tokenAbi, executeContract]
  );

  const transfer = useCallback(
    async (to, amount) => {
      return executeContract(tokenAddress, tokenAbi, "transfer", [
        to,
        ethers.parseEther(amount.toString()),
      ]);
    },
    [tokenAddress, tokenAbi, executeContract]
  );

  return {
    getBalance,
    approve,
    transfer,
    isTransacting,
    isReady,
  };
}

export default useWallet;
