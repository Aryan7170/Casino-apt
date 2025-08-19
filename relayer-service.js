/**
 * APT Casino Gasless Transaction Relayer Service
 * This service acts as a relayer for meta-transactions
 */

const express = require("express");
const { ethers } = require("ethers");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Configuration
const PORT = process.env.RELAYER_PORT || 3001;
const PRIVATE_KEY = process.env.RELAYER_PRIVATE_KEY;
const RPC_URL = process.env.RPC_URL;
const FORWARDER_ADDRESS = process.env.FORWARDER_ADDRESS;
const PAYMASTER_ADDRESS = process.env.PAYMASTER_ADDRESS;

// Contract ABIs (simplified - include your full ABIs)
const FORWARDER_ABI = [
  "function execute((address from,address to,uint256 value,uint256 gas,uint256 nonce,bytes data) req, bytes signature) payable returns (bool,bytes)",
  "function verify((address from,address to,uint256 value,uint256 gas,uint256 nonce,bytes data) req, bytes signature) view returns (bool)",
];

const PAYMASTER_ABI = [
  "function sponsorGas(address user, uint256 gasUsed, address targetContract)",
  "function canSponsorGas(address user, uint256 gasEstimate, address targetContract) view returns (bool,string)",
];

// Initialize provider and signer
const provider = new ethers.JsonRpcProvider(RPC_URL);
const relayerSigner = new ethers.Wallet(PRIVATE_KEY, provider);

// Initialize contracts
const forwarder = new ethers.Contract(
  FORWARDER_ADDRESS,
  FORWARDER_ABI,
  relayerSigner
);
const paymaster = new ethers.Contract(
  PAYMASTER_ADDRESS,
  PAYMASTER_ABI,
  relayerSigner
);

// Rate limiting and security - Relaxed limits for unlimited gasless
const rateLimits = new Map();
const MAX_REQUESTS_PER_MINUTE = 50; // Increased from 10 since gasless is unlimited
const MAX_GAS_LIMIT = 500000;

// Middleware for rate limiting
const rateLimit = (req, res, next) => {
  const clientIP = req.ip;
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute

  if (!rateLimits.has(clientIP)) {
    rateLimits.set(clientIP, { count: 1, resetTime: now + windowMs });
    return next();
  }

  const limit = rateLimits.get(clientIP);
  if (now > limit.resetTime) {
    // Reset the window
    rateLimits.set(clientIP, { count: 1, resetTime: now + windowMs });
    return next();
  }

  if (limit.count >= MAX_REQUESTS_PER_MINUTE) {
    return res.status(429).json({ error: "Too many requests" });
  }

  limit.count++;
  next();
};

// Validation middleware
const validateRequest = (req, res, next) => {
  const { request, signature } = req.body;

  if (!request || !signature) {
    return res.status(400).json({ error: "Missing request or signature" });
  }

  if (!request.from || !request.to || !request.data) {
    return res.status(400).json({ error: "Invalid request format" });
  }

  if (parseInt(request.gas) > MAX_GAS_LIMIT) {
    return res.status(400).json({ error: "Gas limit too high" });
  }

  next();
};

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    relayer: relayerSigner.address,
    timestamp: new Date().toISOString(),
  });
});

// Get relayer status
app.get("/status", async (req, res) => {
  try {
    const balance = await provider.getBalance(relayerSigner.address);
    const nonce = await provider.getTransactionCount(relayerSigner.address);

    res.json({
      relayerAddress: relayerSigner.address,
      balance: ethers.formatEther(balance),
      nonce,
      forwarderAddress: FORWARDER_ADDRESS,
      paymasterAddress: PAYMASTER_ADDRESS,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check if gasless transaction is possible
app.post("/check-gasless", rateLimit, async (req, res) => {
  try {
    const { userAddress, targetContract, gasEstimate } = req.body;

    if (!userAddress || !targetContract || !gasEstimate) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    // Check with paymaster - should always return true now for approved contracts
    const [canSponsor, reason] = await paymaster.canSponsorGas(
      userAddress,
      gasEstimate,
      targetContract
    );

    // Return simple response without exposing gasless details
    res.json({
      canSponsor,
      reason: canSponsor ? "Transaction approved" : reason,
    });
  } catch (error) {
    console.error("Check gasless error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Execute transaction (automatically gasless for all users)
app.post("/relay", rateLimit, validateRequest, async (req, res) => {
  try {
    const { request, signature } = req.body;

    // Verify the signature
    const isValid = await forwarder.verify(request, signature);
    if (!isValid) {
      return res.status(400).json({ error: "Invalid signature" });
    }

    // Automatically sponsor gas for all transactions to approved contracts
    const gasEstimate = parseInt(request.gas);
    const [canSponsor, reason] = await paymaster.canSponsorGas(
      request.from,
      gasEstimate,
      request.to
    );

    if (!canSponsor) {
      return res
        .status(400)
        .json({ error: `Transaction not supported: ${reason}` });
    }

    // Execute the meta-transaction (gasless for all users)
    console.log(
      `Executing gasless transaction for ${request.from} to ${request.to}`
    );

    const tx = await forwarder.execute(request, signature, {
      gasLimit: Math.min(gasEstimate * 2, MAX_GAS_LIMIT), // Add buffer for execution
    });

    console.log(`Transaction submitted: ${tx.hash}`);

    // Wait for confirmation
    const receipt = await tx.wait();

    // Notify paymaster about gas usage (free for all users)
    try {
      const gasUsed = receipt.gasUsed;
      await paymaster.sponsorGas(request.from, gasUsed, request.to);
      console.log(`Gas sponsored (free): ${gasUsed} for ${request.from}`);
    } catch (gasError) {
      console.error("Error updating gas usage:", gasError);
      // Continue anyway as the transaction was successful
    }

    res.json({
      success: true,
      txHash: receipt.transactionHash,
      gasUsed: receipt.gasUsed.toString(),
      blockNumber: receipt.blockNumber,
    });
  } catch (error) {
    console.error("Transaction relay error:", error);

    // Check if it's a revert with a reason
    if (error.reason) {
      return res
        .status(400)
        .json({ error: `Transaction reverted: ${error.reason}` });
    }

    // Check if it's a gas estimation error
    if (error.message.includes("gas")) {
      return res.status(400).json({ error: "Gas estimation failed" });
    }

    res.status(500).json({ error: error.message });
  }
});

// Get user's transaction status (internal endpoint - no gasless exposure)
app.get("/user-status/:userAddress", async (req, res) => {
  try {
    const { userAddress } = req.params;

    if (!ethers.isAddress(userAddress)) {
      return res.status(400).json({ error: "Invalid address" });
    }

    // Internal tracking only - don't expose gasless details to frontend
    const [hasUsedGasless, isWhitelisted, qualifiesForFreeGas] =
      await paymaster.getUserGaslessStatus(userAddress);

    res.json({
      userAddress,
      canTransact: true, // Always true since gasless is unlimited
      status: "active",
    });
  } catch (error) {
    console.error("User status check error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
app.listen(PORT, () => {
  console.log(`APT Casino Relayer Service running on port ${PORT}`);
  console.log(`Relayer address: ${relayerSigner.address}`);
  console.log(`Forwarder address: ${FORWARDER_ADDRESS}`);
  console.log(`Paymaster address: ${PAYMASTER_ADDRESS}`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("Shutting down relayer service...");
  process.exit(0);
});

module.exports = app;
