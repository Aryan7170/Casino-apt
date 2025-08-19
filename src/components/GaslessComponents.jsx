import React from 'react';
import { motion } from 'framer-motion';
import { FaGift, FaCoins, FaBolt, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const GaslessStatusIndicator = ({ 
  userGaslessStatus, 
  isGaslessAvailable, 
  className = "" 
}) => {
  const {
    hasUsedGasless,
    isWhitelisted,
    qualifiesForFreeGas,
    freeGasRemaining,
    dailyGasRemaining
  } = userGaslessStatus;

  const getStatusInfo = () => {
    if (isWhitelisted) {
      return {
        icon: <FaCheckCircle className="text-green-400" />,
        title: "VIP Status",
        description: "Unlimited free transactions",
        color: "from-green-500 to-emerald-600",
        textColor: "text-green-400"
      };
    }

    if (qualifiesForFreeGas && parseInt(freeGasRemaining) > 0) {
      return {
        icon: <FaGift className="text-yellow-400" />,
        title: "New User Bonus",
        description: `${Math.floor(parseInt(freeGasRemaining) / 100000)} free transactions remaining`,
        color: "from-yellow-500 to-orange-600",
        textColor: "text-yellow-400"
      };
    }

    if (parseInt(dailyGasRemaining) > 0) {
      return {
        icon: <FaCoins className="text-blue-400" />,
        title: "Token Payment",
        description: `Pay with APTC tokens for gas`,
        color: "from-blue-500 to-purple-600",
        textColor: "text-blue-400"
      };
    }

    return {
      icon: <FaTimesCircle className="text-red-400" />,
      title: "Gas Required",
      description: "Standard gas fees apply",
      color: "from-gray-500 to-gray-600",
      textColor: "text-red-400"
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-xl border border-gray-700 ${className}`}
    >
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-r ${statusInfo.color} opacity-10`} />
      
      <div className="relative p-4">
        <div className="flex items-center space-x-3">
          {/* Status icon */}
          <div className="flex-shrink-0">
            {statusInfo.icon}
          </div>
          
          {/* Status content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className={`text-sm font-semibold ${statusInfo.textColor}`}>
                {statusInfo.title}
              </h3>
              {isGaslessAvailable && (
                <FaBolt className="text-xs text-yellow-400 animate-pulse" />
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {statusInfo.description}
            </p>
          </div>
          
          {/* Status indicator */}
          <div className="flex-shrink-0">
            <div className={`w-3 h-3 rounded-full ${
              isGaslessAvailable ? 'bg-green-400 animate-pulse' : 'bg-gray-600'
            }`} />
          </div>
        </div>

        {/* Progress bar for free gas */}
        {qualifiesForFreeGas && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Free Gas</span>
              <span>{Math.floor(parseInt(freeGasRemaining) / 100000)} left</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1.5">
              <div
                className="bg-gradient-to-r from-yellow-400 to-orange-500 h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, (parseInt(freeGasRemaining) / 1000000) * 100)}%`
                }}
              />
            </div>
          </div>
        )}

        {/* Daily limit indicator */}
        {!isWhitelisted && parseInt(dailyGasRemaining) > 0 && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Daily Limit</span>
              <span>{Math.floor(parseInt(dailyGasRemaining) / 100000)} remaining</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1.5">
              <div
                className="bg-gradient-to-r from-blue-400 to-purple-500 h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, (parseInt(dailyGasRemaining) / 2000000) * 100)}%`
                }}
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const GaslessTransactionBadge = ({ isGaslessAvailable, className = "" }) => {
  if (!isGaslessAvailable) return null;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-500 to-emerald-600 text-white ${className}`}
    >
      <FaBolt className="w-3 h-3 mr-1" />
      Gasless
    </motion.div>
  );
};

const GaslessOnboardingCard = ({ userGaslessStatus, onClose }) => {
  const { hasUsedGasless, qualifiesForFreeGas } = userGaslessStatus;

  if (hasUsedGasless || !qualifiesForFreeGas) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed bottom-6 right-6 max-w-sm bg-gradient-to-br from-purple-900 to-blue-900 border border-purple-500 rounded-xl p-6 shadow-2xl z-50"
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <FaGift className="text-yellow-400 text-2xl" />
        </div>
        <div className="flex-1">
          <h3 className="text-white font-semibold text-lg mb-2">
            Welcome Bonus! 🎉
          </h3>
          <p className="text-gray-300 text-sm mb-4">
            As a new user, you get free gasless transactions for your first games! 
            No need to worry about gas fees - just start playing!
          </p>
          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
            >
              Got it!
            </button>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          ×
        </button>
      </div>
    </motion.div>
  );
};

export { 
  GaslessStatusIndicator, 
  GaslessTransactionBadge, 
  GaslessOnboardingCard 
};
