"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ButtonDebugger() {
  const router = useRouter();
  const [clickResults, setClickResults] = useState([]);

  const addResult = (result) => {
    setClickResults(prev => [...prev, { 
      ...result, 
      timestamp: new Date().toLocaleTimeString() 
    }]);
  };

  const testNavigation = async (path, buttonName) => {
    try {
      addResult({ type: 'info', message: `Testing navigation to ${path}` });
      router.push(path);
      addResult({ type: 'success', message: `✅ ${buttonName} navigation successful` });
    } catch (error) {
      addResult({ type: 'error', message: `❌ ${buttonName} failed: ${error.message}` });
    }
  };

  const testButtonClick = (buttonName) => {
    addResult({ type: 'success', message: `✅ ${buttonName} button clicked successfully!` });
  };

  return (
    <div className="min-h-screen bg-[#070005] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">🔍 Button Debugger</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Test Buttons */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4">Test Individual Buttons</h2>
            
            {/* Working Game Buttons */}
            <div className="bg-green-900/20 p-4 rounded-lg border border-green-600/30">
              <h3 className="text-lg font-medium mb-3 text-green-400">✅ Working Games</h3>
              <div className="space-y-2">
                <button
                  onClick={() => testNavigation("/game/roulette", "Roulette")}
                  className="w-full p-3 bg-red-600 hover:bg-red-700 rounded transition-colors text-left"
                >
                  🎰 Test Roulette Navigation
                </button>
                <button
                  onClick={() => testNavigation("/game/mines", "Mines")}
                  className="w-full p-3 bg-purple-600 hover:bg-purple-700 rounded transition-colors text-left"
                >
                  💎 Test Mines Navigation
                </button>
              </div>
            </div>

            {/* Placeholder Game Buttons */}
            <div className="bg-yellow-900/20 p-4 rounded-lg border border-yellow-600/30">
              <h3 className="text-lg font-medium mb-3 text-yellow-400">⚠️ Placeholder Games</h3>
              <div className="space-y-2">
                <button
                  onClick={() => testNavigation("/game/poker", "Poker")}
                  className="w-full p-3 bg-gray-600 hover:bg-gray-700 rounded transition-colors text-left"
                >
                  🃏 Test Poker Navigation (Should show Coming Soon)
                </button>
                <button
                  onClick={() => testNavigation("/game/blackjack", "Blackjack")}
                  className="w-full p-3 bg-gray-600 hover:bg-gray-700 rounded transition-colors text-left"
                >
                  🂡 Test Blackjack Navigation (Should show Coming Soon)
                </button>
                <button
                  onClick={() => testNavigation("/game/crash", "Crash")}
                  className="w-full p-3 bg-gray-600 hover:bg-gray-700 rounded transition-colors text-left"
                >
                  📈 Test Crash Navigation (Should be placeholder)
                </button>
                <button
                  onClick={() => testNavigation("/game/plinko", "Plinko")}
                  className="w-full p-3 bg-gray-600 hover:bg-gray-700 rounded transition-colors text-left"
                >
                  🏀 Test Plinko Navigation (Should be placeholder)
                </button>
              </div>
            </div>

            {/* General Navigation */}
            <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-600/30">
              <h3 className="text-lg font-medium mb-3 text-blue-400">🧭 General Navigation</h3>
              <div className="space-y-2">
                <button
                  onClick={() => testNavigation("/game", "Games Page")}
                  className="w-full p-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors text-left"
                >
                  🎮 Test Games Page
                </button>
                <button
                  onClick={() => testNavigation("/", "Home")}
                  className="w-full p-3 bg-green-600 hover:bg-green-700 rounded transition-colors text-left"
                >
                  🏠 Test Home Page
                </button>
              </div>
            </div>

            {/* Button Click Tests */}
            <div className="bg-purple-900/20 p-4 rounded-lg border border-purple-600/30">
              <h3 className="text-lg font-medium mb-3 text-purple-400">🖱️ Button Functionality</h3>
              <div className="space-y-2">
                <button
                  onClick={() => testButtonClick("Basic Button")}
                  className="w-full p-3 bg-purple-600 hover:bg-purple-700 rounded transition-colors text-left"
                >
                  🔘 Test Basic Button Click
                </button>
                <button
                  onClick={() => {
                    testButtonClick("Alert Button");
                    alert("Alert button works!");
                  }}
                  className="w-full p-3 bg-orange-600 hover:bg-orange-700 rounded transition-colors text-left"
                >
                  🚨 Test Alert Button
                </button>
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">📋 Test Results</h2>
            <div className="bg-black/40 p-4 rounded-lg h-96 overflow-y-auto border border-white/10">
              {clickResults.length === 0 ? (
                <p className="text-gray-400 text-center">Click buttons to see results...</p>
              ) : (
                <div className="space-y-2">
                  {clickResults.map((result, index) => (
                    <div 
                      key={index}
                      className={`p-2 rounded text-sm ${
                        result.type === 'success' ? 'bg-green-900/30 text-green-300' :
                        result.type === 'error' ? 'bg-red-900/30 text-red-300' :
                        'bg-blue-900/30 text-blue-300'
                      }`}
                    >
                      <span className="text-gray-400 text-xs">{result.timestamp}</span>
                      <br />
                      {result.message}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <button
              onClick={() => setClickResults([])}
              className="w-full mt-4 p-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
            >
              🗑️ Clear Results
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white/5 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">📖 Instructions</h3>
          <div className="space-y-2 text-white/80">
            <p>• <strong>Working Games:</strong> Should navigate to actual game pages (Roulette, Mines)</p>
            <p>• <strong>Placeholder Games:</strong> Should show "Coming Soon" pages</p>
            <p>• <strong>Button Clicks:</strong> Should register in the results panel</p>
            <p>• <strong>Check Console:</strong> Open browser dev tools to see console logs</p>
            <p>• <strong>Expected Behavior:</strong> All buttons should be clickable and responsive</p>
          </div>
        </div>
      </div>
    </div>
  );
}
