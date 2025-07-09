"use client";
import React, { useState, useReducer, useMemo, useEffect, useRef, useCallback } from "react";
import { Box, Typography, IconButton, CircularProgress } from "@mui/material";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import { ThemeProvider, styled, createTheme } from "@mui/material/styles";
import InfoIcon from "@mui/icons-material/Info";
import ClearIcon from "@mui/icons-material/Clear";
import UndoIcon from "@mui/icons-material/Undo";
import Grid from "@mui/material/Unstable_Grid2"; // Grid version 2
import ParentSize from "@visx/responsive/lib/components/ParentSize";
import currency from "currency.js";
import TextFieldCurrency from "@/components/TextFieldCurrency";
import Button from "@/components/Button";
import { rouletteTutorial, rouletteOdds } from "./tutorials";
import {
  rouletteABI,
  rouletteContractAddress,
  tokenABI,
  tokenContractAddress,
} from "./contractDetails";
import * as ViemClient from "./ViemClient";
import { getContract, parseEther, waitForTransactionReceipt } from "viem";
import { muiStyles } from "./styles";
import Image from "next/image";
import MuiAlert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import GameDetail from "../../../components/GameDetail";
import { gameData, bettingTableData } from "./config/gameDetail";
import { useToken } from "@/hooks/useToken";
import BettingHistory from '@/components/BettingHistory';
import useWalletStatus from '@/hooks/useWalletStatus';
import { FaVolumeMute, FaVolumeUp } from "react-icons/fa";
import { TreasuryUI } from '../../../components/TreasuryUI';
import { TreasuryTest } from '../../../components/TreasuryTest';
import { TreasuryManager } from '../../../components/TreasuryManager';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";


// Debug imports
console.log("ViemClient:", ViemClient);
console.log("publicBinanceTestnetClient:", ViemClient.publicBinanceTestnetClient);

const TooltipWide = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: 800,
  },
});

const BetType = {
  NUMBER: 0,    // Single number (35:1)
  COLOR: 1,     // Red/Black (1:1)
  ODDEVEN: 2,   // Odd/Even (1:1)
  HIGHLOW: 3,   // 1-18/19-36 (1:1)
  DOZEN: 4,     // 1-12, 13-24, 25-36 (2:1)
  COLUMN: 5,    // First, Second, Third column (2:1)
  SPLIT: 6,     // Two adjacent numbers (17:1)
  STREET: 7,    // Three numbers horizontal (11:1)
  CORNER: 8,    // Four numbers (8:1)
  LINE: 9       // Six numbers (5:1)
};

function BetBox({ betValue = 0, betType = "", position = "top-right", ...props }) {
  // Calculate position based on the position prop
  const getPosition = () => {
    switch (position) {
      case "top-right":
        return { top: "25%", left: "75%" };
      case "top-left":
        return { top: "25%", left: "25%" };
      case "bottom-right":
        return { top: "75%", left: "75%" };
      case "bottom-left":
        return { top: "75%", left: "25%" };
      default:
        return { top: "25%", left: "75%" }; // Default to top-right
    }
  };

  return (
    <Tooltip
      title={
        <Typography>
          {betType}: {betValue}
        </Typography>
      }
    >
      <Box
        sx={{
          position: "absolute",
          ...getPosition(),
          transform: "translate(-50%, -50%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 5,
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          backgroundColor: "rgba(255, 215, 0, 0.9)",
          border: "2px solid rgba(255, 255, 255, 0.8)",
          boxShadow: "0 2px 4px rgba(0,0,0,0.5)",
          "&:hover": {
            transform: "translate(-50%, -50%) scale(1.1)",
            boxShadow: "0 4px 8px rgba(0,0,0,0.5)",
          },
        }}
        {...props}
      >
        <Typography
          sx={{ 
            fontSize: "13px", 
            color: "black", 
            fontWeight: "bold",
            textShadow: "0 0 2px rgba(255,255,255,0.5)",
          }}
        >
          {betValue}
        </Typography>
      </Box>
    </Tooltip>
  );
}

function GridInside({
  insideNumber = -1, // must define this
  topEdge = false,
  red = false,
  straightup = 0,
  splitleft = 0,
  splitbottom = 0,
  corner = 0,
  placeBet,
  isWinner = false,
  ...props
}) {
  return (
    <ParentSize {...props}>
      {({ width }) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "stretch",
            width: width,
            height: topEdge ? width + 10 : width,
            ...(red && { backgroundColor: (theme) => theme.palette.game.red }),
            transition: "all 0.2s ease",
            "&:hover": {
              transform: "scale(1.02)",
              boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)",
              zIndex: 2
            }
          }}
        >
          <Box
            sx={{ display: "flex", flexDirection: "column", width: "10px" }}
            id="left-edge"
          >
            {topEdge && (
              <Box
                sx={{
                  height: "10px",
                  backgroundColor: (theme) => theme.palette.dark.card,
                }}
              ></Box>
            )}
            <Box
              sx={{
                position: "relative",
                flex: 1,
                backgroundColor: (theme) => theme.palette.dark.card,
                cursor: "pointer",
              }}
              id="left-split-bet"
              onClick={(e) => placeBet(e, "inside", (insideNumber - 1) * 4 + 2)}
            >
              {splitleft > 0 && (
                <BetBox
                  betValue={splitleft}
                  betType={"Split"}
                  position="top-right"
                  onClick={(e) =>
                    placeBet(e, "inside", (insideNumber - 1) * 4 + 2)
                  }
                />
              )}
            </Box>
            <Box
              sx={{
                position: "relative",
                height: "10px",
                backgroundColor: (theme) => theme.palette.dark.card,
                cursor: "pointer",
              }}
              id="left-corner-bet"
              onClick={(e) => placeBet(e, "inside", (insideNumber - 1) * 4 + 4)}
            >
              {corner > 0 && (
                <BetBox
                  betValue={corner}
                  betType={"Corner"}
                  position="bottom-right"
                  onClick={(e) =>
                    placeBet(e, "inside", (insideNumber - 1) * 4 + 4)
                  }
                />
              )}
            </Box>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
            {topEdge && (
              <Box
                sx={{
                  height: "10px",
                  backgroundColor: (theme) => theme.palette.dark.card,
                }}
              ></Box>
            )}
            <Box
              sx={{
                position: "relative",
                flex: 5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "white",
              }}
              id="straight-bet"
              onClick={(e) => placeBet(e, "inside", (insideNumber - 1) * 4 + 1)}
            >
              <Typography 
                variant="h5" 
                sx={{
                  position: "relative",
                  zIndex: 4,
                  textShadow: "0 0 4px rgba(0,0,0,0.8)",
                  fontWeight: "bold",
                  backgroundColor: "rgba(0,0,0,0.4)",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  transform: "translateX(-10%)", // Slight offset to avoid chip overlap
                }}
              >
                {insideNumber}
              </Typography>
              {straightup > 0 && (
                <BetBox
                  betValue={straightup}
                  betType={"Straight up"}
                  position="top-right"
                  onClick={(e) =>
                    placeBet(e, "inside", (insideNumber - 1) * 4 + 1)
                  }
                />
              )}
            </Box>
            <Box
              sx={{
                position: "relative",
                flex: 1,
                backgroundColor: (theme) => theme.palette.dark.card,
                maxHeight: "10px",
                minHeight: "10px",
                cursor: "pointer",
              }}
              id="bottom-split-bet"
              onClick={(e) => placeBet(e, "inside", (insideNumber - 1) * 4 + 3)}
            >
              {splitbottom > 0 && (
                <BetBox
                  betValue={splitbottom}
                  betType={"Split"}
                  position="bottom-right"
                  onClick={(e) =>
                    placeBet(e, "inside", (insideNumber - 1) * 4 + 3)
                  }
                />
              )}
            </Box>
          </Box>
        </Box>
      )}
    </ParentSize>
  );
}

function GridZero({ inside, placeBet, ...props }) {
  return (
    <ParentSize {...props}>
      {({ width, height }) => (
        <Box
          sx={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: width,
            height: height,
            cursor: "pointer",
            clipPath: "polygon(100% 0%, 100% 100%, 40% 100%, 0% 50%, 40% 0%)",
            backgroundColor: (theme) => theme.palette.game.green,
          }}
          onClick={(e) => placeBet(e, "inside", 0)}
        >
          <Typography variant="h5">0</Typography>
          {inside[0] > 0 && (
            <BetBox
              betValue={inside[0]}
              betType={"Straight up"}
              onClick={(e) => placeBet(e, "inside", 0)}
            />
          )}
        </Box>
      )}
    </ParentSize>
  );
}

