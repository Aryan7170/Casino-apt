"use client";

import Image from "next/image";
import { useEffect, useRef, useMemo } from "react";
import { cn } from "@/lib/utils";

function selectSegmentIndexByProbability(wheelData) {
  const rand = Math.random();
  let cumulative = 0;

  for (let i = 0; i < wheelData.length; i++) {
    cumulative += wheelData[i].probability;
    if (rand <= cumulative) return i;
  }

  return wheelData.length - 1; // fallback
}

export const wheelDataByRisk = {
  low: [
    { multiplier: 0.0, color: "#333947", probability: 0.7 },
    { multiplier: 1.2, color: "#D9D9D9", probability: 0.2 },
    { multiplier: 1.5, color: "#00E403", probability: 0.1 },
  ],
  medium: [
    { multiplier: 0.0, color: "#333947", probability: 0.35 },
    { multiplier: 1.5, color: "#00E403", probability: 0.2 },
    { multiplier: 1.7, color: "#D9D9D9", probability: 0.15 },
    { multiplier: 2.0, color: "#FDE905", probability: 0.15 },
    { multiplier: 3.0, color: "#7F46FD", probability: 0.1 },
    { multiplier: 4.0, color: "#FCA32F", probability: 0.05 },
  ],
  high: (noOfSegments) => {
    const highProb = getHighRiskProbability(noOfSegments);
    return [
      { multiplier: 0.0, color: "#333947", probability: 1 - highProb },
      { multiplier: getHighRiskMultiplier(noOfSegments), color: "#D72E60", probability: highProb },
    ];
  },
};

function getHighRiskMultiplier(noOfSegments) {
  if (noOfSegments <= 10) return 9.90;
  if (noOfSegments <= 20) return 19.80;
  if (noOfSegments <= 30) return 29.70;
  if (noOfSegments <= 40) return 39.60;
  return 49.50;
}

function getHighRiskProbability(noOfSegments) {
  if (noOfSegments <= 10) return 0.10;
  if (noOfSegments <= 20) return 0.08;
  if (noOfSegments <= 30) return 0.06;
  if (noOfSegments <= 40) return 0.04;
  return 0.02;
}

