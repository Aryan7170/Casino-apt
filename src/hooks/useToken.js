import { useState, useCallback, useEffect } from "react";
import { formatUnits, parseUnits } from "viem";
import { useReadContract, useWriteContract, useChainId } from "wagmi";
import { CONTRACTS, CHAIN_IDS } from "@/config/contracts";
import { useGaslessTransactions } from "@/utils/gaslessService";
import { ethers } from "ethers";

// Standard ERC20 ABI for fallback
const STANDARD_ERC20_ABI = [
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "spender", type: "address" }],
    name: "allowance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
];

// Helper function to validate address
const isValidAddress = (address) => {
  if (!address) return false;
  if (typeof address !== "string") return false;
  if (!address.startsWith("0x")) return false;
  if (address.length !== 42) return false; // 0x + 40 hex characters
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

export const useToken = (address) => {
  const [balance, setBalance] = useState("0");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const chainId = useChainId();

  // Initialize gasless transactions for seamless token operations
  const { executeGaslessTransaction, isGaslessAvailable } =
    useGaslessTransactions(
      typeof window !== "undefined" && window.ethereum
        ? new ethers.BrowserProvider(window.ethereum)
        : null,
      address
    );

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

  // Validate address and contract config
  const isValidAddressParam = isValidAddress(address);
  const isValidContractConfig =
    contractConfig &&
    contractConfig.address &&
    isValidAddress(contractConfig.address);

  // Debug logging
  console.log("useToken hook debug:", {
    chainId,
    address,
    isValidAddress: isValidAddressParam,
    contractConfig: contractConfig
      ? {
          address: contractConfig.address,
          hasABI: !!contractConfig.abi,
          abiLength: contractConfig.abi?.length,
          isValidContractAddress: isValidAddress(contractConfig.address),
        }
      : null,
  });

  // Read token balance with fallback to standard ERC20 ABI
  const {
    data: balanceData,
    isError,
    isLoading: isBalanceLoading,
    error: readError,
  } = useReadContract({
    address: contractConfig?.address,
    abi: contractConfig?.abi || STANDARD_ERC20_ABI,
    functionName: "balanceOf",
    args: [address],
    enabled: Boolean(isValidAddressParam && isValidContractConfig),
    watch: true,
    onSuccess: (data) => {
      console.log("Token balance fetched successfully:", {
        address: contractConfig?.address,
        userAddress: address,
        balance: data?.toString(),
        chainId,
      });
    },
    onError: (error) => {
      console.error("Token balance fetch failed:", {
        address: contractConfig?.address,
        userAddress: address,
        error: error,
        chainId,
      });
    },
  });

  // Get write contract function
  const { writeContractAsync } = useWriteContract();

  // Update balance when data changes
  useEffect(() => {
    console.log("Balance data changed:", {
      balanceData: balanceData?.toString(),
      isError,
      isBalanceLoading,
      formattedBalance: balanceData ? formatUnits(balanceData, 18) : "0",
    });

    if (balanceData) {
      const formattedBalance = formatUnits(balanceData, 18);
      console.log("Setting balance to:", formattedBalance);
      setBalance(formattedBalance);
    } else if (!isValidAddressParam) {
      // Reset balance if address is invalid
      setBalance("0");
      setError("Invalid wallet address");
    } else if (!isValidContractConfig) {
      // Reset balance if contract config is invalid
      setBalance("0");
      setError("No contract configuration found for current network");
    } else if (isError) {
      // Print the actual error object, not just 'true'
      console.error("Balance fetch error:", readError);
      setError("Failed to load token balance");
    }
    setIsLoading(isBalanceLoading);
  }, [
    balanceData,
    isError,
    isBalanceLoading,
    readError,
    isValidAddressParam,
    isValidContractConfig,
  ]);

  const transfer = useCallback(
    async (to, amount) => {
      if (!isValidContractConfig) {
        setError("No contract configuration found for current network");
        return null;
      }

      if (!isValidAddress(to)) {
        setError("Invalid recipient address");
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Try gasless transaction first if available
        if (isGaslessAvailable && executeGaslessTransaction) {
          console.log("Executing transfer as gasless transaction");

          const result = await executeGaslessTransaction({
            targetContract: contractConfig.address,
            abi: contractConfig.abi || STANDARD_ERC20_ABI,
            functionName: "transfer",
            args: [to, parseUnits(amount.toString(), 18)],
          });

          return result.hash;
        } else {
          // Fallback to regular transaction
          console.log("Executing transfer as regular transaction");

          const hash = await writeContractAsync({
            address: contractConfig.address,
            abi: contractConfig.abi || STANDARD_ERC20_ABI,
            functionName: "transfer",
            args: [to, parseUnits(amount.toString(), 18)],
          });

          return hash;
        }
      } catch (err) {
        console.error("Transfer error:", err);
        setError(err.message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [
      writeContractAsync,
      contractConfig,
      isValidContractConfig,
      isGaslessAvailable,
      executeGaslessTransaction,
    ]
  );

  const approve = useCallback(
    async (spender, amount) => {
      if (!isValidContractConfig) {
        setError("No contract configuration found for current network");
        return null;
      }

      if (!isValidAddress(spender)) {
        setError("Invalid spender address");
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Try gasless transaction first if available
        if (isGaslessAvailable && executeGaslessTransaction) {
          console.log("Executing approve as gasless transaction");

          const result = await executeGaslessTransaction({
            targetContract: contractConfig.address,
            abi: contractConfig.abi || STANDARD_ERC20_ABI,
            functionName: "approve",
            args: [spender, parseUnits(amount.toString(), 18)],
          });

          return result.hash;
        } else {
          // Fallback to regular transaction
          console.log("Executing approve as regular transaction");

          const hash = await writeContractAsync({
            address: contractConfig.address,
            abi: contractConfig.abi || STANDARD_ERC20_ABI,
            functionName: "approve",
            args: [spender, parseUnits(amount.toString(), 18)],
          });

          return hash;
        }
      } catch (err) {
        console.error("Approve error:", err);
        setError(err.message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [
      writeContractAsync,
      contractConfig,
      isValidContractConfig,
      isGaslessAvailable,
      executeGaslessTransaction,
    ]
  );

  const refresh = useCallback(async () => {
    if (!isValidAddressParam || !isValidContractConfig) return;

    try {
      setIsLoading(true);
      const { data: refreshedBalance } = await useReadContract({
        address: contractConfig.address,
        abi: contractConfig.abi || STANDARD_ERC20_ABI,
        functionName: "balanceOf",
        args: [address],
      });

      if (refreshedBalance) {
        setBalance(formatUnits(refreshedBalance, 18));
      }
    } catch (err) {
      console.error("Failed to refresh token balance:", err);
      setError("Failed to refresh token balance");
    } finally {
      setIsLoading(false);
    }
  }, [address, contractConfig, isValidAddressParam, isValidContractConfig]);

  return {
    balance,
    transfer,
    approve,
    isLoading,
    error,
    refresh,
    isValidAddress: isValidAddressParam,
    isValidContract: isValidContractConfig,
    isGaslessAvailable, // Expose gasless availability for UI decisions
  };
};
