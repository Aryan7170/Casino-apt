import { useState, useEffect, useCallback } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";
import { parseEther, formatEther } from "viem";
import { toast } from "react-toastify";

// Off-chain game server URL
const GAME_SERVER_URL =
  process.env.NEXT_PUBLIC_GAME_SERVER_URL || "http://localhost:3001";

/**
 * Hook for off-chain casino games with on-chain settlements
 * Mimics Stake.com architecture: client seed + server seed + nonce for RNG
 */
export function useOffChainCasino(casinoWalletAddress, casinoWalletABI) {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  // Game state
  const [balance, setBalance] = useState(0);
  const [gameSession, setGameSession] = useState(null);
  const [clientSeed, setClientSeed] = useState("");
  const [serverSeedHash, setServerSeedHash] = useState("");
  const [nonce, setNonce] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lastGameResult, setLastGameResult] = useState(null);

  // Read user balance from contract
  const { data: contractBalance } = useReadContract({
    address: casinoWalletAddress,
    abi: casinoWalletABI,
    functionName: "balances",
    args: [address],
    enabled: !!address,
  });

  // Update balance when contract balance changes
  useEffect(() => {
    if (contractBalance) {
      setBalance(Number(formatEther(contractBalance)));
    }
  }, [contractBalance]);

  // Generate random client seed on component mount
  useEffect(() => {
    if (!clientSeed) {
      const randomSeed =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
      setClientSeed(randomSeed);
    }
  }, []);

  /**
   * Initialize game session with server
   */
  const initializeGame = useCallback(
    async (gameType) => {
      if (!isConnected || !address) {
        toast.error("Please connect your wallet");
        return null;
      }

      try {
        const response = await fetch(`${GAME_SERVER_URL}/api/game/init`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            playerAddress: address,
            gameType,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to initialize game");
        }

        const data = await response.json();

        setGameSession({
          sessionId: data.sessionId,
          gameType,
          serverAddress: data.serverAddress,
        });

        setServerSeedHash(data.serverSeedHash);

        return data;
      } catch (error) {
        console.error("Failed to initialize game:", error);
        toast.error("Failed to initialize game");
        return null;
      }
    },
    [isConnected, address]
  );

  /**
   * Deposit tokens to casino wallet
   */
  const deposit = useCallback(
    async (amount) => {
      if (!isConnected) {
        toast.error("Please connect your wallet");
        return;
      }

      try {
        const amountWei = parseEther(amount.toString());

        const hash = await writeContractAsync({
          address: casinoWalletAddress,
          abi: casinoWalletABI,
          functionName: "deposit",
          args: [amountWei],
        });

        toast.success("Deposit successful!");
        return hash;
      } catch (error) {
        console.error("Deposit failed:", error);
        toast.error("Deposit failed: " + (error.shortMessage || error.message));
      }
    },
    [isConnected, writeContractAsync, casinoWalletAddress, casinoWalletABI]
  );

  /**
   * Withdraw tokens from casino wallet
   */
  const withdraw = useCallback(
    async (amount) => {
      if (!isConnected) {
        toast.error("Please connect your wallet");
        return;
      }

      try {
        const amountWei = parseEther(amount.toString());

        const hash = await writeContractAsync({
          address: casinoWalletAddress,
          abi: casinoWalletABI,
          functionName: "withdraw",
          args: [amountWei],
        });

        toast.success("Withdrawal successful!");
        return hash;
      } catch (error) {
        console.error("Withdrawal failed:", error);
        toast.error(
          "Withdrawal failed: " + (error.shortMessage || error.message)
        );
      }
    },
    [isConnected, writeContractAsync, casinoWalletAddress, casinoWalletABI]
  );

  /**
   * Process game result on-chain
   */
  const processGameResult = useCallback(
    async (gameResult, signature) => {
      if (!isConnected) {
        toast.error("Please connect your wallet");
        return;
      }

      try {
        const hash = await writeContractAsync({
          address: casinoWalletAddress,
          abi: casinoWalletABI,
          functionName: "processGameResult",
          args: [gameResult, signature],
        });

        toast.success("Game result processed!");
        setNonce((prev) => prev + 1); // Increment nonce for next game
        return hash;
      } catch (error) {
        console.error("Failed to process game result:", error);
        toast.error(
          "Failed to process game result: " +
            (error.shortMessage || error.message)
        );
      }
    },
    [isConnected, writeContractAsync, casinoWalletAddress, casinoWalletABI]
  );

  /**
   * Play Roulette
   */
  const playRoulette = useCallback(
    async (bets) => {
      if (!gameSession || gameSession.gameType !== "roulette") {
        await initializeGame("roulette");
        return;
      }

      if (isPlaying) return;

      try {
        setIsPlaying(true);

        const response = await fetch(`${GAME_SERVER_URL}/api/game/roulette`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: gameSession.sessionId,
            clientSeed,
            nonce,
            bets,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to play roulette");
        }

        const data = await response.json();

        // Process result on-chain
        await processGameResult(data.contractResult, data.signature);

        setLastGameResult({
          gameType: "roulette",
          result: data.gameResult,
          serverSeed: data.serverSeed,
          clientSeed,
          nonce,
        });

        return data;
      } catch (error) {
        console.error("Roulette game failed:", error);
        toast.error("Roulette game failed");
      } finally {
        setIsPlaying(false);
      }
    },
    [gameSession, clientSeed, nonce, isPlaying, processGameResult]
  );

  /**
   * Start Mines Game
   */
  const startMines = useCallback(
    async (mineCount, betAmount) => {
      if (!gameSession || gameSession.gameType !== "mines") {
        await initializeGame("mines");
        return;
      }

      if (isPlaying) return;

      try {
        setIsPlaying(true);

        const response = await fetch(`${GAME_SERVER_URL}/api/game/mines`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: gameSession.sessionId,
            clientSeed,
            nonce,
            mineCount,
            betAmount,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to start mines");
        }

        const data = await response.json();

        setLastGameResult({
          gameType: "mines",
          result: data.gameResult,
          serverSeed: data.serverSeed,
          clientSeed,
          nonce,
          betAmount,
          mineCount,
        });

        return data;
      } catch (error) {
        console.error("Mines game failed:", error);
        toast.error("Mines game failed");
      } finally {
        setIsPlaying(false);
      }
    },
    [gameSession, clientSeed, nonce, isPlaying]
  );

  /**
   * Cash out Mines Game
   */
  const cashOutMines = useCallback(
    async (revealedTiles, betAmount) => {
      if (!gameSession || !lastGameResult) return;

      try {
        setIsPlaying(true);

        const response = await fetch(
          `${GAME_SERVER_URL}/api/game/mines/cashout`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId: gameSession.sessionId,
              clientSeed,
              nonce,
              revealedTiles,
              betAmount,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to cash out mines");
        }

        const data = await response.json();

        // Process result on-chain
        await processGameResult(data.contractResult, data.signature);

        setLastGameResult({
          ...lastGameResult,
          cashOut: data,
          revealedTiles,
        });

        return data;
      } catch (error) {
        console.error("Mines cashout failed:", error);
        toast.error("Mines cashout failed");
      } finally {
        setIsPlaying(false);
      }
    },
    [
      gameSession,
      lastGameResult,
      clientSeed,
      nonce,
      processGameResult,
      isPlaying,
    ]
  );

  /**
   * Play Plinko
   */
  const playPlinko = useCallback(
    async (betAmount, risk = "medium") => {
      if (!gameSession || gameSession.gameType !== "plinko") {
        await initializeGame("plinko");
        return;
      }

      if (isPlaying) return;

      try {
        setIsPlaying(true);

        const response = await fetch(`${GAME_SERVER_URL}/api/game/plinko`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: gameSession.sessionId,
            clientSeed,
            nonce,
            betAmount,
            risk,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to play plinko");
        }

        const data = await response.json();

        // Process result on-chain
        await processGameResult(data.contractResult, data.signature);

        setLastGameResult({
          gameType: "plinko",
          result: data.gameResult,
          serverSeed: data.serverSeed,
          clientSeed,
          nonce,
        });

        return data;
      } catch (error) {
        console.error("Plinko game failed:", error);
        toast.error("Plinko game failed");
      } finally {
        setIsPlaying(false);
      }
    },
    [gameSession, clientSeed, nonce, isPlaying, processGameResult]
  );

  /**
   * Verify a past game result
   */
  const verifyGame = useCallback(async (gameResult) => {
    try {
      const response = await fetch(`${GAME_SERVER_URL}/api/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientSeed: gameResult.clientSeed,
          serverSeed: gameResult.serverSeed,
          nonce: gameResult.nonce,
          gameType: gameResult.gameType,
          gameParams: gameResult.gameParams,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to verify game");
      }

      const data = await response.json();
      return data.verified;
    } catch (error) {
      console.error("Game verification failed:", error);
      return false;
    }
  }, []);

  /**
   * Change client seed (affects future games)
   */
  const changeClientSeed = useCallback((newSeed) => {
    setClientSeed(newSeed);
    toast.info("Client seed updated - will affect next games");
  }, []);

  return {
    // State
    balance,
    isConnected,
    address,
    isPlaying,
    gameSession,
    clientSeed,
    serverSeedHash,
    nonce,
    lastGameResult,

    // Actions
    initializeGame,
    deposit,
    withdraw,

    // Games
    playRoulette,
    startMines,
    cashOutMines,
    playPlinko,

    // Utilities
    verifyGame,
    changeClientSeed,
  };
}
