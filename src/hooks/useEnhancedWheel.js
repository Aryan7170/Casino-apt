import { useState, useEffect, useCallback } from "react";
import { useGaslessTransactions } from "@/utils/gaslessService";
import { ethers } from "ethers";

/**
 * Enhanced Wheel Game Hook with Automatic Gasless Transactions
 * Provides seamless gasless wheel spinning experience
 */
export const useEnhancedWheel = (contractAddress, abi, userAddress) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [gameResult, setGameResult] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);

  // Initialize gasless service
  const provider =
    typeof window !== "undefined" && window.ethereum
      ? new ethers.BrowserProvider(window.ethereum)
      : null;

  const {
    executeGaslessTransaction,
    isGaslessAvailable,
    gasAllowanceRemaining,
  } = useGaslessTransactions(provider, userAddress);

  /**
   * Place a bet on the wheel
   * Automatically uses gasless transaction if available
   */
  const placeBet = useCallback(
    async (riskLevel, segments, betAmount) => {
      if (!userAddress || !contractAddress) {
        throw new Error("Wallet not connected or contract not available");
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log("🎡 Enhanced Wheel: Placing bet", {
          riskLevel,
          segments,
          betAmount,
          gasless: isGaslessAvailable,
        });

        const result = await executeGaslessTransaction({
          targetContract: contractAddress,
          abi,
          functionName: "placeBet",
          args: [riskLevel, segments, ethers.parseEther(betAmount.toString())],
        });

        if (result.gasless) {
          console.log("✅ Wheel bet placed gaslessly!", result.hash);
        } else {
          console.log(
            "💰 Wheel bet placed with regular transaction",
            result.hash
          );
        }

        // Wait for transaction confirmation
        const receipt = await result.wait();
        console.log("📋 Wheel bet confirmed:", receipt);

        return {
          ...result,
          receipt,
          gasless: result.gasless,
          hash: result.hash,
        };
      } catch (error) {
        console.error("❌ Enhanced Wheel bet failed:", error);
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
   * Spin the wheel and place bet in one transaction
   */
  const spinWheel = useCallback(
    async (riskLevel, segments, betAmount) => {
      if (!userAddress || !contractAddress) {
        throw new Error("Wallet not connected or contract not available");
      }

      setIsLoading(true);
      setIsSpinning(true);
      setError(null);
      setGameResult(null);

      try {
        console.log("🎰 Enhanced Wheel: Spinning wheel", {
          riskLevel,
          segments,
          betAmount,
          gasless: isGaslessAvailable,
        });

        const result = await executeGaslessTransaction({
          targetContract: contractAddress,
          abi,
          functionName: "spinWheel",
          args: [riskLevel, segments, ethers.parseEther(betAmount.toString())],
        });

        console.log(
          result.gasless
            ? "✅ Wheel spun gaslessly!"
            : "💰 Wheel spun with regular transaction"
        );

        const receipt = await result.wait();

        // Extract game result from events
        const wheelResult = extractWheelResultFromReceipt(receipt);
        setGameResult(wheelResult);

        return {
          ...result,
          receipt,
          gameResult: wheelResult,
          gasless: result.gasless,
          hash: result.hash,
        };
      } catch (error) {
        console.error("❌ Enhanced Wheel spin failed:", error);
        setError(error.message);
        throw error;
      } finally {
        setIsLoading(false);
        setIsSpinning(false);
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
   * Claim winnings from a completed game
   */
  const claimWinnings = useCallback(async () => {
    if (!userAddress || !contractAddress) {
      throw new Error("Wallet not connected or contract not available");
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("💰 Enhanced Wheel: Claiming winnings", {
        gasless: isGaslessAvailable,
      });

      const result = await executeGaslessTransaction({
        targetContract: contractAddress,
        abi,
        functionName: "claimWinnings",
        args: [],
      });

      console.log(
        result.gasless
          ? "✅ Winnings claimed gaslessly!"
          : "💰 Winnings claimed with regular transaction"
      );

      const receipt = await result.wait();

      return {
        ...result,
        receipt,
        gasless: result.gasless,
        hash: result.hash,
      };
    } catch (error) {
      console.error("❌ Enhanced Wheel claim failed:", error);
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
   * Get current active bet for user
   */
  const getCurrentBet = useCallback(async () => {
    if (!userAddress || !contractAddress || !provider) return null;

    try {
      const contract = new ethers.Contract(contractAddress, abi, provider);
      const currentBet = await contract.getCurrentBet(userAddress);
      return currentBet;
    } catch (error) {
      console.error("Error fetching current bet:", error);
      return null;
    }
  }, [contractAddress, abi, userAddress, provider]);

  /**
   * Get wheel configuration (segments, multipliers)
   */
  const getWheelConfig = useCallback(
    async (riskLevel, segments) => {
      if (!contractAddress || !provider) return null;

      try {
        const contract = new ethers.Contract(contractAddress, abi, provider);
        const config = await contract.getWheelConfig(riskLevel, segments);
        return config;
      } catch (error) {
        console.error("Error fetching wheel config:", error);
        return null;
      }
    },
    [contractAddress, abi, provider]
  );

  /**
   * Extract wheel result from transaction receipt
   */
  const extractWheelResultFromReceipt = (receipt) => {
    try {
      // Look for WheelSpun or GameResult events in the receipt
      const wheelSpunEvent = receipt.logs.find((log) => {
        try {
          const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
            ["address", "uint256", "uint256", "bool", "uint256"],
            log.data
          );
          return decoded;
        } catch {
          return null;
        }
      });

      if (wheelSpunEvent) {
        return {
          player: wheelSpunEvent[0],
          position: wheelSpunEvent[1],
          winnings: wheelSpunEvent[2],
          won: wheelSpunEvent[3],
          multiplier: wheelSpunEvent[4],
        };
      }
      return null;
    } catch (error) {
      console.error("Error extracting wheel result:", error);
      return null;
    }
  };

  /**
   * Calculate potential winnings for a bet
   */
  const calculatePotentialWinnings = useCallback(
    (riskLevel, segments, betAmount) => {
      // Wheel multiplier logic based on risk and segments
      const multipliers = {
        0: {
          // Low risk
          10: [1.2, 1.2, 1.2, 1.2, 1.2, 1.2, 1.2, 1.2, 0, 3.0],
          20: [
            1.1, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1,
            1.1, 1.1, 1.1, 0, 0, 0, 6.0,
          ],
          30: Array(27).fill(1.05).concat([0, 0, 9.0]),
        },
        1: {
          // Medium risk
          10: [1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 0, 0, 5.0],
          20: Array(15).fill(1.3).concat([0, 0, 0, 0, 10.0]),
          30: Array(22).fill(1.15).concat([0, 0, 0, 0, 0, 0, 0, 15.0]),
        },
        2: {
          // High risk
          10: [2.0, 2.0, 2.0, 2.0, 2.0, 0, 0, 0, 0, 10.0],
          20: Array(10).fill(1.8).concat(Array(9).fill(0), [20.0]),
          30: Array(15).fill(1.5).concat(Array(14).fill(0), [30.0]),
        },
      };

      const segmentMultipliers = multipliers[riskLevel]?.[segments] || [];
      const maxMultiplier = Math.max(...segmentMultipliers);

      return {
        maxWin: betAmount * maxMultiplier,
        minWin: 0,
        averageMultiplier:
          segmentMultipliers.reduce((a, b) => a + b, 0) /
          segmentMultipliers.length,
      };
    },
    []
  );

  return {
    // Game functions
    placeBet,
    spinWheel,
    claimWinnings,
    getCurrentBet,
    getWheelConfig,
    calculatePotentialWinnings,

    // State
    gameResult,
    isLoading,
    isSpinning,
    error,

    // Gasless info
    isGaslessAvailable,
    gasAllowanceRemaining,

    // Utility
    clearError: () => setError(null),
    clearResult: () => setGameResult(null),
  };
};
