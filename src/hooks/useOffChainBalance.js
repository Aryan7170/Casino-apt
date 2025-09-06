"use client";
import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';

/**
 * Simplified off-chain balance hook that focuses on fetching balance
 * without the complex game logic
 */
import { useState, useEffect, useRef } from 'react';

/**
 * Hook to fetch off-chain balance from the game server
 * @param {string} address - The wallet address to fetch balance for
 * @returns {object} - Balance data and loading state
 */
export function useOffChainBalance(address) {
  const [balance, setBalance] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(0);
  
  const abortControllerRef = useRef(null);
  const CACHE_DURATION = 30000; // 30 seconds cache
  const SERVER_URL = 'http://localhost:3001';

  const fetchBalance = async (walletAddress, forceRefresh = false) => {
    if (!walletAddress) {
      setBalance(null);
      setError(null);
      return;
    }

    // Check cache
    const now = Date.now();
    if (!forceRefresh && lastFetchTime && (now - lastFetchTime) < CACHE_DURATION) {
      console.log('� useOffChainBalance: Using cached balance for', `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 useOffChainBalance: Fetching balance for', `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`);
      
      const response = await fetch(`${SERVER_URL}/api/balance/${walletAddress}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: abortControllerRef.current.signal,
        timeout: 10000, // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ useOffChainBalance: Balance fetched successfully', data);

      // Normalize the response to match expected format
      const normalizedBalance = {
        balance: data.balance || 0,
        totalDeposited: data.totalDeposited || 0,
        totalWagered: data.totalWagered || 0,
        totalWon: data.totalWon || 0,
        gamesPlayed: data.gamesPlayed || 0,
      };

      setBalance(normalizedBalance);
      setLastFetchTime(now);
      setError(null);

    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('� useOffChainBalance: Request aborted');
        return;
      }

      console.warn('❌ useOffChainBalance: Failed to fetch balance:', err.message);
      
      // Set error with user-friendly message
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        setError('Game server unavailable. Please try again later.');
      } else if (err.message.includes('timeout')) {
        setError('Request timeout. Please try again.');
      } else {
        setError(`Failed to fetch balance: ${err.message}`);
      }

      // Return fallback balance on error
      setBalance({
        balance: 0,
        totalDeposited: 0,
        totalWagered: 0,
        totalWon: 0,
        gamesPlayed: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to fetch balance when address changes
  useEffect(() => {
    if (address) {
      fetchBalance(address);
    } else {
      setBalance(null);
      setError(null);
      setIsLoading(false);
    }

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [address]);

  // Manual refresh function
  const refreshBalance = () => {
    if (address) {
      fetchBalance(address, true);
    }
  };

  return {
    balance,
    isLoading,
    error,
    refreshBalance,
    lastFetchTime,
  };
}

export default useOffChainBalance;
