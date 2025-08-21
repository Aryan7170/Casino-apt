import { useState, useEffect, useCallback } from "react";
import { parseEther, formatEther } from "viem";

/**
 * Enhanced Off-Chain Casino Hook for Roulette, Mines, and Wheel
 * Provides instant gameplay with off-chain balance management
 * Integrates with existing gasless infrastructure
 */
export function useOffChainCasino(userAddress = null) {
  // Game state
  const [offChainBalance, setOffChainBalance] = useState(0);
  const [gameSession, setGameSession] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [gameHistory, setGameHistory] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [initAttempted, setInitAttempted] = useState(false); // Track if initialization was attempted

  console.log('🎯 Hook state:', { gameSession: !!gameSession, isLoading, error, offChainBalance, initAttempted });

  // Game server URL - make it reactive to ensure proper dependency tracking
  const gameServerUrl = process.env.NEXT_PUBLIC_GAME_SERVER_URL || 
    "https://casino-mjr4jx8js-aryan-duhoons-projects.vercel.app/api/game-server";

  /**
   * Initialize off-chain game session
   */
  const initializeSession = useCallback(async (retryCount = 0) => {
    console.log(`🎲 Starting session initialization (attempt ${retryCount + 1})...`);
    setIsLoading(true);
    setError(null);

    try {
      // For off-chain games, use provided address or create anonymous session
      const sessionAddress = userAddress || `anonymous_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log("🎯 Game server URL:", gameServerUrl);
      console.log("👤 Session address:", sessionAddress);
      
      const response = await fetch(gameServerUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "initialize",
          userAddress: sessionAddress,
        }),
      });

      console.log("📡 Response status:", response.status);
      const result = await response.json();
      console.log("📥 Response data:", result);

      if (!response.ok) {
        throw new Error(result.error || "Failed to initialize session");
      }

      setGameSession({
        userAddress: sessionAddress,
        serverSeedHash: result.serverSeedHash,
        clientSeed: result.clientSeed,
        nonce: 0,
      });

      setOffChainBalance(result.balance || 1000); // Starting balance
      
      console.log("✅ Off-chain session initialized successfully:", result);
    } catch (err) {
      console.error(`❌ Failed to initialize off-chain session (attempt ${retryCount + 1}):`, err);
      
      // Retry up to 3 times with exponential backoff
      if (retryCount < 2) {
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        console.log(`🔄 Retrying in ${delay}ms...`);
        setTimeout(() => {
          initializeSession(retryCount + 1);
        }, delay);
        return;
      }
      
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []); // Remove gameServerUrl dependency since it's static

  /**
   * Play Roulette off-chain
   */
  const playRouletteOffChain = useCallback(async (bets) => {
    if (!gameSession) {
      throw new Error("No active game session");
    }

    setIsLoading(true);
    setIsPlaying(true);
    setError(null);

    try {
      const response = await fetch(gameServerUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "playRoulette",
          userAddress: gameSession.userAddress,
          bets,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Game failed");
      }

      // Update local state
      setOffChainBalance(result.gameResult.newBalance);
      setLastResult(result.gameResult);
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
      setIsPlaying(false);
    }
  }, [gameSession, gameServerUrl]);

  /**
   * Play Mines off-chain
   */
  const playMinesOffChain = useCallback(async (gameData) => {
    if (!gameSession) {
      throw new Error("No active game session");
    }

    setIsLoading(true);
    setIsPlaying(true);
    setError(null);

    try {
      const response = await fetch(gameServerUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "playMines",
          userAddress: gameSession.userAddress,
          ...gameData,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Mines game failed");
      }

      // Update local state
      setOffChainBalance(result.gameResult.newBalance);
      setLastResult(result.gameResult);
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
      setIsPlaying(false);
    }
  }, [gameSession, gameServerUrl]);

  /**
   * Play Wheel off-chain
   */
  const playWheelOffChain = useCallback(async (betData) => {
    if (!gameSession) {
      throw new Error("No active game session");
    }

    setIsLoading(true);
    setIsPlaying(true);
    setError(null);

    try {
      const response = await fetch(gameServerUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "playWheel",
          userAddress: gameSession.userAddress,
          ...betData,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Wheel game failed");
      }

      // Update local state
      setOffChainBalance(result.gameResult.newBalance);
      setLastResult(result.gameResult);
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
      setIsPlaying(false);
    }
  }, [gameSession, gameServerUrl]);

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
          userAddress: gameSession?.userAddress || userAddress,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setGameHistory(result.history || []);
      }
    } catch (err) {
      console.error("Failed to get history:", err);
    }
  }, [gameSession, gameServerUrl]);

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

  // Initialize session automatically when hook loads
  useEffect(() => {
    const autoInit = async () => {
      console.log('🎮 Auto-init effect triggered:', { 
        gameSession: !!gameSession, 
        isLoading, 
        error, 
        initAttempted 
      });
      
      if (!gameSession && !isLoading && !error && !initAttempted) {
        console.log('🚀 Auto-initializing off-chain session...');
        setInitAttempted(true);
        try {
          await initializeSession();
          console.log('✅ Auto-initialization completed successfully');
        } catch (error) {
          console.error('❌ Auto-initialization failed:', error);
        }
      } else {
        console.log('🚫 Skipping auto-init:', {
          hasSession: !!gameSession,
          isLoading,
          hasError: !!error,
          alreadyAttempted: initAttempted
        });
      }
    };
    
    // Only run auto-init once when the hook mounts
    autoInit();
  }, []); // Empty dependency array to run only once

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
    isPlaying,
    lastResult,

    // Game functions
    playRouletteOffChain,
    playMinesOffChain,
    playWheelOffChain,

    // Account management
    depositToOffChain,
    withdrawFromOffChain,
    initializeSession,
    getGameHistory,
    setError, // Export setError for manual error clearing

    // Utilities
    isSessionActive: !!gameSession,
  };
}

// Export both function names for compatibility
export const useOffChainCasinoGames = useOffChainCasino;
export default useOffChainCasino;
