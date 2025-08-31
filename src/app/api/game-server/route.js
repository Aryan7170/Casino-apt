import { NextResponse } from 'next/server';
import crypto from 'crypto';

// In-memory storage for game sessions (in production, use Redis or database)
const gameSessions = new Map();
const gameHistory = new Map();

// Generate provably fair seeds
function generateSeeds() {
  const serverSeed = crypto.randomBytes(32).toString('hex');
  const serverSeedHash = crypto.createHash('sha256').update(serverSeed).digest('hex');
  const clientSeed = crypto.randomBytes(16).toString('hex');
  
  return { serverSeed, serverSeedHash, clientSeed };
}

// Calculate game results using provably fair algorithm
function calculateMinesResult(serverSeed, clientSeed, nonce, gameData) {
  const combinedSeed = `${serverSeed}:${clientSeed}:${nonce}`;
  const hash = crypto.createHash('sha256').update(combinedSeed).digest('hex');
  
  // Convert hash to random numbers for mine positions
  const minePositions = [];
  let hashIndex = 0;
  
  while (minePositions.length < gameData.mines && hashIndex < hash.length - 1) {
    const randomValue = parseInt(hash.substr(hashIndex, 2), 16);
    const position = randomValue % 25; // 5x5 grid
    
    if (!minePositions.includes(position)) {
      minePositions.push(position);
    }
    hashIndex += 2;
  }
  
  // Calculate if player's revealed tiles hit mines
  const revealedTiles = gameData.revealedTiles || [];
  const hitMine = revealedTiles.some(tile => minePositions.includes(tile));
  
  // Calculate multiplier based on tiles revealed and mines
  const totalTiles = 25;
  const safeTiles = totalTiles - gameData.mines;
  let multiplier = 1;
  
  if (!hitMine && revealedTiles.length > 0) {
    for (let i = 0; i < revealedTiles.length; i++) {
      multiplier *= (safeTiles - i) / (totalTiles - gameData.mines - i);
    }
    multiplier = Math.max(multiplier, 1.01); // Minimum multiplier
  } else if (hitMine) {
    multiplier = 0;
  }
  
  return {
    minePositions,
    revealedTiles,
    hitMine,
    multiplier,
    payout: hitMine ? 0 : gameData.betAmount * multiplier
  };
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, userAddress } = body;

    console.log('🎮 Game server request:', action, userAddress);

    switch (action) {
      case 'initialize': {
        if (!userAddress) {
          return NextResponse.json({ error: 'User address required' }, { status: 400 });
        }

        // Generate new session
        const { serverSeed, serverSeedHash, clientSeed } = generateSeeds();
        const sessionId = `${userAddress}_${Date.now()}`;
        
        const session = {
          userAddress,
          sessionId,
          serverSeed,
          serverSeedHash,
          clientSeed,
          nonce: 0,
          balance: 1000, // Starting balance
          createdAt: new Date().toISOString()
        };

        gameSessions.set(userAddress, session);
        
        // Initialize history if not exists
        if (!gameHistory.has(userAddress)) {
          gameHistory.set(userAddress, []);
        }

        console.log('✅ Session initialized for:', userAddress);
        
        return NextResponse.json({
          success: true,
          sessionId,
          serverSeedHash,
          clientSeed,
          balance: session.balance
        });
      }

      case 'playMines': {
        const session = gameSessions.get(userAddress);
        if (!session) {
          return NextResponse.json({ error: 'No active session' }, { status: 400 });
        }

        const { betAmount, mines, revealedTiles } = body;
        
        if (betAmount > session.balance) {
          return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
        }

        // Calculate game result
        const gameResult = calculateMinesResult(
          session.serverSeed,
          session.clientSeed,
          session.nonce,
          { betAmount, mines, revealedTiles }
        );

        // Update session
        session.nonce++;
        session.balance -= betAmount;
        session.balance += gameResult.payout;

        // Store game in history
        const gameRecord = {
          gameType: 'mines',
          betAmount,
          mines,
          revealedTiles,
          result: gameResult,
          newBalance: session.balance,
          timestamp: new Date().toISOString(),
          nonce: session.nonce - 1
        };

        const history = gameHistory.get(userAddress) || [];
        history.unshift(gameRecord);
        gameHistory.set(userAddress, history.slice(0, 100)); // Keep last 100 games

        console.log('🎯 Mines game played:', {
          user: userAddress,
          bet: betAmount,
          payout: gameResult.payout,
          balance: session.balance
        });

        return NextResponse.json({
          success: true,
          gameResult: {
            ...gameRecord,
            serverSeed: session.serverSeed, // Reveal server seed for verification
          }
        });
      }

      case 'playRoulette': {
        const session = gameSessions.get(userAddress);
        if (!session) {
          return NextResponse.json({ error: 'No active session' }, { status: 400 });
        }

        const { bets } = body;
        const totalBet = bets.reduce((sum, bet) => sum + bet.amount, 0);
        
        if (totalBet > session.balance) {
          return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
        }

        // Generate roulette result
        const combinedSeed = `${session.serverSeed}:${session.clientSeed}:${session.nonce}`;
        const hash = crypto.createHash('sha256').update(combinedSeed).digest('hex');
        const winningNumber = parseInt(hash.substr(0, 8), 16) % 37; // 0-36

        // Calculate winnings
        let totalWin = 0;
        bets.forEach(bet => {
          // Simplified roulette payout calculation
          if (bet.type === 'number' && bet.value === winningNumber) {
            totalWin += bet.amount * 35;
          } else if (bet.type === 'color') {
            const isRed = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(winningNumber);
            if ((bet.value === 'red' && isRed) || (bet.value === 'black' && !isRed && winningNumber !== 0)) {
              totalWin += bet.amount * 2;
            }
          }
          // Add more roulette bet types as needed
        });

        // Update session
        session.nonce++;
        session.balance -= totalBet;
        session.balance += totalWin;

        const gameRecord = {
          gameType: 'roulette',
          bets,
          winningNumber,
          totalBet,
          totalWin,
          newBalance: session.balance,
          timestamp: new Date().toISOString(),
          nonce: session.nonce - 1
        };

        const history = gameHistory.get(userAddress) || [];
        history.unshift(gameRecord);
        gameHistory.set(userAddress, history.slice(0, 100));

        return NextResponse.json({
          success: true,
          gameResult: gameRecord
        });
      }

      case 'getHistory': {
        const history = gameHistory.get(userAddress) || [];
        return NextResponse.json({
          success: true,
          history
        });
      }

      case 'getBalance': {
        const session = gameSessions.get(userAddress);
        if (!session) {
          return NextResponse.json({ error: 'No active session' }, { status: 400 });
        }

        return NextResponse.json({
          success: true,
          balance: session.balance
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('❌ Game server error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'Game server is running',
    timestamp: new Date().toISOString()
  });
}
