import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { minesContractAddress, minesABI, tokenContractAddress } from '@/app/game/mines/config/contractDetails';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';

// Token ABI for basic ERC20 functions
const tokenABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      }
    ],
    "name": "allowance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

export const useMines = () => {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentGame, setCurrentGame] = useState(null);
  const [gameState, setGameState] = useState({
    isActive: false,
    betAmount: 0,
    mines: 0,
    revealedCount: 0,
    minefield: [],
    revealed: [],
    multiplier: 1
  });

  const { writeContractAsync } = useWriteContract();

  // Read contract functions
  const { data: playerGame, refetch: refetchPlayerGame } = useReadContract({
    address: minesContractAddress,
    abi: minesABI,
    functionName: 'getPlayerGame',
    args: [address],
    enabled: !!address,
  });

  const { data: minBet } = useReadContract({
    address: minesContractAddress,
    abi: minesABI,
    functionName: 'minBet',
  });

  const { data: maxBet } = useReadContract({
    address: minesContractAddress,
    abi: minesABI,
    functionName: 'maxBet',
  });

  const { data: maxMines } = useReadContract({
    address: minesContractAddress,
    abi: minesABI,
    functionName: 'MAX_MINES',
  });

  const { data: gridSize } = useReadContract({
    address: minesContractAddress,
    abi: minesABI,
    functionName: 'GRID_SIZE',
  });

  // Token balance
  const { data: tokenBalance, refetch: refetchTokenBalance } = useReadContract({
    address: tokenContractAddress,
    abi: tokenABI,
    functionName: 'balanceOf',
    args: [address],
    enabled: !!address,
  });

  // Token allowance
  const { data: tokenAllowance, refetch: refetchTokenAllowance } = useReadContract({
    address: tokenContractAddress,
    abi: tokenABI,
    functionName: 'allowance',
    args: [address, minesContractAddress],
    enabled: !!address,
  });

  // Update game state when player game data changes
  useEffect(() => {
    if (playerGame) {
      const [playerAddress, betAmount, mines, minefield, revealed, revealedCount, active, finished] = playerGame;
      
      setGameState({
        isActive: active && !finished,
        betAmount: betAmount ? ethers.utils.formatEther(betAmount) : 0,
        mines: Number(mines),
        revealedCount: Number(revealedCount),
        minefield: minefield || [],
        revealed: revealed || [],
        multiplier: calculateMultiplier(Number(mines), Number(revealedCount))
      });
    } else {
      setGameState({
        isActive: false,
        betAmount: 0,
        mines: 0,
        revealedCount: 0,
        minefield: [],
        revealed: [],
        multiplier: 1
      });
    }
  }, [playerGame]);

  // Calculate multiplier based on mines and revealed count
  const calculateMultiplier = (mines, revealedCount) => {
    if (revealedCount === 0) return 1;
    
    try {
      // This is a simplified calculation - the actual contract has a more complex formula
      const safeTiles = 25 - mines;
      let multiplier = 1;
      
      for (let i = 0; i < revealedCount; i++) {
        multiplier = (multiplier * (safeTiles - i)) / (25 - i);
      }
      
      return 1 / multiplier;
    } catch (error) {
      console.error('Error calculating multiplier:', error);
      return 1;
    }
  };

  // Start a new game
  const startGame = async (mines, betAmount) => {
    if (!address) {
      setError('Please connect your wallet');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const parsedAmount = ethers.utils.parseEther(betAmount.toString());
      
      // Check if we need to approve tokens
      if (tokenAllowance < parsedAmount) {
        const approveTx = await writeContractAsync({
          address: tokenContractAddress,
          abi: tokenABI,
          functionName: 'approve',
          args: [minesContractAddress, parsedAmount],
        });
        
        await approveTx.wait();
        await refetchTokenAllowance();
      }

      // Start the game
      const tx = await writeContractAsync({
        address: minesContractAddress,
        abi: minesABI,
        functionName: 'startGame',
        args: [mines, parsedAmount],
      });

      await tx.wait();
      
      // Refresh data
      await refetchPlayerGame();
      await refetchTokenBalance();
      
      return tx;
    } catch (err) {
      console.error('Error starting game:', err);
      setError(err.message || 'Failed to start game');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Reveal a tile
  const revealTile = async (tile) => {
    if (!address || !gameState.isActive) {
      setError('No active game');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const tx = await writeContractAsync({
        address: minesContractAddress,
        abi: minesABI,
        functionName: 'revealTile',
        args: [tile],
      });

      await tx.wait();
      
      // Refresh data
      await refetchPlayerGame();
      await refetchTokenBalance();
      
      return tx;
    } catch (err) {
      console.error('Error revealing tile:', err);
      setError(err.message || 'Failed to reveal tile');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Cash out
  const cashOut = async () => {
    if (!address || !gameState.isActive) {
      setError('No active game');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const tx = await writeContractAsync({
        address: minesContractAddress,
        abi: minesABI,
        functionName: 'cashOut',
        args: [],
      });

      await tx.wait();
      
      // Refresh data
      await refetchPlayerGame();
      await refetchTokenBalance();
      
      return tx;
    } catch (err) {
      console.error('Error cashing out:', err);
      setError(err.message || 'Failed to cash out');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate payout for a given number of revealed tiles
  const calculatePayout = async (betAmount, mines, revealedCount) => {
    try {
      const parsedAmount = ethers.utils.parseEther(betAmount.toString());
      
      const payout = await writeContractAsync({
        address: minesContractAddress,
        abi: minesABI,
        functionName: 'calculatePayout',
        args: [parsedAmount, mines, revealedCount],
      });

      return ethers.utils.formatEther(payout);
    } catch (err) {
      console.error('Error calculating payout:', err);
      return '0';
    }
  };

  // Get contract balance
  const getContractBalance = async () => {
    try {
      const balance = await writeContractAsync({
        address: minesContractAddress,
        abi: minesABI,
        functionName: 'getContractBalance',
        args: [],
      });

      return ethers.utils.formatEther(balance);
    } catch (err) {
      console.error('Error getting contract balance:', err);
      return '0';
    }
  };

  return {
    // State
    isLoading,
    error,
    gameState,
    currentGame: playerGame,
    
    // Contract data
    minBet: minBet ? ethers.utils.formatEther(minBet) : '0',
    maxBet: maxBet ? ethers.utils.formatEther(maxBet) : '0',
    maxMines: Number(maxMines) || 24,
    gridSize: Number(gridSize) || 25,
    tokenBalance: tokenBalance ? ethers.utils.formatEther(tokenBalance) : '0',
    tokenAllowance: tokenAllowance ? ethers.utils.formatEther(tokenAllowance) : '0',
    
    // Functions
    startGame,
    revealTile,
    cashOut,
    calculatePayout,
    getContractBalance,
    
    // Refresh functions
    refetchPlayerGame,
    refetchTokenBalance,
    refetchTokenAllowance,
    
    // Utility functions
    calculateMultiplier
  };
}; 