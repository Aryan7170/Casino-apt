import { useState, useEffect } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther, formatEther } from "viem";

const GAME_SERVER_URL =
  process.env.NEXT_PUBLIC_GAME_SERVER_URL || "http://localhost:3001";
const CASINO_WALLET_ADDRESS = process.env.NEXT_PUBLIC_CASINO_WALLET_ADDRESS;

export function useOffChainCasino() {
  const { address } = useAccount();
  const [balance, setBalance] = useState(0);
  const [gameHistory, setGameHistory] = useState([]);
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const { writeContract, data: txHash } = useWriteContract();
  const { isLoading: txLoading, isSuccess: txSuccess } =
    useWaitForTransactionReceipt({
      hash: txHash,
    });

  // Fetch user balance
  const fetchBalance = async () => {
    if (!address) return;

    try {
      const response = await fetch(`${GAME_SERVER_URL}/api/balance/${address}`);
      const data = await response.json();
      if (data.success) {
        setBalance(data.balance);
      }
    } catch (error) {
      console.error("Failed to fetch balance:", error);
    }
  };

  // Fetch game history
  const fetchGameHistory = async () => {
    if (!address) return;

    try {
      const response = await fetch(
        `${GAME_SERVER_URL}/api/games/history/${address}`
      );
      const data = await response.json();
      setGameHistory(data.games || []);
    } catch (error) {
      console.error("Failed to fetch game history:", error);
    }
  };

  // Fetch withdrawal history
  const fetchWithdrawalHistory = async () => {
    if (!address) return;

    try {
      const response = await fetch(
        `${GAME_SERVER_URL}/api/withdraw/history/${address}`
      );
      const data = await response.json();
      setWithdrawalHistory(data.withdrawals || []);
    } catch (error) {
      console.error("Failed to fetch withdrawal history:", error);
    }
  };

  // Deposit funds to casino
  const deposit = async (amount) => {
    if (!address || !CASINO_WALLET_ADDRESS) return;

    setIsLoading(true);
    try {
      // Call deposit on smart contract
      await writeContract({
        address: CASINO_WALLET_ADDRESS,
        abi: [
          {
            name: "deposit",
            type: "function",
            stateMutability: "payable",
            inputs: [],
            outputs: [],
          },
        ],
        functionName: "deposit",
        value: parseEther(amount.toString()),
      });
    } catch (error) {
      console.error("Deposit failed:", error);
      setIsLoading(false);
    }
  };

  // Request withdrawal
  const requestWithdrawal = async (amount) => {
    if (!address) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${GAME_SERVER_URL}/api/withdraw/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerAddress: address,
          amount: amount,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setBalance(data.newBalance);
        await fetchWithdrawalHistory();
        return data;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Withdrawal request failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Process withdrawal on-chain
  const processWithdrawal = async (withdrawalData) => {
    if (!CASINO_WALLET_ADDRESS) return;

    setIsLoading(true);
    try {
      await writeContract({
        address: CASINO_WALLET_ADDRESS,
        abi: [
          {
            name: "processWithdrawal",
            type: "function",
            stateMutability: "nonpayable",
            inputs: [
              { name: "player", type: "address" },
              { name: "amount", type: "uint256" },
              { name: "timestamp", type: "uint256" },
              { name: "balanceProof", type: "string" },
              { name: "signature", type: "bytes" },
            ],
            outputs: [],
          },
        ],
        functionName: "processWithdrawal",
        args: [
          withdrawalData.player,
          parseEther(withdrawalData.amount.toString()),
          withdrawalData.timestamp,
          withdrawalData.offChainBalanceProof,
          withdrawalData.signature,
        ],
      });
    } catch (error) {
      console.error("Process withdrawal failed:", error);
      setIsLoading(false);
    }
  };

  // Play roulette
  const playRoulette = async (bets, clientSeed) => {
    if (!address) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${GAME_SERVER_URL}/api/games/roulette`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerAddress: address,
          bets: bets,
          clientSeed: clientSeed || Math.random().toString(36),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setBalance(data.newBalance);
        await fetchGameHistory();
        return data.gameResult;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Roulette game failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Play mines
  const playMines = async (betAmount, mineCount, clientSeed) => {
    if (!address) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${GAME_SERVER_URL}/api/game/mines`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerAddress: address,
          betAmount: betAmount,
          mineCount: mineCount,
          clientSeed: clientSeed || Math.random().toString(36),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setBalance(data.newBalance);
        return data.gameResult;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Mines game failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Cash out mines
  const cashOutMines = async (revealedTiles) => {
    if (!address) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${GAME_SERVER_URL}/api/game/mines/cashout`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            playerAddress: address,
            revealedTiles: revealedTiles,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        setBalance(data.newBalance);
        await fetchGameHistory();
        return data.result;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Mines cashout failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Play plinko
  const playPlinko = async (betAmount, risk, clientSeed) => {
    if (!address) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${GAME_SERVER_URL}/api/game/plinko`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerAddress: address,
          betAmount: betAmount,
          risk: risk,
          clientSeed: clientSeed || Math.random().toString(36),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setBalance(data.newBalance);
        await fetchGameHistory();
        return data.gameResult;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Plinko game failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Verify game result
  const verifyGame = async (
    clientSeed,
    serverSeed,
    nonce,
    gameType,
    gameParams
  ) => {
    try {
      const response = await fetch(`${GAME_SERVER_URL}/api/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientSeed,
          serverSeed,
          nonce,
          gameType,
          gameParams,
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Game verification failed:", error);
      throw error;
    }
  };

  // Effects
  useEffect(() => {
    if (address) {
      fetchBalance();
      fetchGameHistory();
      fetchWithdrawalHistory();
    }
  }, [address]);

  useEffect(() => {
    if (txSuccess) {
      // Refresh balance after successful transaction
      setTimeout(() => {
        fetchBalance();
        setIsLoading(false);
      }, 2000);
    }
  }, [txSuccess]);

  return {
    balance,
    gameHistory,
    withdrawalHistory,
    isLoading: isLoading || txLoading,
    deposit,
    requestWithdrawal,
    processWithdrawal,
    playRoulette,
    playMines,
    cashOutMines,
    playPlinko,
    verifyGame,
    refreshBalance: fetchBalance,
    refreshHistory: fetchGameHistory,
  };
}
