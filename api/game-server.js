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
      case "playMines":
        return handlePlayMines(req, res);
      case "playWheel":
        return handlePlayWheel(req, res);
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

function handlePlayMines(req, res) {
  const { userAddress, betAmount, minesCount, revealedTiles } = req.body;
  const session = sessions.get(userAddress);

  if (!session) {
    return res.status(400).json({ error: "No active session" });
  }

  if (betAmount > session.balance) {
    return res.status(400).json({ error: "Insufficient balance" });
  }

  // Generate mine positions
  const random = generateProvablyFairRandom(
    session.clientSeed,
    session.serverSeed,
    session.nonce
  );

  // Generate mine positions based on random seed
  const minePositions = [];
  let tempRandom = random;
  for (let i = 0; i < minesCount; i++) {
    let position;
    do {
      tempRandom = (tempRandom * 1103515245 + 12345) % 2 ** 31;
      position = Math.floor((tempRandom / 2 ** 31) * 25);
    } while (minePositions.includes(position));
    minePositions.push(position);
  }

  // Check if revealed tiles hit mines
  const hitMine = revealedTiles.some((tile) => minePositions.includes(tile));

  // Calculate winnings
  let winnings = 0;
  if (!hitMine && revealedTiles.length > 0) {
    // Mines payout calculation: more revealed tiles = higher multiplier
    const safeSpots = 25 - minesCount;
    const multiplier = Math.pow(
      safeSpots / (safeSpots - revealedTiles.length),
      1.1
    );
    winnings = betAmount * multiplier;
  }

  // Update session
  session.balance = session.balance - betAmount + winnings;
  session.nonce += 1;

  const gameResult = {
    game: "mines",
    betAmount,
    winnings,
    newBalance: session.balance,
    hitMine,
    minePositions,
    revealedTiles,
    nonce: session.nonce - 1,
    serverSeed: session.serverSeed,
    timestamp: Date.now(),
  };

  // Store in history
  if (!gameHistory.has(userAddress)) {
    gameHistory.set(userAddress, []);
  }
  gameHistory.get(userAddress).push(gameResult);

  return res.json({ gameResult });
}

function handlePlayWheel(req, res) {
  const { userAddress, betAmount, selectedColor } = req.body;
  const session = sessions.get(userAddress);

  if (!session) {
    return res.status(400).json({ error: "No active session" });
  }

  if (betAmount > session.balance) {
    return res.status(400).json({ error: "Insufficient balance" });
  }

  // Generate wheel result
  const random = generateProvablyFairRandom(
    session.clientSeed,
    session.serverSeed,
    session.nonce
  );

  // Wheel segments: Red (1x), Blue (2x), Green (5x), Gold (10x)
  const segments = [
    { color: "red", multiplier: 1, weight: 15 },
    { color: "blue", multiplier: 2, weight: 10 },
    { color: "green", multiplier: 5, weight: 4 },
    { color: "gold", multiplier: 10, weight: 1 },
  ];

  // Calculate result based on weighted random
  let totalWeight = segments.reduce((sum, seg) => sum + seg.weight, 0);
  let randomWeight = random * totalWeight;
  let result = segments[0];

  for (const segment of segments) {
    if (randomWeight <= segment.weight) {
      result = segment;
      break;
    }
    randomWeight -= segment.weight;
  }

  // Calculate winnings
  let winnings = 0;
  if (selectedColor === result.color) {
    winnings = betAmount * result.multiplier;
  }

  // Update session
  session.balance = session.balance - betAmount + winnings;
  session.nonce += 1;

  const gameResult = {
    game: "wheel",
    betAmount,
    winnings,
    newBalance: session.balance,
    selectedColor,
    resultColor: result.color,
    multiplier: result.multiplier,
    won: selectedColor === result.color,
    nonce: session.nonce - 1,
    serverSeed: session.serverSeed,
    timestamp: Date.now(),
  };

  // Store in history
  if (!gameHistory.has(userAddress)) {
    gameHistory.set(userAddress, []);
  }
  gameHistory.get(userAddress).push(gameResult);

  return res.json({ gameResult });
}
