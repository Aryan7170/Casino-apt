"use client";
import React, { useState, useEffect } from 'react';
import GradientBorderButton from './GradientBorderButton';
import GradientBgButton from './GradientBgButton';
import { useNotification } from './NotificationSystem';

const BorrowCard = ({ asset }) => {
  const [borrowAmount, setBorrowAmount] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [nativeBalance, setNativeBalance] = useState({ symbol: '', formatted: '0' });
  const [userBorrows, setUserBorrows] = useState({});
  const [userDeposits, setUserDeposits] = useState({});
  const [isPending, setIsPending] = useState(false);
  const [currentAPY, setCurrentAPY] = useState(asset.defaultAPY || 7.5);
  const isDev = process.env.NODE_ENV === 'development';
  const notification = useNotification();
  
  useEffect(() => {
    setIsClient(true);
    
    // In development mode, create mock data
    if (isDev) {
      setIsConnected(false);
      setNativeBalance({
        symbol: asset.symbol,
        formatted: (Math.random() * 5 + 0.5).toFixed(4)
      });
      
      // Create mock borrow data if appropriate
      const shouldHaveBorrow = Math.random() > 0.5;
      if (shouldHaveBorrow) {
        setUserBorrows({
          [asset.symbol]: {
            amount: (Math.random() * 1 + 0.1).toFixed(4),
            interest: (Math.random() * 5 + 5).toFixed(2)
          }
        });
      }
      
      // Create mock deposit data
      setUserDeposits({
        [asset.symbol]: {
          amount: (Math.random() * 10 + 1).toFixed(4),
          value: (Math.random() * 1000 + 100).toFixed(2)
        }
      });
      
      // Set random APY
      setCurrentAPY((Math.random() * 5 + 5).toFixed(2));
      
      // Set up dev wallet toggle event listener
      const handleDevWalletToggle = () => {
        setIsConnected(prev => !prev);
      };
      
      window.addEventListener('dev-wallet-toggle', handleDevWalletToggle);
      return () => {
        window.removeEventListener('dev-wallet-toggle', handleDevWalletToggle);
      };
    }
    
    // In production, try to load wallet data
    const loadWalletData = async () => {
      try {
        // For production, we'll use a more conservative approach
        // Check if wallet connection exists via window.ethereum
        if (typeof window !== 'undefined' && window.ethereum) {
          try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            setIsConnected(accounts && accounts.length > 0);
          } catch (err) {
            console.warn("Failed to check wallet connection:", err);
            setIsConnected(false);
          }
        }
        
        // Set some default/fallback values for production
        setNativeBalance({
          symbol: asset.symbol,
          formatted: '0'
        });
        
        // Set default APY
        setCurrentAPY(asset.defaultAPY || 7.5);
        
        console.log("Wallet data loaded successfully");
      } catch (err) {
        console.warn("Failed to load wallet data:", err);
        // Don't show error notification in production as this is expected behavior
        // when hooks are not available
      }
    };
    
    loadWalletData();
  }, [asset.symbol, asset.defaultAPY, isDev, notification]);
  
  // Get any existing borrow for this asset
  const existingBorrow = userBorrows[asset.symbol];
  
  // Calculate max borrowable amount based on collateral
  const maxBorrowable = calculateMaxBorrowable();
  
  function calculateMaxBorrowable() {
    if (isDev) {
      return asset.symbol === 'APTC' 
        ? 0.5123 
        : Math.random() * 2 + 0.05;
    }
    
    // Calculate based on deposits with an LTV ratio
    const userDeposit = userDeposits[asset.symbol];
    if (!userDeposit) return 0.01;
    
    // Example: 75% LTV ratio
    return parseFloat(userDeposit.amount) * 0.75;
  }
  
  const handleConnectWallet = async () => {
    if (isDev) {
      // In development mode, just simulate connection
      setIsConnected(true);
      return;
    }
    
    try {
      // In production, try to connect via MetaMask directly
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
          });
          if (accounts && accounts.length > 0) {
            setIsConnected(true);
            notification.success("Wallet connected successfully");
          }
        } catch (err) {
          console.warn("Failed to connect wallet:", err);
          notification.error("Failed to connect wallet");
        }
      } else {
        notification.error("No wallet detected. Please install MetaMask.");
      }
    } catch (err) {
      console.warn("Failed to open connect modal:", err);
      notification.error("Unable to connect wallet");
    }
  };
  
  const handleBorrow = async () => {
    if (!isConnected) {
      handleConnectWallet();
      return;
    }
    
    if (!borrowAmount || parseFloat(borrowAmount) <= 0) {
      notification.warning('Please enter a valid amount');
      return;
    }
    
    if (parseFloat(borrowAmount) > maxBorrowable) {
      notification.warning(`You can only borrow up to ${maxBorrowable.toFixed(6)} ${asset.symbol}`);
      return;
    }
    
    try {
      setIsPending(true);
      
      // In development mode, simulate borrowing
      if (isDev) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Fake delay
        
        // Update the mock borrow
        setUserBorrows(prev => ({
          ...prev,
          [asset.symbol]: {
            amount: parseFloat(borrowAmount),
            interest: currentAPY
          }
        }));
        
        notification.success(`Successfully borrowed ${borrowAmount} ${asset.symbol}`);
        setBorrowAmount('');
      } else {
        // In production, show a message that this feature is not yet implemented
        notification.info("Borrowing functionality is coming soon!");
        setBorrowAmount('');
      }
    } finally {
      setIsPending(false);
    }
  };
  
  const handleRepay = async () => {
    if (!isConnected) {
      handleConnectWallet();
      return;
    }
    
    if (!existingBorrow) {
      notification.warning('You have no debt to repay');
      return;
    }
    
    try {
      setIsPending(true);
      
      // In development mode, simulate repaying
      if (isDev) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Fake delay
        
        // Clear the mock borrow
        setUserBorrows(prev => {
          const newBorrows = {...prev};
          delete newBorrows[asset.symbol];
          return newBorrows;
        });
        
        notification.success(`Successfully repaid ${existingBorrow.amount} ${asset.symbol}`);
      } else {
        // In production, show a message that this feature is not yet implemented
        notification.info("Repayment functionality is coming soon!");
      }
    } finally {
      setIsPending(false);
    }
  };
  
  const handleMaxClick = () => {
    setBorrowAmount(maxBorrowable.toFixed(6));
  };
  
  if (!isClient) {
    return (
      <div className="bg-gradient-to-r p-[1px] from-red-magic to-blue-magic rounded-xl">
        <div className="bg-[#1A0015] rounded-xl p-6 h-full">
          <div className="animate-pulse">
            <div className="h-6 w-32 bg-white/10 rounded mb-6"></div>
            <div className="h-10 w-full bg-white/10 rounded mb-6"></div>
            <div className="h-20 w-full bg-white/10 rounded mb-6"></div>
            <div className="flex justify-end">
              <div className="h-10 w-24 bg-white/10 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gradient-to-r p-[1px] from-red-magic to-blue-magic rounded-xl">
      <div className="bg-[#1A0015] rounded-xl p-6 h-full">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <div 
              className="mr-2 w-6 h-6 rounded-full flex items-center justify-center text-white"
              style={{ backgroundColor: asset.iconColor }}
            >
              <span className="text-xs font-bold">{asset.symbol.charAt(0)}</span>
            </div>
            <h3 className="text-lg font-medium">{asset.name}</h3>
          </div>
          
          {isDev && (
            <span className="text-xs text-yellow-400 bg-yellow-900/30 px-2 py-1 rounded">
              Dev Mode
            </span>
          )}
        </div>
        
        <div className="mb-6">
          <p className="text-sm text-white/70 mb-1">Current Balance</p>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold">
              {isConnected 
                ? asset.symbol === nativeBalance?.symbol
                  ? nativeBalance?.formatted || '0'
                  : '0'
                : '0'
              }
            </span>
            <span className="ml-2 text-sm text-white/50">{asset.symbol}</span>
          </div>
        </div>
        
        {/* Borrowed amount (if any) */}
        {existingBorrow && (
          <div className="mb-6 p-3 bg-[#250020] rounded-lg">
            <p className="text-sm text-white/70 mb-1">Borrowed Amount</p>
            <div className="flex items-baseline">
              <span className="text-xl font-medium">{existingBorrow.amount}</span>
              <span className="ml-2 text-xs text-white/50">{asset.symbol}</span>
            </div>
            <p className="text-xs text-red-400 mt-1">
              Interest: {(parseFloat(existingBorrow.interest || currentAPY)).toFixed(2)}% APR
            </p>
          </div>
        )}
        
        <div className="mb-6">
          <label className="block text-sm text-white/70 mb-2">Amount to Borrow</label>
          <div className="p-[1px] rounded-md bg-gradient-to-r from-red-magic to-blue-magic">
            <div className="flex bg-[#250020] rounded-md overflow-hidden">
              <input
                type="text"
                placeholder="0.00"
                value={borrowAmount}
                onChange={(e) => setBorrowAmount(e.target.value)}
                className="bg-transparent flex-1 p-3 focus:outline-none text-white"
                disabled={!isConnected || isPending}
              />
              <button 
                className="bg-[#1A0015] px-4 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleMaxClick}
                disabled={!isConnected || isPending || maxBorrowable <= 0}
              >
                MAX
              </button>
            </div>
          </div>
          <div className="flex justify-between mt-2">
            <p className="text-xs text-white/50">
              Max borrowable: {maxBorrowable.toFixed(6)}
            </p>
            <p className="text-xs text-white/50">
              Current APR: {parseFloat(currentAPY).toFixed(2)}%
            </p>
          </div>
          
          {!isConnected && !isDev && (
            <p className="text-xs text-white/70 mt-2">
              Connect your wallet to borrow {asset.symbol}
            </p>
          )}
          {isDev && (
            <p className="text-xs text-yellow-400/70 mt-2">
              Dev Mode: Simulated borrowing available
            </p>
          )}
        </div>
        
        <div className="flex gap-3 justify-end mt-6">
          <GradientBorderButton 
            onClick={handleRepay}
            disabled={!isConnected || !existingBorrow || isPending}
          >
            {isPending && existingBorrow ? (
              <span className="flex items-center">
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></span>
                Processing...
              </span>
            ) : (
              'Repay'
            )}
          </GradientBorderButton>
          {isConnected ? (
            <GradientBgButton 
              onClick={handleBorrow}
              disabled={!borrowAmount || parseFloat(borrowAmount) <= 0 || isPending}
            >
              {isPending && !existingBorrow ? (
                <span className="flex items-center">
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></span>
                  Processing...
                </span>
              ) : (
                'Borrow'
              )}
            </GradientBgButton>
          ) : (
            <GradientBgButton onClick={handleConnectWallet}>
              Connect Wallet
            </GradientBgButton>
          )}
        </div>
        
        {/* Debug notification buttons - only visible in development mode */}
        {isDev && (
          <div className="mt-6 pt-4 border-t border-white/10">
            <p className="text-xs text-white/50 mb-2">Test Notifications:</p>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => notification.success("Success message test")}
                className="px-2 py-1 text-xs bg-green-600/30 text-green-400 rounded"
              >
                Test Success
              </button>
              <button 
                onClick={() => notification.error("Error message test")}
                className="px-2 py-1 text-xs bg-red-600/30 text-red-400 rounded"
              >
                Test Error
              </button>
              <button 
                onClick={() => notification.warning("Warning message test")}
                className="px-2 py-1 text-xs bg-yellow-600/30 text-yellow-400 rounded"
              >
                Test Warning
              </button>
              <button 
                onClick={() => notification.info("Info message test")}
                className="px-2 py-1 text-xs bg-blue-600/30 text-blue-400 rounded"
              >
                Test Info
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BorrowCard; 