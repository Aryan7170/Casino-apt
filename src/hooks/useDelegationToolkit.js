import { useState, useCallback, useEffect } from 'react';
import { createDelegationToolkit } from '@metamask/delegation-toolkit';
import { ethers } from 'ethers';
import { minesContractAddress, minesABI } from '../app/game/mines/config/contractDetails';
import { useAccount } from 'wagmi';

export function useDelegationToolkit() {
  const { address: wagmiAddress, isConnected: wagmiIsConnected } = useAccount();
  const [session, setSession] = useState(null);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentContract, setCurrentContract] = useState({ address: minesContractAddress, abi: minesABI, chainId: '0x138b' });

  // Sync connection state with Wagmi
  useEffect(() => {
    setAddress(wagmiAddress || null);
    setIsConnected(!!wagmiIsConnected);
  }, [wagmiAddress, wagmiIsConnected]);

  // Connect wallet and create Delegation Toolkit session for a specific contract
  const connectWallet = useCallback(async ({ contractAddress, contractABI, chainId } = {}) => {
    setLoading(true);
    setError(null);
    try {
      if (!window.ethereum) throw new Error('MetaMask not found');
      if (!wagmiIsConnected) throw new Error('Please connect wallet using RainbowKit/Wagmi first');
      const toolkit = await createDelegationToolkit(window.ethereum);
      const session = await toolkit.createSession({
        contracts: [
          {
            address: contractAddress || minesContractAddress,
            abi: contractABI || minesABI,
            chainId: chainId || '0x138b',
          },
        ],
        expiresInSeconds: 3600,
      });
      setSession(session);
      setSigner(session.signer);
      const addr = await session.signer.getAddress();
      setAddress(addr);
      setIsConnected(true);
      setCurrentContract({
        address: contractAddress || minesContractAddress,
        abi: contractABI || minesABI,
        chainId: chainId || '0x138b',
      });
    } catch (e) {
      setError(e);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  }, [wagmiIsConnected]);

  const getContract = useCallback((contractAddress, contractABI) => {
    if (!signer) throw new Error('Not connected');
    return new ethers.Contract(
      contractAddress || currentContract.address,
      contractABI || currentContract.abi,
      signer
    );
  }, [signer, currentContract]);

  const startGame = useCallback(async (mines, betAmount, contractAddress, contractABI) => {
    const contract = getContract(contractAddress, contractABI);
    const tx = await contract.startGame(mines, ethers.utils.parseEther(betAmount.toString()));
    return tx.wait();
  }, [getContract]);

  const revealTile = useCallback(async (tile, contractAddress, contractABI) => {
    const contract = getContract(contractAddress, contractABI);
    const tx = await contract.revealTile(tile);
    return tx.wait();
  }, [getContract]);

  const executeBatch = useCallback(async (contractAddress, contractABI) => {
    // Implement batch logic if needed
  }, [getContract]);

  const cashOut = useCallback(async (contractAddress, contractABI) => {
    const contract = getContract(contractAddress, contractABI);
    const tx = await contract.cashOut();
    return tx.wait();
  }, [getContract]);

  return {
    address,
    isConnected,
    loading,
    error,
    connectWallet,
    startGame,
    revealTile,
    executeBatch,
    cashOut,
  };
} 