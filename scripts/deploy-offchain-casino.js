const { ethers } = require("hardhat");

async function main() {
  console.log("🎰 Deploying APT Casino Off-Chain Gaming Contracts...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log(
    "Account balance:",
    (await deployer.provider.getBalance(deployer.address)).toString()
  );

  // Deploy or get existing token contract
  console.log("\n📄 Deploying Token Contract...");
  const Token = await ethers.getContractFactory("Token");
  const token = await Token.deploy();
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("✅ Token deployed to:", tokenAddress);

  // Deploy CasinoWallet contract
  console.log("\n🏦 Deploying CasinoWallet Contract...");

  // For demo purposes, use deployer as server signer
  // In production, generate a separate server key
  const serverSigner = deployer.address;

  const CasinoWallet = await ethers.getContractFactory("CasinoWallet");
  const casinoWallet = await CasinoWallet.deploy(tokenAddress, serverSigner);
  await casinoWallet.waitForDeployment();
  const casinoWalletAddress = await casinoWallet.getAddress();
  console.log("✅ CasinoWallet deployed to:", casinoWalletAddress);

  console.log("\n📋 Deployment Summary:");
  console.log("=".repeat(50));
  console.log("Token Contract:", tokenAddress);
  console.log("CasinoWallet Contract:", casinoWalletAddress);
  console.log("Server Signer:", serverSigner);
  console.log("Deployer:", deployer.address);

  // Fund the casino wallet with some tokens for initial liquidity
  console.log("\n💰 Setting up initial liquidity...");
  const initialSupply = ethers.parseEther("1000000"); // 1M tokens
  const casinoFunding = ethers.parseEther("100000"); // 100K tokens for casino

  // Mint tokens to deployer
  await token.mint(deployer.address, initialSupply);
  console.log(
    "✅ Minted",
    ethers.formatEther(initialSupply),
    "tokens to deployer"
  );

  // Transfer some tokens to casino wallet for payouts
  await token.transfer(casinoWalletAddress, casinoFunding);
  console.log(
    "✅ Transferred",
    ethers.formatEther(casinoFunding),
    "tokens to casino wallet"
  );

  // Verify contract setup
  console.log("\n🔍 Verifying contract setup...");
  const casinoBalance = await token.balanceOf(casinoWalletAddress);
  const deployerBalance = await token.balanceOf(deployer.address);

  console.log(
    "Casino wallet token balance:",
    ethers.formatEther(casinoBalance)
  );
  console.log("Deployer token balance:", ethers.formatEther(deployerBalance));

  // Environment variables for the game server
  console.log("\n🔧 Environment Variables for Game Server:");
  console.log("=".repeat(50));
  console.log(`CASINO_WALLET_ADDRESS=${casinoWalletAddress}`);
  console.log(`TOKEN_ADDRESS=${tokenAddress}`);
  console.log(
    `SERVER_PRIVATE_KEY=${process.env.PRIVATE_KEY || "YOUR_SERVER_PRIVATE_KEY"}`
  );
  console.log(`RPC_URL=${process.env.RPC_URL || "YOUR_RPC_URL"}`);

  // Frontend environment variables
  console.log("\n🔧 Environment Variables for Frontend:");
  console.log("=".repeat(50));
  console.log(`NEXT_PUBLIC_CASINO_WALLET_ADDRESS=${casinoWalletAddress}`);
  console.log(`NEXT_PUBLIC_TOKEN_ADDRESS=${tokenAddress}`);
  console.log(`NEXT_PUBLIC_GAME_SERVER_URL=http://localhost:3001`);

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n📝 Next Steps:");
  console.log("1. Update your .env files with the addresses above");
  console.log("2. Start the game server: node offchain-game-server.js");
  console.log("3. Update frontend to use new CasinoWallet contract");
  console.log("4. Test deposit/withdraw functionality");
  console.log("5. Test off-chain game integration");

  // Create a simple verification script
  console.log("\n🧪 Creating verification script...");
  const verificationScript = `
// Verification script for deployed contracts
const { ethers } = require("ethers");

const provider = new ethers.JsonRpcProvider("${
    process.env.RPC_URL || "YOUR_RPC_URL"
  }");
const tokenAddress = "${tokenAddress}";
const casinoWalletAddress = "${casinoWalletAddress}";

// Token ABI (minimal)
const tokenABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function approve(address spender, uint256 amount) returns (bool)"
];

// CasinoWallet ABI (minimal)
const casinoWalletABI = [
    "function balances(address player) view returns (uint256)",
    "function deposit(uint256 amount)",
    "function withdraw(uint256 amount)"
];

async function verify() {
    const token = new ethers.Contract(tokenAddress, tokenABI, provider);
    const casinoWallet = new ethers.Contract(casinoWalletAddress, casinoWalletABI, provider);
    
    console.log("Token balance of casino:", await token.balanceOf(casinoWalletAddress));
    console.log("Contracts are deployed and accessible!");
}

verify().catch(console.error);
`;

  require("fs").writeFileSync("verify-deployment.js", verificationScript);
  console.log("✅ Created verify-deployment.js script");

  return {
    token: tokenAddress,
    casinoWallet: casinoWalletAddress,
    serverSigner: serverSigner,
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
