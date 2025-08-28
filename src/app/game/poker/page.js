"use client";
import { useRouter } from "next/navigation";
import GradientBorderButton from "@/components/GradientBorderButton";

export default function PokerPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-sharp-black to-[#150012] text-white flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold mb-4 text-gradient">
            Texas Hold'em Poker
          </h1>
          <p className="text-white/70 text-lg mb-6">
            This game is coming soon! We're working hard to bring you the best gaming experience.
          </p>
        </div>
        
        <div className="space-y-4">
          <GradientBorderButton
            onClick={() => router.push("/game/roulette")}
            className="w-full"
          >
            Try Roulette Instead
          </GradientBorderButton>
          
          <GradientBorderButton
            onClick={() => router.push("/game")}
            className="w-full"
          >
            Back to Games
          </GradientBorderButton>
        </div>
      </div>
    </div>
  );
}