const GameWheel = ({
  isSpinning,
  noOfSegments,
  handleSelectMultiplier,
  wheelPosition,
  setWheelPosition,
  risk = "medium",
  hasSpun = false,
  // selectedSegmentIndex = null // <- ADDED
  contractResult = null // ✅ Add this
}) => {
  const canvasRef = useRef(null);

  const baseWheelData = useMemo(() => {
    if (risk === "high") {
      const highData = wheelDataByRisk.high(noOfSegments);
      const probabilities = highData.find(d => d.probability);
      let arr = [];
      let total = 0;
      const counts = highData.map((seg, idx) => {
        if (idx === highData.length - 1) return noOfSegments - total;
        const count = Math.round(seg.probability * noOfSegments);
        total += count;
        return count;
      });
      const sum = counts.reduce((a, b) => a + b, 0);
      if (sum !== noOfSegments) counts[counts.length - 1] += noOfSegments - sum;
      highData.forEach((seg, idx) => {
        for (let i = 0; i < counts[idx]; i++) arr.push({ ...seg });
      });
      return arr.map(seg => ({ ...seg, probability: seg.probability }));
    }

    if (risk === "medium") {
      const zeroSegment = wheelDataByRisk.medium.find(d => d.multiplier === 0.0);
      const nonZeroSegments = wheelDataByRisk.medium.filter(d => d.multiplier !== 0.0);
      let arr = [], nonZeroIdx = 0;
      for (let i = 0; i < noOfSegments; i++) {
        arr.push(i % 2 === 0 ? { ...zeroSegment } : { ...nonZeroSegments[nonZeroIdx++ % nonZeroSegments.length] });
      }
      return arr.map(seg => ({ ...seg, probability: seg.probability }));
    }

    if (risk === "low") {
      const onePointTwo = wheelDataByRisk.low.find(d => d.multiplier === 1.2);
      const others = wheelDataByRisk.low.filter(d => d.multiplier !== 1.2);
      let arr = [], otherIdx = 0;
      for (let i = 0; i < noOfSegments; i++) {
        arr.push(i % 2 === 0 ? { ...onePointTwo } : { ...others[otherIdx++ % others.length] });
      }
      return arr.map(seg => ({ ...seg, probability: seg.probability }));
    }

    return wheelDataByRisk[risk];
  }, [risk, noOfSegments]);

  const wheelData = useMemo(() => {
    let arr = [];
    for (let i = 0; i < noOfSegments; i++) {
      arr.push(baseWheelData[i % baseWheelData.length]);
    }
    return arr;
  }, [baseWheelData, noOfSegments]);

  const segments = wheelData.length;

  const panelMultipliers = useMemo(() => {
    let original = risk === "high" ? wheelDataByRisk.high(noOfSegments) : wheelDataByRisk[risk] || [];
    return Array.from(new Set(original.map(d => d.multiplier)));
  }, [risk, noOfSegments]);

  const panelColorMap = useMemo(() => {
    let original = risk === "high" ? wheelDataByRisk.high(noOfSegments) : wheelDataByRisk[risk] || [];
    return Object.fromEntries(original.map(d => [d.multiplier, d.color]));
  }, [risk, noOfSegments]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = Math.min(canvas.parentElement.clientWidth, canvas.parentElement.clientHeight) - 40;
    canvas.width = size;
    canvas.height = size;

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 10;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(-wheelPosition);
    ctx.translate(-centerX, -centerY);

    const segmentAngle = (Math.PI * 2) / segments;
    for (let i = 0; i < segments; i++) {
      const start = i * segmentAngle;
      const end = (i + 1) * segmentAngle;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, start, end, false);
      ctx.arc(centerX, centerY, radius * 0.93, end, start, true);
      ctx.closePath();
      ctx.fillStyle = wheelData[i].color;
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = "#0A0009";
    ctx.fill();
    ctx.strokeStyle = "#333947";
    ctx.stroke();

    ctx.restore();
  }, [wheelData, segments, wheelPosition]);

  useEffect(() => {
    if (!isSpinning || !canvasRef.current) return;

    // Always use contractResult.segmentIndex if available
    const selectedIndex = contractResult?.segmentIndex ?? selectSegmentIndexByProbability(wheelData);

    const segmentAngle = (Math.PI * 2) / segments;
    const totalSpins = 5;
    const targetCenter = selectedIndex * segmentAngle + segmentAngle / 2;
    const startRotation = wheelPosition % (Math.PI * 2);
    const finalRotation = (Math.PI * 2 * totalSpins) + (Math.PI * 2 - targetCenter);

    let startTime = null;
    let rafId;
    const duration = 3000;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const newPosition = startRotation + finalRotation * easeOut;
      setWheelPosition(newPosition);

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      } else {
        const landedMultiplier = wheelData[selectedIndex].multiplier;
        handleSelectMultiplier(landedMultiplier);
      }
    };

    rafId = requestAnimationFrame(animate);
    return () => { if (rafId) cancelAnimationFrame(rafId); };
  }, [handleSelectMultiplier, isSpinning, segments, setWheelPosition, wheelData, wheelPosition, contractResult]);

  const getCurrentSegmentUnderPointer = () => {
    const normalized = wheelPosition % (Math.PI * 2);
    const angle = (Math.PI * 2) / segments;
    const offset = (normalized + Math.PI/2 + Math.PI) % (Math.PI * 2);
    const index = Math.floor(offset / angle) % segments;
    return wheelData[index];
  };

  const currentSegment = getCurrentSegmentUnderPointer();

  return (
    <div className="flex flex-col justify-between items-center h-full w-full">
      <div className="relative flex h-[435px] w-[600px] sm:h-[525px] sm:w-[500px] lg:h-[625px] lg:w-[600px] items-center justify-center p-4">
        <Image
          src='/arrow.svg'
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
              {currentSegment.multiplier.toFixed(2)}x
            </div>
          </div>
        )}
      </div>

      <div className="w-full max-w-md mx-auto mb-4 p-4 bg-[#1a1a1a] rounded-lg border border-[#333947]">
        <div className="text-center">
          <div className="text-sm text-gray-400 mb-2">Current Position</div>
          <div className="flex items-center justify-center gap-4">
            <div 
              className="w-8 h-8 rounded-full border-2 border-white"
              style={{ backgroundColor: currentSegment.color }}
            ></div>
            <div className="text-2xl font-bold text-white">
              {currentSegment.multiplier.toFixed(2)}x
            </div>
            <div className="text-sm text-gray-400">
              ({(currentSegment.probability * 100).toFixed(1)}% chance)
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full gap-3 p-2">
        {panelMultipliers.map((multiplier) => {
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
              <div className="w-full h-3 rounded-b-md" style={{ backgroundColor: bgColor }}></div>
            </div>
          );
        })}
      </div>

      <div className="result-multiplier">
        {contractResult ? (
          <span>Result: {contractResult.multiplier}x</span>
        ) : null}
      </div>
    </div>
  );
};

export default GameWheel;