function GridColumnBet({
  topCard = false,
  bottomCard = false,
  index,
  columns,
  bet,
  placeBet,
  ...props
}) {
  return (
    <ParentSize style={{ height: "100%" }} {...props}>
      {({ width, height }) => (
        <Box
          sx={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: width,
            height: height,
            cursor: "pointer",
            backgroundColor: (theme) => theme.palette.dark.button,
            borderTop: (theme) =>
              `${topCard ? 10 : 5}px solid ${theme.palette.dark.card}`,
            borderBottom: (theme) =>
              `${bottomCard ? 10 : 5}px solid ${theme.palette.dark.card}`,
            borderRight: (theme) => "10px solid " + theme.palette.dark.card,
            borderLeft: (theme) => "10px solid " + theme.palette.dark.card,
          }}
          onClick={(e) => placeBet(e, "columns", index)}
        >
          <Typography variant="h5">2 To 1</Typography>
          {columns[index] > 0 && (
            <BetBox
              betValue={columns[index]}
              betType={`2 To 1 (row ${index + 1})`}
              onClick={(e) => placeBet(e, "columns", index)}
            />
          )}
        </Box>
      )}
    </ParentSize>
  );
}

function GridOutsideBet({ rightCard = false, active = false, ...props }) {
  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 2,
        cursor: "pointer",
        backgroundColor: (theme) => theme.palette.dark.button,
        borderBottom: (theme) => "10px solid " + theme.palette.dark.card,
        borderLeft: (theme) => "10px solid " + theme.palette.dark.card,
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)"
        }
      }}
      {...props}
    >
      {props.children}
    </Box>
  );
}

const firstThird = [
  { val: 3, red: true },
  { val: 6 },
  { val: 9, red: true },
  { val: 12 },
  { val: 2 },
  { val: 5, red: true },
  { val: 8 },
  { val: 11 },
  { val: 1, red: true },
  { val: 4 },
  { val: 7, red: true },
  { val: 10 },
];
const secondThird = [
  { val: 15 },
  { val: 18, red: true },
  { val: 21, red: true },
  { val: 24 },
  { val: 14, red: true },
  { val: 17 },
  { val: 20 },
  { val: 23, red: true },
  { val: 13 },
  { val: 16, red: true },
  { val: 19, red: true },
  { val: 22 },
];
const thirdThird = [
  { val: 27, red: true },
  { val: 30, red: true },
  { val: 33 },
  { val: 36, red: true },
  { val: 26 },
  { val: 29 },
  { val: 32, red: true },
  { val: 35 },
  { val: 25, red: true },
  { val: 28 },
  { val: 31 },
  { val: 34, red: true },
];

const arrayReducer = (state, action) => {
  switch (action.type) {
    case "reset":
      return new Array(state.length).fill(0);
    case "update":
      let updatedArr = [...state];
      updatedArr[action.ind] = action.val;
      return updatedArr;
    default:
      return state;
  }
};

const eventReducer = (state, action) => {
  switch (action.type) {
    case "reset":
      return [];
    case "update":
      return action.payload;
    default:
      return state;
  }
};
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const notificationSteps = {
  PLACING_BET: 0,
  BET_PLACED: 1,
  GENERATING_VRF: 2,
  RESULT_READY: 3
};

// Custom animated wheel component for visual feedback
const RouletteWheel = ({ spinning, result, onSpinComplete, onSpinStart, onWin }) => {
  const wheelRef = useRef(null);
  const [spinComplete, setSpinComplete] = useState(false);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (spinning && result >= 0) {
      // Calculate the rotation to land on the result number
      const segmentAngle = 360 / 37; // 37 segments (0-36)
      const baseRotation = 3600; // 10 full rotations for effect
      const resultPosition = segmentAngle * result;
      const finalRotation = baseRotation + resultPosition;
      
      setRotation(finalRotation);
      if (onSpinStart) onSpinStart();
      
      setTimeout(() => {
        setSpinComplete(true);
        if (onSpinComplete) onSpinComplete();
        if (onWin) onWin();
      }, 4200); // Slightly longer than animation
    } else if (!spinning) {
      setRotation(0);
      setSpinComplete(false);
    }
  }, [spinning, result, onSpinComplete, onSpinStart, onWin]);
  
  return (
    <Box 
      sx={{ 
        width: '200px', 
        height: '200px', 
        borderRadius: '50%',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 0 20px rgba(0,0,0,0.5)',
        margin: 'auto',
        display: result >= 0 ? 'block' : 'none'
      }}
    >
      <Box
        ref={wheelRef}
        sx={{
          width: '100%',
          height: '100%',
          backgroundImage: 'url(/images/roulette-wheel.png)',
          backgroundSize: 'contain',
          transformOrigin: 'center',
          position: 'relative',
          transform: `rotate(${rotation}deg)`,
          transition: spinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none'
        }}
      />
      {spinComplete && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '2rem',
            textShadow: '0 0 10px rgba(0,0,0,0.8)',
            zIndex: 10
          }}
        >
          {result}
        </Box>
      )}
    </Box>
  );
};

