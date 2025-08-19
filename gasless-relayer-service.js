const { ethers } = require("ethers");
require("dotenv").config();

/**
 * Gasless Transaction Relayer Service
 * Handles meta-transactions for deposits and withdrawals
 */
class GaslessRelayerService {
  constructor() {
    // Initialize provider and relayer wallet
    this.provider = new ethers.JsonRpcProvider(
      process.env.RPC_URL || "http://localhost:8545"
    );
    this.relayerWallet = new ethers.Wallet(
      process.env.RELAYER_PRIVATE_KEY,
      this.provider
    );

    // Contract details
    this.contractAddress = process.env.CASINO_WALLET_ADDRESS;
    this.contractABI = [
      {
        name: "gaslessDeposit",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [
          {
            name: "depositRequest",
            type: "tuple",
            components: [
              { name: "player", type: "address" },
              { name: "amount", type: "uint256" },
              { name: "nonce", type: "uint256" },
              { name: "deadline", type: "uint256" },
            ],
          },
          { name: "signature", type: "bytes" },
          { name: "permitDeadline", type: "uint256" },
          { name: "permitV", type: "uint8" },
          { name: "permitR", type: "bytes32" },
          { name: "permitS", type: "bytes32" },
        ],
        outputs: [],
      },
      {
        name: "gaslessWithdrawal",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [
          {
            name: "withdrawalRequest",
            type: "tuple",
            components: [
              { name: "player", type: "address" },
              { name: "amount", type: "uint256" },
              { name: "nonce", type: "uint256" },
              { name: "deadline", type: "uint256" },
              { name: "offChainBalanceProof", type: "string" },
            ],
          },
          { name: "userSignature", type: "bytes" },
          { name: "serverSignature", type: "bytes" },
        ],
        outputs: [],
      },
      {
        name: "getDomainSeparator",
        type: "function",
        stateMutability: "view",
        inputs: [],
        outputs: [{ name: "", type: "bytes32" }],
      },
      {
        name: "getPlayerSummary",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "player", type: "address" }],
        outputs: [
          { name: "deposits", type: "uint256" },
          { name: "withdraws", type: "uint256" },
          { name: "netDeposited", type: "uint256" },
          { name: "currentNonce", type: "uint256" },
        ],
      },
    ];

    this.contract = new ethers.Contract(
      this.contractAddress,
      this.contractABI,
      this.relayerWallet
    );

    // EIP-712 type hashes
    this.DEPOSIT_TYPEHASH = ethers.keccak256(
      ethers.toUtf8Bytes(
        "Deposit(address player,uint256 amount,uint256 nonce,uint256 deadline)"
      )
    );

    this.WITHDRAWAL_TYPEHASH = ethers.keccak256(
      ethers.toUtf8Bytes(
        "Withdrawal(address player,uint256 amount,uint256 nonce,uint256 deadline,string offChainBalanceProof)"
      )
    );

    console.log("🚀 Gasless Relayer Service initialized");
    console.log("📍 Relayer Address:", this.relayerWallet.address);
    console.log("🏦 Contract Address:", this.contractAddress);
  }

  /**
   * Get user's current nonce for meta-transactions
   */
  async getUserNonce(userAddress) {
    try {
      const [, , , nonce] = await this.contract.getPlayerSummary(userAddress);
      return nonce;
    } catch (error) {
      console.error("Failed to get user nonce:", error);
      return 0;
    }
  }

  /**
   * Get domain separator for EIP-712
   */
  async getDomainSeparator() {
    try {
      return await this.contract.getDomainSeparator();
    } catch (error) {
      console.error("Failed to get domain separator:", error);
      throw error;
    }
  }

  /**
   * Process gasless deposit transaction
   */
  async processGaslessDeposit({
    player,
    amount,
    signature,
    permitDeadline,
    permitV,
    permitR,
    permitS,
  }) {
    try {
      const nonce = await this.getUserNonce(player);
      const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour deadline

      const depositRequest = {
        player,
        amount: ethers.parseEther(amount.toString()),
        nonce,
        deadline,
      };

      console.log(
        `🔄 Processing gasless deposit for ${player}: ${amount} tokens`
      );

      const tx = await this.contract.gaslessDeposit(
        depositRequest,
        signature,
        permitDeadline,
        permitV,
        permitR,
        permitS,
        {
          gasLimit: 300000, // Estimated gas limit
        }
      );

      const receipt = await tx.wait();

      console.log(`✅ Gasless deposit completed: ${receipt.hash}`);

      return {
        success: true,
        txHash: receipt.hash,
        gasUsed: receipt.gasUsed.toString(),
        effectiveGasPrice: receipt.effectiveGasPrice?.toString() || "0",
      };
    } catch (error) {
      console.error("Gasless deposit failed:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Process gasless withdrawal transaction
   */
  async processGaslessWithdrawal({
    player,
    amount,
    offChainBalanceProof,
    userSignature,
    serverSignature,
  }) {
    try {
      const nonce = await this.getUserNonce(player);
      const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour deadline

      const withdrawalRequest = {
        player,
        amount: ethers.parseEther(amount.toString()),
        nonce,
        deadline,
        offChainBalanceProof,
      };

      console.log(
        `🔄 Processing gasless withdrawal for ${player}: ${amount} tokens`
      );

      const tx = await this.contract.gaslessWithdrawal(
        withdrawalRequest,
        userSignature,
        serverSignature,
        {
          gasLimit: 350000, // Estimated gas limit
        }
      );

      const receipt = await tx.wait();

      console.log(`✅ Gasless withdrawal completed: ${receipt.hash}`);

      return {
        success: true,
        txHash: receipt.hash,
        gasUsed: receipt.gasUsed.toString(),
        effectiveGasPrice: receipt.effectiveGasPrice?.toString() || "0",
      };
    } catch (error) {
      console.error("Gasless withdrawal failed:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get relayer balance for monitoring
   */
  async getRelayerBalance() {
    try {
      const balance = await this.provider.getBalance(
        this.relayerWallet.address
      );
      return ethers.formatEther(balance);
    } catch (error) {
      console.error("Failed to get relayer balance:", error);
      return "0";
    }
  }

  /**
   * Generate EIP-712 signature for testing
   */
  async generateDepositSignature(player, amount, nonce, deadline, privateKey) {
    const domain = {
      name: "CasinoWallet",
      version: "1",
      chainId: await this.provider.getNetwork().then((n) => n.chainId),
      verifyingContract: this.contractAddress,
    };

    const types = {
      Deposit: [
        { name: "player", type: "address" },
        { name: "amount", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    };

    const value = {
      player,
      amount: ethers.parseEther(amount.toString()),
      nonce,
      deadline,
    };

    const wallet = new ethers.Wallet(privateKey);
    return await wallet.signTypedData(domain, types, value);
  }

  /**
   * Generate withdrawal signature for testing
   */
  async generateWithdrawalSignature(
    player,
    amount,
    nonce,
    deadline,
    offChainBalanceProof,
    privateKey
  ) {
    const domain = {
      name: "CasinoWallet",
      version: "1",
      chainId: await this.provider.getNetwork().then((n) => n.chainId),
      verifyingContract: this.contractAddress,
    };

    const types = {
      Withdrawal: [
        { name: "player", type: "address" },
        { name: "amount", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
        { name: "offChainBalanceProof", type: "string" },
      ],
    };

    const value = {
      player,
      amount: ethers.parseEther(amount.toString()),
      nonce,
      deadline,
      offChainBalanceProof,
    };

    const wallet = new ethers.Wallet(privateKey);
    return await wallet.signTypedData(domain, types, value);
  }
}

module.exports = GaslessRelayerService;
