// wheelUtils.js - Utility functions for wheel operations

export const wheelDataByRisk = {
    low: [
      { multiplier: 0, color: "#333947", probability: 0.7 },
      { multiplier: 1.20, color: "#D9D9D9", probability: 0.2 },
      { multiplier: 1.50, color: "#00E403", probability: 0.1 },
    ],
    medium: [
      { multiplier: 0, color: "#333947", probability: 0.35 },
      { multiplier: 1.50, color: "#00E403", probability: 0.2 },
      { multiplier: 1.70, color: "#D9D9D9", probability: 0.15 },
      { multiplier: 2.00, color: "#FDE905", probability: 0.15 },
      { multiplier: 3.00, color: "#7F46FD", probability: 0.1 },
      { multiplier: 4.00, color: "#FCA32F", probability: 0.05 },
    ],
    high: (noOfSegments) => {
      const highProb = getHighRiskProbability(noOfSegments);
      return [
        { multiplier: 0, color: "#333947", probability: 1 - highProb },
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
  
  // Generate wheel data based on risk and segments
  export function generateWheelData(risk, noOfSegments) {
    let baseWheelData = [];
  
    if (risk === "high") {
      const highData = wheelDataByRisk.high(noOfSegments);
      let arr = [];
      let total = 0;
      
      const counts = highData.map((seg, idx) => {
        if (idx === highData.length - 1) {
          return noOfSegments - total;
        }
        const count = Math.round(seg.probability * noOfSegments);
        total += count;
        return count;
      });
      
      const sum = counts.reduce((a, b) => a + b, 0);
      if (sum !== noOfSegments) {
        counts[counts.length - 1] += noOfSegments - sum;
      }
      
      highData.forEach((seg, idx) => {
        for (let i = 0; i < counts[idx]; i++) {
          arr.push({ ...seg });
        }
      });
      
      baseWheelData = arr;
    } else if (risk === "medium") {
      const zeroSegment = wheelDataByRisk.medium.find(d => d.multiplier === 0);
      const nonZeroSegments = wheelDataByRisk.medium.filter(d => d.multiplier !== 0);
      
      let arr = [];
      let nonZeroIdx = 0;
      for (let i = 0; i < noOfSegments; i++) {
        if (i % 2 === 0) {
          arr.push({ ...zeroSegment });
        } else {
          arr.push({ ...nonZeroSegments[nonZeroIdx % nonZeroSegments.length] });
          nonZeroIdx++;
        }
      }
      baseWheelData = arr;
    } else if (risk === "low") {
      const onePointTwoSegment = wheelDataByRisk.low.find(d => d.multiplier === 120);
      const otherSegments = wheelDataByRisk.low.filter(d => d.multiplier !== 120);
      
      let arr = [];
      let otherIdx = 0;
      for (let i = 0; i < noOfSegments; i++) {
        if (i % 2 === 0) {
          arr.push({ ...onePointTwoSegment });
        } else {
          arr.push({ ...otherSegments[otherIdx % otherSegments.length] });
          otherIdx++;
        }
      }
      baseWheelData = arr;
    }
  
    // Create final wheel data
    let wheelData = [];
    for (let i = 0; i < noOfSegments; i++) {
      wheelData.push(baseWheelData[i % baseWheelData.length]);
    }
  
    return wheelData;
  }
  
  // Get current segment under pointer
  export function getCurrentSegmentUnderPointer(wheelPosition, wheelData) {
    const segments = wheelData.length;
    const normalizedPosition = wheelPosition % (Math.PI * 2);
    const segmentAngle = (Math.PI * 2) / segments;
    
    const offsetPosition = (normalizedPosition + Math.PI/2 + Math.PI) % (Math.PI * 2);
    const segmentIndex = Math.floor(offsetPosition / segmentAngle) % segments;
    
    return wheelData[segmentIndex];
  }
  
  // Extract all current segment values
  export function getCurrentSegmentValues(wheelPosition, wheelData) {
    const currentSegment = getCurrentSegmentUnderPointer(wheelPosition, wheelData);
    
    return {
      multiplier: currentSegment.multiplier,
      color: currentSegment.color,
      probability: currentSegment.probability,
      formattedMultiplier: (currentSegment.multiplier).toFixed(2), // Convert from basis points to decimal
      probabilityPercentage: (currentSegment.probability * 100).toFixed(1),
      segmentIndex: Math.floor(((wheelPosition % (Math.PI * 2)) + Math.PI/2 + Math.PI) / ((Math.PI * 2) / wheelData.length)) % wheelData.length,
      normalizedPosition: wheelPosition % (Math.PI * 2),
      totalSegments: wheelData.length
    };
  }
  
  // Get unique multipliers for panel display
  export function getPanelMultipliers(risk, noOfSegments) {
    let original = [];
    if (risk === "high") {
      original = wheelDataByRisk.high(noOfSegments);
    } else {
      original = wheelDataByRisk[risk] || [];
    }
    return Array.from(new Set(original.map(d => d.multiplier))); // Convert to decimal for display
  }
  
  // Get color mapping for multipliers
  export function getPanelColorMap(risk, noOfSegments) {
    let original = [];
    if (risk === "high") {
      original = wheelDataByRisk.high(noOfSegments);
    } else {
      original = wheelDataByRisk[risk] || [];
    }
    return Object.fromEntries(original.map(d => [d.multiplier, d.color])); // Convert to decimal for display
  }
  
  // Select segment by probability (for spinning)
  export function selectSegmentIndexByProbability(wheelData) {
    const rand = Math.random();
    let cumulative = 0;
  
    for (let i = 0; i < wheelData.length; i++) {
      cumulative += wheelData[i].probability;
      if (rand <= cumulative) return i;
    }
  
    return wheelData.length - 1; // fallback
  }