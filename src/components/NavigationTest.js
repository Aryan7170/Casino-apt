"use client";
import React from "react";
import { useRouter } from "next/navigation";
import GradientBorderButton from "./GradientBorderButton";

export default function NavigationTest() {
  const router = useRouter();

  const testNavigations = [
    { name: "Roulette", path: "/game/roulette" },
    { name: "Mines", path: "/game/mines" },
    { name: "All Games", path: "/game" },
  ];

  return (
    <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 m-4">
      <h3 className="text-white text-lg font-bold mb-4">
        🧪 Navigation Test Panel
      </h3>
      <div className="flex flex-wrap gap-2">
        {testNavigations.map((nav) => (
          <GradientBorderButton
            key={nav.name}
            onClick={() => {
              console.log(`🧪 Test navigation to ${nav.path}`);
              try {
                router.push(nav.path);
                console.log(`🧪 Navigation to ${nav.path} successful`);
              } catch (error) {
                console.error(`🧪 Navigation to ${nav.path} failed:`, error);
              }
            }}
          >
            Test {nav.name}
          </GradientBorderButton>
        ))}
      </div>
      <p className="text-white/70 text-sm mt-2">
        Check browser console for navigation logs
      </p>
    </div>
  );
}
