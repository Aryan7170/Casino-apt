export const gameData = {
  title: "European Roulette",
  label: "CLASSIC CASINO GAME",
  image: "/images/games/roulette.png",
  paragraphs: [
    "Welcome to our European Roulette game, where elegance meets excitement! Experience the thrill of the wheel with our provably fair, blockchain-powered roulette game. With a single zero and a house edge of just 2.70%, we offer better odds than traditional casinos. European Roulette features 37 pockets (numbers 0-36), offering better odds than American Roulette. Players bet on where the ball will land after the wheel is spun.",
    "",
    "Video Tutorial: How to Play Roulette",
    "https://www.youtube.com/embed/6nKBlWaRI8w?si=24sWw5ftQ2dpOop8",
  ],
};

export const bettingTableData = {
  title: "Betting Options",
  description: "Explore our comprehensive betting options and maximize your winning potential:",
  options: [
    {
      category: "Inside Bets",
      bets: [
        { name: "Straight Up", description: "Bet on a single number", payout: "35:1" },
        { name: "Split", description: "Bet on two adjacent numbers", payout: "17:1" },
        { name: "Street", description: "Bet on three numbers in a row", payout: "11:1" },
        { name: "Corner", description: "Bet on four numbers in a square", payout: "8:1" },
        { name: "Six Line", description: "Bet on six numbers in two rows", payout: "5:1" }
      ]
    },
    {
      category: "Outside Bets",
      bets: [
        { name: "Red/Black", description: "Bet on all red or black numbers", payout: "1:1" },
        { name: "Even/Odd", description: "Bet on all even or odd numbers", payout: "1:1" },
        { name: "High/Low", description: "Bet on 1-18 or 19-36", payout: "1:1" },
        { name: "Dozen", description: "Bet on 1-12, 13-24, or 25-36", payout: "2:1" },
        { name: "Column", description: "Bet on a vertical column of numbers", payout: "2:1" }
      ]
    }
  ]
}; 