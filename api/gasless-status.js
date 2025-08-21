/**
 * Vercel Serverless Function for Gasless Transaction Status
 * Checks if gasless transactions are enabled and user eligibility
 */

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    const { userAddress } = req.method === "GET" ? req.query : req.body;

    // Check if gasless is enabled
    const gaslessEnabled = process.env.GASLESS_ENABLED === "true";

    if (!gaslessEnabled) {
      return res.json({
        gaslessEnabled: false,
        message: "Gasless transactions are currently disabled",
      });
    }

    // Check user eligibility (simplified logic)
    const isEligible = await checkUserEligibility(userAddress);

    return res.json({
      gaslessEnabled: true,
      userEligible: isEligible,
      relayerUrl: process.env.NEXT_PUBLIC_RELAYER_URL,
      gameServerUrl: process.env.NEXT_PUBLIC_GAME_SERVER_URL,
      forwarderAddress: process.env.NEXT_PUBLIC_FORWARDER_ADDRESS,
      paymasterAddress: process.env.NEXT_PUBLIC_PAYMASTER_ADDRESS,
    });
  } catch (error) {
    console.error("Gasless status error:", error);
    return res.status(500).json({
      error: error.message,
      gaslessEnabled: false,
    });
  }
}

async function checkUserEligibility(userAddress) {
  // Simplified eligibility check
  // In production, you might check:
  // - User's transaction history
  // - Account age
  // - Reputation score
  // - Current balance

  if (!userAddress) {
    return false;
  }

  // For now, all users are eligible
  return true;
}
