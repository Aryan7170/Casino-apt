"use client";
import { useRouter } from "next/navigation";
import GradientBorderButton from "@/components/GradientBorderButton";

export default function SimpleButtonTest() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#070005] text-white p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center">Simple Button Test</h1>
        
        {/* Test 1: Basic Button */}
        <div className="bg-white/5 p-6 rounded-lg">
          <h2 className="text-xl mb-4">Test 1: Basic HTML Button</h2>
          <button
            onClick={() => {
              console.log("Basic button clicked");
              alert("Basic button works!");
            }}
            className="w-full p-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
          >
            Basic Button Test
          </button>
        </div>

        {/* Test 2: GradientBorderButton */}
        <div className="bg-white/5 p-6 rounded-lg">
          <h2 className="text-xl mb-4">Test 2: GradientBorderButton</h2>
          <GradientBorderButton
            className="w-full"
            onClick={() => {
              console.log("GradientBorderButton clicked");
              alert("GradientBorderButton works!");
            }}
          >
            GradientBorderButton Test
          </GradientBorderButton>
        </div>

        {/* Test 3: Navigation Button */}
        <div className="bg-white/5 p-6 rounded-lg">
          <h2 className="text-xl mb-4">Test 3: Navigation Test</h2>
          <button
            onClick={() => {
              console.log("Navigation button clicked");
              alert("Navigating to /game");
              router.push("/game");
            }}
            className="w-full p-3 bg-green-600 hover:bg-green-700 rounded transition-colors"
          >
            Test Navigation to /game
          </button>
        </div>

        {/* Test 4: GradientBorderButton with Navigation */}
        <div className="bg-white/5 p-6 rounded-lg">
          <h2 className="text-xl mb-4">Test 4: GradientBorderButton + Navigation</h2>
          <GradientBorderButton
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              console.log("GradientBorderButton navigation clicked");
              alert("GradientBorderButton navigation test");
              router.push("/game/roulette");
            }}
          >
            Navigate to Roulette
          </GradientBorderButton>
        </div>

        {/* Test 5: Mines Navigation */}
        <div className="bg-white/5 p-6 rounded-lg">
          <h2 className="text-xl mb-4">Test 5: Mines Game Navigation</h2>
          <GradientBorderButton
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              console.log("Mines navigation clicked");
              alert("Navigating to Mines game");
              router.push("/game/mines");
            }}
          >
            Navigate to Mines
          </GradientBorderButton>
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded transition-colors"
          >
            Back to Home
          </button>
        </div>

        <div className="bg-yellow-900/20 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Expected Results:</h3>
          <ul className="text-sm space-y-1 text-yellow-200">
            <li>• All buttons should be clickable</li>
            <li>• Alerts should appear when clicked</li>
            <li>• Console logs should appear in browser dev tools</li>
            <li>• Navigation should work for all tests</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
