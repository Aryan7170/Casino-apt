"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NavigationTest() {
  const router = useRouter();
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    setLogs((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  const testNavigation = (path) => {
    addLog(`Attempting to navigate to: ${path}`);
    try {
      router.push(path);
      addLog(`Navigation call successful for: ${path}`);
    } catch (error) {
      addLog(`Navigation error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl font-bold mb-6">Navigation Test Page</h1>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => testNavigation("/game/mines")}
          className="p-4 bg-purple-600 hover:bg-purple-700 rounded-lg"
        >
          Test Mines Navigation
        </button>

        <button
          onClick={() => testNavigation("/game/roulette")}
          className="p-4 bg-red-600 hover:bg-red-700 rounded-lg"
        >
          Test Roulette Navigation
        </button>

        <button
          onClick={() => testNavigation("/game")}
          className="p-4 bg-blue-600 hover:bg-blue-700 rounded-lg"
        >
          Test Games Page Navigation
        </button>

        <button
          onClick={() => testNavigation("/")}
          className="p-4 bg-green-600 hover:bg-green-700 rounded-lg"
        >
          Test Home Navigation
        </button>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Navigation Logs:</h2>
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-gray-400">
              No logs yet. Click a button to test navigation.
            </p>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="text-sm font-mono text-gray-300">
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
