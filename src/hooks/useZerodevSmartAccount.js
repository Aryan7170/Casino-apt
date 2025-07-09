import { useEffect, useState, useCallback, useRef } from 'react';
import { ethers } from 'ethers';
import { minesContractAddress, minesABI } from '../app/game/mines/config/contractDetails';

const CHAIN_ID = 5003; // Mantle Sepolia Testnet
const RPC_URL = 'https://rpc.sepolia.mantle.xyz';

export function useZerodevSmartAccount() {
  const [scwAddress, setScwAddress] = useState(null);
  const [scwBalance, setScwBalance] = useState(null);
  const [sessionKeyValid, setSessionKeyValid] = useState(false);
  const [sessionKeyExpiry, setSessionKeyExpiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const mountedRef = useRef(true);

  const batchQueue = useRef([]);

  // Initialize connection
  const initConnection = useCallback(async () => {
    if (!mountedRef.current) return;
    
    setLoading(true);
    setError(null);
    
    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed');
      }

      // Check current chain
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (parseInt(currentChainId, 16) !== CHAIN_ID) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${CHAIN_ID.toString(16)}` }],
          });
        } catch (switchError) {
          // This error code indicates that the chain has not been added to MetaMask
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: `0x${CHAIN_ID.toString(16)}`,
                  chainName: 'Mantle Sepolia Testnet',
                  nativeCurrency: {
                    name: 'MNT',
                    symbol: 'MNT',
                    decimals: 18
                  },
                  rpcUrls: [RPC_URL],
                  blockExplorerUrls: ['https://explorer.sepolia.mantle.xyz/']
                }],
              });
            } catch (addError) {
              throw new Error('Failed to add Mantle Sepolia network');
            }
          } else {
            throw new Error('Failed to switch to Mantle Sepolia network');
          }
        }
      }

      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      await web3Provider.send("eth_requestAccounts", []);
      
      if (!mountedRef.current) return;
      
      const signer = web3Provider.getSigner();
      const address = await signer.getAddress();
      
      setProvider(web3Provider);
      setSigner(signer);
      setScwAddress(address);
      setIsConnected(true);
      
      const bal = await web3Provider.getBalance(address);
      if (!mountedRef.current) return;
      setScwBalance(ethers.utils.formatEther(bal));
      
      // Set session key expiry (15 minutes from now)
      const expiry = Date.now() + 15 * 60 * 1000;
      setSessionKeyExpiry(expiry);
      setSessionKeyValid(true);

      // Set up event listeners
      const handleAccountsChanged = (accounts) => {
        if (!mountedRef.current) return;
        if (accounts.length === 0) {
          // Disconnected
          resetState();
        } else {
          // Account changed
          setScwAddress(accounts[0]);
          refreshBalance();
        }
      };

      const handleChainChanged = (chainId) => {
        if (!mountedRef.current) return;
        if (parseInt(chainId, 16) !== CHAIN_ID) {
          setError(new Error(`Please switch to Mantle Sepolia (Chain ID: ${CHAIN_ID})`));
          resetState();
        } else {
          setError(null);
          initConnection(); // Reinitialize on correct chain
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      // Cleanup function
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
      
    } catch (e) {
      if (!mountedRef.current) return;
      setError(e);
      console.error('Wallet connection error:', e);
      resetState();
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const resetState = () => {
    setScwAddress(null);
    setScwBalance(null);
    setSessionKeyValid(false);
    setSessionKeyExpiry(null);
    setProvider(null);
    setSigner(null);
    setIsConnected(false);
  };

  const refreshBalance = useCallback(async () => {
    if (!provider || !scwAddress || !mountedRef.current) return;
    try {
      const bal = await provider.getBalance(scwAddress);
      if (mountedRef.current) {
        setScwBalance(ethers.utils.formatEther(bal));
      }
    } catch (e) {
      console.error('Error refreshing balance:', e);
    }
  }, [provider, scwAddress]);

  const getContract = useCallback(() => {
    if (!signer || !scwAddress) return null;
    return new ethers.Contract(minesContractAddress, minesABI, signer);
  }, [signer, scwAddress]);

  // Game actions
  const startGame = useCallback(async (mines, betAmount) => {
    if (!isConnected) throw new Error('Wallet not connected');
    
    const contract = getContract();
    if (!contract) throw new Error('Contract not initialized');
    
    try {
      const tx = await contract.startGame(
        mines,
        ethers.utils.parseEther(betAmount.toString())
      );
      const receipt = await tx.wait();
      await refreshBalance();
      return receipt;
    } catch (e) {
      console.error('Start game error:', e);
      throw e;
    }
  }, [isConnected, getContract, refreshBalance]);

  const revealTile = useCallback(async (tile) => {
    if (!isConnected) throw new Error('Wallet not connected');
    
    const contract = getContract();
    if (!contract) throw new Error('Contract not initialized');
    
    try {
      const tx = await contract.revealTile(tile);
      const receipt = await tx.wait();
      return receipt;
    } catch (e) {
      console.error('Reveal tile error:', e);
      throw e;
    }
  }, [isConnected, getContract]);

  const executeBatch = useCallback(async () => {
    if (!isConnected || batchQueue.current.length === 0) return;
    
    const contract = getContract();
    if (!contract) throw new Error('Contract not initialized');
    
    try {
      for (const item of batchQueue.current) {
        const tx = await contract[item.method](...item.args);
        await tx.wait();
      }
      batchQueue.current = [];
    } catch (e) {
      console.error('Batch execution error:', e);
      throw e;
    }
  }, [isConnected, getContract]);

  const cashOut = useCallback(async () => {
    if (!isConnected) throw new Error('Wallet not connected');
    
    const contract = getContract();
    if (!contract) throw new Error('Contract not initialized');
    
    try {
      const tx = await contract.cashOut();
      const receipt = await tx.wait();
      await refreshBalance();
      return receipt;
    } catch (e) {
      console.error('Cashout error:', e);
      throw e;
    }
  }, [isConnected, getContract, refreshBalance]);

  // Session key check
  useEffect(() => {
    if (!sessionKeyExpiry) return;
    
    const interval = setInterval(() => {
      if (mountedRef.current) {
        setSessionKeyValid(Date.now() < sessionKeyExpiry);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [sessionKeyExpiry]);

  // Initial connection
  useEffect(() => {
    mountedRef.current = true;
    initConnection();
    
    return () => {
      mountedRef.current = false;
    };
  }, [initConnection]);

  return {
    scwAddress,
    scwBalance,
    sessionKeyValid,
    sessionKeyExpiry,
    loading,
    error,
    isConnected,
    connectWallet: initConnection,
    refreshBalance,
    startGame,
    revealTile,
    executeBatch,
    cashOut,
  };
}