"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { useDelegationToolkit } from '@/hooks/useDelegationToolkit';

// Components
import Button from "@/components/Button";
import Tabs from "@/components/Tabs";
import ConnectWalletButton from '@/components/ConnectWalletButton';
import GameDetail from "@/components/GameDetail";
import DynamicForm from "./Form";
import Game from "./game";

// Mines Components
import MinesGameDetail from "./components/MinesGameDetail";
import MinesBettingTable from "./components/MinesBettingTable";
import MinesProbability from "./components/MinesProbability";
import MinesHistory from "./components/MinesHistory";
import MinesLeaderboard from "./components/MinesLeaderboard";
import MinesStrategyGuide from "./components/MinesStrategyGuide";
import AIAutoBetting from "./components/AIAutoBetting";
import AISettingsModal from "./components/AISettingsModal";

// Config
import { gameData, bettingTableData, gameStatistics, winProbabilities } from "./config/gameDetail";
import { manualFormConfig, autoFormConfig } from "./config/formConfig";

// Icons
import { 
  FaCrown, FaHistory, FaTrophy, FaInfoCircle, FaChartLine, FaBomb, 
  FaDiscord, FaTelegram, FaTwitter, FaDice, FaCoins, FaChevronDown 
} from "react-icons/fa";
import { 
  GiMining, GiDiamonds, GiCardRandom, GiMineExplosion, 
  GiCrystalGrowth, GiChestArmor, GiGoldBar 
} from "react-icons/gi";
import { HiLightningBolt, HiOutlineTrendingUp, HiOutlineChartBar } from "react-icons/hi";

// Styles
import "./mines.css";

