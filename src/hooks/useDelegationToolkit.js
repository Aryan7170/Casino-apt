import { useState, useCallback, useEffect } from "react";
import { ethers } from "ethers";
import {
  minesContractAddress,
  minesABI,
} from "../app/game/mines/config/contractDetails";
import { useAccount } from "wagmi";
import { useGaslessTransactions } from "../utils/gaslessService";

export function useDelegationToolkit() {
  const { address: wagmiAddress, isConnected: wagmiIsConnected } = useAccount();
  const [session, setSession] = useState(null);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentContract, setCurrentContract] = useState({
    address: minesContractAddress,
    abi: minesABI,
    chainId: "0x138b",
  });
  const [provider, setProvider] = useState(null);

  // Initialize gasless functionality - now with unlimited gasless for all users
  const {
    isGaslessAvailable,
    gasAllowanceRemaining,
    isWhitelisted,
    executeGaslessTransaction,
    refreshGaslessStatus,
  } = useGaslessTransactions(provider, address);

  // Sync connection state with Wagmi
  useEffect(() => {
    setAddress(wagmiAddress || null);
    setIsConnected(!!wagmiIsConnected);

    if (wagmiIsConnected && window.ethereum) {
      const ethProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(ethProvider);
    }
  }, [wagmiAddress, wagmiIsConnected]);

  // Connect wallet and create Delegation Toolkit session for a specific contract
  const connectWallet = useCallback(
    async ({ contractAddress, contractABI, chainId } = {}) => {
      setLoading(true);
      setError(null);
      try {
        if (!window.ethereum) throw new Error("MetaMask not found");
        if (!wagmiIsConnected)
          throw new Error("Please connect wallet using RainbowKit/Wagmi first");
        // const toolkit = await createDelegationToolkit(window.ethereum); // This line was removed as per the edit hint
        const session = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        // const session = await toolkit.createSession({ // This line was removed as per the edit hint
        //   contracts: [
        //     {
        //       address: contractAddress || minesContractAddress,
        //       abi: contractABI || minesABI,
        //       chainId: chainId || '0x138b',
        //     },
        //   ],
        //   expiresInSeconds: 3600,
        // });
        setSession(session);
        setSigner(session.signer);
        const addr = await session.signer.getAddress();
        setAddress(addr);
        setIsConnected(true);
        setCurrentContract({
          address: contractAddress || minesContractAddress,
          abi: contractABI || minesABI,
          chainId: chainId || "0x138b",
        });
      } catch (e) {
        setError(e);
        setIsConnected(false);
      } finally {
        setLoading(false);
      }
    },
    [wagmiIsConnected]
  );

  const getContract = useCallback(
    (contractAddress, contractABI) => {
      if (!signer) throw new Error("Not connected");
      return new ethers.Contract(
        contractAddress || currentContract.address,
        contractABI || currentContract.abi,
        signer
      );
    },
    [signer, currentContract]
  );

  const startGame = useCallback(
    async (mines, betAmount, contractAddress, contractABI) => {
      try {
        const contract = getContract(contractAddress, contractABI);
        const data = contract.interface.encodeFunctionData("startGame", [
          mines,
          ethers.parseEther(betAmount.toString()),
        ]);

        // Try gasless transaction first if available
        if (isGaslessAvailable && provider) {
          const relayerSigner = signer; // In production, this would be your relayer's signer
          const result = await executeGaslessTransaction(
            contractAddress || currentContract.address,
            data,
            signer,
            relayerSigner
          );

          if (result.success) {
            return result.receipt;
          }
        }

        // Fallback to regular transaction
        const tx = await contract.startGame(
          mines,
          ethers.parseEther(betAmount.toString())
        );
        return tx.wait();
      } catch (error) {
        console.error("Start game error:", error);
        throw error;
      }
    },
    [
      getContract,
      isGaslessAvailable,
      provider,
      executeGaslessTransaction,
      signer,
      currentContract,
    ]
  );

  const revealTile = useCallback(
    async (tile, contractAddress, contractABI) => {
      try {
        const contract = getContract(contractAddress, contractABI);
        const data = contract.interface.encodeFunctionData("revealTile", [
          tile,
        ]);

        // Try gasless transaction first if available
        if (isGaslessAvailable && provider) {
          const relayerSigner = signer;
          const result = await executeGaslessTransaction(
            contractAddress || currentContract.address,
            data,
            signer,
            relayerSigner
          );

          if (result.success) {
            return result.receipt;
          }
        }

        // Fallback to regular transaction
        const tx = await contract.revealTile(tile);
        return tx.wait();
      } catch (error) {
        console.error("Reveal tile error:", error);
        throw error;
      }
    },
    [
      getContract,
      isGaslessAvailable,
      provider,
      executeGaslessTransaction,
      signer,
      currentContract,
    ]
  );

  const executeBatch = useCallback(
    async (contractAddress, contractABI) => {
      // Implement batch logic if needed
    },
    [getContract]
  );

  const cashOut = useCallback(
    async (contractAddress, contractABI) => {
      try {
        const contract = getContract(contractAddress, contractABI);
        const data = contract.interface.encodeFunctionData("cashOut", []);

        // Try gasless transaction first if available
        if (isGaslessAvailable && provider) {
          const relayerSigner = signer;
          const result = await executeGaslessTransaction(
            contractAddress || currentContract.address,
            data,
            signer,
            relayerSigner
          );

          if (result.success) {
            return result.receipt;
          }
        }

        // Fallback to regular transaction
        const tx = await contract.cashOut();
        return tx.wait();
      } catch (error) {
        console.error("Cash out error:", error);
        throw error;
      }
    },
    [
      getContract,
      isGaslessAvailable,
      provider,
      executeGaslessTransaction,
      signer,
      currentContract,
    ]
  );

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
    // Gasless transaction info
    isGaslessAvailable,
    gasAllowanceRemaining,
    isWhitelisted,
    refreshGaslessStatus,
  };
}