// Add betting statistics tracking
const BettingStats = ({ history }) => {
  const stats = useMemo(() => {
    if (!history || history.length === 0) return null;
    
    // Calculate win rate
    const winCount = history.filter(bet => bet.won).length;
    const winRate = history.length > 0 ? (winCount / history.length * 100).toFixed(1) : 0;
    
    // Calculate most common numbers
    const numberFrequency = {};
    history.forEach(bet => {
      if (bet.roll >= 0) {
        numberFrequency[bet.roll] = (numberFrequency[bet.roll] || 0) + 1;
      }
    });
    
    const mostCommonNumbers = Object.entries(numberFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([number, count]) => ({ number: parseInt(number), count }));
    
    // Calculate profit/loss
    const totalWagered = history.reduce((sum, bet) => sum + bet.amount, 0);
    const totalWon = history.reduce((sum, bet) => sum + (bet.won ? bet.payout : 0), 0);
    const profitLoss = totalWon - totalWagered;
    
    return {
      winRate,
      mostCommonNumbers,
      totalWagered,
      totalWon,
      profitLoss,
      sessionBets: history.length
    };
  }, [history]);
  
  if (!stats) return null;
  
  return (
    <Box sx={{ 
      p: 2, 
      border: '1px solid rgba(255,255,255,0.1)', 
      borderRadius: '8px',
      background: 'rgba(0,0,0,0.3)'
    }}>
      <Typography variant="h6" color="white" sx={{ mb: 2 }}>Session Statistics</Typography>
      <Grid container spacing={2}>
        <Grid xs={6} md={4}>
          <Typography variant="body2" color="text.secondary">Win Rate</Typography>
          <Typography variant="h5">{stats.winRate}%</Typography>
        </Grid>
        <Grid xs={6} md={4}>
          <Typography variant="body2" color="text.secondary">Total Bets</Typography>
          <Typography variant="h5">{stats.sessionBets}</Typography>
        </Grid>
        <Grid xs={6} md={4}>
          <Typography variant="body2" color="text.secondary">P/L</Typography>
          <Typography variant="h5" color={stats.profitLoss >= 0 ? 'success.main' : 'error.main'}>
            {stats.profitLoss >= 0 ? '+' : ''}{stats.profitLoss.toFixed(2)}
          </Typography>
        </Grid>
        <Grid xs={12}>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Hot Numbers</Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            {stats.mostCommonNumbers.map((item) => (
              <Box 
                key={item.number} 
                sx={{ 
                  width: 30, 
                  height: 30, 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  backgroundColor: item.number === 0 ? 'game.green' : 
                    [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(item.number) ? 'game.red' : 'dark.bg',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}
              >
                <Typography variant="caption" fontWeight="bold">{item.number}</Typography>
              </Box>
            ))}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default function GameRoulette() {
  const [events, dispatchEvents] = useReducer(eventReducer, []);
  const [bet, setBet] = useState(0);
  const [inside, dispatchInside] = useReducer(arrayReducer, new Array(145).fill(0));
  const [red, setRed] = useState(0);
  const [black, setBlack] = useState(0);
  const [odd, setOdd] = useState(0);
  const [even, setEven] = useState(0);
  const [over, setOver] = useState(0);
  const [under, setUnder] = useState(0);
  const [dozens, dispatchDozens] = useReducer(arrayReducer, [0, 0, 0]);
  const [columns, dispatchColumns] = useReducer(arrayReducer, [0, 0, 0]);
  const [correctNetwork, setCorrectNetwork] = useState(false);
  const [submitDisabled, setSubmitDisabled] = useState(false);
  const [winnings, setWinnings] = useState(-1);
  const [rollResult, setRollResult] = useState(-1);
  const [notificationIndex, setNotificationIndex] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessages] = useState([
    "Placing Bet...",
    "Bet Placed Successfully!",
    "Generating VRF Outcome...",
    "Result Ready!"
  ]);
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [currentBetType, setCurrentBetType] = useState(null);
  const [wheelSpinning, setWheelSpinning] = useState(false);
  const [showBettingStats, setShowBettingStats] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [recentResults, setRecentResults] = useState([]);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [bettingHistory, setBettingHistory] = useState([]);
  const [isDev, setIsDev] = useState(false);
  const [error, setError] = useState(null);
  const [pendingBets, setPendingBets] = useState([]);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const { address, isConnected } = useWalletStatus();

  const { data: hash, isPending, writeContract: wagmiWriteContract } = useWriteContract();

  const checkTransactionStatus = async (hash) => {
    try {
      const receipt = await ViemClient.publicBinanceTestnetClient.waitForTransactionReceipt({ hash });
      return receipt.status; // 'success' or 'reverted'
    } catch (error) {
      console.error("Error checking transaction status:", error);
      return 'failed';
    }
  };

  

  // Get wallet status and balance
  const { balance } = useToken(address);

  // Add wagmi hooks for contract interactions
  const { writeContractAsync, data: wagmiWriteResult, error: wagmiWriteError, isPending: wagmiIsPending } = useWriteContract();
  const { data: wagmiTransactionReceipt } = useWaitForTransactionReceipt({ hash: wagmiWriteResult?.hash });

  // Add debug logging for wallet state
  useEffect(() => {
    console.log('Wallet Status:', {
      isConnected,
      address,
      balance,
      correctNetwork
    });
  }, [isConnected, address, balance, correctNetwork]);

  // Sound refs
  const spinSoundRef = useRef(null);
  const winSoundRef = useRef(null);
  const chipSelectRef = useRef(null);
  const chipPlaceRef = useRef(null);
  const menuClickRef = useRef(null);
  const backgroundMusicRef = useRef(null);
  const ambientSoundsRef = useRef(null);

  // Sound utility function
  const playSound = useCallback((ref) => {
    if (!ref?.current || ref.current.muted) return;
    ref.current.currentTime = 0;
    ref.current.play().catch(error => console.error("Sound play failed:", error));
  }, []);

  // Start background sounds as soon as component mounts
  useEffect(() => {
    let backgroundMusicAttempted = false;
    let ambientSoundsAttempted = false;

    const startBackgroundSounds = async () => {
      console.log("Attempting to start background sounds...");

      // Function to handle user interaction and start sounds
      const startSound = async (ref, volume, name) => {
        if (!ref.current) {
          console.log(`${name} ref not available`);
          return;
        }
        
        try {
          ref.current.volume = volume;
          // Load the audio
          await ref.current.load();
          console.log(`${name} loaded successfully`);
          
          // Try to play
          const playPromise = ref.current.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log(`${name} playing successfully`);
              })
              .catch((error) => {
                console.log(`${name} autoplay failed:`, error);
                // Add click event listener if not already attempted
                if (!backgroundMusicAttempted && name === "Background Music") {
                  backgroundMusicAttempted = true;
                  document.addEventListener('click', async () => {
                    try {
                      await ref.current.play();
                      console.log(`${name} started after user interaction`);
                    } catch (err) {
                      console.log(`${name} failed after user interaction:`, err);
                    }
                  }, { once: true });
                }
                if (!ambientSoundsAttempted && name === "Ambient Sounds") {
                  ambientSoundsAttempted = true;
                  document.addEventListener('click', async () => {
                    try {
                      await ref.current.play();
                      console.log(`${name} started after user interaction`);
                    } catch (err) {
                      console.log(`${name} failed after user interaction:`, err);
                    }
                  }, { once: true });
                }
              });
          }
        } catch (err) {
          console.log(`${name} error:`, err);
        }
      };

      await startSound(backgroundMusicRef, 0.3, "Background Music");
      await startSound(ambientSoundsRef, 0.2, "Ambient Sounds");
    };

    startBackgroundSounds();

    // Cleanup function
    return () => {
      console.log("Cleaning up sound effects...");
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.pause();
        backgroundMusicRef.current.currentTime = 0;
      }
      if (ambientSoundsRef.current) {
        ambientSoundsRef.current.pause();
        ambientSoundsRef.current.currentTime = 0;
      }
    };
  }, []);

  // Handle muting of all sounds
  useEffect(() => {
    console.log("Mute status changed:", isMuted);
    const audioRefs = [
      spinSoundRef,
      winSoundRef,
      chipSelectRef,
      chipPlaceRef,
      menuClickRef,
      backgroundMusicRef,
      ambientSoundsRef
    ];

    audioRefs.forEach(ref => {
      if (ref?.current) {
        ref.current.muted = isMuted;
        console.log(`Set muted=${isMuted} for audio element`);
      }
    });
  }, [isMuted]);

  useEffect(() => {
    // Force production mode for contract interactions
    setIsDev(false);
    console.log('Development mode:', process.env.NODE_ENV);
  }, []);

  useEffect(() => {
    // Set up event listeners
    const setupEventListeners = () => {
      if (!address || !isConnected) {
        console.log('Wallet not connected, skipping event listeners');
        return;
      }

      console.log('Setting up contract event listeners...');
      console.log('Contract address:', rouletteContractAddress);
      console.log('Connected wallet:', address);

      const winningsListener = ViemClient.publicBinanceTestnetClient.watchContractEvent({
      address: rouletteContractAddress,
      abi: rouletteABI,
      eventName: "RandomGenerated",
      onLogs: (logs) => {
          console.log('RandomGenerated event received:', logs);
          try {
            // Safely parse the random number
            const randomNumberRaw = logs[0]?.args?.randomNumber;
            const randomNumber = typeof randomNumberRaw === 'object' 
              ? parseInt(randomNumberRaw.toString()) 
              : parseInt(randomNumberRaw);
            
            if (!isNaN(randomNumber)) {
        setRollResult(randomNumber);
              setNotificationIndex(notificationSteps.RESULT_READY);
              console.log(`Random Number Generated: ${randomNumber}`);
            } else {
              console.error("Invalid random number:", randomNumberRaw);
            }
          } catch (error) {
            console.error("Error processing random number:", error);
          }
      },
    });

      const betResultListener = ViemClient.publicBinanceTestnetClient.watchContractEvent({
      address: rouletteContractAddress,
      abi: rouletteABI,
      eventName: "BetResult",
      onLogs: (logs) => {
          console.log('BetResult event received:', logs);
          try {
            if (!logs || !logs[0] || !logs[0].args) {
              console.error("Invalid logs in BetResult event:", logs);
              return;
            }
            
            const { player, amount, won } = logs[0].args;
            
            // Safely compare addresses
            const playerAddress = player ? player.toLowerCase() : null;
            const userAddress = address ? address.toLowerCase() : null;
            
            if (userAddress && playerAddress === userAddress) {
              // Safely convert amount to number
              let amountNum = 0;
              try {
                const amountStr = typeof amount === 'object' ? amount.toString() : String(amount);
                amountNum = parseFloat(amountStr) / 1e18;
              } catch (e) {
                console.error("Error parsing amount:", e);
                amountNum = 0;
              }
              
              setWinnings(won ? amountNum : 0);
              
              // Add to betting history
              setBettingHistory(prev => [{
                type: currentBetType?.type || 'Unknown',
                amount: amountNum,
                won: Boolean(won),
                payout: won ? amountNum : 0,
                roll: rollResult,
                timestamp: new Date().toISOString()
              }, ...prev].slice(0, 10)); // Keep last 10 bets
              
              console.log(`Bet Result - Won: ${won}, Amount: ${amountNum}`);
            }
          } catch (error) {
            console.error("Error processing bet result:", error);
          }
        },
      });

      const vrfRequestListener = ViemClient.publicBinanceTestnetClient.watchContractEvent({
        address: rouletteContractAddress,
        abi: rouletteABI,
        eventName: "RandomNumberRequested",
        onLogs: (logs) => {
          console.log('RandomNumberRequested event received:', logs);
          try {
            setNotificationIndex(notificationSteps.GENERATING_VRF);
            
            // Handle the request ID safely
            if (logs && logs[0] && logs[0].args) {
              const requestId = logs[0].args.requestId;
              const safeRequestId = typeof requestId === 'object' 
                ? (requestId.toString ? requestId.toString() : JSON.stringify(requestId)) 
                : requestId;
              console.log("VRF Request ID:", safeRequestId);
      } else {
              console.log("VRF Request received but no request ID found");
            }
          } catch (error) {
            console.error("Error handling VRF request:", error);
          }
        },
      });

      return () => {
        if (typeof winningsListener === 'function') winningsListener();
        if (typeof betResultListener === 'function') betResultListener();
        if (typeof vrfRequestListener === 'function') vrfRequestListener();
      };
    };

    setupEventListeners();
  }, [address, isConnected, currentBetType, rollResult, setNotificationIndex, setRollResult, setWinnings, setBettingHistory, setCurrentBetType]);

  // Check screen size for responsive layout
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  // Track recent results
  useEffect(() => {
    if (rollResult >= 0) {
      setRecentResults(prev => [rollResult, ...prev].slice(0, 10));
    }
  }, [rollResult]);

  // Handle wheel spin completion
  const handleSpinComplete = () => {
    setWheelSpinning(false);
  };

  // Add a function to toggle sound
  const toggleSound = () => {
    setIsMuted(!isMuted);
  };

  // Create theme using muiStyles
  const theme = createTheme(muiStyles["dark"]);

  // insert into events
  const insertEvent = (type, oldVal, newVal, ind = 0) => {
    let newArr = [...events];
    newArr.push({ type: type, oldVal: oldVal, newVal: newVal, ind: ind });
    dispatchEvents({ type: "update", payload: newArr });
  };

  // Update the revertEvent function
  const revertEvent = useCallback((e) => {
    if (events.length > 0) {
      playSound(menuClickRef);
      const lastEvent = events[events.length - 1];
      
      switch (lastEvent.type) {
        case "red":
          setRed(lastEvent.oldVal);
          break;
        case "black":
          setBlack(lastEvent.oldVal);
          break;
        case "odd":
          setOdd(lastEvent.oldVal);
          break;
        case "even":
          setEven(lastEvent.oldVal);
          break;
        case "over":
          setOver(lastEvent.oldVal);
          break;
        case "under":
          setUnder(lastEvent.oldVal);
          break;
        case "dozens":
          dispatchDozens({ type: "update", ind: lastEvent.ind, val: lastEvent.oldVal });
          break;
        case "columns":
          dispatchColumns({ type: "update", ind: lastEvent.ind, val: lastEvent.oldVal });
          break;
        case "inside":
          dispatchInside({ type: "update", ind: lastEvent.ind, val: lastEvent.oldVal });
          break;
      }
      
      // Remove the last event from history
      dispatchEvents({ type: "update", payload: events.slice(0, -1) });
    }
  }, [events, playSound, menuClickRef]);

  // Update the placeBet function to accumulate bets
  // Update the placeBet function to accumulate bets
  const placeBet = useCallback((e, type, ind = 0, newVal = bet, revert = false) => {
    if (e) {
    e.preventDefault();
    e.stopPropagation();
    }
    if (isNaN(newVal)) {
      return;
    }

    // Play chip sound when placing a bet
    if (!revert && newVal > 0) {
      playSound(chipPlaceRef);
    }

    let oldVal = 0;
    let betType = 0;
    let betValue = 0;
    let numbers = [];

    switch (type) {
      case "red":
        oldVal = red;
        const updatedRed = revert ? newVal : red + newVal;
        if (red !== updatedRed) {
        if (!revert) {
            dispatchEvents({ type: "update", payload: [...events, { type, oldVal, newVal: updatedRed, ind }] });
          }
          setRed(updatedRed);
          // Add to pending bets for red
          if (!revert && newVal > 0) {
            betType = 1; // COLOR
            betValue = 0; // Red
            numbers = []; // Simple bets have empty numbers array
            setPendingBets(prev => [...prev, { betType, betValue, amount: newVal, numbers, id: Date.now() }]);
          }
        }
        break;
      case "black":
        oldVal = black;
        const updatedBlack = revert ? newVal : black + newVal;
        if (black !== updatedBlack) {
        if (!revert) {
            dispatchEvents({ type: "update", payload: [...events, { type, oldVal, newVal: updatedBlack, ind }] });
          }
          setBlack(updatedBlack);
          // Add to pending bets for black
          if (!revert && newVal > 0) {
            betType = 1; // COLOR
            betValue = 1; // Black
            numbers = []; // Simple bets have empty numbers array
            setPendingBets(prev => [...prev, { betType, betValue, amount: newVal, numbers, id: Date.now() }]);
          }
        }
        break;
      case "odd":
        oldVal = odd;
        const updatedOdd = revert ? newVal : odd + newVal;
        if (odd !== updatedOdd) {
        if (!revert) {
            dispatchEvents({ type: "update", payload: [...events, { type, oldVal, newVal: updatedOdd, ind }] });
          }
          setOdd(updatedOdd);
          // Add to pending bets for odd
          if (!revert && newVal > 0) {
            betType = 2; // ODDEVEN
            betValue = 1; // Odd
            numbers = []; // Simple bets have empty numbers array
            setPendingBets(prev => [...prev, { betType, betValue, amount: newVal, numbers, id: Date.now() }]);
          }
        }
        break;
      case "even":
        oldVal = even;
        const updatedEven = revert ? newVal : even + newVal;
        if (even !== updatedEven) {
        if (!revert) {
            dispatchEvents({ type: "update", payload: [...events, { type, oldVal, newVal: updatedEven, ind }] });
          }
          setEven(updatedEven);
          // Add to pending bets for even
          if (!revert && newVal > 0) {
            betType = 2; // ODDEVEN
            betValue = 0; // Even
            numbers = []; // Simple bets have empty numbers array
            setPendingBets(prev => [...prev, { betType, betValue, amount: newVal, numbers, id: Date.now() }]);
          }
        }
        break;
      case "over":
        oldVal = over;
        const updatedOver = revert ? newVal : over + newVal;
        if (over !== updatedOver) {
        if (!revert) {
            dispatchEvents({ type: "update", payload: [...events, { type, oldVal, newVal: updatedOver, ind }] });
          }
          setOver(updatedOver);
          // Add to pending bets for over
          if (!revert && newVal > 0) {
            betType = 3; // HIGHLOW
            betValue = 1; // High (19-36)
            numbers = []; // Simple bets have empty numbers array
            setPendingBets(prev => [...prev, { betType, betValue, amount: newVal, numbers, id: Date.now() }]);
          }
        }
        break;
      case "under":
        oldVal = under;
        const updatedUnder = revert ? newVal : under + newVal;
        if (under !== updatedUnder) {
        if (!revert) {
            dispatchEvents({ type: "update", payload: [...events, { type, oldVal, newVal: updatedUnder, ind }] });
          }
          setUnder(updatedUnder);
          // Add to pending bets for under
          if (!revert && newVal > 0) {
            betType = 3; // HIGHLOW
            betValue = 0; // Low (1-18)
            numbers = []; // Simple bets have empty numbers array
            setPendingBets(prev => [...prev, { betType, betValue, amount: newVal, numbers, id: Date.now() }]);
          }
        }
        break;
      case "dozens":
        oldVal = dozens[ind];
        const updatedDozen = revert ? newVal : dozens[ind] + newVal;
        if (dozens[ind] !== updatedDozen) {
        if (!revert) {
            dispatchEvents({ type: "update", payload: [...events, { type, oldVal, newVal: updatedDozen, ind }] });
          }
          dispatchDozens({ type: "update", ind, val: updatedDozen });
          // Add to pending bets for dozens
          if (!revert && newVal > 0) {
            betType = 4; // DOZEN
            betValue = ind; // 0, 1, or 2 for first, second, third dozen
            numbers = []; // Simple bets have empty numbers array
            setPendingBets(prev => [...prev, { betType, betValue, amount: newVal, numbers, id: Date.now() }]);
          }
        }
        break;
      case "columns":
        oldVal = columns[ind];
        const updatedColumn = revert ? newVal : columns[ind] + newVal;
        if (columns[ind] !== updatedColumn) {
        if (!revert) {
            dispatchEvents({ type: "update", payload: [...events, { type, oldVal, newVal: updatedColumn, ind }] });
          }
          dispatchColumns({ type: "update", ind, val: updatedColumn });
          // Add to pending bets for columns
          if (!revert && newVal > 0) {
            betType = 5; // COLUMN
            betValue = ind; // 0, 1, or 2 for first, second, third column
            numbers = []; // Simple bets have empty numbers array
            setPendingBets(prev => [...prev, { betType, betValue, amount: newVal, numbers, id: Date.now() }]);
          }
        }
        break;
      case "inside":
        oldVal = inside[ind];
        const updatedInside = revert ? newVal : inside[ind] + newVal;
        if (inside[ind] !== updatedInside) {
        if (!revert) {
            dispatchEvents({ type: "update", payload: [...events, { type, oldVal, newVal: updatedInside, ind }] });
        }
          dispatchInside({ type: "update", ind, val: updatedInside });
          // Add to pending bets for inside bets
          if (!revert && newVal > 0) {
            // Determine the type of inside bet based on the index
            if (ind === 0) {
              betType = 0; // NUMBER (straight up)
              betValue = 0; // Number 0
              numbers = []; // Empty array for NUMBER bet type
            } else {
              // For other numbers, determine bet type based on position
              const number = Math.floor((ind - 1) / 4) + 1;
              const position = (ind - 1) % 4;
              
              switch (position) {
                case 0: // Straight up
                  betType = 0; // NUMBER
                  betValue = number;
                  numbers = []; // Empty array for NUMBER bet type
                  break;
                case 1: // Split left
                  betType = 6; // SPLIT
                  betValue = 0;
                  numbers = [number, number - 1];
                  break;
                case 2: // Split bottom
                  betType = 6; // SPLIT
                  betValue = 0;
                  numbers = [number, number + 3];
                  break;
                case 3: // Corner
                  betType = 8; // CORNER
                  betValue = 0;
                  numbers = [number, number + 1, number + 3, number + 4];
                  break;
              }
            }
            setPendingBets(prev => [...prev, { betType, betValue, amount: newVal, numbers, id: Date.now() }]);
          }
      }
        break;
    }
  }, [bet, events, red, black, odd, even, over, under, dozens, columns, inside, playSound, chipPlaceRef]);
  // reset all the bets
  const reset = useCallback((e) => {
    if (e) e.preventDefault();
    playSound(menuClickRef);
    setRed(0);
    setBlack(0);
    setOdd(0);
    setEven(0);
    setOver(0);
    setUnder(0);
    dispatchDozens({ type: "reset" });
    dispatchColumns({ type: "reset" });
    dispatchInside({ type: "reset" });
    dispatchEvents({ type: "reset" });
    setRollResult(-1);
    setWinnings(-1);
    setPendingBets([]); // Clear pending bets
  }, [playSound, menuClickRef]);

  // updating the bet size
  const handleBetChange = useCallback((e) => {
    setBet(parseFloat(e.target.value));
    playSound(chipSelectRef);
  }, [playSound, chipSelectRef]);

  // Function to close the notification
  const handleCloseNotification = () => {
    setShowNotification(false);
    setNotificationIndex(0);
  };

  const treasury = TreasuryManager();

  const approveTokens = async (amount) => {
    try {
      setNotification({ open: true, message: 'Checking allowance...', severity: 'info' });

      // Get the current chain ID to determine which client to use
      let chainId;
      if (typeof window !== 'undefined' && window.ethereum) {
        chainId = await window.ethereum.request({ method: 'eth_chainId' });
        console.log('Current chainId:', chainId);
      }

      // Select the appropriate client based on the current network
      let client;
      if (chainId === '0x138b') { // Mantle Sepolia
        client = ViemClient.publicMantleSepoliaClient;
      } else if (chainId === '0xc352') { // Pharos Devnet
        client = ViemClient.publicPharosSepoliaClient;
      } else if (chainId === '0x61') { // Binance Testnet
        client = ViemClient.publicBinanceTestnetClient;
      } else {
        // Default fallback
        client = ViemClient.publicMantleSepoliaClient;
      }

      console.log('Using client for chainId:', chainId, 'Client:', client);

      // Get contract addresses for current network
      const contractAddresses = tokenContractAddress;
      console.log('Using contract addresses:', contractAddresses);

      // 1. Check current allowance
      const currentAllowance = await ViemClient.publicBinanceTestnetClient.readContract({
        address: tokenContractAddress,
        abi: tokenABI,
        functionName: 'allowance',
        args: [address, rouletteContractAddress],
      });

      // 2. Compare with the required amount
      if (currentAllowance < amount) {
        // 3. If allowance is insufficient, request approval
        setNotification({ open: true, message: 'Requesting approval to place bet...', severity: 'info' });
        const hash = await writeContractAsync({
          address: tokenContractAddress,
          abi: tokenABI,
          functionName: 'approve',
          args: [rouletteContractAddress, amount],
        });
        await ViemClient.publicBinanceTestnetClient.waitForTransactionReceipt({ hash });
        setNotification({ open: true, message: 'Approval successful!', severity: 'success' });
      } else {
        // 4. If allowance is sufficient, do nothing.
        setNotification({ open: true, message: 'Allowance confirmed.', severity: 'info' });
      }
      return true;
    } catch (error) {
      console.error("Error in approveTokens function:", error);
      setNotification({ open: true, message: `Approval failed: ${error.shortMessage || error.message}`, severity: 'error' });
      return false;
    }
  };

  // Modify the lockBet function to include approval
  const lockBet = async () => {
    if (!isConnected || !address) {
      console.error('Wallet connection check failed:', { isConnected, address });
      alert("Please connect your wallet first");
      return;
    }

    if (!correctNetwork) {
      alert("Please switch to the correct network");
      return;
    }

    if (total <= 0) {
      alert("Please place a bet first");
      return;
    }

    // Check if there are pending bets
    if (pendingBets.length === 0) {
      alert("No bets to place. Please add some bets first.");
      return;
    }

    try {
      console.log('Starting lockBet process...');
      console.log('Total bet amount:', total);
      console.log('User address:', address);
      console.log('Roulette contract address:', rouletteContractAddress);
      console.log('Pending bets:', pendingBets);
      console.log('Wagmi hooks state:', {
        writeContractAsync: typeof writeContractAsync,
        wagmiWriteError,
        wagmiIsPending
      });
      
      // Check if wagmi hooks are properly loaded
      if (!writeContractAsync) {
        console.error('writeContractAsync is not available');
        alert("Wallet connection not ready. Please refresh the page and try again.");
        return;
      }
      
      // Additional wallet connection checks
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          // Check if wallet is connected and chain ID is available
          const accounts = await window.ethereum.request({ method: "eth_accounts" });
          const chainId = await window.ethereum.request({ method: "eth_chainId" });
          
          console.log('Wallet connection details:', {
            accounts,
            chainId,
            isConnected: accounts.length > 0
          });
          
          if (accounts.length === 0) {
            throw new Error('No accounts found');
          }
          
          if (!chainId) {
            throw new Error('Chain ID not available');
          }
          
        } catch (walletError) {
          console.error('Wallet connection check failed:', walletError);
          alert("Wallet connection issue. Please reconnect your wallet and try again.");
          return;
        }
      }
      
      // Check token balance before proceeding
      console.log('Checking token balance...');
      console.log('Total bet amount:', total);
      console.log('User address:', address);
      
      // Note: We'll rely on the contract to handle insufficient balance errors
      // The contract will revert if the user doesn't have enough tokens
      
      // First, prepare the bet amounts in the correct format (wei)
      const amountsInWei = pendingBets.map(bet => parseEther(bet.amount.toString()));
      const totalAmountInWei = amountsInWei.reduce((acc, curr) => acc + curr, BigInt(0));

      // Now, approve the total amount
      console.log('Approving tokens for total amount:', totalAmountInWei.toString());
      const approvalSuccessful = await approveTokens(totalAmountInWei);
      if (!approvalSuccessful) {
        console.error('Token approval failed. Aborting bet placement.');
        setNotification({ open: true, message: 'Token approval failed. Please try again.', severity: 'error' });
        return;
      }
      console.log('Token approval successful');
      
      // Prepare the rest of the bet parameters
      const betTypes = pendingBets.map(bet => bet.betType);
      const betValues = pendingBets.map(bet => bet.betValue);
      const amountsAsStrings = amountsInWei.map(a => a.toString()); // For contract call
      const betNumbers = pendingBets.map(bet => bet.numbers || []);
      
      console.log('=== MANUAL BET PARAMETERS ===');
      console.log('Bet parameters:', {
        betTypes,
        betValues,
        amounts: amountsAsStrings,
        betNumbers
      });
      
      // Compare with test transaction parameters
      console.log('=== COMPARISON WITH TEST TRANSACTION ===');
      const testParams = {
        betTypes: [1], // COLOR
        betValues: [0], // Red
        amounts: [parseEther("1").toString()], // 1 token
        betNumbers: [[]] // empty array
      };
      console.log('Test transaction parameters:', testParams);
      console.log('Manual bet parameters:', {
        betTypes,
        betValues,
        amounts: amountsAsStrings,
        betNumbers
      });
      
      // Check if there are any invalid bet types or values
      console.log('=== VALIDATION CHECKS ===');
      const validBetTypes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]; // NUMBER, COLOR, ODDEVEN, HIGHLOW, DOZEN, COLUMN, SPLIT, STREET, CORNER, LINE
      const invalidBetTypes = betTypes.filter(type => !validBetTypes.includes(type));
      console.log('Invalid bet types:', invalidBetTypes);
      
      // Check for zero amounts
      const hasZeroAmounts = amountsAsStrings.some(amount => amount === parseEther("0").toString());
      console.log('Has zero amounts:', hasZeroAmounts);
      
      // Check for empty bet arrays
      const emptyBetArrays = betNumbers.filter(numbers => !numbers || numbers.length === 0);
      console.log('Empty bet arrays:', emptyBetArrays);
      
      console.log('=== END COMPARISON ===');
      
      // Check if writeContractAsync is available
      if (typeof writeContractAsync !== 'function') {
        throw new Error('writeContractAsync is not available. Please check wallet connection.');
      }
      
      // Place multiple bets using placeMultipleBets function
      console.log('Calling writeContractAsync...');
      
      // Log the exact parameters being sent
      const contractConfig = {
        address: rouletteContractAddress,
        abi: rouletteABI,
        functionName: 'placeMultipleBets',
        args: [betTypes, betValues, amountsAsStrings, betNumbers],
      };
      
      console.log('Contract config:', JSON.stringify(contractConfig, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value, 2)
      );
      console.log('Contract address:', rouletteContractAddress);
      console.log('ABI function exists:', rouletteABI.find(f => f.name === 'placeMultipleBets'));
      
      const hash = await writeContractAsync(contractConfig);
      
      console.log('Bet transaction hash:', hash);
      console.log('Bet transaction submitted successfully');
      
      // Wait for transaction confirmation and check for failures
      console.log('Waiting for transaction confirmation...');
      try {
        // Use ViemClient directly to wait for transaction
        const receipt = await ViemClient.publicBinanceTestnetClient.waitForTransactionReceipt({ hash });
        console.log('Transaction receipt:', receipt);
        
        if (receipt.status === 'success') {
          console.log('Transaction confirmed successfully');
          // Clear pending bets after successful placement
          setPendingBets([]);
          console.log("Bets placed successfully:", hash);
          setWheelSpinning(true);
          playSound(spinSoundRef);
        } else {
          throw new Error('Transaction failed on-chain');
        }
      } catch (receiptError) {
        console.error('Transaction confirmation failed:', receiptError);
        
        // Check transaction status for more details
        const txStatus = await checkTransactionStatus(hash);
        console.log('Transaction status:', txStatus);
        
        // Provide more specific error information
        let errorMessage = 'Transaction failed';
        if (receiptError.message.includes('execution reverted')) {
          errorMessage = 'Transaction reverted on-chain. This could be due to insufficient token balance, invalid bet parameters, or contract state issues.';
        } else if (receiptError.message.includes('out of gas')) {
          errorMessage = 'Transaction ran out of gas. Please try again with higher gas limit.';
        } else if (receiptError.message.includes('nonce')) {
          errorMessage = 'Transaction nonce issue. Please try again.';
        } else if (receiptError.message.includes('not found')) {
          errorMessage = 'Transaction not found. It may have been dropped or failed to be included in a block.';
        } else {
          errorMessage = `Transaction failed: ${receiptError.message}`;
        }
        
        throw new Error(errorMessage);
      }
      
    } catch (error) {
      console.error("Error locking bet:", error);
      setNotification({ open: true, message: `Error placing bet: ${error.shortMessage || error.message}`, severity: 'error' });
      
      // Clear pending bets on failure to prevent accumulation
      setPendingBets([]);

      // Additional logging for debugging
      console.error("Error details:", error);
      if (error.cause) {
        console.error("Cause:", error.cause);
      }
      
      // Log additional debugging info
      console.error("Debug info:", {
        pendingBets,
        total,
        address,
        rouletteContractAddress,
        correctNetwork,
        isConnected,
        betTypes: pendingBets.map(bet => bet.betType),
        betValues: pendingBets.map(bet => bet.betValue),
        amounts: pendingBets.map(bet => parseEther(bet.amount.toString()).toString()),
        betNumbers: pendingBets.map(bet => bet.numbers || [])
      });
      
      // Provide more specific error messages
      if (error.message.includes('getChainId')) {
        alert("Wallet connection issue. Please refresh the page and reconnect your wallet.");
      } else if (error.message.includes('user rejected')) {
        alert("Transaction was rejected by user.");
      } else if (error.message.includes('insufficient funds')) {
        alert("Insufficient funds for transaction.");
      } else if (error.message.includes('execution reverted')) {
        alert("Transaction reverted. This could be due to insufficient token balance, invalid bet parameters, or contract state issues.");
      } else if (error.message.includes('nonce')) {
        alert("Transaction nonce issue. Please try again.");
      } else if (error.message.includes('gas')) {
        alert("Gas estimation failed. This could be due to invalid contract parameters or network issues.");
      } else if (error.message.includes('network')) {
        alert("Network error. Please check your connection and try again.");
      } else {
        alert(`Failed to lock bet: ${error.message}`);
      }
    }
  };

  const handleWithdrawWinnings = useCallback(async (e) => {
    if (e) e.preventDefault();
    playSound(winSoundRef);

    if (!address) {
      console.error("Wallet not connected.");
      alert("Please connect your wallet.");
      return;
    }

    try {
      const amount = parseEther(winnings.toString()); // Use winnings as the amount to withdraw

      reset(e); // Reset the state after withdrawing

      // Use wagmi writeContractAsync instead of ViemClient
      const withdrawResponse = await writeContractAsync({
        address: rouletteContractAddress,
        abi: rouletteABI,
        functionName: "withdrawTokens",
        args: [amount.toString()], // Convert BigInt to string
      });

      if (withdrawResponse) {
        console.log("Winnings withdrawn successfully:", withdrawResponse);
        alert("Winnings withdrawn successfully!");
      } else {
        throw new Error("Withdrawal transaction failed.");
      }
    } catch (error) {
      console.error("Error withdrawing winnings:", error);
      alert(`Failed to withdraw winnings: ${error.message}`);
    }
  }, [playSound, winnings, reset, writeContractAsync]);

  const writeContract = async (config) => {
    if (isDev) {
      // Simulate contract write in dev mode
      // Note: wagmiIsPending is handled by the hook automatically
      
      // Simulate a delay for the transaction
      return new Promise((resolve) => {
        setTimeout(() => {
          const mockTxHash = '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
          resolve({ hash: mockTxHash });
        }, 2000);
      });
    }
    
    try {
      const result = await writeContractAsync(config);
      return result;
    } catch (error) {
      console.error("Contract write error:", error);
      throw error;
    }
  };

  const waitForTransaction = async (hash) => {
    if (isDev) {
      // Simulate transaction confirmation in dev mode
      return new Promise((resolve) => {
        setTimeout(() => {
          const mockReceipt = {
            blockNumber: 12345678,
            status: 'success',
            transactionHash: hash
          };
          resolve(mockReceipt);
        }, 3000);
      });
    }
    
    try {
      // Ensure hash is a string, not an object
      const hashStr = typeof hash === 'object' && hash.hash ? hash.hash : hash;
      const receipt = await ViemClient.publicBinanceTestnetClient.waitForTransactionReceipt({ hash: hashStr });
      return receipt;
    } catch (error) {
      console.error("Wait for transaction error:", error);
      throw error;
    }
  };

  const checkNetwork = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const chainId = await window.ethereum.request({ method: "eth_chainId" });
        // Support Mantle Sepolia (0x138b) and Local Hardhat (0x7a69)
        // Comment out Pharos Devnet (0xc352) - using Mantle Sepolia instead
        setCorrectNetwork(chainId === "0x138b" || chainId === "0x61" || chainId === "0x7a69");
      } catch (error) {
        console.error("Error checking network:", error);
        setCorrectNetwork(false);
      }
    }
  };
  
  useEffect(() => {
    checkNetwork();
    
    if (window.ethereum) {
      window.ethereum.on("chainChanged", checkNetwork);
      return () => {
        window.ethereum.removeListener("chainChanged", checkNetwork);
      };
    }
  }, []);

  const switchNetwork = async () => {
    if (typeof window !== "undefined") {
      try {
        // Try switching to Local Hardhat first
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x61" }],
        });
      } catch (switchError) {
        // If Local Hardhat is not added, add it
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: "0x61",
                  chainName: "Local Hardhat",
                  nativeCurrency: {
                    name: "Ethereum",
                    symbol: "ETH",
                    decimals: 18,
                  },
                  rpcUrls: ["http://127.0.0.1:8545"],
                  blockExplorerUrls: ["http://localhost:8545"],
                },
              ],
            });
          } catch (addError) {
            console.error("Failed to add Local Hardhat:", addError);
            // If Local Hardhat fails, try Mantle Sepolia
            try {
              await window.ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: "0x138b" }],
              });
            } catch (mantleError) {
              // Comment out Pharos Devnet fallback - using Mantle Sepolia instead
              // try {
              //   await window.ethereum.request({
              //     method: "wallet_switchEthereumChain",
              //     params: [{ chainId: "0xc352" }],
              //   });
              // } catch (pharosError) {
              //   console.error("Failed to switch to any network:", pharosError);
              // }
              console.error("Failed to switch to Mantle Sepolia:", mantleError);
            }
          }
        } else {
          console.error("Failed to switch network:", switchError);
        }
      }
      window.location.reload();
    }
  };

  // Calculate total bet
  const total = useMemo(() => {
    let val = red + black + odd + even + over + under;
    val += dozens.reduce((acc, currVal) => {
      return acc + currVal;
    }, 0);
    val += columns.reduce((acc, currVal) => {
      return acc + currVal;
    }, 0);
    val += inside.reduce((acc, currVal) => {
      return acc + currVal;
    }, 0);
    return val;
  }, [red, black, odd, even, over, under, dozens, columns, inside]);

  // Update the clear bet function
  const clearBet = useCallback((e) => {
    if (e) e.preventDefault();
    playSound(menuClickRef);
    setRed(0);
    setBlack(0);
    setOdd(0);
    setEven(0);
    setOver(0);
    setUnder(0);
    dispatchDozens({ type: "reset" });
    dispatchColumns({ type: "reset" });
    dispatchInside({ type: "reset" });
    dispatchEvents({ type: "reset" });
  }, [playSound, menuClickRef]);

  //  Wrap treasury operations in useEffect
  // useEffect(() => {
  //   const handleTreasuryOperations = async () => {
  //     try {
  //       await treasury.sendTokensToUser(address, total);
  //     } catch (error) {
  //       console.error("Failed to send tokens:", error.message);
  //     }

  //     try {
  //       await treasury.handleGameResult(address, total, rollResult, winnings > 0);
  //     } catch (error) {
  //       console.error("Failed to handle game result:", error.message);
  //     }
  //   };

  //   if (address && total > 0) {
  //     handleTreasuryOperations();
  //   }
  // }, [address, total, rollResult, winnings]);

  const { data: playerBalance, isError, isLoading: isBalanceLoading } = useReadContract({
    address: tokenContractAddress,
    abi: tokenABI,
    functionName: 'balanceOf',
    args: [address],
    enabled: Boolean(address),
    watch: true,
    onSuccess: (data) => console.log('Balance data:', data),
    onError: (error) => console.error('Balance error:', error)
  });

  // Test contract connection
  const testContractConnection = async () => {
    try {
      console.log('Testing contract connection...');
      
      const contract = getContract({
        address: rouletteContractAddress,
        abi: rouletteABI,
        client: ViemClient.publicBinanceTestnetClient,
      });
      
      // Try to call a simple view function
      const currentRound = await contract.read.currentRound();
      console.log('Contract connection successful. Current round:', currentRound.toString());
      alert('Contract connection successful!');
      
    } catch (error) {
      console.error('Contract connection failed:', error);
      alert(`Contract connection failed: ${error.message}`);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="font-sans" style={{ backgroundColor: "#080005", minHeight: "100vh", overflowX: 'hidden' }}>
        {/* Audio elements */}
        <audio ref={spinSoundRef} src="/sounds/ball-spin.mp3" preload="auto" />
        <audio ref={winSoundRef} src="/sounds/win-chips.mp3" preload="auto" />
     //   <audio ref={chipSelectRef} src="/sounds/chip-select.mp3" preload="auto" />
        <audio ref={chipPlaceRef} src="/sounds/chip-put.mp3" preload="auto" />
        <audio ref={menuClickRef} src="/sounds/menu.mp3" preload="auto" />
        <audio ref={backgroundMusicRef} src="/sounds/background-music.mp3" preload="auto" loop />
        <audio ref={ambientSoundsRef} src="/sounds/ambient-sounds.mp3" preload="auto" loop />

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            pt: { xs: 12, md: 14 },
          }}
        >
          {/* Recent Results Bar */}
          {/* <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              overflowX: 'auto',
              py: 1,
              backgroundColor: 'rgba(0,0,0,0.2)',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              gap: 1
            }}
          >
            <Typography 
              variant="body2" 
              sx={{ 
                mr: 2, 
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '24px',
                color: 'white',
              }}
            >
              Recent Results:
            </Typography>
            {recentResults.length === 0 ? (
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'text.secondary',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '24px',
                  opacity: 0.7
                }}
              >
                No results yet
              </Typography>
            ) : (
              recentResults.map((num, idx) => (
                <Box 
                  key={idx} 
                  sx={{ 
                    width: 24, 
                    height: 24, 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    backgroundColor: num === 0 ? 'game.green' : 
                      [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(num) ? 'game.red' : 'dark.bg'
                  }}
                >
                  {num}
                </Box>
              ))
            )}
          </Box> */}

          {/* Play Button */}
          {/* <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              mt: 2,
              mb: 2
            }}
          >
            <Button
              onClick={lockBet}
              disabled={submitDisabled || total <= 0}
              sx={{
                backgroundColor: 'game.green',
                color: 'white',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                padding: '12px 48px',
                borderRadius: '25px',
                '&:hover': {
                  backgroundColor: 'game.green',
                  opacity: 0.9
                },
                '&:disabled': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'rgba(255, 255, 255, 0.5)'
                }
              }}
            >
              {submitDisabled ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'PLAY'
              )}
            </Button>
          </Box> */}

          {/* Responsive Grid Layout */}
          <Grid 
            container 
            sx={{ mt: { xs: 2, md: 10 }, mx: { xs: 1, sm: 5, md: 10 } }}
            columns={isSmallScreen ? 7 : 14}
          >
            <Grid md={1}>
              <GridZero inside={inside} placeBet={placeBet} />
            </Grid>
            <Grid md={4} container columns={12}>
              {firstThird.map((val, ind) => (
                <Grid md={3} key={`first-third-${val.val}`}>
                  <GridInside
                    insideNumber={val.val}
                    red={val?.red}
                    topEdge={ind < 4}
                    placeBet={placeBet}
                    straightup={inside[(val.val - 1) * 4 + 1]}
                    splitleft={inside[(val.val - 1) * 4 + 2]}
                    splitbottom={inside[(val.val - 1) * 4 + 3]}
                    corner={inside[(val.val - 1) * 4 + 4]}
                    isWinner={rollResult === val.val}
                  />
                </Grid>
              ))}
            </Grid>
            <Grid md={4} container columns={12}>
              {secondThird.map((val, ind) => (
                <Grid md={3} key={`second-third-${val.val}`}>
                  <GridInside
                    insideNumber={val.val}
                    red={val?.red}
                    topEdge={ind < 4}
                    placeBet={placeBet}
                    straightup={inside[(val.val - 1) * 4 + 1]}
                    splitleft={inside[(val.val - 1) * 4 + 2]}
                    splitbottom={inside[(val.val - 1) * 4 + 3]}
                    corner={inside[(val.val - 1) * 4 + 4]}
                    isWinner={rollResult === val.val}
                  />
                </Grid>
              ))}
            </Grid>
            <Grid md={4} container columns={12}>
              {thirdThird.map((val, ind) => (
                <Grid md={3} key={`third-third-${val.val}`}>
                  <GridInside
                    insideNumber={val.val}
                    red={val?.red}
                    topEdge={ind < 4}
                    placeBet={placeBet}
                    straightup={inside[(val.val - 1) * 4 + 1]}
                    splitleft={inside[(val.val - 1) * 4 + 2]}
                    splitbottom={inside[(val.val - 1) * 4 + 3]}
                    corner={inside[(val.val - 1) * 4 + 4]}
                    isWinner={rollResult === val.val}
                  />
                </Grid>
              ))}
            </Grid>
            <Grid md={1} sx={{ display: "flex", alignItems: "stretch" }}>
              <Box
                sx={{ display: "flex", flexDirection: "column", width: "100%" }}
              >
                <GridColumnBet
                  topCard={true}
                  columns={columns}
                  index={0}
                  bet={bet}
                  placeBet={placeBet}
                />
                <GridColumnBet
                  columns={columns}
                  index={1}
                  bet={bet}
                  placeBet={placeBet}
                />
                <GridColumnBet
                  bottomCard={true}
                  columns={columns}
                  index={2}
                  bet={bet}
                  placeBet={placeBet}
                />
              </Box>
            </Grid>

            <Grid md={1} />
            <Grid md={4}>
              <GridOutsideBet onClick={(e) => placeBet(e, "dozens", 0)}>
                <Typography variant="h5">1st 12</Typography>
                {dozens[0] > 0 && (
                  <BetBox
                    betValue={dozens[0]}
                    betType="1st 12"
                    onClick={(e) => placeBet(e, "dozens", 0)}
                  />
                )}
              </GridOutsideBet>
            </Grid>
            <Grid md={4}>
              <GridOutsideBet onClick={(e) => placeBet(e, "dozens", 1)}>
                <Typography variant="h5">2nd 12</Typography>
                {dozens[1] > 0 && (
                  <BetBox
                    betValue={dozens[1]}
                    betType="2nd 12"
                    onClick={(e) => placeBet(e, "dozens", 1)}
                  />
                )}
              </GridOutsideBet>
            </Grid>
            <Grid md={4}>
              <GridOutsideBet
                rightCard={true}
                onClick={(e) => placeBet(e, "dozens", 2)}
              >
                <Typography variant="h5">3rd 12</Typography>
                {dozens[2] > 0 && (
                  <BetBox
                    betValue={dozens[2]}
                    betType="3rd 12"
                    onClick={(e) => placeBet(e, "dozens", 2)}
                  />
                )}
              </GridOutsideBet>
            </Grid>
            <Grid
              md={1}
              sx={{
                borderLeft: (theme) => `10px solid ${theme.palette.dark.card}`,
              }}
            />

            <Grid md={1} />
            <Grid md={2}>
              <GridOutsideBet onClick={(e) => placeBet(e, "under")}>
                <Typography variant="h5">1-18</Typography>
                {under > 0 && (
                  <BetBox
                    betValue={under}
                    betType="Under (1-18)"
                    onClick={(e) => placeBet(e, "under")}
                  />
                )}
              </GridOutsideBet>
            </Grid>
            <Grid md={2}>
              <GridOutsideBet onClick={(e) => placeBet(e, "even")}>
                <Typography variant="h5">Even</Typography>
                {even > 0 && (
                  <BetBox
                    betValue={even}
                    betType="Even"
                    onClick={(e) => placeBet(e, "even")}
                  />
                )}
              </GridOutsideBet>
            </Grid>
            <Grid md={2}>
              <GridOutsideBet onClick={(e) => placeBet(e, "red")}>
                <Box
                  sx={{
                    width: "32px",
                    height: "32px",
                    backgroundColor: (theme) => theme.palette.game.red,
                  }}
                />
                {red > 0 && (
                  <BetBox
                    betValue={red}
                    betType="Red"
                    onClick={(e) => placeBet(e, "red")}
                  />
                )}
              </GridOutsideBet>
            </Grid>
            <Grid md={2}>
              <GridOutsideBet onClick={(e) => placeBet(e, "black")}>
                <Box
                  sx={{
                    width: "32px",
                    height: "32px",
                    backgroundColor: (theme) => theme.palette.dark.bg,
                  }}
                />
                {black > 0 && (
                  <BetBox
                    betValue={black}
                    betType="Black"
                    onClick={(e) => placeBet(e, "black")}
                  />
                )}
              </GridOutsideBet>
            </Grid>
            <Grid md={2}>
              <GridOutsideBet onClick={(e) => placeBet(e, "odd")}>
                <Typography variant="h5">Odd</Typography>
                {odd > 0 && (
                  <BetBox
                    betValue={odd}
                    betType="Odd"
                    onClick={(e) => placeBet(e, "odd")}
                  />
                )}
              </GridOutsideBet>
            </Grid>
            <Grid md={2}>
              <GridOutsideBet
                rightCard={true}
                onClick={(e) => placeBet(e, "over")}
              >
                <Typography variant="h5">19-36</Typography>
                {over > 0 && (
                  <BetBox
                    betValue={over}
                    betType="Over (19-36)"
                    onClick={(e) => placeBet(e, "over")}
                  />
                )}
              </GridOutsideBet>
            </Grid>
            <Grid
              md={1}
              sx={{
                borderLeft: (theme) => `10px solid ${theme.palette.dark.card}`,
              }}
            />
          </Grid>

          <Box
            sx={{
              mt: 2,
              display: "flex",
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'center', md: 'flex-start' },
              justifyContent: "center",
              mb: 5,
              gap: 4,
            }}
          >
            <Box
              sx={{ display: "flex", flexDirection: "column", mb: { xs: 3, md: 0 } }}
            >
              <Typography variant="h3" color="text.accent">
                Roulette
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <TooltipWide title={<Typography>{rouletteTutorial}</Typography>}>
                <Box
                    sx={{ display: "flex", alignItems: "center", cursor: 'pointer' }}
                  color="text.secondary"
                    onClick={() => setShowHelp(!showHelp)}
                >
                  <Typography variant="h6">Tutorial</Typography>
                  <InfoIcon sx={{ ml: 1 }} />
                </Box>
              </TooltipWide>
              <TooltipWide
                title={
                  <Box sx={{ display: "flex", flexDirection: "column" }}>
                    {rouletteOdds.map((v, ind) => (
                      <Typography key={`tutorial-odds-${ind}`}>{v}</Typography>
                    ))}
                  </Box>
                }
              >
                <Box
                    sx={{ display: "flex", alignItems: "center", cursor: 'pointer' }}
                  color="text.secondary"
                >
                  <Typography variant="h6">Odds</Typography>
                  <InfoIcon sx={{ ml: 1 }} />
                </Box>
              </TooltipWide>
            </Box>
              
              {/* Animated Roulette Wheel */}
              <RouletteWheel 
                spinning={wheelSpinning} 
                result={rollResult} 
                onSpinComplete={handleSpinComplete}
                onSpinStart={() => playSound(spinSoundRef)}
                onWin={() => playSound(winSoundRef)}
              />
            </Box>
            
            {/* Betting Controls */}
            <Box sx={{ 
              display: "flex", 
              flexDirection: "column",
              width: { xs: '100%', md: 'auto' },
              maxWidth: { xs: '400px', md: 'none' }
            }}>
              <TextFieldCurrency
                label="Bet Amount"
                variant="standard"
                value={bet}
                handleChange={handleBetChange}
              />
              <Box sx={{ mt: 2, mb: 1 }}>
                <Typography variant="body1" color="white">
                  Total Balance:{" "}
                  {balance === '0' ? (
                    <CircularProgress size={16} />
                  ) : (
                    `${currency(balance, { pattern: "#", precision: 4 }).format()} APTC`
                  )}
              </Typography>
            </Box>
              <Typography color="white" sx={{ opacity: 0.8 }}>
                Current Bet Total: {currency(total, { pattern: "#" }).format()} APTC
              </Typography>
              
              {/* Quick Bet Buttons */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                {[1, 5, 10, 25, 50, 100].map(amount => (
                  <Button 
                    key={amount}
                    onClick={() => setBet(amount)}
                    sx={{ 
                      minWidth: '40px', 
                      height: '30px', 
                      py: 0, 
                      backgroundColor: bet === amount ? 'primary.light' : 'rgba(255,255,255,0.1)'
                    }}
                  >
                    {amount}
                  </Button>
                ))}
              </Box>
            </Box>
            
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                ml: { xs: 0, md: 3 },
                mt: { xs: 0, md: 1 },
              }}
            >
              <Box sx={{ display: 'flex', gap: 2 }}>
              <Tooltip title={<Typography>Undo last bet</Typography>}>
                <span>
                  <IconButton
                    disabled={events.length === 0 || submitDisabled}
                    onClick={revertEvent}
                  >
                    <UndoIcon />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title={<Typography>Clear bet</Typography>}>
                <IconButton
                  disabled={submitDisabled}
                    onClick={clearBet}
                >
                  <ClearIcon />
                </IconButton>
              </Tooltip>
            </Box>
              
              <Box sx={{ mt: 3 }}>
              {rollResult >= 0 ? (
                <Box>
                  {winnings > 0 ? (
                      <Button 
                        onClick={() => handleWithdrawWinnings(winnings)}
                        sx={{
                          animation: 'pulse 1.5s infinite',
                          '@keyframes pulse': {
                            '0%': { transform: 'scale(1)' },
                            '50%': { transform: 'scale(1.05)' },
                            '100%': { transform: 'scale(1)' },
                          }
                        }}
                      >
                        Collect {winnings} APTC
                      </Button>
                    ) : (
                      <Button onClick={() => placeBet(null, null, null, 0, true)}>Go Again</Button>
                    )}
                    <Box sx={{ mt: 1, textAlign: 'center' }}>
                      <Typography variant="h5">
                        Result: <span style={{ 
                          color: rollResult === 0 ? '#14D854' : 
                                 [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(rollResult) ? '#d82633' : 'white'
                        }}>{rollResult}</span>
                    </Typography>
                      {winnings > 0 ? (
                        <Typography variant="body1" color="success.main" sx={{ animation: 'fadeIn 1s', fontWeight: 'bold' }}>
                          You won {winnings} APTC!
                        </Typography>
                      ) : (
                        <Typography variant="body1" color="white" sx={{ opacity: 0.8 }}>
                          Better luck next time!
                        </Typography>
                      )}
                  </Box>
                </Box>
              ) : correctNetwork ? (
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Button
                    disabled={total === 0}
                    loading={submitDisabled}
                      onClick={lockBet}
                  >
                    Submit Bet
                  </Button>
                  {submitDisabled && rollResult < 0 && (
                      <Typography color="white" sx={{ opacity: 0.8 }}>
                      Die being rolled, please wait...
                    </Typography>
                  )}
                </Box>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <Button onClick={() => switchNetwork()}>Switch Network</Button>
                </Box>
              )}
            </Box>
          </Box>
            
            {/* Toggle between History and Stats */}
            <Box sx={{ width: { xs: '100%', md: '300px' }, mt: { xs: 4, md: 0 } }}>
              <Box sx={{ display: 'flex', mb: 1 }}>
                <Button 
                  onClick={() => setShowBettingStats(false)}
                  sx={{ 
                    flex: 1, 
                    borderBottom: !showBettingStats ? '2px solid #681DDB' : '2px solid transparent'
                  }}
                >
                  History
                </Button>
                <Button 
                  onClick={() => setShowBettingStats(true)}
                  sx={{ 
                    flex: 1, 
                    borderBottom: showBettingStats ? '2px solid #681DDB' : '2px solid transparent'
                  }}
                >
                  Stats
                </Button>
        </Box>

              {showBettingStats ? (
                <BettingStats history={bettingHistory} />
              ) : (
                <BettingHistory history={bettingHistory} />
              )}
            </Box>
          </Box>
          
          {/* Help Modal for Mobile */}
          {showHelp && (
            <Box
              sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.8)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 2
              }}
              onClick={() => setShowHelp(false)}
            >
              <Box
                sx={{
                  backgroundColor: 'bg.light',
                  p: 3,
                  borderRadius: 2,
                  maxWidth: 600,
                  maxHeight: '80vh',
                  overflow: 'auto'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <Typography variant="h5" sx={{ mb: 2 }}>How to Play Roulette</Typography>
                <Typography paragraph>{rouletteTutorial}</Typography>
                <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Payout Odds</Typography>
                {rouletteOdds.map((odd, index) => (
                  <Typography key={index} paragraph>
                    {odd}
                  </Typography>
                ))}
                <Button 
                  onClick={() => setShowHelp(false)}
                  sx={{ mt: 2 }}
                >
                  Close
                </Button>
              </Box>
            </Box>
          )}
          
          <GameDetail gameData={gameData} bettingTableData={bettingTableData} />
        </Box>
{/* <TreasuryUI /> */}
{/* <TreasuryTest /> */}

        <Snackbar
          open={showNotification}
          autoHideDuration={notificationIndex === notificationSteps.RESULT_READY ? 5000 : null}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={handleCloseNotification}
            severity={notificationIndex === notificationSteps.RESULT_READY ? (winnings > 0 ? "success" : "error") : "info"}
            sx={{ width: "100%" }}
          >
            {notificationMessages[notificationIndex]}
            {notificationIndex === notificationSteps.RESULT_READY && (
              <Typography>
                {winnings > 0
                  ? `You won ${winnings} APTC!`
                  : "Better luck next time!"}
              </Typography>
            )}
          </Alert>
        </Snackbar>

        {/* Sound control button - add near the top of the UI */}
        <Box sx={{ position: 'fixed', top: 15, right: 15, zIndex: 100 }}>
          <IconButton 
            onClick={toggleSound}
            sx={{ 
              backgroundColor: 'rgba(0,0,0,0.5)', 
              color: 'white',
              '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' }
            }}
            aria-label={isMuted ? "Unmute sound" : "Mute sound"}
          >
            {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
          </IconButton>
        </Box>
      </div>
    </ThemeProvider>
  );
}
