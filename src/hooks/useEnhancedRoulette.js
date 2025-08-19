/**
 * Enhanced Roulette Hook with Automatic Gasless Integration
 *
 * This hook extends your existing Roulette game functionality to automatically
 * use gasless transactions when available, while maintaining full compatibility
 * with your current frontend architecture.
 */

import { useCallback, useState } from "react";
import { useGaslessTransactions } from "@/utils/gaslessService";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ethers } from "ethers";

export function useEnhancedRoulette(contractAddress, contractABI, userAddress) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get provider for gasless transactions
  const provider =
    typeof window !== "undefined" && window.ethereum
      ? new ethers.BrowserProvider(window.ethereum)
      : null;

  // Initialize gasless functionality
  const {
    executeGaslessTransaction,
    isGaslessAvailable,
    gasAllowanceRemaining,
    isWhitelisted,
  } = useGaslessTransactions(provider, userAddress);

  // Regular Wagmi write contract (fallback)
  const { writeContractAsync } = useWriteContract();

  /**
   * Place multiple bets with automatic gasless handling
   * This function will automatically use gasless transactions when available,
   * falling back to regular transactions if needed
   */
  const placeMultipleBets = useCallback(
    async (betTypes, betValues, amounts, betNumbers) => {
      setIsLoading(true);
      setError(null);

      try {
        // Try gasless transaction first (should always work with unlimited gasless)
        if (isGaslessAvailable && executeGaslessTransaction) {
          console.log("Placing bets using gasless transaction");

          const result = await executeGaslessTransaction({
            targetContract: contractAddress,
            abi: contractABI,
            functionName: "placeMultipleBets",
            args: [betTypes, betValues, amounts, betNumbers],
          });

          return {
            hash: result.hash,
            wait: result.wait,
            gasless: true,
          };
        } else {
          // Fallback to regular transaction (shouldn't happen with unlimited gasless)
          console.log("Placing bets using regular transaction");

          const hash = await writeContractAsync({
            address: contractAddress,
            abi: contractABI,
            functionName: "placeMultipleBets",
            args: [betTypes, betValues, amounts, betNumbers],
          });

          return {
            hash,
            wait: () => {
              // Return a promise that resolves with transaction receipt
              return new Promise((resolve, reject) => {
                provider.waitForTransaction(hash).then(resolve).catch(reject);
              });
            },
            gasless: false,
          };
        }
      } catch (err) {
        console.error("Error placing bets:", err);
        setError(err.message || "Failed to place bets");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [
      contractAddress,
      contractABI,
      isGaslessAvailable,
      executeGaslessTransaction,
      writeContractAsync,
      provider,
    ]
  );

  /**
   * Enhanced token approval with gasless support
   */
  const approveTokens = useCallback(
    async (tokenAddress, tokenABI, amount) => {
      setIsLoading(true);
      setError(null);

      try {
        if (isGaslessAvailable && executeGaslessTransaction) {
          console.log("Approving tokens using gasless transaction");

          const result = await executeGaslessTransaction({
            targetContract: tokenAddress,
            abi: tokenABI,
            functionName: "approve",
            args: [contractAddress, amount],
          });

          return result;
        } else {
          console.log("Approving tokens using regular transaction");

          const hash = await writeContractAsync({
            address: tokenAddress,
            abi: tokenABI,
            functionName: "approve",
            args: [contractAddress, amount],
          });

          return { hash, gasless: false };
        }
      } catch (err) {
        console.error("Error approving tokens:", err);
        setError(err.message || "Failed to approve tokens");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [
      contractAddress,
      isGaslessAvailable,
      executeGaslessTransaction,
      writeContractAsync,
    ]
  );

  return {
    // Main betting function
    placeMultipleBets,

    // Token operations
    approveTokens,

    // Status information (for UI decisions)
    isLoading,
    error,
    isGaslessAvailable,
    gasAllowanceRemaining,
    isWhitelisted,

    // Utility functions
    clearError: () => setError(null),
  };
}

/**
 * Example usage in your Roulette component:
 *
 * ```jsx
 * import { useEnhancedRoulette } from './useEnhancedRoulette';
 *
 * function RouletteGame() {
 *   const { address } = useAccount();
 *   const {
 *     placeMultipleBets,
 *     approveTokens,
 *     isLoading,
 *     error,
 *     isGaslessAvailable,
 *     gasAllowanceRemaining
 *   } = useEnhancedRoulette(ROULETTE_ADDRESS, ROULETTE_ABI, address);
 *
 *   const handlePlaceBet = async () => {
 *     try {
 *       const result = await placeMultipleBets(betTypes, betValues, amounts, betNumbers);
 *
 *       if (result.gasless) {
 *         console.log('Bet placed with gasless transaction!');
 *       }
 *
 *       const receipt = await result.wait();
 *       console.log('Transaction confirmed:', receipt.transactionHash);
 *     } catch (error) {
 *       console.error('Bet failed:', error);
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       {isGaslessAvailable && (
 *         <div className="gasless-status">
 *           ✅ Gasless transactions enabled
 *           {gasAllowanceRemaining !== 'unlimited' && (
 *             <span>Gas remaining: {gasAllowanceRemaining}</span>
 *           )}
 *         </div>
 *       )}
 *
 *       <button
 *         onClick={handlePlaceBet}
 *         disabled={isLoading}
 *       >
 *         {isLoading ? 'Processing...' : 'Place Bet'}
 *       </button>
 *
 *       {error && (
 *         <div className="error">
 *           Error: {error}
 *         </div>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */

export default useEnhancedRoulette;
