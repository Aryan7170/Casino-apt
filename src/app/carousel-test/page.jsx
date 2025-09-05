"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import GradientBorderButton from "@/components/GradientBorderButton";

export default function SimplifiedGameCarousel() {
  const router = useRouter();

  const games = [
    {
      id: "roulette",
      title: "Roulette",
      path: "/game/roulette",
    },
    {
      id: "mines",
      title: "Mines",
      path: "/game/mines",
    },
    {
      id: "poker",
      title: "Poker",
      path: "/game/poker",
    },
  ];

  return (
    <div className="min-h-screen bg-[#070005] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          Simplified Game Carousel Test
        </h1>

        {/* Simple grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {games.map((game) => (
            <div key={game.id} className="bg-white/10 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">{game.title}</h2>

              {/* Test with a simple button first */}
              <button
                className="w-full mb-2 p-2 bg-red-500 hover:bg-red-600 rounded text-white"
                onClick={() => {
                  console.log(`Simple button clicked for ${game.title}`);
                  router.push(game.path);
                }}
              >
                Simple Button - Play {game.title}
              </button>

              <Link href={game.path} className="block w-full">
                <GradientBorderButton
                  className="w-full"
                  onClick={(e) => {
                    console.log(`Link test: ${game.title} button clicked`);
                  }}
                >
                  Play {game.title}
                </GradientBorderButton>
              </Link>
            </div>
          ))}
        </div>

        {/* Test the exact same structure as GameCarousel but simplified */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            GameCarousel-like Structure
          </h2>
          <div className="flex overflow-x-auto pb-4">
            <div className="flex gap-6">
              {games.map((game) => (
                <div key={`carousel-${game.id}`} className="snap-start">
                  <div className="flex-shrink-0 w-[320px] p-0.5 bg-gradient-to-r from-red-500 to-blue-500 rounded-xl h-[200px]">
                    <div className="bg-[#070005] flex p-6 w-full h-full rounded-xl relative">
                      <div className="flex flex-col justify-between w-full">
                        <h3 className="text-xl font-bold text-white">
                          {game.title}
                        </h3>

                        <Link href={game.path} className="block w-full">
                          <GradientBorderButton
                            className="w-full"
                            onClick={(e) => {
                              console.log(
                                `Carousel Link test: ${game.title} button clicked`
                              );
                            }}
                          >
                            Play Now
                          </GradientBorderButton>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
      </div>
    </div>
  );
}
