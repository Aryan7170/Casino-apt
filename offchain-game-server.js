const express = require("express");
const crypto = require("crypto");
const { ethers } = require("ethers");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const GaslessRelayerService = require("./gasless-relayer-service");

const app = express();
app.use(cors());
app.use(express.json());

// Server configuration
const SERVER_PORT = 3001;
const SERVER_PRIVATE_KEY =
  process.env.SERVER_PRIVATE_KEY ||
  "0x" + crypto.randomBytes(32).toString("hex");
const RPC_URL = process.env.RPC_URL || "https://rpc.sepolia.mantle.xyz";
const CASINO_WALLET_ADDRESS = process.env.CASINO_WALLET_ADDRESS;

// Initialize wallet
const provider = new ethers.JsonRpcProvider(RPC_URL);
const serverWallet = new ethers.Wallet(SERVER_PRIVATE_KEY, provider);

// Initialize gasless relayer service
let gaslessRelayer;
try {
  gaslessRelayer = new GaslessRelayerService();
  console.log("✅ Gasless relayer service initialized");
} catch (error) {
  console.warn("⚠️ Gasless relayer not available:", error.message);
}

console.log("🎲 Casino Game Server Starting...");
console.log("Server Address:", serverWallet.address);
console.log("Casino Wallet Contract:", CASINO_WALLET_ADDRESS);

// Initialize SQLite database
const dbPath = path.join(__dirname, "casino_database.db");
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
  // User balances table
  db.run(`CREATE TABLE IF NOT EXISTS user_balances (
        address TEXT PRIMARY KEY,
        balance REAL DEFAULT 0,
        total_deposited REAL DEFAULT 0,
        total_wagered REAL DEFAULT 0,
        total_won REAL DEFAULT 0,
        games_played INTEGER DEFAULT 0,
        last_activity DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

  // Game history table
  db.run(`CREATE TABLE IF NOT EXISTS game_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player_address TEXT NOT NULL,
        game_type TEXT NOT NULL,
        bet_amount REAL NOT NULL,
        win_amount REAL NOT NULL,
        client_seed TEXT NOT NULL,
        server_seed TEXT NOT NULL,
        server_seed_hash TEXT NOT NULL,
        nonce INTEGER NOT NULL,
        result_data TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (player_address) REFERENCES user_balances(address)
    )`);

  // Withdrawal requests table
  db.run(`CREATE TABLE IF NOT EXISTS withdrawal_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player_address TEXT NOT NULL,
        amount REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        balance_proof TEXT,
        signature TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        processed_at DATETIME,
        FOREIGN KEY (player_address) REFERENCES user_balances(address)
    )`);

  console.log("📊 Database initialized successfully");
});

// Game state storage (in-memory for sessions)
const gameStore = new Map();
const serverSeeds = new Map();

// Database helper functions
function getUserBalance(address) {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT * FROM user_balances WHERE address = ?",
      [address],
      (err, row) => {
        if (err) reject(err);
        else resolve(row || { address, balance: 0, total_deposited: 0 });
      }
    );
  });
}

function updateUserBalance(address, newBalance, gameData = null) {
  return new Promise((resolve, reject) => {
    // First ensure user exists
    db.run(
      `INSERT OR IGNORE INTO user_balances (address, balance) VALUES (?, ?)`,
      [address, 0],
      (err) => {
        if (err) return reject(err);

        // Update balance and stats
        let updateQuery = `UPDATE user_balances SET 
                          balance = ?, 
                          last_activity = CURRENT_TIMESTAMP`;
        let params = [newBalance, address];

        if (gameData) {
          updateQuery += `, total_wagered = total_wagered + ?, 
                          total_won = total_won + ?, 
                          games_played = games_played + 1`;
          params.unshift(gameData.betAmount, gameData.winAmount);
        }

        updateQuery += ` WHERE address = ?`;

        db.run(updateQuery, params, (err) => {
          if (err) reject(err);
          else resolve();
        });
      }
    );
  });
}

function addGameToHistory(gameData) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO game_history 
       (player_address, game_type, bet_amount, win_amount, client_seed, 
        server_seed, server_seed_hash, nonce, result_data) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        gameData.playerAddress,
        gameData.gameType,
        gameData.betAmount,
        gameData.winAmount,
        gameData.clientSeed,
        gameData.serverSeed,
        gameData.serverSeedHash,
        gameData.nonce,
        JSON.stringify(gameData.result),
      ],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
}

function recordDeposit(address, amount) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT OR IGNORE INTO user_balances (address, balance) VALUES (?, ?)`,
      [address, 0],
      (err) => {
        if (err) return reject(err);

        db.run(
          `UPDATE user_balances SET 
           balance = balance + ?, 
           total_deposited = total_deposited + ?,
           last_activity = CURRENT_TIMESTAMP 
           WHERE address = ?`,
          [amount, amount, address],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      }
    );
  });
}

