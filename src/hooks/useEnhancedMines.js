import { useState, useEffect, useCallback, useMemo } from "react";
import { useGaslessTransactions } from "@/utils/gaslessService";
import { ethers } from "ethers";

/**
 * Enhanced Mines Game Hook with Automatic Gasless Transactions
 * Provides seamless gasless mining game experience
 */
export const useEnhancedMines = (contractAddress, abi, userAddress) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [gameState, setGameState] = useState(null);

  // Memoize provider to prevent recreation on every render
  const provider = useMemo(() => {
    return typeof window !== "undefined" && window.ethereum
      ? new ethers.BrowserProvider(window.ethereum)
      : null;
  }, []);

  const {
    executeGaslessTransaction,
    isGaslessAvailable,
    gasAllowanceRemaining,
  } = useGaslessTransactions(provider, userAddress);

  /**
   * Place a bet in the mines game
   * Automatically uses gasless transaction if available
   */
  const placeBet = useCallback(
    async (mineCount, betAmount) => {
      if (!userAddress || !contractAddress) {
        throw new Error("Wallet not connected or contract not available");
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log("Enhanced Mines: Placing bet", {
          mineCount,
          betAmount,
          gasless: isGaslessAvailable,
        });

        const result = await executeGaslessTransaction({
          targetContract: contractAddress,
          abi,
          functionName: "placeBet",
          args: [mineCount, ethers.parseEther(betAmount.toString())],
        });

        if (result.gasless) {
          console.log(" Mines bet placed gaslessly!", result.hash);
        } else {
          console.log(
            " Mines bet placed with regular transaction",
            result.hash
          );
        }

        // Wait for transaction confirmation
        const receipt = await result.wait();
        console.log(" Mines bet confirmed:", receipt);

        return {
          ...result,
          receipt,
          gasless: result.gasless,
          hash: result.hash,
        };
      } catch (error) {
        console.error(" Enhanced Mines bet failed:", error);
        setError(error.message);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [
      contractAddress,
      abi,
      userAddress,
      executeGaslessTransaction,
      isGaslessAvailable,
    ]
  );

  /**
   * Reveal a tile in the mines game
   */
  const revealTile = useCallback(
    async (tileIndex) => {
      if (!userAddress || !contractAddress) {
        throw new Error("Wallet not connected or contract not available");
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log(" Enhanced Mines: Revealing tile", {
          tileIndex,
          gasless: isGaslessAvailable,
        });

        const result = await executeGaslessTransaction({
          targetContract: contractAddress,
          abi,
          functionName: "revealTile",
          args: [tileIndex],
        });

        console.log(
          result.gasless
            ? " Tile revealed gaslessly!"
            : " Tile revealed with regular transaction"
        );

        const receipt = await result.wait();

        return {
          ...result,
          receipt,
          gasless: result.gasless,
          hash: result.hash,
        };
      } catch (error) {
        console.error(" Enhanced Mines tile reveal failed:", error);
        setError(error.message);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [
      contractAddress,
      abi,
      userAddress,
      executeGaslessTransaction,
      isGaslessAvailable,
    ]
  );

  /**
   * Cash out from the current mines game
   */
  const cashOut = useCallback(async () => {
    if (!userAddress || !contractAddress) {
      throw new Error("Wallet not connected or contract not available");
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("💰 Enhanced Mines: Cashing out", {
        gasless: isGaslessAvailable,
      });

      const result = await executeGaslessTransaction({
        targetContract: contractAddress,
        abi,
        functionName: "cashOut",
        args: [],
      });

      console.log(
        result.gasless
          ? "Cashed out gaslessly!"
          : " Cashed out with regular transaction"
      );

      const receipt = await result.wait();

      return {
        ...result,
        receipt,
        gasless: result.gasless,
        hash: result.hash,
      };
    } catch (error) {
      console.error(" Enhanced Mines cash out failed:", error);
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [
    contractAddress,
    abi,
    userAddress,
    executeGaslessTransaction,
    isGaslessAvailable,
  ]);

  /**
   * Start a new mines game
   */
  const startNewGame = useCallback(
    async (mineCount, betAmount) => {
      if (!userAddress || !contractAddress) {
        throw new Error("Wallet not connected or contract not available");
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log(" Enhanced Mines: Starting new game", {
          mineCount,
          betAmount,
          gasless: isGaslessAvailable,
        });

        const result = await executeGaslessTransaction({
          targetContract: contractAddress,
          abi,
          functionName: "startGame",
          args: [mineCount, ethers.parseEther(betAmount.toString())],
        });

        console.log(
          result.gasless
            ? "New game started gaslessly!"
            : " New game started with regular transaction"
        );

        const receipt = await result.wait();

        return {
          ...result,
          receipt,
          gasless: result.gasless,
          hash: result.hash,
        };
      } catch (error) {
        console.error(" Enhanced Mines new game failed:", error);
        setError(error.message);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [
      contractAddress,
      abi,
      userAddress,
      executeGaslessTransaction,
      isGaslessAvailable,
    ]
  );

  /**
   * Get current game state
   */
  const getCurrentGame = useCallback(async () => {
    if (!userAddress || !contractAddress || !provider) return null;

    try {
      const contract = new ethers.Contract(contractAddress, abi, provider);
      const gameState = await contract.getCurrentGame(userAddress);
      setGameState(gameState);
      return gameState;
    } catch (error) {
      console.error("Error fetching current game:", error);
      return null;
    }
  }, [contractAddress, userAddress, provider]);

  // Auto-fetch game state when user address changes
  useEffect(() => {
    if (userAddress && contractAddress && provider) {
      getCurrentGame();
    }
  }, [userAddress, contractAddress, provider, getCurrentGame]);

  return {
    // Game functions
    placeBet,
    revealTile,
    cashOut,
    startNewGame,
    getCurrentGame,

    // State
    gameState,
    isLoading,
    error,

    // Gasless info
    isGaslessAvailable,
    gasAllowanceRemaining,

    // Utility
    clearError: () => setError(null),
  };
};
