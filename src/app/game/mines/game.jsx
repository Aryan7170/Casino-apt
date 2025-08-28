import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineVolumeUp,
  HiOutlineVolumeOff,
  HiOutlineInformationCircle,
} from "react-icons/hi";
import {
  FaRegGem,
  FaBomb,
  FaDiamond,
  FaQuestion,
  FaCoins,
  FaBullseye,
  FaClipboardCheck,
  FaDice,
  FaArrowLeft,
  FaArrowRight,
} from "react-icons/fa";
import { GiMineTruck, GiTreasureMap, GiCrystalGrowth } from "react-icons/gi";
import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDelegationToolkit } from "@/hooks/useDelegationToolkit";
import { minesContractAddress, minesABI } from "./config/contractDetails";
import { ethers } from "ethers";

const GRID_SIZES = {
  5: 5, // 5x5 grid - classic mode
};

const MINE_SPRITES = ["/images/bomb.png"];

const GEM_SPRITES = ["/images/diamond.png"];

// Sound effects URLs
const SOUNDS = {
  click: "/sounds/click.mp3",
  reveal: "/sounds/reveal.mp3",
  gem: "/sounds/gem.mp3",
  explosion: "/sounds/explosion.mp3",
  win: "/sounds/win.mp3",
  cashout: "/sounds/cashout.mp3",
  hover: "/sounds/hover.mp3",
  bet: "/sounds/bet.mp3",
};

