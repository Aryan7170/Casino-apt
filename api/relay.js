const { ethers } = require("ethers");

/**
 * Vercel Serverless Function for Gasless Relayer
 * Handles meta-transactions for APT Casino
 */

// Environment variables needed
const RELAYER_PRIVATE_KEY = process.env.RELAYER_PRIVATE_KEY;
const RPC_URL = process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL;
const FORWARDER_ADDRESS = process.env.NEXT_PUBLIC_FORWARDER_ADDRESS;
const PAYMASTER_ADDRESS = process.env.NEXT_PUBLIC_PAYMASTER_ADDRESS;

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { request, signature } = req.body;

    if (!request || !signature) {
      return res.status(400).json({ error: "Missing request or signature" });
    }

    // Initialize provider and relayer wallet
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const relayerWallet = new ethers.Wallet(RELAYER_PRIVATE_KEY, provider);

    // Simple forwarder ABI (you may need to expand this)
    const forwarderABI = [
      "function execute((address from,address to,uint256 value,uint256 gas,uint256 nonce,bytes data) req, bytes signature) external returns (bool success, bytes ret)",
    ];

    const forwarder = new ethers.Contract(
      FORWARDER_ADDRESS,
      forwarderABI,
      relayerWallet
    );

    // Execute the meta-transaction
    console.log("Executing meta-transaction:", request);
    const tx = await forwarder.execute(request, signature);
    const receipt = await tx.wait();

    return res.status(200).json({
      success: true,
      txHash: receipt.hash,
      gasUsed: receipt.gasUsed.toString(),
      blockNumber: receipt.blockNumber,
    });
  } catch (error) {
    console.error("Relayer error:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
