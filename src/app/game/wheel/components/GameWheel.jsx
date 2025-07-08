"use client";

import Image from "next/image";
import { useEffect, useRef, useMemo } from "react";
import { cn } from "@/lib/utils";

// FIXED: Match the exact smart contract logic for probability selection
function selectSegmentIndexByProbability(wheelData) {
  // Convert to smart contract's integer-based probability system (0-999)
  const rand = Math.floor(Math.random() * 1000);
  let cumulative = 0;

  for (let i = 0; i < wheelData.length; i++) {
    // FIXED: wheelData[i].probability is already an integer (0-1000)
    cumulative += wheelData[i].probability;
    if (rand < cumulative) {
      return i;
    }
  }

  return wheelData.length - 1; // fallback
}

// FIXED: Exact match with smart contract's wheel data (integers)
export const wheelDataByRisk = {
  low: [
    { multiplier: 0, color: "#333947", probability: 700 },    // 0.0x, 700/1000
    { multiplier: 120, color: "#D9D9D9", probability: 200 },  // 1.2x, 200/1000
    { multiplier: 150, color: "#00E403", probability: 100 },  // 1.5x, 100/1000
  ],
  medium: [
    { multiplier: 0, color: "#333947", probability: 350 },    // 0.0x, 350/1000
    { multiplier: 150, color: "#00E403", probability: 200 },  // 1.5x, 200/1000
    { multiplier: 170, color: "#D9D9D9", probability: 150 },  // 1.7x, 150/1000
    { multiplier: 200, color: "#FDE905", probability: 150 },  // 2.0x, 150/1000
    { multiplier: 300, color: "#7F46FD", probability: 100 },  // 3.0x, 100/1000
    { multiplier: 400, color: "#FCA32F", probability: 50 },   // 4.0x, 50/1000
  ],
  high: (noOfSegments) => {
    const highProb = getHighRiskProbability(noOfSegments);
    const winMultiplier = getHighRiskMultiplier(noOfSegments);
    return [
      { multiplier: 0, color: "#333947", probability: 1000 - highProb },
      { multiplier: winMultiplier, color: "#D72E60", probability: highProb },
    ];
  },
};

// FIXED: Return integer multipliers (like smart contract)
function getHighRiskMultiplier(noOfSegments) {
  if (noOfSegments <= 10) return 990;   // 9.90x
  if (noOfSegments <= 20) return 1980;  // 19.80x
  if (noOfSegments <= 30) return 2970;  // 29.70x
  if (noOfSegments <= 40) return 3960;  // 39.60x
  return 4950;                          // 49.50x
}

// FIXED: Return integer probabilities (like smart contract)
function getHighRiskProbability(noOfSegments) {
  if (noOfSegments <= 10) return 100;   // 10%
  if (noOfSegments <= 20) return 80;    // 8%
  if (noOfSegments <= 30) return 60;    // 6%
  if (noOfSegments <= 40) return 40;    // 4%
  return 20;                           // 2%
}

// Helper function to convert integer multiplier to decimal for display
function formatMultiplier(intMultiplier) {
  return (intMultiplier / 100).toFixed(2);
}

