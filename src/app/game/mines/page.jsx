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
          {/* Background Elements */}
          <div className="absolute top-5 -right-32 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-28 left-1/3 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-20 left-1/4 w-48 h-48 bg-pink-500/5 rounded-full blur-3xl"></div>
          
          <div className="relative">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              {/* Left Column - Game Info */}
              <div className="md:w-3/4">
                <div className="flex items-center">
                  <div className="mr-3 p-3 bg-gradient-to-br from-purple-900/40 to-purple-700/10 rounded-lg shadow-lg shadow-purple-900/10 border border-purple-800/20">
                    <GiMineExplosion className="text-3xl text-purple-300" />
                  </div>
              <div>
                    <motion.div 
                      className="flex items-center gap-2"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p className="text-sm text-gray-400 font-sans">Games / Mines</p>
                      <span className="text-xs px-2 py-0.5 bg-purple-900/30 rounded-full text-purple-300 font-display">Popular</span>
                      <span className="text-xs px-2 py-0.5 bg-green-900/30 rounded-full text-green-300 font-display">Live</span>
                    </motion.div>
                    <motion.h1 
                      className="text-3xl md:text-4xl font-bold font-display bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                    >
                      Mines
                    </motion.h1>
                  </div>
                </div>
                <motion.p 
                  className="text-white/70 mt-2 max-w-xl font-sans"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  Unearth hidden gems while avoiding mines. Higher risk means higher rewards - can you beat the odds?
                </motion.p>
                
                {/* Game highlights */}
                <motion.div 
                  className="flex flex-wrap gap-3 mt-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <div className="flex items-center text-sm bg-gradient-to-r from-purple-900/30 to-purple-800/10 px-3 py-1.5 rounded-full">
                    <FaBomb className="mr-1.5 text-red-400" />
                    <span className="font-sans">Up to 24 mines</span>
                  </div>
                  <div className="flex items-center text-sm bg-gradient-to-r from-purple-900/30 to-purple-800/10 px-3 py-1.5 rounded-full">
                    <GiDiamonds className="mr-1.5 text-blue-400" />
                    <span className="font-sans">Customizable game grid</span>
                  </div>
                  <div className="flex items-center text-sm bg-gradient-to-r from-purple-900/30 to-purple-800/10 px-3 py-1.5 rounded-full">
                    <GiCrystalGrowth className="mr-1.5 text-green-400" />
                    <span className="font-sans">Provably fair gaming</span>
                  </div>
                </motion.div>
              </div>
              
              {/* Right Column - Stats and Controls */}
              <div className="md:w-3/4">
                <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/5 rounded-xl p-3 border border-purple-800/20 shadow-lg shadow-purple-900/10">
                  {/* Quick stats in top row */}
                  <motion.div 
                    className="grid grid-cols-3 gap-2 mb-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    <div className="flex flex-col items-center p-2 bg-black/20 rounded-lg">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600/20 mb-1">
                        <FaChartLine className="text-blue-400" />
                      </div>
                      <div className="text-xs text-white/50 font-sans text-center">Total Bets</div>
                      <div className="text-white font-display text-sm md:text-base">{gameStatistics.totalBets}</div>
                    </div>
                    
                    <div className="flex flex-col items-center p-2 bg-black/20 rounded-lg">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-600/20 mb-1">
                        <GiGoldBar className="text-yellow-400" />
                      </div>
                      <div className="text-xs text-white/50 font-sans text-center">Volume</div>
                      <div className="text-white font-display text-sm md:text-base">{gameStatistics.totalVolume}</div>
                    </div>
                    
                    <div className="flex flex-col items-center p-2 bg-black/20 rounded-lg">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-600/20 mb-1">
                        <FaTrophy className="text-yellow-500" />
                      </div>
                      <div className="text-xs text-white/50 font-sans text-center">Max Win</div>
                      <div className="text-white font-display text-sm md:text-base">{gameStatistics.maxWin}</div>
                    </div>
                  </motion.div>
                  
                  {/* Quick actions */}
                  <motion.div
                    className="flex flex-wrap justify-between gap-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <button 
                      onClick={() => scrollToElement('strategy-guide')}
                      className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-purple-800/40 to-purple-900/20 rounded-lg text-white font-medium text-sm hover:from-purple-700/40 hover:to-purple-800/20 transition-all duration-300"
                    >
                      <GiCardRandom className="mr-2" />
                      Strategy Guide
                    </button>
                    <button 
                      onClick={() => scrollToElement('probability')}
                      className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-800/40 to-blue-900/20 rounded-lg text-white font-medium text-sm hover:from-blue-700/40 hover:to-blue-800/20 transition-all duration-300"
                    >
                      <HiOutlineChartBar className="mr-2" />
                      Probabilities
                    </button>
                    <button 
                      onClick={() => scrollToElement('history')}
                      className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-pink-800/40 to-pink-900/20 rounded-lg text-white font-medium text-sm hover:from-pink-700/40 hover:to-pink-800/20 transition-all duration-300"
                    >
                      <FaHistory className="mr-2" />
                      Game History
                    </button>
                  </motion.div>
                </div>
              </div>
            </div>

            <div className="w-full h-0.5 bg-gradient-to-r from-purple-600 via-blue-500/30 to-transparent mt-6"></div>
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
      <AIAutoBetting 
        isActive={isAIActive} 
        onActivate={handleAIToggle}
        onSettings={() => setShowAISettings(true)} 
      />
      
      <AISettingsModal
        isOpen={showAISettings}
        onClose={() => setShowAISettings(false)}
        onSave={handleAISettingsSave}
        currentSettings={aiSettings}
      />
    </div>
  );
}