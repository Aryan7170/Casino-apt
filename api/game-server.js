/**
 * Vercel Serverless Function for Off-Chain Game Server
 * Handles game sessions and provably fair gaming
 */

const crypto = require("crypto");

// Simple in-memory storage (in production, use a database)
const sessions = new Map();
const gameHistory = new Map();

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const { action } = req.body;

  try {
    switch (action) {
      case "initialize":
        return handleInitialize(req, res);
      case "playRoulette":
        return handlePlayRoulette(req, res);
      case "getHistory":
        return handleGetHistory(req, res);
      default:
        return res.status(400).json({ error: "Invalid action" });
    }
  } catch (error) {
    console.error("Game server error:", error);
    return res.status(500).json({ error: error.message });
  }
}

function handleInitialize(req, res) {
  const { userAddress } = req.body;

  const serverSeed = crypto.randomBytes(32).toString("hex");
  const serverSeedHash = crypto
    .createHash("sha256")
    .update(serverSeed)
    .digest("hex");
  const clientSeed = crypto.randomBytes(16).toString("hex");

  const session = {
    userAddress,
    serverSeed,
    serverSeedHash,
    clientSeed,
    nonce: 0,
    balance: 1000, // Starting balance
    created: Date.now(),
  };

  sessions.set(userAddress, session);

  return res.json({
    serverSeedHash,
    clientSeed,
    balance: session.balance,
  });
}

function handlePlayRoulette(req, res) {
  const { userAddress, bets } = req.body;
  const session = sessions.get(userAddress);

  if (!session) {
    return res.status(400).json({ error: "No active session" });
  }

  // Calculate total bet
  const totalBet = bets.reduce((sum, bet) => sum + bet.amount, 0);

  if (totalBet > session.balance) {
    return res.status(400).json({ error: "Insufficient balance" });
  }

  // Generate provably fair result
  const random = generateProvablyFairRandom(
    session.clientSeed,
    session.serverSeed,
    session.nonce
  );
  const result = Math.floor(random * 37); // 0-36

  // Calculate winnings (simplified roulette logic)
  let totalWinnings = 0;
  const betResults = bets.map((bet) => {
    let won = false;
    let payout = 0;

    switch (bet.type) {
      case "number":
        if (result === bet.value) {
          won = true;
          payout = bet.amount * 36;
        }
        break;
      case "red":
        const redNumbers = [
          1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
        ];
        if (redNumbers.includes(result)) {
          won = true;
          payout = bet.amount * 2;
        }
        break;
      case "black":
        const blackNumbers = [
          2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35,
        ];
        if (blackNumbers.includes(result)) {
          won = true;
          payout = bet.amount * 2;
        }
        break;
      // Add more bet types as needed
    }

    totalWinnings += payout;
    return { ...bet, won, payout };
  });

  // Update session
  session.balance = session.balance - totalBet + totalWinnings;
  session.nonce += 1;

  const gameResult = {
    result,
    betResults,
    totalBet,
    totalWinnings,
    newBalance: session.balance,
    nonce: session.nonce - 1,
    serverSeed: session.serverSeed, // Reveal for verification
    timestamp: Date.now(),
  };

  // Store in history
  if (!gameHistory.has(userAddress)) {
    gameHistory.set(userAddress, []);
  }
  gameHistory.get(userAddress).push(gameResult);

  return res.json({ gameResult });
}

function handleGetHistory(req, res) {
  const { userAddress } = req.body;
  const history = gameHistory.get(userAddress) || [];
  return res.json({ history });
}

function generateProvablyFairRandom(clientSeed, serverSeed, nonce) {
  const combined = `${clientSeed}:${serverSeed}:${nonce}`;
  const hash = crypto.createHash("sha256").update(combined).digest("hex");
  return parseInt(hash.substring(0, 8), 16) / 0xffffffff;
}
