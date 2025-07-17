"use client";

import Image from "next/image";
import { useEffect, useRef, useMemo } from "react";
import { cn } from "@/lib/utils";
import { 
  generateWheelData, 
  getCurrentSegmentUnderPointer,
  getCurrentSegmentValues,
  getPanelMultipliers,
  getPanelColorMap,
  selectSegmentIndexByProbability 
} from '../config/wheelUtils.js';

const GameWheel = ({
  isSpinning,
  noOfSegments,
  handleSelectMultiplier,
  wheelPosition,
  setWheelPosition,
  risk = "medium",
  hasSpun = false,
}) => {
  const canvasRef = useRef(null);
  
  // Use the extracted function to generate wheel data
  const wheelData = useMemo(() => {
    return generateWheelData(risk, noOfSegments);
  }, [risk, noOfSegments]);

  const segments = wheelData.length;

  // Use extracted functions for panel data
  const panelMultipliers = useMemo(() => {
    return getPanelMultipliers(risk, noOfSegments);
  }, [risk, noOfSegments]);
  
  const panelColorMap = useMemo(() => {
    return getPanelColorMap(risk, noOfSegments);
  }, [risk, noOfSegments]);

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
    
    // Draw segments - now each segment corresponds to wheelData[i]
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
    }
    
    // Draw inner circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = "#0A0009";
    ctx.fill();
    ctx.strokeStyle = "#333947";
    ctx.stroke();

    // Restore the context to draw the pointer without rotation
    ctx.restore();
    
  }, [wheelData, segments, wheelPosition]);

  // Render wheel rotation animation
  useEffect(() => {
    if (!isSpinning || !canvasRef.current) return;

    const selectedIndex = selectSegmentIndexByProbability(wheelData);
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
        // When animation completes, set the multiplier to the selected segment
        const landedMultiplier = wheelData[selectedIndex].multiplier;
        handleSelectMultiplier(landedMultiplier);
      }
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [handleSelectMultiplier, isSpinning, segments, setWheelPosition, wheelData, wheelPosition]);

  // Use the extracted function to get current segment
  const currentSegment = getCurrentSegmentUnderPointer(wheelPosition, wheelData);
  
  // Get all current segment values (you can use this for more detailed info)
  const currentSegmentValues = getCurrentSegmentValues(wheelPosition, wheelData);

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
              {currentSegmentValues.formattedMultiplier}x
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
              {currentSegmentValues.formattedMultiplier}x
            </div>
            <div className="text-sm text-gray-400">
              ({currentSegmentValues.probabilityPercentage}% chance)
            </div>
          </div>
          {/* Debug info */}
          <div className="text-xs text-gray-500 mt-2">
            Position: {currentSegmentValues.normalizedPosition.toFixed(3)} | 
            Segment: {currentSegmentValues.segmentIndex} | 
            Total: {currentSegmentValues.totalSegments}
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
                {multiplier.toFixed(2)}x
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