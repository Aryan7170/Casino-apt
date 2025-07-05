"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaTrophy, FaCoins, FaChartLine, FaDice } from "react-icons/fa";
import { GiWheelbarrow } from "react-icons/gi";

const ResultsPopup = ({ isOpen, onClose, result }) => {
  if (!isOpen || !result) return null;

  const {
    multiplier,
    segmentIndex,
    isWin,
    payout,
    betAmount,
    roundId,
    risk,
    segments,
    color
  } = result;

  const winAmount = isWin ? payout : 0n;
  const multiplierFormatted = (Number(multiplier) / 100).toFixed(2); // Convert from contract format
  const winAmountFormatted = (Number(winAmount) / 1e18).toFixed(4); // Convert from wei
  const betAmountFormatted = (Number(betAmount) / 1e18).toFixed(4); // Convert from wei

  // Determine color based on multiplier and win status
  const getSegmentColor = () => {
    if (color) return color;
    if (!isWin) return "#333947"; // Dark gray for loss
    if (Number(multiplier) === 0) return "#333947"; // Dark gray for 0x
    if (Number(multiplier) <= 120) return "#D9D9D9"; // Light gray for low multipliers
    if (Number(multiplier) <= 150) return "#00E403"; // Green for medium multipliers
    if (Number(multiplier) <= 200) return "#FDE905"; // Yellow for higher multipliers
    if (Number(multiplier) <= 300) return "#7F46FD"; // Purple for high multipliers
    if (Number(multiplier) <= 400) return "#FCA32F"; // Orange for very high multipliers
    return "#D72E60"; // Red for highest multipliers
  };

  const segmentColor = getSegmentColor();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-gradient-to-br from-red-900/90 to-red-800/70 rounded-2xl border border-red-700/50 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 text-white/70 hover:text-white transition-colors"
            >
              <FaTimes className="text-xl" />
            </button>

            {/* Header */}
            <div className="relative p-6 pb-4">
              <div className="flex items-center justify-center mb-4">
                <div className="mr-3 p-3 bg-gradient-to-br from-red-800/50 to-red-700/30 rounded-full">
                  <GiWheelbarrow className="text-2xl text-red-300" />
                </div>
                <div className="text-center">
                  <h2 className="text-xl font-bold text-white font-display">
                    {isWin ? "🎉 Congratulations!" : "😔 Better Luck Next Time!"}
                  </h2>
                  <p className="text-sm text-white/70 font-sans">Round #{roundId}</p>
                </div>
              </div>

              {/* Result indicator */}
              <div className="flex justify-center mb-6">
                <div
                  className="w-16 h-16 rounded-full border-4 border-white/20 flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: segmentColor }}
                >
                  <span className="text-white font-bold text-lg">
                    {multiplierFormatted}x
                  </span>
                </div>
              </div>
            </div>

            {/* Results content */}
            <div className="px-6 pb-6">
              {/* Main result */}
              <div className="bg-black/30 rounded-xl p-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white font-display mb-1">
                    {isWin ? `+${winAmountFormatted} APTC` : `-${betAmountFormatted} APTC`}
                  </div>
                  <div className={`text-sm font-medium ${isWin ? 'text-green-400' : 'text-red-400'}`}>
                    {isWin ? "WIN" : "LOSS"}
                  </div>
                </div>
              </div>

              {/* Game details */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                  <div className="flex items-center">
                    <FaDice className="text-blue-400 mr-2" />
                    <span className="text-white/80 text-sm font-sans">Multiplier</span>
                  </div>
                  <span className="text-white font-bold">{multiplierFormatted}x</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                  <div className="flex items-center">
                    <FaCoins className="text-yellow-400 mr-2" />
                    <span className="text-white/80 text-sm font-sans">Bet Amount</span>
                  </div>
                  <span className="text-white font-bold">{betAmountFormatted} APTC</span>
                </div>

                {isWin && (
                  <div className="flex items-center justify-between p-3 bg-green-900/20 rounded-lg border border-green-700/30">
                    <div className="flex items-center">
                      <FaTrophy className="text-green-400 mr-2" />
                      <span className="text-green-300 text-sm font-sans">Win Amount</span>
                    </div>
                    <span className="text-green-300 font-bold">+{winAmountFormatted} APTC</span>
                  </div>
                )}

                <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                  <div className="flex items-center">
                    <FaChartLine className="text-purple-400 mr-2" />
                    <span className="text-white/80 text-sm font-sans">Risk Level</span>
                  </div>
                  <span className="text-white font-bold capitalize">{risk}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                  <div className="flex items-center">
                    <GiWheelbarrow className="text-red-400 mr-2" />
                    <span className="text-white/80 text-sm font-sans">Segments</span>
                  </div>
                  <span className="text-white font-bold">{segments}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                  <div className="flex items-center">
                    <FaDice className="text-orange-400 mr-2" />
                    <span className="text-white/80 text-sm font-sans">Segment Index</span>
                  </div>
                  <span className="text-white font-bold">#{segmentIndex}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-red-700/50 to-red-600/50 hover:from-red-600/60 hover:to-red-500/60 text-white font-medium rounded-lg transition-all duration-300 border border-red-600/30"
                >
                  Play Again
                </button>
                <button
                  onClick={() => {
                    // Add share functionality here
                    console.log("Share result");
                  }}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-700/50 to-blue-600/50 hover:from-blue-600/60 hover:to-blue-500/60 text-white font-medium rounded-lg transition-all duration-300 border border-blue-600/30"
                >
                  Share
                </button>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-yellow-500 to-red-500"></div>
            <div className="absolute -top-10 -right-10 w-20 h-20 bg-red-500/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-10 -left-10 w-16 h-16 bg-yellow-500/10 rounded-full blur-xl"></div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ResultsPopup; 