/**
 * Generate provably fair random number using client seed, server seed, and nonce
 * This follows the same pattern as Stake.com
 */
function generateProvablyFairRandom(clientSeed, serverSeed, nonce) {
  const combined = `${clientSeed}:${serverSeed}:${nonce}`;
  const hash = crypto.createHash("sha256").update(combined).digest("hex");

  // Convert to number between 0 and 1
  const randomValue = parseInt(hash.substring(0, 8), 16) / 0xffffffff;
  return randomValue;
}

/**
 * Generate server seed and its hash
 */
function generateServerSeed() {
  const seed = crypto.randomBytes(32).toString("hex");
  const hash = crypto.createHash("sha256").update(seed).digest("hex");
  return { seed, hash };
}

/**
 * Roulette game logic
 */
function playRoulette(clientSeed, serverSeed, nonce, bets) {
  const random = generateProvablyFairRandom(clientSeed, serverSeed, nonce);
  const result = Math.floor(random * 37); // 0-36

  let totalBetAmount = 0;
  let totalWinAmount = 0;

  const betResults = bets.map((bet) => {
    totalBetAmount += bet.amount;

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
      case "odd":
        if (result > 0 && result % 2 === 1) {
          won = true;
          payout = bet.amount * 2;
        }
        break;
      case "even":
        if (result > 0 && result % 2 === 0) {
          won = true;
          payout = bet.amount * 2;
        }
        break;
      case "low": // 1-18
        if (result >= 1 && result <= 18) {
          won = true;
          payout = bet.amount * 2;
        }
        break;
      case "high": // 19-36
        if (result >= 19 && result <= 36) {
          won = true;
          payout = bet.amount * 2;
        }
        break;
    }

    totalWinAmount += payout;

    return {
      type: bet.type,
      value: bet.value,
      amount: bet.amount,
      won,
      payout,
    };
  });

  return {
    result,
    betResults,
    totalBetAmount,
    totalWinAmount,
    randomValue: random,
  };
}

/**
 * Mines game logic
 */
function playMines(clientSeed, serverSeed, nonce, mineCount, betAmount) {
  const gridSize = 25;
  const random = generateProvablyFairRandom(clientSeed, serverSeed, nonce);

  // Generate mine positions
  const mines = new Set();
  let seed = random;

  while (mines.size < mineCount) {
    seed = generateProvablyFairRandom(
      clientSeed,
      serverSeed,
      nonce + mines.size
    );
    const position = Math.floor(seed * gridSize);
    mines.add(position);
  }

  // Calculate multipliers for each safe tile
  const safeCount = gridSize - mineCount;
  const multipliers = [];

  for (let i = 1; i <= safeCount; i++) {
    const multiplier = (gridSize / (gridSize - mineCount)) ** i;
    multipliers.push(multiplier);
  }

  return {
    mines: Array.from(mines),
    multipliers,
    gridSize,
    mineCount,
    safeCount,
    randomValue: random,
  };
}

