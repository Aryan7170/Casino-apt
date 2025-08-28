"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Tooltip,
  Fade,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useAccount, useBalance } from "wagmi";
import { useToken } from "@/hooks/useToken";
import { useOffChainCasinoGames } from "@/hooks/useOffChainCasinoGames";

const BalanceContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: "8px 16px",
  background: "rgba(198, 157, 242, 0.1)",
  borderRadius: "12px",
  border: "1px solid rgba(198, 157, 242, 0.2)",
  backdropFilter: "blur(10px)",
  transition: "all 0.3s ease",
  "&:hover": {
    background: "rgba(198, 157, 242, 0.15)",
    transform: "translateY(-1px)",
    boxShadow: "0 4px 20px rgba(198, 157, 242, 0.15)",
  },
}));

const TokenContainer = styled(Box)({
  display: "flex",
  alignItems: "center",
  cursor: "pointer",
  position: "relative",
});

const DevModeBadge = styled(Box)({
  position: "absolute",
  top: "-12px",
  right: "-12px",
  background: "rgba(245, 158, 11, 0.8)",
  color: "white",
  fontSize: "0.6rem",
  padding: "2px 4px",
  borderRadius: "4px",
  fontWeight: "bold",
});

const TokenBalance = () => {
  // Use Wagmi hooks properly
  const { address, isConnected } = useAccount();
  const { data: balance, isLoading: balanceLoading } = useBalance({
    address: address,
  });

  // Get APTC token balance
  const { balance: aptcBalance, isLoading: aptcLoading } = useToken(address);

  // Get off-chain casino balance
  const { offChainBalance, isLoading: offChainLoading } =
    useOffChainCasinoGames();

  const [balances, setBalances] = useState({
    APTC: "0",
    MNT: "0",
    CASINO: "0",
  });
  const [selectedToken, setSelectedToken] = useState("CASINO");
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const isDev = process.env.NODE_ENV === "development";

  useEffect(() => {
    setMounted(true);

    // In development, show mock balances
    if (isDev) {
      setLoading(false);
      setBalances({
        APTC: (Math.random() * 1000 + 100).toFixed(2),
        MNT: (Math.random() * 5 + 0.5).toFixed(4),
        CASINO: (Math.random() * 500 + 50).toFixed(2),
      });
      return;
    }

    // Update balances when wallet data changes
    const newBalances = { ...balances };

    // Update MNT balance (native token)
    if (balance && isConnected) {
      newBalances.MNT = parseFloat(balance.formatted).toFixed(4);
    }

    // Update APTC balance (token)
    if (aptcBalance && isConnected) {
      newBalances.APTC = parseFloat(aptcBalance).toFixed(2);
    }

    // Update casino balance (off-chain)
    if (offChainBalance !== undefined) {
      newBalances.CASINO = parseFloat(offChainBalance).toFixed(2);
    }

    setBalances(newBalances);

    // Set loading state based on any balance loading
    setLoading(balanceLoading || aptcLoading || offChainLoading);
  }, [
    isDev,
    isConnected,
    balance,
    balanceLoading,
    aptcBalance,
    aptcLoading,
    offChainBalance,
    offChainLoading,
  ]);

  // Toggle between tokens
  const toggleToken = () => {
    const tokens = ["CASINO", "APTC", "MNT"];
    const currentIndex = tokens.indexOf(selectedToken);
    const nextIndex = (currentIndex + 1) % tokens.length;
    setSelectedToken(tokens[nextIndex]);
  };

  if (!mounted) {
    return null;
  }

  // Show casino balance even if wallet not connected (for off-chain gaming)
  if (!isConnected && !isDev && offChainBalance !== undefined) {
    return (
      <BalanceContainer onClick={toggleToken}>
        <Typography
          sx={{
            fontFamily: "Inter, sans-serif",
            fontSize: "0.875rem",
            color: "#E0E0E0",
            mr: 1,
            fontWeight: 500,
          }}
        >
          Casino:
        </Typography>
        <Typography
          sx={{
            fontFamily: "Inter, sans-serif",
            fontSize: "1rem",
            fontWeight: 600,
            background: "linear-gradient(90deg, #c69df2 0%, #a67de0 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "-0.01em",
          }}
        >
          {parseFloat(offChainBalance).toFixed(2)} APTC
        </Typography>
      </BalanceContainer>
    );
  }

  // Not connected and no off-chain balance, show connect message
  if (!isConnected && !isDev) {
    return (
      <BalanceContainer sx={{ opacity: 0.7 }}>
        <Typography
          sx={{
            fontFamily: "Inter, sans-serif",
            fontSize: "0.875rem",
            color: "#E0E0E0",
            fontWeight: 500,
          }}
        >
          Connect wallet to view balance
        </Typography>
      </BalanceContainer>
    );
  }

  return (
    <Tooltip
      title={`Click to toggle between balances: ${
        selectedToken === "CASINO"
          ? "Casino Balance"
          : selectedToken === "APTC"
          ? "APTC Token"
          : "Native MNT"
      }`}
      arrow
      placement="bottom"
      TransitionComponent={Fade}
      TransitionProps={{ timeout: 600 }}
    >
      <BalanceContainer onClick={toggleToken}>
        <Typography
          sx={{
            fontFamily: "Inter, sans-serif",
            fontSize: "0.875rem",
            color: "#E0E0E0",
            mr: 1,
            fontWeight: 500,
          }}
        >
          {selectedToken === "CASINO" ? "Casino:" : "Balance:"}
        </Typography>
        {loading ? (
          <CircularProgress size={16} sx={{ color: "#c69df2" }} />
        ) : (
          <TokenContainer>
            {isDev && <DevModeBadge>DEV</DevModeBadge>}
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: "1rem",
                fontWeight: 600,
                background:
                  selectedToken === "CASINO"
                    ? "linear-gradient(90deg, #10b981 0%, #059669 100%)"
                    : "linear-gradient(90deg, #c69df2 0%, #a67de0 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.01em",
              }}
            >
              {balances[selectedToken]}{" "}
              {selectedToken === "CASINO" ? "APTC" : selectedToken}
            </Typography>
          </TokenContainer>
        )}
      </BalanceContainer>
    </Tooltip>
  );
};

export default TokenBalance;
