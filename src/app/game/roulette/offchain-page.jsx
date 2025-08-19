"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { useOffChainCasino } from "@/hooks/useOffChainCasino";
import ConnectWalletButton from "@/components/ConnectWalletButton";

// Casino Wallet Contract (simplified for transactions only)
const CASINO_WALLET_ADDRESS = process.env.NEXT_PUBLIC_CASINO_WALLET_ADDRESS;
const CASINO_WALLET_ABI = [
  {
    inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
    name: "deposit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "balances",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];

const RouletteNumber = ({ number, isWinning, onClick, isSelected }) => {
  const isRed = [
    1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
  ].includes(number);
  const isBlack = [
    2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35,
  ].includes(number);

  let bgColor = "#2e7d32"; // Green for 0
  if (isRed) bgColor = "#d32f2f";
  if (isBlack) bgColor = "#424242";

  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      animate={
        isWinning
          ? {
              boxShadow: [
                "0 0 0 0 rgba(255,215,0,0.7)",
                "0 0 0 10px rgba(255,215,0,0)",
                "0 0 0 0 rgba(255,215,0,0)",
              ],
              scale: [1, 1.2, 1],
            }
          : {}
      }
      transition={{ duration: 0.6 }}
    >
      <Box
        onClick={() => onClick(number)}
        sx={{
          width: 40,
          height: 40,
          backgroundColor: bgColor,
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 1,
          cursor: "pointer",
          border: isSelected ? "2px solid #ffd700" : "1px solid #666",
          fontSize: "14px",
          fontWeight: "bold",
          "&:hover": {
            opacity: 0.8,
          },
        }}
      >
        {number}
      </Box>
    </motion.div>
  );
};

export default function OffChainRoulette() {
  const {
    balance,
    isConnected,
    address,
    isPlaying,
    gameSession,
    clientSeed,
    serverSeedHash,
    nonce,
    lastGameResult,
    initializeGame,
    deposit,
    withdraw,
    playRoulette,
    changeClientSeed,
  } = useOffChainCasino(CASINO_WALLET_ADDRESS, CASINO_WALLET_ABI);

  // Betting state
  const [selectedBets, setSelectedBets] = useState([]);
  const [betAmount, setBetAmount] = useState(10);
  const [depositAmount, setDepositAmount] = useState(100);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [customClientSeed, setCustomClientSeed] = useState("");
  const [winningNumber, setWinningNumber] = useState(null);
  const [showResult, setShowResult] = useState(false);

  // Initialize game session on component mount
  useEffect(() => {
    if (isConnected && !gameSession) {
      initializeGame("roulette");
    }
  }, [isConnected, gameSession, initializeGame]);

  // Display last game result
  useEffect(() => {
    if (lastGameResult && lastGameResult.gameType === "roulette") {
      setWinningNumber(lastGameResult.result.result);
      setShowResult(true);

      // Clear result after 5 seconds
      setTimeout(() => {
        setShowResult(false);
        setWinningNumber(null);
      }, 5000);
    }
  }, [lastGameResult]);

  const handleNumberBet = (number) => {
    const existingBet = selectedBets.find(
      (bet) => bet.type === "number" && bet.value === number
    );
    if (existingBet) {
      // Remove bet
      setSelectedBets((prev) =>
        prev.filter((bet) => !(bet.type === "number" && bet.value === number))
      );
    } else {
      // Add bet
      setSelectedBets((prev) => [
        ...prev,
        { type: "number", value: number, amount: betAmount },
      ]);
    }
  };

  const handleOutsideBet = (type) => {
    const existingBet = selectedBets.find((bet) => bet.type === type);
    if (existingBet) {
      setSelectedBets((prev) => prev.filter((bet) => bet.type !== type));
    } else {
      setSelectedBets((prev) => [...prev, { type, amount: betAmount }]);
    }
  };

  const handleSpin = async () => {
    if (selectedBets.length === 0) {
      toast.error("Please place at least one bet");
      return;
    }

    const totalBet = selectedBets.reduce((sum, bet) => sum + bet.amount, 0);
    if (totalBet > balance) {
      toast.error("Insufficient balance");
      return;
    }

    try {
      const result = await playRoulette(selectedBets);
      if (result) {
        toast.success(
          `Spin complete! Winning number: ${result.gameResult.result}`
        );
        setSelectedBets([]); // Clear bets for next round
      }
    } catch (error) {
      toast.error("Failed to spin roulette");
    }
  };

  const handleDeposit = async () => {
    if (depositAmount > 0) {
      await deposit(depositAmount);
    }
  };

  const handleWithdraw = async () => {
    if (withdrawAmount > 0 && withdrawAmount <= balance) {
      await withdraw(withdrawAmount);
    }
  };

  const handleSeedChange = () => {
    if (customClientSeed.trim()) {
      changeClientSeed(customClientSeed.trim());
      setCustomClientSeed("");
    }
  };

  if (!isConnected) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <ConnectWalletButton />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      {/* Header */}
      <Typography variant="h3" gutterBottom align="center" sx={{ mb: 4 }}>
        🎰 Off-Chain Roulette
      </Typography>

      <Grid container spacing={4}>
        {/* Wallet Panel */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                💰 Casino Wallet
              </Typography>
              <Typography variant="h4" color="primary" gutterBottom>
                {balance.toFixed(4)} TOKENS
              </Typography>

              <Box sx={{ mt: 2 }}>
                <TextField
                  label="Deposit Amount"
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  fullWidth
                  sx={{ mb: 2 }}
                />
                <Button
                  variant="contained"
                  onClick={handleDeposit}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  Deposit
                </Button>

                <TextField
                  label="Withdraw Amount"
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                  fullWidth
                  sx={{ mb: 2 }}
                />
                <Button
                  variant="outlined"
                  onClick={handleWithdraw}
                  fullWidth
                  disabled={withdrawAmount > balance}
                >
                  Withdraw
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Fairness Panel */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🔍 Provably Fair
              </Typography>

              <Typography variant="body2" gutterBottom>
                <strong>Client Seed:</strong> {clientSeed.substring(0, 20)}...
              </Typography>

              <Typography variant="body2" gutterBottom>
                <strong>Server Seed Hash:</strong>{" "}
                {serverSeedHash.substring(0, 20)}...
              </Typography>

              <Typography variant="body2" gutterBottom>
                <strong>Nonce:</strong> {nonce}
              </Typography>

              <TextField
                label="Custom Client Seed"
                value={customClientSeed}
                onChange={(e) => setCustomClientSeed(e.target.value)}
                fullWidth
                sx={{ mt: 2, mb: 1 }}
                size="small"
              />
              <Button
                variant="outlined"
                onClick={handleSeedChange}
                size="small"
                fullWidth
              >
                Update Seed
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Game Panel */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              {/* Result Display */}
              <AnimatePresence>
                {showResult && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                  >
                    <Box
                      sx={{
                        textAlign: "center",
                        mb: 3,
                        p: 2,
                        backgroundColor: "#f5f5f5",
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant="h4">
                        🎊 Winning Number: {winningNumber} 🎊
                      </Typography>
                      {lastGameResult && (
                        <Typography variant="h6" color="primary">
                          Total Won: {lastGameResult.result.totalWinAmount}{" "}
                          TOKENS
                        </Typography>
                      )}
                    </Box>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Betting Controls */}
              <Box sx={{ mb: 3 }}>
                <TextField
                  label="Bet Amount"
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                  sx={{ mr: 2, width: 150 }}
                />

                <Typography variant="body2" sx={{ mt: 1 }}>
                  Selected Bets: {selectedBets.length} | Total:{" "}
                  {selectedBets.reduce((sum, bet) => sum + bet.amount, 0)}{" "}
                  TOKENS
                </Typography>
              </Box>

              {/* Numbers Grid */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Numbers
                </Typography>
                <Grid container spacing={1}>
                  {[0, ...Array(36).keys()].map((i) => (
                    <Grid item key={i}>
                      <RouletteNumber
                        number={i}
                        isWinning={winningNumber === i}
                        onClick={handleNumberBet}
                        isSelected={selectedBets.some(
                          (bet) => bet.type === "number" && bet.value === i
                        )}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* Outside Bets */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Outside Bets
                </Typography>
                <Grid container spacing={2}>
                  {[
                    { type: "red", label: "Red (2:1)", color: "#d32f2f" },
                    { type: "black", label: "Black (2:1)", color: "#424242" },
                    { type: "odd", label: "Odd (2:1)", color: "#666" },
                    { type: "even", label: "Even (2:1)", color: "#666" },
                    { type: "low", label: "1-18 (2:1)", color: "#666" },
                    { type: "high", label: "19-36 (2:1)", color: "#666" },
                  ].map((bet) => (
                    <Grid item key={bet.type}>
                      <Chip
                        label={bet.label}
                        onClick={() => handleOutsideBet(bet.type)}
                        color={
                          selectedBets.some((b) => b.type === bet.type)
                            ? "primary"
                            : "default"
                        }
                        variant={
                          selectedBets.some((b) => b.type === bet.type)
                            ? "filled"
                            : "outlined"
                        }
                        sx={{
                          backgroundColor: selectedBets.some(
                            (b) => b.type === bet.type
                          )
                            ? bet.color
                            : "transparent",
                          color: selectedBets.some((b) => b.type === bet.type)
                            ? "white"
                            : "inherit",
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* Spin Button */}
              <Box sx={{ textAlign: "center" }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleSpin}
                  disabled={isPlaying || selectedBets.length === 0}
                  sx={{
                    minWidth: 200,
                    minHeight: 60,
                    fontSize: "1.2rem",
                    background:
                      "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
                  }}
                >
                  {isPlaying ? "🎰 Spinning..." : "🎰 SPIN ROULETTE"}
                </Button>
              </Box>

              {/* Selected Bets Display */}
              {selectedBets.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Selected Bets:
                  </Typography>
                  {selectedBets.map((bet, index) => (
                    <Chip
                      key={index}
                      label={`${bet.type}${
                        bet.value !== undefined ? ` ${bet.value}` : ""
                      }: ${bet.amount} TOKENS`}
                      onDelete={() => {
                        setSelectedBets((prev) =>
                          prev.filter((_, i) => i !== index)
                        );
                      }}
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Game History */}
      {lastGameResult && (
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🎲 Last Game Result
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography>
                  <strong>Winning Number:</strong>{" "}
                  {lastGameResult.result.result}
                </Typography>
                <Typography>
                  <strong>Total Bet:</strong>{" "}
                  {lastGameResult.result.totalBetAmount} TOKENS
                </Typography>
                <Typography>
                  <strong>Total Won:</strong>{" "}
                  {lastGameResult.result.totalWinAmount} TOKENS
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography>
                  <strong>Client Seed:</strong> {lastGameResult.clientSeed}
                </Typography>
                <Typography>
                  <strong>Server Seed:</strong>{" "}
                  {lastGameResult.serverSeed.substring(0, 20)}...
                </Typography>
                <Typography>
                  <strong>Nonce:</strong> {lastGameResult.nonce}
                </Typography>
                <Typography>
                  <strong>Random Value:</strong>{" "}
                  {lastGameResult.result.randomValue.toFixed(8)}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
