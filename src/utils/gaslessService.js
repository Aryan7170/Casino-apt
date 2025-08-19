import { ethers } from "ethers";
import { useState, useEffect, useCallback } from "react";

/**
 * Enhanced Gasless Transaction Service for APT Casino
 * Provides seamless gasless transactions while maintaining existing frontend architecture
 * All users automatically get unlimited gasless transactions
 */
export class GaslessService {
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
    this.relayerUrl =
      process.env.NEXT_PUBLIC_RELAYER_URL || "http://localhost:3001";
  }

  /**
   * Check if gasless transaction is possible for user
   * Now always returns true for approved contracts since gasless is unlimited
   */
  async canPerformGaslessTransaction(userAddress, targetContract, gasEstimate) {
    try {
      // Check if relayer URL is available
      if (!this.relayerUrl) {
        console.warn(
          "No relayer URL configured, allowing gasless transaction with fallback"
        );
        return {
          canSponsor: true,
          reason: "Fallback mode - relayer unavailable",
          isUnlimited: true,
          message: "Gasless transaction available (fallback mode)",
        };
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(`${this.relayerUrl}/check-gasless`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userAddress,
          targetContract,
          gasEstimate,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      return {
        canSponsor: result.canSponsor,
        reason: result.reason,
        isUnlimited: true, // All users now have unlimited gasless
        message: result.canSponsor
          ? "Gasless transaction available"
          : result.reason,
      };
    } catch (error) {
      console.warn(
        "Relayer service unavailable for gasless check, using fallback:",
        error.message
      );
      return {
        canSponsor: true, // Allow gasless in fallback mode
        reason: "Fallback mode - relayer unavailable",
        isUnlimited: true,
        message: "Gasless transaction available (fallback mode)",
      };
    }
  }

  /**
   * Prepare meta-transaction request
   */
  async prepareMetaTransaction(
    signer,
    targetContract,
    functionData,
    value = 0
  ) {
    try {
      const userAddress = await signer.getAddress();

      // Get nonce from forwarder
      const forwarder = new ethers.Contract(
        this.forwarderAddress,
        this.forwarderAbi,
        this.provider
      );

      const nonce = await forwarder.getNonce(userAddress);

      // Estimate gas
      const gasLimit = await this.provider.estimateGas({
        to: targetContract,
        data: functionData,
        from: userAddress,
        value: value,
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
    } catch (error) {
      console.error("Error preparing meta-transaction:", error);
      throw error;
    }
  }

  /**
   * Sign meta-transaction
   */
  async signMetaTransaction(signer, request) {
    try {
      const chainId = await signer.getChainId();

      // EIP-712 domain
      const domain = {
        name: "GameForwarder",
        version: "1",
        chainId: chainId,
        verifyingContract: this.forwarderAddress,
      };

      // EIP-712 types
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
    } catch (error) {
      console.error("Error signing meta-transaction:", error);
      throw error;
    }
  }

  /**
   * Execute gasless transaction via relayer
   */
  async executeGaslessTransaction(request, signature) {
    try {
      const response = await fetch(`${this.relayerUrl}/relay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          request,
          signature,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Transaction failed");
      }

      return {
        success: result.success,
        txHash: result.txHash,
        gasUsed: result.gasUsed,
        blockNumber: result.blockNumber,
      };
    } catch (error) {
      console.error("Gasless transaction failed:", error);
      throw error;
    }
  }

  /**
   * Execute contract function with automatic gasless handling
   * This is the main method your existing frontend should use
   */
  async executeContractFunction(
    signer,
    contractAddress,
    abi,
    functionName,
    args = [],
    options = {}
  ) {
    try {
      // Check if gasless is available (should always be true now)
      const userAddress = await signer.getAddress();
      const contract = new ethers.Contract(contractAddress, abi, this.provider);
      const functionData = contract.interface.encodeFunctionData(
        functionName,
        args
      );

      const gasEstimate = await this.provider.estimateGas({
        to: contractAddress,
        data: functionData,
        from: userAddress,
        value: options.value || 0,
      });

      const gaslessCheck = await this.canPerformGaslessTransaction(
        userAddress,
        contractAddress,
        gasEstimate.toString()
      );

      if (gaslessCheck.canSponsor) {
        // Try to execute as gasless transaction
        try {
          console.log("Executing as gasless transaction");

          const request = await this.prepareMetaTransaction(
            signer,
            contractAddress,
            functionData,
            options.value || 0
          );

          const signature = await this.signMetaTransaction(signer, request);
          const result = await this.executeGaslessTransaction(
            request,
            signature
          );

          return {
            hash: result.txHash,
            wait: () =>
              Promise.resolve({
                transactionHash: result.txHash,
                gasUsed: BigInt(result.gasUsed),
                blockNumber: result.blockNumber,
                status: 1,
              }),
            gasless: true,
          };
        } catch (gaslessError) {
          console.warn(
            "Gasless transaction failed, falling back to regular transaction:",
            gaslessError.message
          );
          // Fallback to regular transaction
          const contractWithSigner = new ethers.Contract(
            contractAddress,
            abi,
            signer
          );
          const result = await contractWithSigner[functionName](
            ...args,
            options
          );
          return {
            ...result,
            gasless: false,
          };
        }
      } else {
        // Fallback to regular transaction
        console.log("Gasless not available, using regular transaction");
        const contractWithSigner = new ethers.Contract(
          contractAddress,
          abi,
          signer
        );
        const result = await contractWithSigner[functionName](...args, options);
        return {
          ...result,
          gasless: false,
        };
      }
    } catch (error) {
      console.error("Error executing contract function:", error);
      throw error;
    }
  }

  /**
   * Get user's gasless transaction status
   * Returns user-friendly status information
   */
  async getUserGaslessStatus(userAddress) {
    try {
      // Check if relayer URL is available
      if (!this.relayerUrl) {
        console.warn(
          "No relayer URL configured, using fallback gasless status"
        );
        return this.getFallbackGaslessStatus();
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(
        `${this.relayerUrl}/user-status/${userAddress}`,
        {
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      return {
        hasUsedGasless: true, // Assume true for better UX
        isWhitelisted: true, // All users are effectively whitelisted
        qualifiesForFreeGas: true, // All users qualify for free gas
        freeGasRemaining: "unlimited", // Unlimited free gas
        dailyGasRemaining: "unlimited", // No daily limits
        canTransact: result.canTransact,
        status: result.status,
      };
    } catch (error) {
      console.warn(
        "Relayer service unavailable, using fallback gasless status:",
        error.message
      );
      return this.getFallbackGaslessStatus();
    }
  }

  /**
   * Fallback gasless status when relayer is unavailable
   */
  getFallbackGaslessStatus() {
    return {
      hasUsedGasless: false,
      isWhitelisted: true, // Default to true for better UX
      qualifiesForFreeGas: true,
      freeGasRemaining: "unlimited",
      dailyGasRemaining: "unlimited",
      canTransact: true,
      status: "fallback",
    };
  }

  /**
   * Get user's remaining gas allowance (always unlimited now)
   */
  async getUserGasAllowance(userAddress) {
    return "unlimited";
  }

  /**
   * Check if user is whitelisted for free gas (always true now)
   */
  async isUserWhitelisted(userAddress) {
    return true;
  }
}

/**
 * React hook for gasless transactions - enhanced for unlimited gasless
 * Compatible with existing frontend architecture
 */
export function useGaslessTransactions(provider, userAddress) {
  const [gaslessService, setGaslessService] = useState(null);
  const [isGaslessAvailable, setIsGaslessAvailable] = useState(true); // Always true now
  const [gasAllowanceRemaining, setGasAllowanceRemaining] =
    useState("unlimited");
  const [isWhitelisted, setIsWhitelisted] = useState(true); // Always true now
  const [isLoading, setIsLoading] = useState(false);

  // Initialize gasless service
  useEffect(() => {
    if (provider) {
      const service = new GaslessService(
        provider,
        process.env.NEXT_PUBLIC_FORWARDER_ADDRESS,
        [], // You can add the full ABI here if needed
        process.env.NEXT_PUBLIC_PAYMASTER_ADDRESS,
        [] // You can add the full ABI here if needed
      );
      setGaslessService(service);
    }
  }, [provider]);

  // Check gasless status for user
  useEffect(() => {
    if (gaslessService && userAddress) {
      checkGaslessStatus();
    }
  }, [gaslessService, userAddress]);

  const checkGaslessStatus = useCallback(async () => {
    if (!gaslessService || !userAddress) return;

    try {
      setIsLoading(true);
      const status = await gaslessService.getUserGaslessStatus(userAddress);

      setIsGaslessAvailable(true); // Always available
      setGasAllowanceRemaining("unlimited");
      setIsWhitelisted(true);
    } catch (error) {
      console.warn(
        "Unable to check gasless status, using fallback settings:",
        error.message
      );
      // Default to available for better UX - don't throw the error
      setIsGaslessAvailable(true);
      setGasAllowanceRemaining("unlimited");
      setIsWhitelisted(true);
    } finally {
      setIsLoading(false);
    }
  }, [gaslessService, userAddress]);

  // Execute gasless transaction - main function for frontend
  const executeGaslessTransaction = useCallback(
    async ({ targetContract, abi, functionName, args = [], options = {} }) => {
      if (!gaslessService || !provider) {
        throw new Error("Gasless service not initialized");
      }

      try {
        setIsLoading(true);
        const signer = await provider.getSigner();

        const result = await gaslessService.executeContractFunction(
          signer,
          targetContract,
          abi,
          functionName,
          args,
          options
        );

        // Refresh status after transaction
        await checkGaslessStatus();

        return result;
      } catch (error) {
        console.error("Gasless transaction execution failed:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [gaslessService, provider]
  );

  const refreshGaslessStatus = useCallback(async () => {
    await checkGaslessStatus();
  }, [gaslessService, userAddress]);

  return {
    gaslessService,
    isGaslessAvailable,
    gasAllowanceRemaining,
    isWhitelisted,
    isLoading,
    executeGaslessTransaction,
    refreshGaslessStatus,
  };
}