export default function Mines() {
  // Theme
  const { theme } = useTheme();

  // Wallet connection
  const {
    isConnected,
    address,
    loading: walletLoading,
    error: walletError,
    connectWallet
  } = useDelegationToolkit();

  // Game State
  const [betSettings, setBetSettings] = useState({});
  const [activeTab, setActiveTab] = useState("Manual");
  const [gameInstance, setGameInstance] = useState(1);
  const [showTutorial, setShowTutorial] = useState(false);
  const [isStatsExpanded, setIsStatsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submissionRef = useRef(null);
  
  // AI State
  const [isAIActive, setIsAIActive] = useState(false);
  const [showAISettings, setShowAISettings] = useState(false);
  const [aiSettings, setAISettings] = useState({
    strategy: 'balanced',
    maxBet: 100,
    stopLoss: 500,
    targetProfit: 1000,
    riskFactors: {
      adaptToHistory: true,
      maxConsecutiveLosses: 3,
      increaseOnWin: false,
      decreaseOnLoss: true
    },
    tiles: {
      min: 3,
      max: 8
    },
    mines: {
      min: 3,
      max: 10
    }
  });

  // Reset game when wallet disconnects
  useEffect(() => {
    if (!isConnected && !walletLoading) {
      resetGameState();
    }
  }, [isConnected, walletLoading]);

  const resetGameState = () => {
    setBetSettings({});
    setIsAIActive(false);
    setGameInstance(prev => prev + 1);
  };

  // Handle AI toggle
  const handleAIToggle = () => {
    if (!checkWalletConnection()) return;

    if (!isAIActive) {
      const { strategy, tiles, mines } = aiSettings;
      const minesCount = randomInRange(mines.min, mines.max);
      const tilesToReveal = randomInRange(tiles.min, tiles.max);
      const betAmount = getBetAmountByStrategy(strategy);
      
      setBetSettings({
        betAmount,
        mines: minesCount,
        tilesToReveal,
        isAutoBetting: true,
        aiAssist: true
      });
      setGameInstance(prev => prev + 1);
    }
    
    setIsAIActive(!isAIActive);
  };

  const randomInRange = (min, max) => 
    Math.floor(Math.random() * (max - min + 1)) + min;

  const getBetAmountByStrategy = (strategy) => {
    const strategies = {
      conservative: [10, 25, 50],
      balanced: [50, 100, 250],
      aggressive: [100, 250, 500]
    };
    const amounts = strategies[strategy] || [50];
    return amounts[Math.floor(Math.random() * amounts.length)];
  };

  // Handle form submission
  const handleFormSubmit = (formData) => {
    if (!checkWalletConnection()) return;
    if (isSubmitting) return;

    const submissionKey = JSON.stringify(formData) + Date.now();
    if (submissionRef.current === submissionKey) return;
    
    submissionRef.current = submissionKey;
    setIsSubmitting(true);
    
    if (isAIActive) setIsAIActive(false);
    
    setBetSettings({
      ...formData,
      isAutoBetting: activeTab === "Auto"
    });
    
    setGameInstance(prev => prev + 1);
    
    setTimeout(() => {
      setIsSubmitting(false);
      submissionRef.current = null;
    }, 2000);
  };

  // Handle AI settings save
  const handleAISettingsSave = (newSettings) => {
    setAISettings(newSettings);
    
    if (isAIActive) {
      const { strategy, tiles, mines } = newSettings;
      setBetSettings({
        betAmount: getBetAmountByStrategy(strategy),
        mines: randomInRange(mines.min, mines.max),
        tilesToReveal: randomInRange(tiles.min, tiles.max),
        isAutoBetting: true,
        aiAssist: true
      });
      setGameInstance(prev => prev + 1);
    }
  };

  // Check wallet connection
  const checkWalletConnection = () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return false;
    }
    if (walletLoading) {
      alert('Wallet is initializing, please wait');
      return false;
    }
    return true;
  };

  // Tabs configuration
  const tabs = useMemo(() => [
    {
      label: "Manual",
      content: (
        <DynamicForm 
          config={manualFormConfig} 
          onSubmit={handleFormSubmit} 
          isSubmitting={isSubmitting} 
        />
      ),
    },
    {
      label: "Auto",
      content: (
        <DynamicForm 
          config={autoFormConfig} 
          onSubmit={handleFormSubmit} 
          isSubmitting={isSubmitting} 
        />
      ),
    },
  ], [isSubmitting]);

  const handleTabChange = (tabLabel) => {
    setActiveTab(tabLabel);
    submissionRef.current = null;
    setIsSubmitting(false);
  };

  const scrollToElement = (elementId) => {
    const element = document.getElementById(elementId);
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Wallet connection guard
  if (!isConnected || walletLoading) {
    return (
      <div className="min-h-screen bg-[#070005] bg-gradient-to-b from-[#070005] to-[#0e0512] flex flex-col items-center justify-center text-white">
        <div className="bg-gradient-to-br from-purple-900/40 to-purple-700/10 rounded-xl p-8 max-w-md text-center border-2 border-purple-700/30 shadow-xl shadow-purple-900/20">
          <GiMineExplosion className="text-5xl text-purple-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2 font-display">Wallet Required</h3>
          <p className="text-white/70 mb-6 font-sans">
            Connect your wallet to start playing Mines
          </p>
          <ConnectWalletButton 
            onClick={connectWallet}
            loading={walletLoading}
            className="mx-auto"
          />
          {walletError && (
            <div className="mt-4 text-red-400 text-sm font-mono">
              {walletError.message || 'Connection failed'}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070005] bg-gradient-to-b from-[#070005] to-[#0e0512] pb-20 text-white mines-bg">
      <div className="pt-16">
        {/* Header Section */}
        <div className="relative text-white px-4 md:px-8 lg:px-20 mb-8 pt-8 md:pt-10 mt-4">
          {/* Wallet Info */}
          <div className="mb-4 flex flex-wrap gap-4 items-center">
            <div className="bg-purple-900/30 rounded-lg px-4 py-2 text-xs font-mono">
              <span className="text-purple-300">Account:</span> {address ? `${address.slice(0, 8)}...${address.slice(-6)}` : 'Not connected'}
            </div>
          </div>

          {/* Game Title */}
          <div className="flex items-center mb-4">
            <div className="mr-3 p-3 bg-gradient-to-br from-purple-900/40 to-purple-700/10 rounded-lg border border-purple-800/20">
              <GiMineExplosion className="text-3xl text-purple-300" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-display bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                Mines
              </h1>
              <p className="text-white/70 mt-1 font-sans">
                Unearth hidden gems while avoiding mines
              </p>
            </div>
          </div>
        </div>

        {/* Main Game Area */}
        <div className="flex flex-col lg:flex-row gap-4 px-4 md:px-8 lg:px-20">
          {/* Betting Form */}
          <div className="w-full lg:w-1/3 xl:w-1/4">
            <div className="rounded-xl border-2 border-purple-700/30 bg-gradient-to-br from-[#290023]/80 to-[#150012]/90 p-5 shadow-xl shadow-purple-900/20">
              <Tabs tabs={tabs} onTabChange={handleTabChange} />
            </div>
          </div>

          {/* Game Board */}
          <div className="w-full lg:w-2/3 xl:w-3/4 rounded-xl border-2 border-purple-700/30 bg-gradient-to-br from-[#290023]/80 to-[#150012]/90 p-6 md:p-8 shadow-xl shadow-purple-900/20">
            <Game key={gameInstance} betSettings={betSettings} />
          </div>
        </div>

        {/* Game Information Sections */}
        <div className="mt-10 px-4 md:px-8 lg:px-20">
          <MinesGameDetail gameData={gameData} />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
            <MinesBettingTable bettingTableData={bettingTableData} />
            <MinesProbability winProbabilities={winProbabilities} />
          </div>
          
          <div className="mt-6">
            <MinesHistory />
          </div>
          
          <div className="mt-6">
            <MinesLeaderboard />
          </div>

          {/* Strategy Guide */}
          <div className="mt-8 bg-gradient-to-br from-[#290023]/80 to-[#150012]/90 border-2 border-purple-700/30 rounded-xl p-6 shadow-xl shadow-purple-900/20">
            <MinesStrategyGuide 
              isExpanded={isStatsExpanded}
              onExpandToggle={() => setIsStatsExpanded(!isStatsExpanded)}
            />
          </div>
        </div>
      </div>

      {/* AI Components */}
      {/* <AIAutoBetting 
        isActive={isAIActive} 
        onActivate={handleAIToggle}
        onSettings={() => setShowAISettings(true)} 
      /> */}
      
      <AISettingsModal
        isOpen={showAISettings}
        onClose={() => setShowAISettings(false)}
        onSave={handleAISettingsSave}
        currentSettings={aiSettings}
      />
    </div>
  );
}