/**
 * Plinko game logic
 */
function playPlinko(clientSeed, serverSeed, nonce, betAmount, risk = "medium") {
  const rows = 16;
  let position = rows / 2; // Start in middle

  // Generate path
  const path = [];
  for (let i = 0; i < rows; i++) {
    const random = generateProvablyFairRandom(
      clientSeed,
      serverSeed,
      nonce + i
    );
    const direction = random < 0.5 ? -0.5 : 0.5;
    position += direction;
    path.push(position);
  }

  // Final bucket
  const bucket = Math.floor(position);

  // Multipliers based on risk level
  const multipliers = {
    low: [1.5, 1.3, 1.1, 1.0, 0.5, 0.3, 0.5, 1.0, 1.1, 1.3, 1.5],
    medium: [10, 3, 1.5, 1.2, 0.7, 0.4, 0.7, 1.2, 1.5, 3, 10],
    high: [50, 12, 4, 2, 0.2, 0.1, 0.2, 2, 4, 12, 50],
  };

  const bucketMultipliers = multipliers[risk] || multipliers.medium;
  const multiplier =
    bucketMultipliers[Math.min(bucket, bucketMultipliers.length - 1)] || 0;
  const winAmount = betAmount * multiplier;

  return {
    path,
    bucket,
    multiplier,
    winAmount,
    betAmount,
  };
}

// API Routes

/**
 * Initialize game session
 */
app.post("/api/game/init", async (req, res) => {
  try {
    const { playerAddress, gameType } = req.body;

    if (!playerAddress || !gameType) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Generate server seed
    const { seed: serverSeed, hash: serverSeedHash } = generateServerSeed();

    // Store server seed (to be revealed later)
    const sessionId = crypto.randomBytes(16).toString("hex");
    serverSeeds.set(sessionId, serverSeed);

    // Initialize game session
    gameStore.set(sessionId, {
      playerAddress,
      gameType,
      serverSeedHash,
      created: Date.now(),
      status: "initialized",
    });

    // Get current user balance
    const userBalance = await getUserBalance(playerAddress);

    res.json({
      sessionId,
      serverSeedHash,
      serverAddress: serverWallet.address,
      currentBalance: userBalance.balance,
    });
  } catch (error) {
    console.error("Game init error:", error);
    res.status(500).json({ error: "Failed to initialize game" });
  }
});

/**
 * Handle user deposit notification (called when deposit transaction is confirmed)
 */
app.post("/api/deposit", async (req, res) => {
  try {
    const { playerAddress, amount } = req.body;

    if (!playerAddress || !amount) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Record deposit in database
    await recordDeposit(playerAddress, parseFloat(amount));

    // Get updated balance
    const userBalance = await getUserBalance(playerAddress);

    res.json({
      success: true,
      newBalance: userBalance.balance,
      totalDeposited: userBalance.total_deposited,
    });
  } catch (error) {
    console.error("Deposit recording error:", error);
    res.status(500).json({ error: "Failed to record deposit" });
  }
});

/**
 * Get user balance and stats
 */
app.get("/api/balance/:address", async (req, res) => {
  try {
    const { address } = req.params;
    const userBalance = await getUserBalance(address);

    res.json({
      balance: userBalance.balance,
      totalDeposited: userBalance.total_deposited,
      totalWagered: userBalance.total_wagered,
      totalWon: userBalance.total_won,
      gamesPlayed: userBalance.games_played,
    });
  } catch (error) {
    console.error("Balance fetch error:", error);
    res.status(500).json({ error: "Failed to fetch balance" });
  }
});

/**
 * Play roulette
 */
