"use client";

import { useState } from "react";
import GameWheel from "../../../components/wheel/GameWheel";
import BettingPanel from "../../../components/wheel/BettingPanel";
import GameHistory from "../../../components/wheel/GameHistory";
import { calculateResult } from "../../../lib/gameLogic";
import Image from "next/image";
import coin from "../../../../public/coin.png";


export default function Home() {
  const [balance, setBalance] = useState(1000);
  const [betAmount, setBetAmount] = useState(0);
  const [risk, setRisk] = useState("medium");
  const [noOfSegments, setSegments] = useState(10);
  const [isSpinning, setIsSpinning] = useState(false);
  const [gameMode, setGameMode] = useState("manual");
  const [currentMultiplier, setCurrentMultiplier] = useState(0);
  const [gameHistory, setGameHistory] = useState([]);
  const [targetMultiplier, setTargetMultiplier] = useState(null);
  const [wheelPosition, setWheelPosition] = useState(0);
  const [hasSpun, setHasSpun] = useState(false);

  const manulBet = () => {
    if (betAmount <= 0 || betAmount > balance || isSpinning) return;
    
    setIsSpinning(true);
    setHasSpun(false);
    setBalance(prev => prev - betAmount);
    
    const result = calculateResult(risk, noOfSegments);
    
    setTimeout(() => {
      setCurrentMultiplier(result.multiplier);
      setWheelPosition(result.position);
      
      setTimeout(() => {
        const winAmount = betAmount * result.multiplier;
        setBalance(prev => prev + winAmount);
        
        const newHistoryItem = {
          id: Date.now(),
          game: "Mines",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          betAmount: betAmount,
          multiplier: `${result.multiplier.toFixed(2)}x`,
          payout: winAmount
        };
        
        setGameHistory(prev => [newHistoryItem, ...prev]);
        setIsSpinning(false);
        setHasSpun(true);
      }, 1000);
    }, 3000);
  };


  const autoBet = async ({
    numberOfBets,
    winIncrease = 0,
    lossIncrease = 0,
    stopProfit = 0,
    stopLoss = 0,
    betAmount: initialBetAmount,
    risk,
    noOfSegments,
  }) => {
    if (isSpinning) return; // Prevent overlapping spins

    let currentBet = initialBetAmount;
    let totalProfit = 0;

    for (let i = 0; i < numberOfBets; i++) {
      setIsSpinning(true);
      setHasSpun(false);
      setBalance(prev => prev - currentBet);

      // Calculate result (you have this function)
      const result = calculateResult(risk, noOfSegments);

      // Simulate spin delay
      await new Promise((r) => setTimeout(r, 3000)); // spin animation time

      setCurrentMultiplier(result.multiplier);
      setWheelPosition(result.position);

      setIsSpinning(false);
      setHasSpun(true);

      // Wait 2 seconds to show the result
      await new Promise((r) => setTimeout(r, 2000));

      // Calculate win amount
      const winAmount = currentBet * result.multiplier;

      // Update balance with win
      setBalance(prev => prev + winAmount);

      // Update total profit
      const profit = winAmount - currentBet;
      totalProfit += profit;

      // Store history entry
      const newHistoryItem = {
        id: Date.now() + i, // unique id per bet
        game: "Mines",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        betAmount: currentBet,
        multiplier: `${result.multiplier.toFixed(2)}x`,
        payout: winAmount,
      };

      setGameHistory(prev => [newHistoryItem, ...prev]);

      // Adjust bet for next round based on win/loss increase
      if (result.multiplier > 1) {
        currentBet = currentBet + (currentBet * winIncrease);
      } else {
        currentBet = currentBet + (currentBet * lossIncrease);
      }

      // Clamp bet to balance
      if (currentBet > balance) currentBet = balance;
      if (currentBet <= 0) currentBet = initialBetAmount;

      // Stop conditions
      if (stopProfit > 0 && totalProfit >= stopProfit) break;
      if (stopLoss > 0 && totalProfit <= -stopLoss) break;
    }

    setIsSpinning(false);
    setBetAmount(currentBet); // update bet amount in panel
  };

  const handleSelectMultiplier = (value) => {
    setTargetMultiplier(value);
  };


  return (
    <div className="min-h-screen bg-[#070005] text-white py-4 md:py-12 px-4 md:px-24 ">
      <div className="flex flex-col space-y-5 gap-7">
        {/* Header */}
          <div className="content flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <div className="text-sm mb-4 text-gray-400">Games / Mines</div>
              <h1 className="text-4xl ">Crazy times</h1>
            </div>
            <div className="gradient-border">
              <div className="bg-[#1e0936] rounded-sm p-2 py-4 px-5 flex items-center gap-2 mt-2 md:mt-0">
                <span className="text-white text-lg">{balance.toFixed(10)}</span>
                <Image
                  src={coin}
                  width={20}
                  height={20}
                  alt="coin"
                  className=""
                />                 
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-[#F1324D] to-[#2414E3] p-[1.5px] w-full"></div>


        {/* Main Content */}
        <div className="w-full flex flex-col-reverse md:flex-row gap-7">
          {/* Betting Panel */}
          <div className="w-full md:w-[40%] lg:w-[30%]">
          <BettingPanel 
            betAmount={betAmount}
            setBetAmount={setBetAmount}
            balance={balance}
            gameMode={gameMode}
            setGameMode={setGameMode}
            risk={risk}
            setRisk={setRisk}
            noOfSegments={noOfSegments}
            setSegments={setSegments}
            manulBet={manulBet}
            isSpinning={isSpinning}
            autoBet={autoBet}
          />
          </div>
          
          {/* Game Wheel */}
          <div className="w-full md:w-[60%] lg:w-[70%] p-5 bg-[#290023] border border-[#333947] rounded-3xl overflow-hidden">
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
            />
          </div>
        </div>
        
        {/* Game History */}
        <GameHistory 
          gameHistory={gameHistory}
        />
      </div>
    </div>
  );
}