const Game = ({ betSettings = {}, offChainGameProps = null }) => {
  // Game Settings
  const defaultSettings = {
    betAmount: 50,
    mines: 5,
    isAutoBetting: false,
    tilesToReveal: 5,
  };

  const settings = { ...defaultSettings, ...betSettings };
  const processedSettingsRef = useRef(null); // Track if current settings have been processed

  console.log("Settings object:", {
    defaultSettings,
    betSettings,
    mergedSettings: settings,
  });

  // Game State
  const [grid, setGrid] = useState([]);
  const [gridSize, setGridSize] = useState(GRID_SIZES[5]); // Default 5x5 grid
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [minesCount, setMinesCount] = useState(settings.mines);
  const [revealedCount, setRevealedCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [multiplier, setMultiplier] = useState(1.0);
  const [profit, setProfit] = useState(0);
  const [hasPlacedBet, setHasPlacedBet] = useState(false);
  const [isAutoBetting, setIsAutoBetting] = useState(settings.isAutoBetting);
  const [isGameInfoVisible, setIsGameInfoVisible] = useState(false);
  const [betAmount, setBetAmount] = useState(settings.betAmount);
  const [autoRevealInProgress, setAutoRevealInProgress] = useState(false);

  // Audio refs
  const audioRefs = {
    click: useRef(null),
    reveal: useRef(null),
    gem: useRef(null),
    explosion: useRef(null),
    win: useRef(null),
    cashout: useRef(null),
    hover: useRef(null),
    bet: useRef(null),
  };

  // Window size for Confetti
  const { width, height } = useWindowSize();

  // Calculate safe tiles
  const totalTiles = gridSize * gridSize;
  const safeTiles = totalTiles - minesCount;

  // Calculate next multiplier based on revealed count
  const calculateNextMultiplier = (revealed) => {
    const nextRevealed = revealed + 1;

    // Special case for very high mine counts (24 mines in 5x5 grid)
    if (safeTiles === 1 && nextRevealed === 1) {
      return 25.0; // Fixed high multiplier for the 1 safe tile
    }

    // Allow higher tile reveals for high mine counts
    const maxReveal = minesCount >= 20 ? safeTiles : 15;
    if (nextRevealed > maxReveal) return multiplier;

    // Formula: totalTiles / (totalTiles - minesCount - revealed)
    // Guard against division by zero or negative numbers
    const denominator = totalTiles - minesCount - nextRevealed;
    if (denominator <= 0) return multiplier;

    return parseFloat((totalTiles / denominator).toFixed(2));
  };

  // Calculate chance of hitting a mine
  const calculateMineChance = () => {
    // Edge cases
    if (revealedCount >= totalTiles) return 0; // All tiles revealed
    if (revealedCount >= safeTiles) return 100; // All safe tiles revealed, only mines left
    if (safeTiles <= 0) return 100; // No safe tiles
    if (minesCount <= 0) return 0; // No mines

    // Regular case: mines / unrevealed tiles
    const unrevealedTiles = totalTiles - revealedCount;
    if (unrevealedTiles <= 0) return 0;

    const chance = Math.round((minesCount / unrevealedTiles) * 100);
    return isNaN(chance) ? 0 : chance; // Guard against NaN
  };

  // Calculate current payout
  const calculatePayout = () => {
    return Math.round(betAmount * multiplier);
  };

  // Multiplier table (memoized to avoid recalculation)
  const multiplierTable = useMemo(() => {
    const table = [];

    // If we have very few or no safe tiles, show at least one entry
    if (safeTiles <= 1) {
      // For edge case with 1 safe tile (e.g., 24 mines in 5x5 grid)
      if (safeTiles === 1) {
        // Formula: totalTiles / (totalTiles - minesCount - 1)
        const denominator = totalTiles - minesCount - 1;
        if (denominator > 0) {
          const mult = parseFloat((totalTiles / denominator).toFixed(2));
          table.push({ tiles: 1, multiplier: mult });
        } else {
          // Fallback for impossible math case
          table.push({ tiles: 1, multiplier: 25.0 });
        }
      } else {
        // No safe tiles case (shouldn't happen, but just in case)
        table.push({ tiles: 1, multiplier: 1.0 });
      }
      return table;
    }

    // Show up to 15 tiles, or all safe tiles for high mine counts
    // For very high mine counts (20+), we'll show all possible safe tiles
    const maxTiles = minesCount >= 20 ? safeTiles : Math.min(15, safeTiles);

    for (let i = 1; i <= maxTiles; i++) {
      // Formula: totalTiles / (totalTiles - minesCount - revealed)
      // Make sure we don't divide by zero or negative numbers
      const denominator = totalTiles - minesCount - i;
      if (denominator <= 0) break;

      const mult = parseFloat((totalTiles / denominator).toFixed(2));
      table.push({ tiles: i, multiplier: mult });
    }

    return table;
  }, [minesCount, safeTiles, totalTiles]);

  // Play sound helper function
  const playSound = (sound) => {
    if (isMuted || !audioRefs[sound]?.current) return;

    // Reset sound to beginning if it's already playing
    audioRefs[sound].current.currentTime = 0;
    audioRefs[sound].current
      .play()
      .catch((error) => console.error("Sound play failed:", error));
  };

  // Initialize the grid
  const initializeGrid = (mines = minesCount) => {
    // Ensure mines count is valid (never more than totalTiles - 1)
    const validMines = Math.min(mines, totalTiles - 1);

    let newGrid = Array(gridSize)
      .fill()
      .map(() =>
        Array(gridSize)
          .fill()
          .map(() => ({
            isDiamond: false,
            isBomb: false,
            isRevealed: false,
            isHovered: false,
            spriteIndex: 0, // Always use the first sprite
          }))
      );

    let bombsPlaced = 0;
    while (bombsPlaced < validMines) {
      const row = Math.floor(Math.random() * gridSize);
      const col = Math.floor(Math.random() * gridSize);
      if (!newGrid[row][col].isBomb) {
        newGrid[row][col].isBomb = true;
        bombsPlaced++;
      }
    }

    // All non-bomb cells are diamonds (gems)
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (!newGrid[i][j].isBomb) {
          newGrid[i][j].isDiamond = true;
        }
      }
    }

    return newGrid;
  };

  // Initialize the game on component mount
  useEffect(() => {
    const size = GRID_SIZES[5];
    setGridSize(size);
    setGrid(initializeGrid());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset the game state when gridSize or minesCount changes
  useEffect(() => {
    if (isPlaying) return; // Don't reset while playing

    setGrid(initializeGrid(minesCount));
    setMultiplier(1.0);
    setProfit(0);
    setRevealedCount(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minesCount]); // Only depend on minesCount since gridSize is fixed at 5

  // Delegation Toolkit
  const {
    address,
    startGame: dtStartGame,
    revealTile: dtRevealTile,
    executeBatch: dtExecuteBatch,
    cashOut: dtCashOut,
    loading: dtLoading,
    error: dtError,
    isConnected,
  } = useDelegationToolkit();

  // Off-chain game props
  const {
    playMinesOffChain,
    offChainBalance,
    gameSession,
    isSessionActive,
    setOffChainError,
  } = offChainGameProps || {};

  // Determine if we should use off-chain or on-chain
  const useOffChain = !!offChainGameProps && isSessionActive;

  // Update state when bet settings change
  useEffect(() => {
    console.log("Game useEffect triggered with settings:", settings);

    // Get a string representation of settings to compare
    const settingsKey = JSON.stringify(settings);

    // Skip if we've already processed these exact settings
    if (processedSettingsRef.current === settingsKey) {
      console.log("Settings already processed, skipping");
      return;
    }

    // Check if we actually have settings to process and if they're different from defaults
    console.log("Checking conditions:", {
      hasKeys: Object.keys(settings).length > 0,
      settingsKey,
      defaultSettingsKey: JSON.stringify(defaultSettings),
      isDifferent: settingsKey !== JSON.stringify(defaultSettings),
    });

    // Check if we have actual bet settings (not just defaults)
    const hasActualBetSettings =
      betSettings && Object.keys(betSettings).length > 0;

    if (hasActualBetSettings) {
      console.log("Processing new settings:", settings);
      // Save current settings as processed
      processedSettingsRef.current = settingsKey;

      // Reset the game first without affecting hasPlacedBet
      // We'll update these manually to avoid infinite loops
      setGameOver(false);
      setGameWon(false);
      setGrid(initializeGrid(settings.mines));
      setMultiplier(1.0);
      setProfit(0);
      setRevealedCount(0);
      setAutoRevealInProgress(false);
      setShowConfetti(false);

      // Set state with new settings (convert strings to numbers)
      const minesCount = parseInt(settings.mines, 10);
      const betAmount = parseFloat(settings.betAmount);

      console.log("Converted settings:", {
        minesCount,
        betAmount,
        isAutoBetting: settings.isAutoBetting,
      });

      setMinesCount(minesCount);
      setBetAmount(betAmount);
      setIsAutoBetting(settings.isAutoBetting);

      // Start the game (off-chain or on-chain)
      console.log("Checking game mode:", { useOffChain, isConnected, address });

      if (useOffChain) {
        // Use off-chain gaming
        (async () => {
          try {
            console.log("Starting off-chain mines game:", {
              minesCount,
              betAmount,
            });

            const gameResult = await playMinesOffChain({
              betAmount,
              minesCount,
              action: "start",
            });

            console.log("Off-chain game started successfully:", gameResult);
            toast.success("Game started off-chain!");
            setIsPlaying(true);
            setHasPlacedBet(true);
            console.log(
              "Game state updated: isPlaying = true, hasPlacedBet = true"
            );
          } catch (e) {
            console.error("Failed to start off-chain game:", e);
            toast.error("Failed to start game: " + (e.message || e));
            if (setOffChainError) {
              setOffChainError(e.message || "Failed to start game");
            }
          }
        })();
      } else if (isConnected) {
        // Use on-chain gaming
        (async () => {
          try {
            console.log("Starting on-chain game with converted settings:", {
              minesCount,
              betAmount,
            });
            console.log("Calling dtStartGame...");
            await dtStartGame(
              minesCount,
              betAmount,
              minesContractAddress,
              minesABI
            );
            console.log("Game started successfully on-chain");
            toast.success("Game started on-chain!");
            setIsPlaying(true);
            setHasPlacedBet(true);
            console.log(
              "Game state updated: isPlaying = true, hasPlacedBet = true"
            );
          } catch (e) {
            console.error("Failed to start on-chain game:", e);
            toast.error("Failed to start game: " + (e.message || e));
          }
        })();
      } else {
        console.log("No gaming method available");
        toast.error("Please connect wallet or wait for session initialization");
      }

      // Special message if AI-assisted auto betting
      if (settings.isAutoBetting && settings.aiAssist) {
        toast.info(`AI-assisted auto betting activated`);
        toast.info(`Using advanced pattern recognition algorithms`);
      } else if (settings.isAutoBetting) {
        toast.info(
          `Auto betting mode: Will reveal ${settings.tilesToReveal || 5} tiles`
        );
      } else {
        toast.info(
          `Bet placed: ${settings.betAmount} APTC, ${settings.mines} mines`
        );
      }

      // If auto-betting is enabled, automatically reveal tiles after a short delay
      if (settings.isAutoBetting) {
        const tilesToReveal = settings.tilesToReveal || 5;

        setTimeout(() => {
          autoRevealTiles(tilesToReveal);
        }, 800);
      }
    }
  }, [settings, isConnected]); // eslint-disable-line react-hooks/exhaustive-deps

  // Event listeners for contract events
  useEffect(() => {
    if (!isConnected) return;

    // Create a provider for event listening
    const provider = new ethers.JsonRpcProvider(
      "https://rpc.sepolia.mantle.xyz"
    );
    const contract = new ethers.Contract(
      minesContractAddress,
      minesABI,
      provider
    );

    // GameStarted
    const onGameStarted = (player, betAmount, mines) => {
      toast.success(
        `Game started: Bet ${ethers.formatEther(
          betAmount
        )} MNT, Mines: ${mines}`
      );
      setIsPlaying(true);
      setHasPlacedBet(true);
      setGameOver(false);
      setGameWon(false);
      setShowConfetti(false);
    };
    // TileRevealed
    const onTileRevealed = (player, tile, isMine, revealedCount) => {
      if (isMine) {
        toast.error("Mine hit! Game over.");
        setGameOver(true);
        setIsPlaying(false);
      } else {
        toast.success(`Tile ${tile} revealed! Total: ${revealedCount}`);
        setRevealedCount(Number(revealedCount));
      }
    };
    // CashedOut
    const onCashedOut = (player, payout, revealedCount) => {
      toast.success(
        `Cashed out: ${ethers.formatEther(
          payout
        )} MNT after ${revealedCount} reveals!`
      );
      setIsPlaying(false);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    };
    // GameLost
    const onGameLost = (player, betAmount, revealedCount) => {
      toast.error(
        `Game lost after ${revealedCount} reveals. Bet: ${ethers.formatEther(
          betAmount
        )} MNT`
      );
      setGameOver(true);
      setIsPlaying(false);
    };
    // GameReset
    const onGameReset = (player) => {
      toast.info("Game reset.");
      setIsPlaying(false);
      setGameOver(false);
      setGameWon(false);
      setShowConfetti(false);
      setRevealedCount(0);
    };

    contract.on("GameStarted", onGameStarted);
    contract.on("TileRevealed", onTileRevealed);
    contract.on("CashedOut", onCashedOut);
    contract.on("GameLost", onGameLost);
    contract.on("GameReset", onGameReset);

    return () => {
      contract.off("GameStarted", onGameStarted);
      contract.off("TileRevealed", onTileRevealed);
      contract.off("CashedOut", onCashedOut);
      contract.off("GameLost", onGameLost);
      contract.off("GameReset", onGameReset);
    };
  }, [isConnected]);

  // Handle cell hover (for desktop)
  const handleCellHover = (row, col, isHovering) => {
    if (gameOver || gameWon || !isPlaying || grid[row][col].isRevealed) return;

    if (isHovering) playSound("hover");

    const newGrid = [...grid];
    newGrid[row][col].isHovered = isHovering;
    setGrid(newGrid);
  };

  // Reveal a specific cell
  const revealCell = (row, col) => {
    console.log("revealCell called:", {
      row,
      col,
      gameOver,
      gameWon,
      isPlaying,
      isRevealed: grid[row][col].isRevealed,
    });

    if (gameOver || gameWon || !isPlaying || grid[row][col].isRevealed) {
      console.log("revealCell blocked:", {
        gameOver,
        gameWon,
        isPlaying,
        isRevealed: grid[row][col].isRevealed,
      });
      return;
    }

    playSound("click");

    // Call contract revealTile or off-chain reveal
    if (useOffChain) {
      // Off-chain tile reveal
      (async () => {
        try {
          const tileIndex = row * gridSize + col;
          console.log("Revealing tile off-chain:", { tileIndex, row, col });

          const result = await playMinesOffChain({
            action: "reveal",
            tileIndex,
            row,
            col,
          });

          console.log("Off-chain tile reveal result:", result);
          // Handle the result based on what the server returns
          // The server should tell us if it's a mine or safe tile
        } catch (e) {
          console.error("Off-chain reveal error:", e);
          toast.error("Failed to reveal tile: " + (e.message || e));
          if (setOffChainError) {
            setOffChainError(e.message || "Failed to reveal tile");
          }
        }
      })();
    } else if (isConnected) {
      // On-chain tile reveal
      (async () => {
        try {
          const tileIndex = row * gridSize + col;
          console.log("Calling dtRevealTile with tile index:", tileIndex);
          await dtRevealTile(tileIndex, minesContractAddress, minesABI);
          toast.success("Tile revealed on-chain!");
        } catch (e) {
          console.error("revealTile error:", e);
          toast.error("Failed to reveal tile: " + (e.message || e));
        }
      })();
    } else {
      toast.error("Please connect wallet or wait for session initialization");
    }
    const newGrid = [...grid];
    newGrid[row][col].isRevealed = true;
    setGrid(newGrid);
    setTimeout(() => {
      if (grid[row][col].isBomb) {
        playSound("explosion");
        setGameOver(true);
        revealAll();
        toast.error("Game Over! You hit a mine!");
      } else if (grid[row][col].isDiamond) {
        playSound("gem");
        setRevealedCount((prev) => {
          const newCount = prev + 1;
          const maxTiles = minesCount >= 20 ? safeTiles : 15;
          if (newCount <= maxTiles) {
            const newMultiplier = calculateNextMultiplier(prev);
            setMultiplier(newMultiplier);
            setProfit(Math.round(betAmount * (newMultiplier - 1)));
          }
          if (newCount === safeTiles) {
            setGameWon(true);
            revealAll();
            playSound("win");
            setShowConfetti(true);
            toast.success("Congratulations! You revealed all safe tiles!");
            setTimeout(() => setShowConfetti(false), 5000);
          }
          return newCount;
        });
      }
    }, 200);
  };

  // Auto-reveal tiles (for auto betting)
  const autoRevealTiles = (count = settings.tilesToReveal) => {
    if (gameOver || gameWon || !isPlaying || autoRevealInProgress) return;
    setAutoRevealInProgress(true);
    const tilesToReveal = count || 5;
    const maxTiles =
      minesCount >= 20
        ? Math.min(safeTiles, tilesToReveal)
        : Math.min(15, tilesToReveal);
    let revealed = 0;
    let timerIds = [];
    toast.info("AI is making decisions...");
    const revealBatch = [];
    const unrevealedGems = [];
    grid.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (!cell.isRevealed && cell.isDiamond) {
          unrevealedGems.push([rowIndex, colIndex]);
        }
      });
    });
    for (let i = 0; i < Math.min(maxTiles, unrevealedGems.length); i++) {
      const [rowToReveal, colToReveal] = unrevealedGems[i];
      revealBatch.push(rowToReveal * gridSize + colToReveal);
    }
    if (isConnected) {
      (async () => {
        try {
          for (const tile of revealBatch) {
            await dtRevealTile(tile, minesContractAddress, minesABI);
          }
          await dtExecuteBatch(minesContractAddress, minesABI);
          toast.success("Batch reveal on-chain!");
        } catch (e) {
          toast.error("Batch reveal failed: " + (e.message || e));
        } finally {
          setAutoRevealInProgress(false);
        }
      })();
    } else {
      toast.error("Please connect MetaMask to play");
      setAutoRevealInProgress(false);
    }
  };

  // Reveal all cells (game over)
  const revealAll = () => {
    const newGrid = grid.map((row) =>
      row.map((cell) => ({
        ...cell,
        isRevealed: true,
      }))
    );
    setGrid(newGrid);
  };

  // Reset the game
  const resetGame = () => {
    playSound("click");

    // Update the processed settings ref when manually resetting
    processedSettingsRef.current = null;

    setIsPlaying(false);
    setGameOver(false);
    setGameWon(false);
    setGrid(initializeGrid(minesCount));
    setMultiplier(1.0);
    setProfit(0);
    setRevealedCount(0);
    setAutoRevealInProgress(false);
    setShowConfetti(false);

    // Don't reset hasPlacedBet here - we'll handle that in the Game Controls section
  };

  // Replace cashout logic with contract call
  const cashout = () => {
    if (!isPlaying || gameOver || gameWon || revealedCount === 0) return;
    playSound("cashout");
    setIsPlaying(false);

    if (useOffChain) {
      // Off-chain cashout
      (async () => {
        try {
          const result = await playMinesOffChain({
            action: "cashout",
            multiplier,
            profit,
          });
          console.log("Off-chain cashout result:", result);
          toast.success("Cashed out successfully!");
        } catch (e) {
          console.error("Off-chain cashout error:", e);
          toast.error("Cashout failed: " + (e.message || e));
          if (setOffChainError) {
            setOffChainError(e.message || "Cashout failed");
          }
        }
      })();
    } else if (isConnected) {
      // On-chain cashout
      (async () => {
        try {
          await dtCashOut(minesContractAddress, minesABI);
          toast.success("Cashed out on-chain!");
        } catch (e) {
          toast.error("Cashout failed: " + (e.message || e));
        }
      })();
    } else {
      toast.error("Please connect wallet or wait for session initialization");
    }
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Toggle game info
  const toggleGameInfo = () => {
    setIsGameInfoVisible(!isGameInfoVisible);
  };

  const adjustMinesCount = (delta) => {
    if (isPlaying) return;

    // For 5x5 grid, allow up to 24 mines (with 1 safe tile)
    const newCount = Math.max(1, Math.min(minesCount + delta, 24));
    setMinesCount(newCount);
  };

  // Cell content renderer
  const getCellContent = (cell) => {
    if (!cell.isRevealed) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <FaQuestion className="text-gray-400 text-xl md:text-2xl" />
        </div>
      );
    }

    if (cell.isBomb) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <Image
            src={MINE_SPRITES[cell.spriteIndex % MINE_SPRITES.length]}
            alt="Mine"
            width={64}
            height={64}
            className="w-10 h-10 md:w-12 md:h-12 object-contain"
          />
        </div>
      );
    }

    if (cell.isDiamond) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <Image
            src={GEM_SPRITES[cell.spriteIndex % GEM_SPRITES.length]}
            alt="Gem"
            width={64}
            height={64}
            className="w-10 h-10 md:w-12 md:h-12 object-contain"
          />
        </div>
      );
    }

    return null;
  };

  return (
    <div className="relative flex flex-col items-center w-full">
      {/* Audio elements */}
      {Object.entries(SOUNDS).map(([key, src]) => (
        <audio key={key} ref={audioRefs[key]} src={src} preload="auto" />
      ))}

      {/* Confetti animation for wins */}
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={300}
        />
      )}

      {/* Toast notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        theme="dark"
      />

      {/* Game information overlay */}
      <AnimatePresence>
        {isGameInfoVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute top-0 left-0 right-0 bottom-0 bg-black/90 backdrop-blur-sm z-50 p-6 overflow-auto"
          >
            <div className="max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                <GiMineTruck className="mr-2 text-red-500" /> How to Play Mines
              </h3>

              <div className="space-y-4 text-white/90">
                <p>
                  <strong>Objective:</strong> Reveal gem tiles while avoiding
                  hidden mines.
                </p>

                <div className="flex items-center gap-2 bg-gray-800/50 p-2 rounded">
                  <FaRegGem className="text-blue-400 text-xl" />
                  <span>
                    Gems are safe to click - each one increases your multiplier.
                  </span>
                </div>

                <div className="flex items-center gap-2 bg-gray-800/50 p-2 rounded">
                  <FaBomb className="text-red-500 text-xl" />
                  <span>
                    Mines end your game if clicked - you lose your bet.
                  </span>
                </div>

                <div className="flex items-center gap-2 bg-gray-800/50 p-2 rounded">
                  <FaCoins className="text-yellow-500 text-xl" />
                  <span>Cashout anytime to secure your winnings.</span>
                </div>

                <p>
                  <strong>Strategy:</strong> More mines mean higher risk but
                  bigger potential rewards.
                </p>

                <div className="border border-gray-700 rounded p-4">
                  <h4 className="text-lg font-semibold mb-2">Payout Formula</h4>
                  <p className="font-mono bg-gray-800/50 p-2 rounded text-sm">
                    multiplier = totalTiles / (totalTiles - mines -
                    revealedTiles)
                  </p>
                </div>
              </div>

              <button
                className="mt-6 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-medium"
                onClick={toggleGameInfo}
              >
                Got it!
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Header */}
      <div className="w-full flex flex-wrap justify-between items-center gap-2 mb-4">
        <div className="flex items-center space-x-3">
          <button
            className="p-2 rounded-full bg-purple-900/20 hover:bg-purple-900/40 transition-colors"
            onClick={toggleMute}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <HiOutlineVolumeOff className="text-white/70 text-xl" />
            ) : (
              <HiOutlineVolumeUp className="text-white/70 text-xl" />
            )}
          </button>

          <button
            className="p-2 rounded-full bg-blue-900/20 hover:bg-blue-900/40 transition-colors"
            onClick={toggleGameInfo}
            title="Game Info"
          >
            <HiOutlineInformationCircle className="text-white/70 text-xl" />
          </button>
        </div>

        <div className="flex items-center">
          <div className="text-sm text-white/70 mr-2">Mines:</div>
          <div className="flex items-center bg-gray-900/50 rounded overflow-hidden">
            <button
              className="px-2 py-1 bg-red-900/30 hover:bg-red-900/50 text-white disabled:opacity-50"
              onClick={() => adjustMinesCount(-1)}
              disabled={isPlaying || minesCount <= 1}
            >
              -
            </button>
            <div className="px-3 py-1 font-medium text-white">{minesCount}</div>
            <button
              className="px-2 py-1 bg-green-900/30 hover:bg-green-900/50 text-white disabled:opacity-50"
              onClick={() => adjustMinesCount(1)}
              disabled={isPlaying || minesCount >= 24}
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Game Stats */}
      <div className="w-full grid grid-cols-3 gap-2 mb-3">
        <div className="bg-gray-900/50 rounded p-2 text-center">
          <div className="text-xs text-white/50 mb-1">Chance of Mine</div>
          <div
            className={`text-lg font-bold ${
              calculateMineChance() > 50 ? "text-red-400" : "text-white"
            }`}
          >
            {calculateMineChance()}%
          </div>
        </div>

        <div className="bg-gray-900/50 rounded p-2 text-center">
          <div className="text-xs text-white/50 mb-1">Multiplier</div>
          <div className="text-lg font-bold text-yellow-400">
            {multiplier.toFixed(2)}x
          </div>
        </div>

        <div className="bg-gray-900/50 rounded p-2 text-center">
          <div className="text-xs text-white/50 mb-1">Profit</div>
          <div
            className={`text-lg font-bold ${
              profit > 0 ? "text-green-400" : "text-white"
            }`}
          >
            {profit > 0 ? "+" : ""}
            {profit}
          </div>
        </div>
      </div>

      {/* Game Grid */}
      <div
        className={`grid gap-1.5 w-full mb-3 mx-auto max-w-md`}
        style={{
          gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <motion.button
              key={`${rowIndex}-${colIndex}`}
              className={`
                aspect-square flex items-center justify-center rounded-lg 
                ${
                  cell.isRevealed
                    ? cell.isBomb
                      ? "bg-red-900/70"
                      : "bg-blue-600/30"
                    : cell.isHovered
                    ? "bg-purple-800/30"
                    : "bg-gray-900/70"
                }
                ${
                  !isPlaying
                    ? "cursor-not-allowed opacity-80"
                    : "cursor-pointer"
                }
                ${cell.isRevealed ? "" : "hover:bg-purple-800/30"}
                transition-colors duration-200 text-2xl
                border border-gray-800 shadow-lg
              `}
              onClick={() => isPlaying && revealCell(rowIndex, colIndex)}
              onMouseEnter={() => handleCellHover(rowIndex, colIndex, true)}
              onMouseLeave={() => handleCellHover(rowIndex, colIndex, false)}
              disabled={!isPlaying || cell.isRevealed || gameOver || gameWon}
              whileHover={{ scale: isPlaying && !cell.isRevealed ? 1.05 : 1 }}
              whileTap={{ scale: isPlaying && !cell.isRevealed ? 0.95 : 1 }}
              animate={{
                opacity: cell.isRevealed ? 1 : 0.9,
                scale: cell.isRevealed ? 1 : 1,
              }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              {getCellContent(cell)}
            </motion.button>
          ))
        )}
      </div>

      {/* Game Controls */}
      <div className="w-full space-y-2">
        {hasPlacedBet && (
          <div className="flex gap-3">
            <button
              onClick={cashout}
              disabled={!isPlaying || revealedCount === 0}
              className={`flex-1 py-3 ${
                isPlaying && revealedCount > 0
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  : "bg-gray-700 cursor-not-allowed"
              } rounded-lg text-white font-bold shadow-lg transition-all flex items-center justify-center gap-2`}
            >
              <FaCoins className="text-yellow-300" />
              <span>CASH OUT ({calculatePayout()} APTC)</span>
            </button>

            <button
              onClick={() => {
                resetGame();
                setHasPlacedBet(false); // Allow user to go back to the form
              }}
              className="flex-1 py-3 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg text-white font-bold shadow-lg hover:from-red-700 hover:to-orange-700 transition-all flex items-center justify-center gap-2"
            >
              <FaDice className="text-white" />
              <span>NEW GAME</span>
            </button>
          </div>
        )}

        {/* Game result message */}
        {(gameOver || gameWon) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-center py-1.5 rounded-lg ${
              gameWon
                ? "bg-green-900/30 text-green-400"
                : "bg-red-900/30 text-red-400"
            } font-bold`}
          >
            {gameWon
              ? "Congratulations! You won!"
              : "Game Over! You hit a mine!"}
          </motion.div>
        )}
      </div>

      {/* Multiplier Table */}
      <div className="w-full mt-2">
        <h3 className="text-white font-medium mb-2 flex items-center">
          <GiCrystalGrowth className="mr-2 text-blue-400" />
          Multiplier Table
        </h3>
        <div className="relative">
          {/* Scrollable multiplier table with improved styling and indicators */}
          <div className="bg-black/40 p-4 rounded-xl border border-gray-700/60 shadow-lg">
            {/* Shadow indicators with arrow icons for better UX */}
            <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none flex items-center justify-center">
              <FaArrowLeft className="text-purple-400 ml-2" />
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none flex items-center justify-center">
              <FaArrowRight className="text-purple-400 mr-2" />
            </div>

            <div className="overflow-x-auto pb-1">
              <div className="flex gap-3 min-w-max">
                {multiplierTable.map((item, index) => (
                  <div
                    key={index}
                    className={`min-w-[95px] p-2.5 text-center rounded-lg ${
                      item.tiles === revealedCount
                        ? "bg-gradient-to-br from-purple-700 to-purple-600 text-white font-bold shadow-lg shadow-purple-700/50 border-2 border-purple-500/80"
                        : "bg-gradient-to-br from-gray-800/90 to-gray-900/90 text-white/90 hover:bg-gray-700/90 transition-colors shadow-md border border-gray-700/50"
                    }`}
                  >
                    <div className="text-xs font-medium mb-1">
                      {item.tiles} Tiles
                    </div>
                    <div className="text-xl font-semibold">
                      {item.multiplier.toFixed(2)}x
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {safeTiles === 1 ? (
              <div className="text-xs text-center text-yellow-400 font-medium mt-3">
                Only 1 safe tile with a 25.00x multiplier!
              </div>
            ) : (
              multiplierTable.length > 6 && (
                <div className="text-xs text-center text-white/80 mt-3 flex items-center justify-center gap-2">
                  <FaArrowLeft className="text-purple-400" />
                  <span>Swipe to see more multipliers</span>
                  <FaArrowRight className="text-purple-400" />
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;
