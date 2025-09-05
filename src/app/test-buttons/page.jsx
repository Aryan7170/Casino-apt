"use client";
import { useRouter } from "next/navigation";
import GradientBorderButton from "@/components/GradientBorderButton";

export default function TestButtons() {
  const router = useRouter();

  const testButtonClick = (buttonName) => {
    console.log(`✅ ${buttonName} button clicked successfully!`);
    alert(`${buttonName} button is working!`);
  };

  return (
    <div className="min-h-screen bg-[#070005] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Button Test Page
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Button Test */}
          <div className="bg-white/5 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Basic Button</h2>
            <button
              onClick={() => testButtonClick("Basic")}
              className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Test Basic Button
            </button>
          </div>

          {/* GradientBorderButton Test */}
          <div className="bg-white/5 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">GradientBorderButton</h2>
            <GradientBorderButton
              onClick={() => testButtonClick("GradientBorder")}
              className="w-full"
            >
              Test Gradient Button
            </GradientBorderButton>
          </div>

          {/* Router Navigation Test */}
          <div className="bg-white/5 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Router Navigation</h2>
            <button
              onClick={() => {
                console.log("🚀 Router test button clicked");
                router.push("/game");
              }}
              className="w-full py-3 px-6 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              Test Router Navigation
            </button>
          </div>

          {/* Launch Game Button Test */}
          <div className="bg-white/5 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Launch Game Style</h2>
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log("🚀 Launch Game style button clicked");
                testButtonClick("Launch Game Style");
              }}
              className="w-full text-white font-display cursor-pointer rounded-xl py-3 px-6 smooth-gradient hover:shadow-lg transition-all"
              type="button"
            >
              Test Launch Game Style
            </button>
          </div>

          {/* Tournaments Button Test */}
          <div className="bg-white/5 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Tournaments Style</h2>
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log("🏆 Tournaments test button clicked");
                testButtonClick("Tournaments Style");
              }}
              className="w-full px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all text-sm font-medium text-white/90 cursor-pointer"
            >
              Test Tournaments Style
            </button>
          </div>

          {/* Back to Home */}
          <div className="bg-white/5 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Navigation Back</h2>
            <button
              onClick={() => router.push("/")}
              className="w-full py-3 px-6 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>

        <div className="mt-8 bg-white/5 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <p className="text-white/70">
            Click each button to test if they're working properly. Check the
            browser console for logs and alerts should appear.
          </p>
        </div>
      </div>
    </div>
  );
}
