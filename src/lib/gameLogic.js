import { wheelDataByRisk } from "../app/game/wheel/components/GameWheel.jsx"; // Updated path after restructuring

export const calculateResult = (risk, noOfSegments) => {
  
  // Simulate contract logic: first determine segment index, then multiplier
  const segmentIndex = Math.floor(Math.random() * noOfSegments);
  
  // Get the wheel data for the risk level
  const wheelData = risk === "high" ? wheelDataByRisk.high(noOfSegments) : wheelDataByRisk[risk];

  // Pick multiplier based on probability (similar to contract logic)
  const rand = Math.random() * 100; // 0-100 like contract
  let cumulative = 0;
  let selectedIndex = 0;

  for (let i = 0; i < wheelData.length; i++) {
    cumulative += wheelData[i].probability * 100; // Convert to percentage like contract
    if (rand <= cumulative) {
      selectedIndex = i;
      break;
    }
  }

  const multiplier = wheelData[selectedIndex].multiplier;

  // Calculate wheel position based on segment index (like contract)
  const totalSpins = 5;
  const segmentAngle = (Math.PI * 2) / noOfSegments;
  const segmentCenter = segmentIndex * segmentAngle + segmentAngle / 2;
  const position = (Math.PI * 2 * totalSpins) + (Math.PI * 2 - segmentCenter);

  return {
    multiplier,
    position,
    segmentIndex
  };
};
/**
 * Validate bet amount
 */
export const validateBet = (amount, balance) => {
  return amount > 0 && amount <= balance;
};

/**
 * Format currency for display
 */
export const formatCurrency = (value) => {
  return value.toFixed(10);
};