const GameWheel = ({
  isSpinning,
  noOfSegments,
  handleSelectMultiplier,
  wheelPosition,
  setWheelPosition,
  risk = "medium",
  hasSpun = false,
  contractResult = null, // Add contract result prop
}) => {
  const canvasRef = useRef(null);
  
  // FIXED: Generate wheel data using EXACT smart contract logic
  const wheelData = useMemo(() => {
    const segments = noOfSegments;
    let wheelData = [];

    if (risk === "high") {
      // High risk: dynamic based on segments - EXACT contract logic
      const winMultiplier = getHighRiskMultiplier(segments);
      const winProbability = getHighRiskProbability(segments);
      const lossProbability = 1000 - winProbability;
      
      for (let i = 0; i < segments; i++) {
        if (i === 0) {
          wheelData[i] = { 
            multiplier: winMultiplier, 
            color: "#D72E60", 
            probability: winProbability 
          };
        } else {
          wheelData[i] = { 
            multiplier: 0, 
            color: "#333947", 
            probability: lossProbability 
          };
        }
      }
    } else if (risk === "medium") {
      // Medium risk: FIXED to match new contract logic with proper probabilities
      const mediumRiskSegments = wheelDataByRisk.medium;
      
      for (let i = 0; i < segments; i++) {
        if (i % 2 === 0) {
          // Even segments: 0x multiplier (35% of total probability)
          wheelData[i] = { 
            multiplier: 0, 
            color: "#333947", 
            probability: 350 * 2 / segments 
          };
        } else {
          // Odd segments: non-zero multipliers (65% of total probability)
          let baseSegmentIndex = i % 6; // Map to 6 base segments
          if (baseSegmentIndex === 0) baseSegmentIndex = 1; // Skip 0x segment
          wheelData[i] = { 
            ...mediumRiskSegments[baseSegmentIndex],
            probability: 650 * 2 / segments 
          };
        }
      }
    } else {
      // Low risk: FIXED to match new contract logic with proper probabilities
      const lowRiskSegments = wheelDataByRisk.low;
      
      for (let i = 0; i < segments; i++) {
        if (i % 2 === 0) {
          // Even segments: non-zero multipliers (30% of total probability)
          let baseSegmentIndex = i % 3; // Map to 3 base segments
          if (baseSegmentIndex === 1) baseSegmentIndex = 0; // Skip 1.2x segment
          wheelData[i] = { 
            ...lowRiskSegments[baseSegmentIndex],
            probability: 300 * 2 / segments 
          };
        } else {
          // Odd segments: 0x multiplier (70% of total probability)
          wheelData[i] = { 
            multiplier: 0, 
            color: "#333947", 
            probability: 700 * 2 / segments 
          };
        }
      }
    }

    return wheelData;
  }, [risk, noOfSegments]);

  const segments = wheelData.length;

  // For the bottom panel, show unique multipliers from the wheel
  const panelMultipliers = useMemo(() => {
    const uniqueMultipliers = [...new Set(wheelData.map(d => d.multiplier))];
    return uniqueMultipliers.sort((a, b) => a - b);
  }, [wheelData]);
  
  const panelColorMap = useMemo(() => {
    const colorMap = {};
    wheelData.forEach(segment => {
      if (!colorMap[segment.multiplier]) {
        colorMap[segment.multiplier] = segment.color;
      }
    });
    return colorMap;
  }, [wheelData]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions
    const size = Math.min(canvas.parentElement.clientWidth, canvas.parentElement.clientHeight) - 40;
    canvas.width = size;
    canvas.height = size;
    
    // Draw wheel
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 10;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Save the current context state
    ctx.save();
    
    // Move to center and rotate the entire wheel
    ctx.translate(centerX, centerY);
    ctx.rotate(-wheelPosition); // Negative for clockwise rotation
    ctx.translate(-centerX, -centerY);
    
    // Draw segments with multipliers
    const segmentAngle = (Math.PI * 2) / segments;
    
    for (let i = 0; i < segments; i++) {
      const startAngle = i * segmentAngle;
      const endAngle = (i + 1) * segmentAngle;
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle, false);
      ctx.arc(centerX, centerY, radius * 0.93, endAngle, startAngle, true);
      ctx.closePath();

      // Use the color from wheelData[i]
      ctx.fillStyle = wheelData[i].color;
      ctx.fill();
      
      // Add stroke between segments
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Draw multiplier text on each segment
      if (segments <= 20) { // Only show text if segments are not too small
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + segmentAngle / 2);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = wheelData[i].multiplier === 0 ? "#666" : "#FFF";
        ctx.font = segments <= 10 ? "14px Arial" : "10px Arial";
        // FIXED: Format multiplier for display
        ctx.fillText(
          `${formatMultiplier(wheelData[i].multiplier)}x`, 
          radius * 0.75, 
          0
        );
        ctx.restore();
      }
    }
    
    // Draw inner circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = "#0A0009";
    ctx.fill();
    ctx.strokeStyle = "#333947";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Restore the context to draw the pointer without rotation
    ctx.restore();
    
  }, [wheelData, segments, wheelPosition]);

  // Render wheel rotation animation
  useEffect(() => {
    if (!isSpinning || !canvasRef.current) return;

    // Use contract result if available, otherwise fall back to frontend generation
    let selectedIndex;
    if (contractResult && contractResult.segmentIndex !== undefined) {
      // Use contract result - map segment index to wheel segments
      selectedIndex = contractResult.segmentIndex % segments;
      console.log('Using contract result for wheel spin:', contractResult, 'selectedIndex:', selectedIndex);
      console.log('Wheel segment at selectedIndex:', wheelData[selectedIndex]);
      console.log('All wheel segments:', wheelData.map((seg, idx) => `${idx}: ${formatMultiplier(seg.multiplier)}x`));
    } else {
      // Fallback to frontend generation (for testing/demo)
      selectedIndex = selectSegmentIndexByProbability(wheelData);
      console.log('Using frontend-generated result for wheel spin, selectedIndex:', selectedIndex);
    }

    const segmentAngle = (Math.PI * 2) / segments;
    const totalSpins = 5;
    
    // Calculate target rotation to land on the selected segment
    const targetSegmentCenter = selectedIndex * segmentAngle + segmentAngle / 2;
    const startRotation = wheelPosition % (Math.PI * 2);
    
    // We want the selected segment to be at the top (under the pointer)
    const finalRotation = (Math.PI * 2 * totalSpins) + (Math.PI * 2 - targetSegmentCenter);

    let startTime = null;
    let rafId;

    const duration = 3000;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3); // cubic easing out

      const newPosition = startRotation + finalRotation * easeOut;
      setWheelPosition(newPosition);

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      } else {
        // Use contract result multiplier if available, otherwise use wheel data
        const landedMultiplier = contractResult && contractResult.multiplier !== undefined 
          ? Math.floor(contractResult.multiplier * 100) // Convert back to contract format
          : wheelData[selectedIndex].multiplier;
        handleSelectMultiplier(landedMultiplier);
      }
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [handleSelectMultiplier, isSpinning, segments, setWheelPosition, wheelData, wheelPosition, contractResult]);

  // Helper function to get the current segment under the pointer
  const getCurrentSegmentUnderPointer = () => {
    const normalizedPosition = wheelPosition % (Math.PI * 2);
    const segmentAngle = (Math.PI * 2) / segments;
    
    const offsetPosition = (normalizedPosition + Math.PI/2 + Math.PI) % (Math.PI * 2);
    const segmentIndex = Math.floor(offsetPosition / segmentAngle) % segments;
    
    return wheelData[segmentIndex];
  };

  const currentSegment = getCurrentSegmentUnderPointer();

  return (
    <div className="flex flex-col justify-between items-center h-full w-full">
      <div className="relative flex h-[435px] w-[600px] sm:h-[525px] sm:w-[500px] lg:h-[625px] lg:w-[600px] items-center justify-center p-4">

        <Image
          src="/arrow.svg"
          width={50}
          height={50}
          alt="Pointer Arrow"
          className="absolute top-0 left-1/2 -translate-x-1/2 z-10"
        />           
        <canvas 
          ref={canvasRef} 
          className={cn(
            "max-w-[85vw] max-h-[85vh] rounded-full pt-4 p-2 bg-[#0A0009] transition-transform",
            isSpinning && "animate-pulse"
          )}
        />
        
        {!isSpinning && hasSpun && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-4xl font-bold text-white animate-bounce">
              {formatMultiplier(currentSegment.multiplier)}x
            </div>
          </div>
        )}
      </div>

      {/* Current Segment Display */}
      <div className="w-full max-w-md mx-auto mb-4 p-4 bg-[#1a1a1a] rounded-lg border border-[#333947]">
        <div className="text-center">
          <div className="text-sm text-gray-400 mb-2">Current Position</div>
          <div className="flex items-center justify-center gap-4">
            <div 
              className="w-8 h-8 rounded-full border-2 border-white"
              style={{ backgroundColor: currentSegment.color }}
            ></div>
            <div className="text-2xl font-bold text-white">
              {formatMultiplier(currentSegment.multiplier)}x
            </div>
            <div className="text-sm text-gray-400">
              ({(currentSegment.probability / 10).toFixed(1)}% chance)
            </div>
          </div>
          {/* Debug info */}
          <div className="text-xs text-gray-500 mt-2">
            Position: {(wheelPosition % (Math.PI * 2)).toFixed(3)} | 
            Segment: {Math.floor(((wheelPosition % (Math.PI * 2)) + Math.PI/2 + Math.PI) / ((Math.PI * 2) / segments)) % segments} | 
            Total: {segments}
          </div>
        </div>
      </div>
      
      <div className="flex w-full gap-3 p-2">
        {panelMultipliers.map((multiplier) => {
          // Only highlight if hasSpun is true
          const isSelected = hasSpun && currentSegment && currentSegment.multiplier === multiplier;
          const bgColor = panelColorMap[multiplier] || "#333947";
          return (
            <div
              key={multiplier}
              className="flex flex-col justify-end items-center h-[60px] w-full rounded-md text-sm font-medium border bg-[#0A0009] border-[#333947] transition-all"
              style={isSelected ? { backgroundColor: bgColor } : {}}
            >
              <span className="text-white pb-2">
                {formatMultiplier(multiplier)}x
              </span>
              <div
                className="w-full h-3 rounded-b-md"
                style={{ backgroundColor: bgColor }}
              ></div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default GameWheel;