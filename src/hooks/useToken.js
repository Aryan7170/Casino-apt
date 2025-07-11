"use client";

import { useState, useCallback, useEffect } from 'react';
import { formatUnits, parseUnits } from 'viem';
import { useReadContract, useWriteContract, useChainId } from 'wagmi';
import { CONTRACTS, CHAIN_IDS } from '@/config/contracts';

// Standard ERC20 ABI for fallback
const STANDARD_ERC20_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "spender", "type": "address"}],
    "name": "allowance",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "spender", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "transfer",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export const useToken = (address) => {
  const [balance, setBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const chainId = useChainId();

  // Get contract configuration for current chain
  const getContractConfig = () => {
    if (chainId === CHAIN_IDS.ETHEREUM_SEPOLIA) {
      return CONTRACTS.ETHEREUM_SEPOLIA?.token;
    } else if (chainId === CHAIN_IDS.MANTLE_SEPOLIA) {
      return CONTRACTS.MANTLE_SEPOLIA?.token;
    } else if (chainId === CHAIN_IDS.PHAROS_DEVNET) {
      return CONTRACTS.PHAROS_DEVNET?.token;
    } else if (chainId === CHAIN_IDS.BINANCE_TESTNET) {
      return CONTRACTS.BINANCE_TESTNET?.token;
    }
    return null;
  };

  const contractConfig = getContractConfig();
  
  // Debug logging
  console.log('useToken hook debug:', {
    chainId,
    address,
    contractConfig: contractConfig ? {
      address: contractConfig.address,
      hasABI: !!contractConfig.abi,
      abiLength: contractConfig.abi?.length
    } : null
  });

  // Read token balance with fallback to standard ERC20 ABI
  const { data: balanceData, isError, isLoading: isBalanceLoading, error: readError } = useReadContract({
    address: contractConfig?.address,
    abi: contractConfig?.abi || STANDARD_ERC20_ABI,
    functionName: 'balanceOf',
    args: [address],
    enabled: Boolean(address && contractConfig?.address),
    watch: true,
    onSuccess: (data) => {
      console.log('Token balance fetched successfully:', {
        address: contractConfig?.address,
        userAddress: address,
        balance: data?.toString(),
        chainId
      });
    },
    onError: (error) => {
      console.error('Token balance fetch failed:', {
        address: contractConfig?.address,
        userAddress: address,
        error: error,
        chainId
      });
    }
  });

  // Get write contract function
  const { writeContractAsync } = useWriteContract();

  // Update balance when data changes
  useEffect(() => {
    console.log('Balance data changed:', {
      balanceData: balanceData?.toString(),
      isError,
      isBalanceLoading,
      formattedBalance: balanceData ? formatUnits(balanceData, 18) : '0'
    });
    
    if (balanceData) {
      const formattedBalance = formatUnits(balanceData, 18);
      console.log('Setting balance to:', formattedBalance);
      setBalance(formattedBalance);
    }
    if (isError) {
      // Print the actual error object, not just 'true'
      console.error('Balance fetch error:', readError);
      setError('Failed to load token balance');
    }
    setIsLoading(isBalanceLoading);
  }, [balanceData, isError, isBalanceLoading, readError]);

  const transfer = useCallback(async (to, amount) => {
    if (!contractConfig?.address) {
      setError('No contract configuration found for current network');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const hash = await writeContractAsync({
        address: contractConfig.address,
        abi: contractConfig.abi || STANDARD_ERC20_ABI,
        functionName: 'transfer',
        args: [to, parseUnits(amount.toString(), 18)],
      });
      
      return hash;
    } catch (err) {
      console.error('Transfer error:', err);
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [writeContractAsync, contractConfig]);

  const refresh = useCallback(async () => {
    if (!address || !contractConfig?.address) return;
    
    try {
      setIsLoading(true);
      const { data: refreshedBalance } = await useReadContract({
        address: contractConfig.address,
        abi: contractConfig.abi || STANDARD_ERC20_ABI,
        functionName: 'balanceOf',
        args: [address],
      });
      
      if (refreshedBalance) {
        setBalance(formatUnits(refreshedBalance, 18));
      }
    } catch (err) {
      console.error('Failed to refresh token balance:', err);
      setError('Failed to refresh token balance');
    } finally {
      setIsLoading(false);
    }
  }, [address, contractConfig]);

  return {
    balance,
    transfer,
    isLoading,
    error,
    refresh
  };
}; 