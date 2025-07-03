"use client";

import { useState, useEffect } from "react";
import GameWheel from "./components/GameWheel.jsx";
import BettingPanel from "./components/BettingPanel.jsx";
import GameHistory from "./components/GameHistory.jsx";
import { calculateResult } from "../../../lib/gameLogic";
import Image from "next/image";
import coin from "../../../../public/coin.png";
import { motion } from "framer-motion";
import {
  FaHistory,
  FaTrophy,
  FaInfoCircle,
  FaChartLine,
  FaCoins,
  FaChevronDown,
  FaPercentage,
  FaBalanceScale,
} from "react-icons/fa";
import {
  GiCardRandom,
  GiWheelbarrow,
  GiSpinningBlades,
  GiTrophyCup,
} from "react-icons/gi";
import { HiOutlineTrendingUp, HiOutlineChartBar } from "react-icons/hi";
import useWalletStatus from '@/hooks/useWalletStatus';
import ConnectWalletButton from '@/components/ConnectWalletButton';
import TokenBalance from '@/components/TokenBalance';
import { useWriteContract, useReadContract } from 'wagmi';
import { readContract } from 'wagmi/actions';
import { wheelContractAddress, wheelABI } from './config/contractDetails';
import { tokenContractAddress, tokenABI } from '../roulette/contractDetails';
import { useChainId } from 'wagmi';
import { config } from '@/app/providers';

// Import new components
import WheelVideo from "./components/WheelVideo";
import WheelDescription from "./components/WheelDescription";
import WheelStrategyGuide from "./components/WheelStrategyGuide";
import WheelProbability from "./components/WheelProbability";
import WheelPayouts from "./components/WheelPayouts";
import WheelHistory from "./components/WheelHistory";

