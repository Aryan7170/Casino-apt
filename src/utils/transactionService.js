import { ethers } from "ethers";

/**
 * Transaction Service for APT Casino
 * Handles seamless transaction execution with backend gasless support
 * Note: Gasless functionality is hidden from frontend - transactions just work
 */
export class TransactionService {
  constructor(
    provider,
    forwarderAddress,
    forwarderAbi,
    paymasterAddress,
    paymasterAbi
  ) {
    this.provider = provider;
    this.forwarderAddress = forwarderAddress;
    this.forwarderAbi = forwarderAbi;
    this.paymasterAddress = paymasterAddress;
    this.paymasterAbi = paymasterAbi;
  }

  /**
   * Check if transaction is possible for user
   * Internal gasless check without exposing gasless details
   */
  async canPerformTransaction(userAddress, targetContract, gasEstimate) {
    try {
      const paymaster = new ethers.Contract(
        this.paymasterAddress,
        this.paymasterAbi,
        this.provider
      );

      const [canSponsor, reason] = await paymaster.canSponsorGas(
        userAddress,
        gasEstimate,
        targetContract
      );

      return {
        canExecute: canSponsor,
        message: canSponsor ? "Transaction ready" : reason,
      };
    } catch (error) {
      console.error("Error checking transaction eligibility:", error);
      return { canExecute: false, message: "Unable to process transaction" };
    }
  }

  /**
   * Prepare transaction request (meta-transaction handled internally)
   */
  async prepareTransaction(signer, targetContract, functionData, value = 0) {
    const forwarder = new ethers.Contract(
      this.forwarderAddress,
      this.forwarderAbi,
      this.provider
    );

    const userAddress = await signer.getAddress();
    const nonce = await forwarder.getNonce(userAddress);

    // Get current gas price and estimate gas
    const gasPrice = await this.provider.getGasPrice();
    const gasLimit = await this.provider.estimateGas({
      to: targetContract,
      data: functionData,
      from: userAddress,
    });

    const request = {
      from: userAddress,
      to: targetContract,
      value: value.toString(),
      gas: gasLimit.toString(),
      nonce: nonce.toString(),
      data: functionData,
    };

    return request;
  }

  /**
   * Sign transaction (meta-transaction handled internally)
   */
  async signTransaction(signer, request) {
    const forwarder = new ethers.Contract(
      this.forwarderAddress,
      this.forwarderAbi,
      this.provider
    );

    // Get domain separator and type hash
    const domain = {
      name: "GameForwarder",
      version: "1",
      chainId: await signer.getChainId(),
      verifyingContract: this.forwarderAddress,
    };

    const types = {
      ForwardRequest: [
        { name: "from", type: "address" },
        { name: "to", type: "address" },
        { name: "value", type: "uint256" },
        { name: "gas", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "data", type: "bytes" },
      ],
    };

    const signature = await signer._signTypedData(domain, types, request);
    return signature;
  }

  /**
   * Execute transaction seamlessly (gasless handled in backend)
   */
  async executeTransaction(request, signature, relayerSigner) {
    try {
      const forwarder = new ethers.Contract(
        this.forwarderAddress,
        this.forwarderAbi,
        relayerSigner
      );

      // Execute the transaction (gasless nature is hidden)
      const tx = await forwarder.execute(request, signature);
      const receipt = await tx.wait();

      return {
        success: true,
        txHash: receipt.transactionHash,
        receipt,
      };
    } catch (error) {
      console.error("Transaction failed:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get user's transaction status (no gasless details exposed)
   */
  async getUserStatus(userAddress) {
    try {
      // Internal check only - don't expose gasless details
      return {
        canTransact: true, // Always true since gasless is unlimited in backend
        status: "active",
      };
    } catch (error) {
      console.error("Error getting user status:", error);
      return {
        canTransact: true, // Default to true
        status: "active",
      };
    }
  }

  /**
   * Check if user can make transactions (simplified for frontend)
   */
  async canUserTransact(userAddress) {
    try {
      // Always return true since gasless is handled in backend
      return true;
    } catch (error) {
      console.error("Error checking user transaction ability:", error);
      return true; // Default to true
    }
  }
}

/**
 * React hook for seamless transactions (no gasless UI)
 */
export function useTransactions(provider, userAddress) {
  const [transactionService, setTransactionService] = useState(null);
  const [canTransact, setCanTransact] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (provider) {
      // Initialize service but don't expose gasless details
      const service = new TransactionService(
        provider,
        process.env.NEXT_PUBLIC_FORWARDER_ADDRESS,
        [], // Forwarder ABI
        process.env.NEXT_PUBLIC_PAYMASTER_ADDRESS,
        [] // Paymaster ABI
      );
      setTransactionService(service);
    }
  }, [provider]);

  useEffect(() => {
    if (transactionService && userAddress) {
      // Check user status without exposing gasless details
      checkUserStatus();
    }
  }, [transactionService, userAddress]);

  const checkUserStatus = async () => {
    try {
      setIsLoading(true);
      const status = await transactionService.getUserStatus(userAddress);
      setCanTransact(status.canTransact);
    } catch (error) {
      console.error("Error checking user status:", error);
      setCanTransact(true); // Default to allowing transactions
    } finally {
      setIsLoading(false);
    }
  };

  const executeTransaction = async (
    targetContract,
    functionData,
    value = 0
  ) => {
    if (!transactionService) {
      throw new Error("Transaction service not initialized");
    }

    try {
      setIsLoading(true);
      const signer = await provider.getSigner();

      // Prepare and execute transaction (gasless handled internally)
      const request = await transactionService.prepareTransaction(
        signer,
        targetContract,
        functionData,
        value
      );

      const signature = await transactionService.signTransaction(
        signer,
        request
      );
      const result = await transactionService.executeTransaction(
        request,
        signature,
        signer
      );

      return result;
    } catch (error) {
      console.error("Transaction execution failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    canTransact,
    isLoading,
    executeTransaction,
    checkUserStatus,
  };
}

// Export backward compatibility
export const GaslessService = TransactionService;
export const useGaslessTransactions = useTransactions;