app.post("/api/game/roulette", async (req, res) => {
  try {
    const { sessionId, clientSeed, nonce, bets } = req.body;

    const session = gameStore.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    const serverSeed = serverSeeds.get(sessionId);

    // Check user balance
    const userBalance = await getUserBalance(session.playerAddress);
    const totalBetAmount = bets.reduce((sum, bet) => sum + bet.amount, 0);

    if (userBalance.balance < totalBetAmount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    // Play the game
    const gameResult = playRoulette(clientSeed, serverSeed, nonce, bets);

    // Calculate new balance (subtract bet, add winnings)
    const newBalance =
      userBalance.balance - totalBetAmount + gameResult.totalWinAmount;

    // Update balance in database
    await updateUserBalance(session.playerAddress, newBalance, {
      betAmount: totalBetAmount,
      winAmount: gameResult.totalWinAmount,
    });

    // Add to game history
    await addGameToHistory({
      playerAddress: session.playerAddress,
      gameType: "roulette",
      betAmount: totalBetAmount,
      winAmount: gameResult.totalWinAmount,
      clientSeed: clientSeed,
      serverSeed: serverSeed,
      serverSeedHash: session.serverSeedHash,
      nonce: nonce,
      result: gameResult,
    });

    res.json({
      gameResult,
      newBalance,
      serverSeed: serverSeed, // Reveal server seed immediately for transparency
      balanceChange: gameResult.totalWinAmount - totalBetAmount,
    });
  } catch (error) {
    console.error("Roulette game error:", error);
    res.status(500).json({ error: "Failed to play roulette" });
  }
});

/**
 * Play mines
 */
app.post("/api/game/mines", async (req, res) => {
  try {
    const { playerAddress, clientSeed, mineCount, betAmount } = req.body;

    if (!playerAddress || !betAmount || !mineCount || !clientSeed) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    // Check user balance
    const userBalance = await getUserBalance(playerAddress);

    if (userBalance.balance < betAmount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    // Generate server seed and nonce
    const serverSeed = ethers.keccak256(ethers.randomBytes(32));
    const nonce = userBalance.games_played + 1;

    // For mines, we return the initial setup
    // Player will reveal tiles and cash out or hit mine
    const gameResult = playMines(
      clientSeed,
      serverSeed,
      nonce,
      mineCount,
      betAmount
    );

    // Deduct bet amount from balance (will be updated on cashout/bust)
    const newBalance = userBalance.balance - betAmount;
    await updateUserBalance(playerAddress, newBalance);

    // Store temporary game state
    gameStore.set(playerAddress, {
      gameType: "mines",
      betAmount,
      mineCount,
      gameResult,
      clientSeed,
      serverSeed,
      nonce,
      startTime: Date.now(),
    });

    res.json({
      success: true,
      gameResult: {
        gameId: playerAddress,
        grid: gameResult.grid,
        canCashout: true,
      },
      newBalance,
      clientSeed,
      serverSeed,
      nonce,
    });
  } catch (error) {
    console.error("Mines game error:", error);
    res.status(500).json({ error: "Failed to play mines" });
  }
});

/**
 * Cash out mines game
 */
app.post("/api/game/mines/cashout", async (req, res) => {
  try {
    const { playerAddress, revealedTiles } = req.body;

    const gameState = gameStore.get(playerAddress);
    if (!gameState || gameState.gameType !== "mines") {
      return res.status(404).json({ error: "Game session not found" });
    }

    const { gameResult, betAmount, clientSeed, serverSeed, nonce } = gameState;

    // Check if any revealed tiles are mines
    const hitMine = revealedTiles.some((tile) =>
      gameResult.mines.includes(tile)
    );

    let payout = 0;
    let profit = -betAmount; // Default to loss

    if (!hitMine) {
      // Calculate payout based on revealed safe tiles
      const safeRevealed = revealedTiles.length;
      const multiplier = gameResult.multipliers[safeRevealed - 1] || 0;
      payout = betAmount * multiplier;
      profit = payout - betAmount;
    }

    // Get current balance and add payout
    const userBalance = await getUserBalance(playerAddress);
    const newBalance = userBalance.balance + payout;

    // Update balance
    await updateUserBalance(playerAddress, newBalance);

    // Update user stats
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE user_balances 
         SET total_wagered = total_wagered + ?, 
             games_played = games_played + 1 
         WHERE address = ?`,
        [betAmount, playerAddress],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Store game history
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO game_history 
         (player_address, game_type, bet_amount, payout, profit, client_seed, server_seed, nonce, game_data) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          playerAddress,
          "mines",
          betAmount,
          payout,
          profit,
          clientSeed,
          serverSeed,
          nonce,
          JSON.stringify({
            mineCount: gameState.mineCount,
            mines: gameResult.mines,
            revealedTiles,
            hitMine,
            multiplier: hitMine
              ? 0
              : gameResult.multipliers[revealedTiles.length - 1],
          }),
        ],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Clear game state
    gameStore.delete(playerAddress);

    res.json({
      success: true,
      result: {
        won: !hitMine,
        payout,
        profit,
        mines: gameResult.mines,
        revealedTiles,
        hitMine,
      },
      newBalance,
      serverSeed,
    });
  } catch (error) {
    console.error("Mines cashout error:", error);
    res.status(500).json({ error: "Failed to cash out mines game" });
  }
});

/**
 * Play plinko
 */
app.post("/api/game/plinko", async (req, res) => {
  try {
    const { playerAddress, clientSeed, betAmount, risk } = req.body;

    if (!playerAddress || !betAmount || !risk || !clientSeed) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    // Check user balance
    const userBalance = await getUserBalance(playerAddress);

    if (userBalance.balance < betAmount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    // Generate server seed and nonce
    const serverSeed = ethers.keccak256(ethers.randomBytes(32));
    const nonce = userBalance.games_played + 1;

    // Play the game
    const gameResult = playPlinko(
      clientSeed,
      serverSeed,
      nonce,
      betAmount,
      risk
    );

    // Calculate new balance
    const newBalance = userBalance.balance - betAmount + gameResult.winAmount;

    // Update balance
    await updateUserBalance(playerAddress, newBalance);

    // Update user stats
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE user_balances 
         SET total_wagered = total_wagered + ?, 
             games_played = games_played + 1 
         WHERE address = ?`,
        [betAmount, playerAddress],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Store game history
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO game_history 
         (player_address, game_type, bet_amount, payout, profit, client_seed, server_seed, nonce, game_data) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          playerAddress,
          "plinko",
          betAmount,
          gameResult.winAmount,
          gameResult.winAmount - betAmount,
          clientSeed,
          serverSeed,
          nonce,
          JSON.stringify({
            ballPath: gameResult.ballPath,
            multiplier: gameResult.multiplier,
            risk,
          }),
        ],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    res.json({
      success: true,
      gameResult,
      newBalance,
      clientSeed,
      serverSeed,
      nonce,
    });
  } catch (error) {
    console.error("Plinko game error:", error);
    res.status(500).json({ error: "Failed to play plinko" });
  }
});
"address",
  "string",
  "uint256",
  /**
   * Request withdrawal
   */
  app.post("/api/withdraw/request", async (req, res) => {
    try {
      const { playerAddress, amount } = req.body;

      if (!playerAddress || !amount || amount <= 0) {
        return res.status(400).json({ error: "Invalid withdrawal request" });
      }

      // Check user balance
      const userBalance = await getUserBalance(playerAddress);

      if (userBalance.balance < amount) {
        return res.status(400).json({ error: "Insufficient balance" });
      }

      // Create withdrawal request
      const withdrawalRequest = {
        player: playerAddress,
        amount: amount,
        timestamp: Math.floor(Date.now() / 1000),
        offChainBalanceProof: JSON.stringify({
          currentBalance: userBalance.balance,
          requestedAmount: amount,
          totalDeposited: userBalance.total_deposited,
          totalWagered: userBalance.total_wagered,
          gamesPlayed: userBalance.games_played,
        }),
      };

      // Sign the withdrawal request
      const messageHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["address", "uint256", "uint256", "string"],
          [
            withdrawalRequest.player,
            withdrawalRequest.amount,
            withdrawalRequest.timestamp,
            withdrawalRequest.offChainBalanceProof,
          ]
        )
      );

      const signature = await serverWallet.signMessage(
        ethers.getBytes(messageHash)
      );

      // Store withdrawal request in database
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO withdrawal_requests 
         (player_address, amount, balance_proof, signature) 
         VALUES (?, ?, ?, ?)`,
          [
            playerAddress,
            amount,
            withdrawalRequest.offChainBalanceProof,
            signature,
          ],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      // Update user balance (subtract withdrawal amount)
      await updateUserBalance(playerAddress, userBalance.balance - amount);

      res.json({
        success: true,
        withdrawalRequest,
        signature,
        newBalance: userBalance.balance - amount,
        message: "Withdrawal request created. Process on-chain to complete.",
      });
    } catch (error) {
      console.error("Withdrawal request error:", error);
      res.status(500).json({ error: "Failed to create withdrawal request" });
    }
  });

/**
 * Gasless deposit endpoint
 */
app.post("/api/deposit/gasless", async (req, res) => {
  try {
    const {
      playerAddress,
      amount,
      signature,
      permitDeadline,
      permitV,
      permitR,
      permitS,
    } = req.body;

    if (!gaslessRelayer) {
      return res
        .status(503)
        .json({ error: "Gasless transactions not available" });
    }

    if (!playerAddress || !amount || !signature) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    console.log(
      `🔄 Processing gasless deposit for ${playerAddress}: ${amount} tokens`
    );

    // Process the gasless deposit through relayer
    const result = await gaslessRelayer.processGaslessDeposit({
      player: playerAddress,
      amount: amount,
      signature: signature,
      permitDeadline: permitDeadline,
      permitV: permitV,
      permitR: permitR,
      permitS: permitS,
    });

    if (result.success) {
      // Update off-chain balance
      const userBalance = await getUserBalance(playerAddress);
      const newBalance = userBalance.balance + parseFloat(amount);

      await updateUserBalance(playerAddress, newBalance);

      // Update deposit tracking
      await new Promise((resolve, reject) => {
        db.run(
          `UPDATE user_balances 
           SET total_deposited = total_deposited + ? 
           WHERE address = ?`,
          [amount, playerAddress],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      res.json({
        success: true,
        txHash: result.txHash,
        newBalance: newBalance,
        gasUsed: result.gasUsed,
        message: "Gasless deposit completed successfully",
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    console.error("Gasless deposit error:", error);
    res.status(500).json({ error: "Failed to process gasless deposit" });
  }
});

/**
 * Gasless withdrawal endpoint
 */
app.post("/api/withdraw/gasless", async (req, res) => {
  try {
    const { playerAddress, amount, userSignature } = req.body;

    if (!gaslessRelayer) {
      return res
        .status(503)
        .json({ error: "Gasless transactions not available" });
    }

    if (!playerAddress || !amount || !userSignature) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    // Check user balance
    const userBalance = await getUserBalance(playerAddress);

    if (userBalance.balance < amount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    // Create balance proof
    const offChainBalanceProof = JSON.stringify({
      currentBalance: userBalance.balance,
      requestedAmount: amount,
      totalDeposited: userBalance.total_deposited,
      totalWagered: userBalance.total_wagered,
      gamesPlayed: userBalance.games_played,
    });

    // Create server signature for withdrawal
    const withdrawalRequest = {
      player: playerAddress,
      amount: amount,
      nonce: await gaslessRelayer.getUserNonce(playerAddress),
      deadline: Math.floor(Date.now() / 1000) + 3600,
      offChainBalanceProof: offChainBalanceProof,
    };

    const messageHash = ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(
        ["address", "uint256", "uint256", "uint256", "string"],
        [
          withdrawalRequest.player,
          ethers.parseEther(withdrawalRequest.amount.toString()),
          withdrawalRequest.nonce,
          withdrawalRequest.deadline,
          withdrawalRequest.offChainBalanceProof,
        ]
      )
    );

    const serverSignature = await serverWallet.signMessage(
      ethers.getBytes(messageHash)
    );

    console.log(
      `🔄 Processing gasless withdrawal for ${playerAddress}: ${amount} tokens`
    );

    // Process the gasless withdrawal through relayer
    const result = await gaslessRelayer.processGaslessWithdrawal({
      player: playerAddress,
      amount: amount,
      offChainBalanceProof: offChainBalanceProof,
      userSignature: userSignature,
      serverSignature: serverSignature,
    });

    if (result.success) {
      // Update off-chain balance
      const newBalance = userBalance.balance - parseFloat(amount);
      await updateUserBalance(playerAddress, newBalance);

      // Store withdrawal record
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO withdrawal_requests 
           (player_address, amount, balance_proof, signature) 
           VALUES (?, ?, ?, ?)`,
          [playerAddress, amount, offChainBalanceProof, serverSignature],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      res.json({
        success: true,
        txHash: result.txHash,
        newBalance: newBalance,
        gasUsed: result.gasUsed,
        message: "Gasless withdrawal completed successfully",
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    console.error("Gasless withdrawal error:", error);
    res.status(500).json({ error: "Failed to process gasless withdrawal" });
  }
});

/**
 * Get withdrawal history
 */
app.get("/api/withdraw/history/:address", async (req, res) => {
  try {
    const { address } = req.params;

    const withdrawals = await new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM withdrawal_requests 
         WHERE player_address = ? 
         ORDER BY timestamp DESC 
         LIMIT 50`,
        [address],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    res.json({ withdrawals });
  } catch (error) {
    console.error("Withdrawal history error:", error);
    res.status(500).json({ error: "Failed to fetch withdrawal history" });
  }
});

/**
 * Get game history
 */
app.get("/api/games/history/:address", async (req, res) => {
  try {
    const { address } = req.params;
    const { limit = 50 } = req.query;

    const games = await new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM game_history 
         WHERE player_address = ? 
         ORDER BY timestamp DESC 
         LIMIT ?`,
        [address, parseInt(limit)],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    res.json({ games });
  } catch (error) {
    console.error("Game history error:", error);
    res.status(500).json({ error: "Failed to fetch game history" });
  }
});

/**
 * Verify game result (for transparency)
 */
app.post("/api/verify", (req, res) => {
  try {
    const { clientSeed, serverSeed, nonce, gameType, gameParams } = req.body;

    let result;
    switch (gameType) {
      case "roulette":
        result = playRoulette(clientSeed, serverSeed, nonce, gameParams.bets);
        break;
      case "mines":
        result = playMines(
          clientSeed,
          serverSeed,
          nonce,
          gameParams.mineCount,
          gameParams.betAmount
        );
        break;
      case "plinko":
        result = playPlinko(
          clientSeed,
          serverSeed,
          nonce,
          gameParams.betAmount,
          gameParams.risk
        );
        break;
      default:
        return res.status(400).json({ error: "Invalid game type" });
    }

    res.json({
      verified: true,
      result,
    });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ error: "Failed to verify game" });
  }
});

/**
 * Get server stats
 */
app.get("/api/stats", (req, res) => {
  res.json({
    activeGames: gameStore.size,
    serverAddress: serverWallet.address,
    timestamp: Date.now(),
  });
});

// Start server
app.listen(SERVER_PORT, () => {
  console.log(`🚀 Casino Game Server running on port ${SERVER_PORT}`);
  console.log(`🔗 API Base URL: http://localhost:${SERVER_PORT}/api`);
});

module.exports = app;
