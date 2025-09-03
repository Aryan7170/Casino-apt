"use client";
import { useOffChainCasinoGames } from "@/hooks/useOffChainCasinoGames";
import { useEffect, useState } from "react";

export default function DebugOffChain() {
  const {
    offChainBalance,
    gameSession,
    isLoading,
    error,
    isSessionActive,
    initializeSession,
  } = useOffChainCasinoGames();

  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    const timestamp = new Date().toISOString();
    setLogs((prev) => [...prev, `${timestamp}: ${message}`]);
  };

  useEffect(() => {
    addLog(
      `Hook state: session=${!!gameSession}, loading=${isLoading}, error=${error}, active=${isSessionActive}, balance=${offChainBalance}`
    );
  }, [gameSession, isLoading, error, isSessionActive, offChainBalance]);

  useEffect(() => {
    addLog("Component mounted, waiting for hook initialization...");
  }, []);

  const handleManualInit = async () => {
    addLog("Manual initialization triggered");
    try {
      await initializeSession();
      addLog("Manual initialization completed");
    } catch (err) {
      addLog(`Manual initialization failed: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl font-bold mb-6">Off-Chain Gaming Debug</h1>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Current State</h2>
          <div className="space-y-1 text-sm">
            <div>Session: {gameSession ? "✅ Active" : "❌ None"}</div>
            <div>Loading: {isLoading ? "🔄 Yes" : "✅ No"}</div>
            <div>Session Active: {isSessionActive ? "✅ Yes" : "❌ No"}</div>
            <div>Balance: {offChainBalance} APTC</div>
            <div>Error: {error || "None"}</div>
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Environment</h2>
          <div className="space-y-1 text-sm">
            <div>
              Game Server URL:{" "}
              {process.env.NEXT_PUBLIC_GAME_SERVER_URL || "Default"}
            </div>
            <div>
              Gasless Enabled: {process.env.GASLESS_ENABLED || "Not set"}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <button
          onClick={handleManualInit}
          disabled={isLoading}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded-lg"
        >
          {isLoading ? "Initializing..." : "Manual Initialize"}
        </button>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Debug Logs:</h2>
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-gray-400">No logs yet.</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="text-xs font-mono text-gray-300">
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
