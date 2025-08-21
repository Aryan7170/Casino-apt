import { useState, useEffect, useCallback } from "react";
import { parseEther, formatEther } from "viem";

/**
 * Enhanced Off-Chain Casino Hook for Roulette, Mines, and Wheel
 * Provides instant gameplay with off-chain balance management
 * Integrates with existing gasless infrastructure
 */
export function useOffChainCasino(userAddress) {
  // Game state
  const [offChainBalance, setOffChainBalance] = useState(0);
  const [gameSession, setGameSession] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [gameHistory, setGameHistory] = useState([]);

  // Game server URL
  const gameServerUrl = process.env.NEXT_PUBLIC_GAME_SERVER_URL || 
    "https://casino-mjr4jx8js-aryan-duhoons-projects.vercel.app/api/game-server";

  /**
   * Initialize off-chain game session
   */
  const initializeSession = useCallback(async () => {
    if (!userAddress) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(gameServerUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "initialize",
          userAddress,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to initialize session");
      }

      setGameSession({
        userAddress,
        serverSeedHash: result.serverSeedHash,
        clientSeed: result.clientSeed,
        nonce: 0,
      });

      setOffChainBalance(result.balance || 1000); // Starting balance
      
      console.log("Off-chain session initialized:", result);
    } catch (err) {
      console.error("Failed to initialize off-chain session:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [userAddress, gameServerUrl]);

  /**
   * Play Roulette off-chain
   */
  const playRouletteOffChain = useCallback(async (bets) => {
    if (!gameSession) {
      throw new Error("No active game session");
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(gameServerUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "playRoulette",
          userAddress,
          bets,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Game failed");
      }

      // Update local state
      setOffChainBalance(result.gameResult.newBalance);
      setGameSession(prev => ({
        ...prev,
        nonce: prev.nonce + 1,
      }));

      // Add to history
      setGameHistory(prev => [result.gameResult, ...prev.slice(0, 49)]); // Keep last 50

      return result.gameResult;
    } catch (err) {
      console.error("Off-chain roulette failed:", err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [gameSession, userAddress, gameServerUrl]);

  /**
   * Play Mines off-chain
   */
  const playMinesOffChain = useCallback(async (gameData) => {
    if (!gameSession) {
      throw new Error("No active game session");
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(gameServerUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "playMines",
          userAddress,
          ...gameData,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Mines game failed");
      }

      // Update local state
      setOffChainBalance(result.gameResult.newBalance);
      setGameSession(prev => ({
        ...prev,
        nonce: prev.nonce + 1,
      }));

      // Add to history
      setGameHistory(prev => [result.gameResult, ...prev.slice(0, 49)]);

      return result.gameResult;
    } catch (err) {
      console.error("Off-chain mines failed:", err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [gameSession, userAddress, gameServerUrl]);

  /**
   * Play Wheel off-chain
   */
  const playWheelOffChain = useCallback(async (betData) => {
    if (!gameSession) {
      throw new Error("No active game session");
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(gameServerUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "playWheel",
          userAddress,
          ...betData,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Wheel game failed");
      }

      // Update local state
      setOffChainBalance(result.gameResult.newBalance);
      setGameSession(prev => ({
        ...prev,
        nonce: prev.nonce + 1,
      }));

      // Add to history
      setGameHistory(prev => [result.gameResult, ...prev.slice(0, 49)]);

      return result.gameResult;
    } catch (err) {
      console.error("Off-chain wheel failed:", err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [gameSession, userAddress, gameServerUrl]);

  /**
   * Get game history
   */
  const getGameHistory = useCallback(async () => {
    if (!userAddress) return;

    try {
      const response = await fetch(gameServerUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "getHistory",
          userAddress,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setGameHistory(result.history || []);
      }
    } catch (err) {
      console.error("Failed to get history:", err);
    }
  }, [userAddress, gameServerUrl]);

  /**
   * Deposit tokens to off-chain balance
   */
  const depositToOffChain = useCallback(async (amount) => {
    // This would typically involve:
    // 1. User approves tokens
    // 2. Contract transfers tokens to casino wallet
    // 3. Off-chain balance is increased
    
    console.log("Deposit to off-chain:", amount);
    // For now, just add to balance (implement proper deposit logic)
    setOffChainBalance(prev => prev + parseFloat(amount));
  }, []);

  /**
   * Withdraw tokens from off-chain balance
   */
  const withdrawFromOffChain = useCallback(async (amount) => {
    // This would typically involve:
    // 1. Verify off-chain balance
    // 2. Process withdrawal request
    // 3. Transfer tokens back to user
    
    console.log("Withdraw from off-chain:", amount);
    // For now, just subtract from balance (implement proper withdrawal logic)
    setOffChainBalance(prev => Math.max(0, prev - parseFloat(amount)));
  }, []);

  // Initialize session when user address changes
  useEffect(() => {
    if (userAddress) {
      initializeSession();
    }
  }, [userAddress, initializeSession]);

  // Load game history when session is initialized
  useEffect(() => {
    if (gameSession) {
      getGameHistory();
    }
  }, [gameSession, getGameHistory]);

  return {
    // Balance and session
    offChainBalance,
    gameSession,
    isLoading,
    error,
    gameHistory,

    // Game functions
    playRouletteOffChain,
    playMinesOffChain,
    playWheelOffChain,

    // Account management
    depositToOffChain,
    withdrawFromOffChain,
    initializeSession,
    getGameHistory,

    // Utilities
    isSessionActive: !!gameSession,
  };
}