export default function Home() {
  const [balance, setBalance] = useState(1000);
  const [betAmount, setBetAmount] = useState(10);
  const [risk, setRisk] = useState("medium");
  const [noOfSegments, setSegments] = useState(10);
  const [isSpinning, setIsSpinning] = useState(false);
  const [gameMode, setGameMode] = useState("manual");
  const [currentMultiplier, setCurrentMultiplier] = useState(null);
  const [gameHistory, setGameHistory] = useState([]);
  const [targetMultiplier, setTargetMultiplier] = useState(null);
  const [wheelPosition, setWheelPosition] = useState(0);
  const [hasSpun, setHasSpun] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [isStatsExpanded, setIsStatsExpanded] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState('medium');
  const [result, setResult] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [contractResult, setContractResult] = useState(null);
  const [cooldown, setCooldown] = useState(0);
  const [blockWaitMessage, setBlockWaitMessage] = useState("");
  const [blockCheckLoading, setBlockCheckLoading] = useState(false);
  const [resultPopup, setResultPopup] = useState(null);

  // Wallet connection
  const { isConnected, address } = useWalletStatus();
  const { writeContractAsync } = useWriteContract();
  const { data: roundData, refetch: refetchRound } = useReadContract({
    address: wheelContractAddress,
    abi: wheelABI,
    functionName: 'currentRound',
    watch: true,
  });

  const [currentRound, setCurrentRound] = useState(null);
  const chainId = useChainId();

  // Add state for lastBetBlock and MIN_WAIT_BLOCK
  const [lastBetBlock, setLastBetBlock] = useState(null);
  const [minWaitBlock, setMinWaitBlock] = useState(null);
  const [currentBlock, setCurrentBlock] = useState(null);

  useEffect(() => {
    if (roundData !== undefined && roundData !== null) {
      setCurrentRound(BigInt(roundData));
    }
  }, [roundData]);

  // Cooldown timer effect
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => {
        setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [cooldown]);

  // Fetch lastBetBlock, MIN_WAIT_BLOCK, and current block number
  useEffect(() => {
    const fetchBlockData = async () => {
      if (!chainId) return;
      setBlockCheckLoading(true);
      try {
        // Get lastBetBlock
        const lastBlock = await readContract(config, {
          address: wheelContractAddress,
          abi: wheelABI,
          functionName: 'lastBetBlock',
          chainId: Number(chainId),
        });
        setLastBetBlock(Number(lastBlock));
        // Get MIN_WAIT_BLOCK
        const minWait = await readContract(config, {
          address: wheelContractAddress,
          abi: wheelABI,
          functionName: 'MIN_WAIT_BLOCK',
          chainId: Number(chainId),
        });
        setMinWaitBlock(Number(minWait));
        // Get current block number
        const blockNumber = await window.ethereum.request({ method: 'eth_blockNumber' });
        setCurrentBlock(parseInt(blockNumber, 16));
      } catch (err) {
        console.error('Error fetching block data:', err);
      }
      setBlockCheckLoading(false);
    };
    fetchBlockData();
    // Optionally poll every 2 seconds
    const interval = setInterval(fetchBlockData, 2000);
    return () => clearInterval(interval);
  }, [chainId]);

  // Add block wait logic to canBet
  const canBetBlock =
    lastBetBlock !== null && minWaitBlock !== null && currentBlock !== null
      ? currentBlock > lastBetBlock + minWaitBlock
      : true;

  useEffect(() => {
    if (!canBetBlock) {
      setBlockWaitMessage('Please wait for the next block to be mined before placing another bet.');
    } else {
      setBlockWaitMessage('');
    }
  }, [canBetBlock]);

  // Update canBet to include block check
  const canBet =
    isConnected &&
    chainId !== undefined &&
    chainId !== null &&
    betAmount > 0 &&
    !isSpinning &&
    cooldown === 0 &&
    canBetBlock;

  const scrollToElement = (elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
      const yOffset = -100; // Adjust this value for proper scroll position
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const approveTokens = async (amount) => {
    try {
      console.log('Checking token allowance...');
      const allowance = await window.ethereum.request({
        method: 'eth_call',
        params: [{
          to: tokenContractAddress,
          data: '0xdd62ed3e' + address.slice(2).padStart(64, '0') + wheelContractAddress.slice(2).padStart(64, '0')
        }, 'latest']
      });
      console.log('Current allowance:', BigInt(allowance).toString());
      if (BigInt(allowance) < BigInt(amount)) {
        console.log('Insufficient allowance, sending approve transaction...');
        await writeContractAsync({
          address: tokenContractAddress,
          abi: tokenABI,
          functionName: 'approve',
          args: [wheelContractAddress, amount],
        });
        console.log('Token approval transaction sent!');
      } else {
        console.log('Sufficient allowance, no need to approve.');
      }
    } catch (err) {
      console.error('Token approval failed:', err);
      throw err;
    }
  };

  const setWheelToContractResult = (segmentIndex, multiplier) => {
    const segmentAngle = (Math.PI * 2) / noOfSegments;
    const totalSpins = 5;
    const segmentCenter = segmentIndex * segmentAngle + segmentAngle / 2;
    const targetPosition = (Math.PI * 2 * totalSpins) + (Math.PI * 2 - segmentCenter);
    setWheelPosition(targetPosition);
    setCurrentMultiplier(multiplier);
    setHasSpun(true);
    console.log('Wheel set to contract result:', { segmentIndex, multiplier, targetPosition, segmentCenter });
  };

  // Helper: Retry fetching contract result until chainId is available
  const fetchContractResultWithRetry = async (roundId, retries = 5) => {
    if (chainId === undefined || chainId === null) {
      if (retries > 0) {
        await new Promise(res => setTimeout(res, 500));
        return fetchContractResultWithRetry(roundId, retries - 1);
      }
      console.error("Chain ID is undefined after retries, cannot fetch contract result");
      return null;
    }
    return fetchContractResult(roundId);
  };

  const fetchContractResult = async (roundId) => {
    console.log('chainId before readContract', chainId, typeof chainId);
    if (chainId === undefined || chainId === null || isNaN(Number(chainId))) {
      console.error('chainId is not ready, aborting contract call');
      return null;
    }
    try {
      console.log("Fetching result for roundId:", roundId);
      const result = await readContract(config, {
        address: wheelContractAddress,
        abi: wheelABI,
        functionName: 'getResult',
        args: [roundId],
        chainId: Number(chainId),
      });
      if (!result || !Array.isArray(result) || result.length !== 3) {
        console.error("Invalid contract result:", result);
        return null;
      }
      const [multiplier, segmentIndex, isWin] = result;
      return {
        multiplier: Number(multiplier) / 100,
        segmentIndex: Number(segmentIndex),
        isWin
      };
    } catch (err) {
      console.error("Error fetching contract result:", err);
      return null;
    }
  };

  const manulBet = async () => {
    if (!canBet) return;
    setHasSpun(false);
    try {
      const amount = BigInt(Math.floor(betAmount * 1e18));
      const roundId = currentRound !== null ? currentRound : 0n;
      await approveTokens(amount);
      let tx;
      try {
        tx = await writeContractAsync({
          address: wheelContractAddress,
          abi: wheelABI,
          functionName: 'placeBet',
          args: [risk === 'low' ? 0 : risk === 'medium' ? 1 : 2, noOfSegments, amount],
        });
      } catch (err) {
        setIsSpinning(false);
        setResultPopup({ win: false, error: true, message: 'Transaction failed: ' + (err?.message || JSON.stringify(err)) });
        return;
      }
      setCooldown(3);
      setTimeout(async () => {
        const result = await fetchContractResultWithRetry(roundId);
        if (result) {
          setContractResult(result);
          setIsSpinning(true); // Start wheel spin
          setTimeout(() => {
            setIsSpinning(false); // End wheel spin after animation duration
            setResultPopup({
              win: result.isWin && result.multiplier > 0,
              error: false,
              message: result.isWin && result.multiplier > 0
                ? `You won! Multiplier: ${result.multiplier}x`
                : 'You lost this round.',
              contractResult: result
            });
          }, 3200); // match wheel animation duration
          setWheelToContractResult(result.segmentIndex, result.multiplier);
        } else {
          setResultPopup({ win: false, error: true, message: 'Failed to fetch contract result. Please try again later.' });
        }
        refetchRound();
      }, 10000);
    } catch (err) {
      setIsSpinning(false);
      setResultPopup({ win: false, error: true, message: 'Bet failed: ' + (err?.message || JSON.stringify(err)) });
    }
  };

  const autoBet = async ({
    numberOfBets,
    betAmount: initialBetAmount,
    risk,
    noOfSegments,
  }) => {
    if (isSpinning) return;
    let currentBet = initialBetAmount;
    for (let i = 0; i < numberOfBets; i++) {
      setHasSpun(false);
      if (cooldown > 0) {
        await new Promise((resolve) => {
          const interval = setInterval(() => {
            if (cooldown === 0) {
              clearInterval(interval);
              resolve();
            }
          }, 500);
        });
      }
      try {
        const amount = BigInt(Math.floor(currentBet * 1e18));
        const roundId = currentRound !== null ? currentRound : 0n;
        await approveTokens(amount);
        let tx;
        try {
          tx = await writeContractAsync({
            address: wheelContractAddress,
            abi: wheelABI,
            functionName: 'placeBet',
            args: [risk === 'low' ? 0 : risk === 'medium' ? 1 : 2, noOfSegments, amount],
          });
        } catch (err) {
          setIsSpinning(false);
          setResultPopup({ win: false, error: true, message: 'Auto bet failed at bet #' + (i + 1) + ': ' + (err?.message || JSON.stringify(err)) });
          break;
        }
        setCooldown(3);
        await new Promise((resolve) => setTimeout(resolve, 10000));
        const result = await fetchContractResultWithRetry(roundId);
        if (result) {
          setContractResult(result);
          setIsSpinning(true);
          await new Promise((resolve) => setTimeout(resolve, 3200));
          setIsSpinning(false);
          setResultPopup({
            win: result.isWin && result.multiplier > 0,
            error: false,
            message: result.isWin && result.multiplier > 0
              ? `Auto bet #${i + 1}: You won! Multiplier: ${result.multiplier}x`
              : `Auto bet #${i + 1}: You lost this round.`,
            contractResult: result
          });
          setWheelToContractResult(result.segmentIndex, result.multiplier);
        } else {
          setResultPopup({ win: false, error: true, message: `Auto bet #${i + 1}: Failed to fetch contract result. Stopping auto-bet.` });
          break;
        }
        refetchRound();
      } catch (err) {
        setIsSpinning(false);
        setResultPopup({ win: false, error: true, message: 'Auto bet failed: ' + (err?.message || JSON.stringify(err)) });
        break;
      }
    }
  };

  const handleSelectMultiplier = (value) => {
    setTargetMultiplier(value);
  };

  const renderHeader = () => {
    const gameStatistics = {
      totalBets: '1,856,342',
      totalVolume: '8.3M APTC',
      maxWin: '243,500 APTC'
    };
    
    return (
      <div className="relative text-white px-4 md:px-8 lg:px-20 mb-8 pt-20 md:pt-28 mt-0">
        {/* Background Elements */}
        <div className="absolute top-5 -right-32 w-64 h-64 bg-red-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-28 left-1/3 w-32 h-32 bg-green-500/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-20 left-1/4 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl"></div>
        
        <div className="relative">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
            {/* Left Column - Game Info */}
            <div className="md:w-1/2">
              <div className="flex items-center">
                <div className="mr-3 p-3 bg-gradient-to-br from-red-900/40 to-red-700/10 rounded-lg shadow-lg shadow-red-900/10 border border-red-800/20">
                  <GiWheelbarrow className="text-3xl text-red-300" />
                </div>
                <div>
                  <motion.div 
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-sm text-gray-400 font-sans">Games / Wheel</p>
                    <span className="text-xs px-2 py-0.5 bg-red-900/30 rounded-full text-red-300 font-display">Classic</span>
                    <span className="text-xs px-2 py-0.5 bg-green-900/30 rounded-full text-green-300 font-display">Live</span>
                  </motion.div>
                  <motion.h1 
                    className="text-3xl md:text-4xl font-bold font-display bg-gradient-to-r from-red-300 to-amber-300 bg-clip-text text-transparent"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                  >
                    Fortune Wheel
                  </motion.h1>
                </div>
              </div>
              <motion.p 
                className="text-white/70 mt-2 max-w-xl font-sans"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Place your bets and experience the thrill of the spinning wheel. From simple risk levels to customizable segments, the choice is yours.
              </motion.p>
              
              {/* Game highlights */}
              <motion.div 
                className="flex flex-wrap gap-4 mt-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="flex items-center text-sm bg-gradient-to-r from-red-900/30 to-red-800/10 px-3 py-1.5 rounded-full">
                  <FaPercentage className="mr-1.5 text-amber-400" />
                  <span className="font-sans">2.7% house edge</span>
                </div>
                <div className="flex items-center text-sm bg-gradient-to-r from-red-900/30 to-red-800/10 px-3 py-1.5 rounded-full">
                  <GiSpinningBlades className="mr-1.5 text-blue-400" />
                  <span className="font-sans">Multiple risk levels</span>
                </div>
                <div className="flex items-center text-sm bg-gradient-to-r from-red-900/30 to-red-800/10 px-3 py-1.5 rounded-full">
                  <FaBalanceScale className="mr-1.5 text-green-400" />
                  <span className="font-sans">Provably fair gaming</span>
                </div>
              </motion.div>
            </div>
            
            {/* Right Column - Stats and Controls */}
            <div className="md:w-1/2">
              <div className="bg-gradient-to-br from-red-900/20 to-red-800/5 rounded-xl p-4 border border-red-800/20 shadow-lg shadow-red-900/10">
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
                      <FaCoins className="text-yellow-400" />
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
                    className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-red-800/40 to-red-900/20 rounded-lg text-white font-medium text-sm hover:from-red-700/40 hover:to-red-800/20 transition-all duration-300"
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
                    className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-purple-800/40 to-purple-900/20 rounded-lg text-white font-medium text-sm hover:from-purple-700/40 hover:to-purple-800/20 transition-all duration-300"
                  >
                    <FaChartLine className="mr-2" />
                    Game History
                  </button>
                </motion.div>
              </div>
            </div>
          </div>
          <div className="w-full h-0.5 bg-gradient-to-r from-red-600 via-blue-500/30 to-transparent mt-6"></div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#070005] text-white pb-20">
      {/* Header */}
      {renderHeader()}
      {/* Main Game Section */}
      <div className="px-4 md:px-8 lg:px-20">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-2/3">
            <GameWheel
              risk={risk}
              isSpinning={isSpinning}
              noOfSegments={noOfSegments}
              currentMultiplier={currentMultiplier}
              targetMultiplier={targetMultiplier}
              handleSelectMultiplier={handleSelectMultiplier}
              wheelPosition={wheelPosition}
              setWheelPosition={setWheelPosition}
              hasSpun={hasSpun}
              contractResult={contractResult}
            />
          </div>
          <div className="w-full lg:w-1/3">
            <BettingPanel
              balance={balance}
              gameMode={gameMode}
              setGameMode={setGameMode}
              betAmount={betAmount}
              setBetAmount={setBetAmount}
              risk={risk}
              setRisk={setRisk}
              noOfSegments={noOfSegments}
              setSegments={setSegments}
              manulBet={manulBet}
              isSpinning={isSpinning}
              autoBet={autoBet}
              canBet={canBet}
            />
          </div>
        </div>
      </div>
      <WheelVideo />
      <WheelDescription />
      <WheelStrategyGuide />
      <WheelProbability />
      <WheelPayouts />
      <WheelHistory />
      {blockWaitMessage && (
        <div className="bg-yellow-200 text-yellow-900 p-2 rounded mb-2 text-center">
          {blockWaitMessage}
        </div>
      )}
      {resultPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-60">
          <div className="bg-[#1a1a1a] border border-[#333947] rounded-lg p-8 text-center shadow-xl">
            <div className={`text-3xl font-bold mb-2 ${resultPopup.win ? 'text-green-400' : resultPopup.error ? 'text-red-400' : 'text-yellow-400'}`}>{resultPopup.message}</div>
            {resultPopup.contractResult && (
              <div className="mt-2 text-white/80">
                Segment: <span className="font-mono">{resultPopup.contractResult.segmentIndex}</span><br/>
                Multiplier: <span className="font-mono">{resultPopup.contractResult.multiplier}x</span><br/>
                Win: <span className="font-mono">{resultPopup.contractResult.isWin ? 'Yes' : 'No'}</span>
              </div>
            )}
            <button className="mt-6 px-6 py-2 rounded bg-gradient-to-r from-red-500 to-yellow-500 text-white font-bold" onClick={() => setResultPopup(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
