const { ethers } = require("hardhat");
const fs = requ; // 2. DEPLOY CASINOWALLET CONTRACT
console.log("🏦 [2/7] Deploying CasinoWallet Contract...");
const CasinoWallet = await ethers.getContractFactory("CasinoWallet");
const casinoWallet = await CasinoWallet.deploy(
  tokenAddress, // token address
  deployerAddress, // serverSigner (admin wallet)
  deployerAddress // gaslessRelayer (for now use same as admin, can be changed later)
);
await casinoWallet.waitForDeployment();
const casinoWalletAddress = await casinoWallet.getAddress();
deployedContracts.casinoWallet = casinoWalletAddress;
const path = require("path");

async function main() {
  console.log("🎰 APT CASINO - SEPOLIA TESTNET DEPLOYMENT");
  console.log("==========================================");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  const deployerAddress = deployer.address;
  const balance = await deployer.provider.getBalance(deployerAddress);

  console.log("📋 Deployment Info:");
  console.log("👤 Deployer Address:", deployerAddress);
  console.log("💰 Balance:", ethers.formatEther(balance), "ETH");
  console.log("🌐 Network: Ethereum Sepolia Testnet");
  console.log("⏰ Timestamp:", new Date().toISOString());
  console.log("==========================================\n");

  // Check minimum balance
  const minBalance = ethers.parseEther("0.05");
  if (balance < minBalance) {
    console.log(
      "❌ Insufficient balance! You need at least 0.05 ETH for deployment."
    );
    console.log("🚰 Get Sepolia ETH from: https://sepolia-faucet.pk910.de/");
    process.exit(1);
  }

  const deployedContracts = {};
  const startTime = Date.now();

  try {
    // 1. DEPLOY TOKEN CONTRACT (APTC)
    console.log("📄 [1/7] Deploying APTC Token Contract...");
    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy();
    await token.waitForDeployment();
    const tokenAddress = await token.getAddress();
    deployedContracts.token = tokenAddress;

    console.log("✅ Token deployed to:", tokenAddress);
    console.log("📋 Token Details:");
    console.log("   - Name:", await token.name());
    console.log("   - Symbol:", await token.symbol());
    console.log(
      "   - Total Supply:",
      ethers.formatEther(await token.totalSupply()),
      "APTC"
    );
    console.log("   - Treasury:", await token.treasury());
    console.log("");

    // 2. DEPLOY CASINOWALLET CONTRACT
    console.log("🏦 [2/7] Deploying CasinoWallet Contract...");
    const CasinoWallet = await ethers.getContractFactory("CasinoWallet");
    const casinoWallet = await CasinoWallet.deploy(
      tokenAddress, // token address
      deployerAddress // serverSigner (admin wallet)
    );
    await casinoWallet.waitForDeployment();
    const casinoWalletAddress = await casinoWallet.getAddress();
    deployedContracts.casinoWallet = casinoWalletAddress;

    console.log("✅ CasinoWallet deployed to:", casinoWalletAddress);
    console.log("📋 CasinoWallet Details:");
    console.log("   - Token:", await casinoWallet.token());
    console.log("   - Server Signer:", await casinoWallet.serverSigner());
    console.log(
      "   - Min Deposit:",
      ethers.formatEther(await casinoWallet.minDeposit()),
      "APTC"
    );
    console.log(
      "   - Max Withdraw:",
      ethers.formatEther(await casinoWallet.maxWithdraw()),
      "APTC"
    );
    console.log("");

    // 3. DEPLOY FORWARDER CONTRACT
    console.log("⚡ [3/7] Deploying Forwarder Contract...");
    const Forwarder = await ethers.getContractFactory("Forwarder");
    const forwarder = await Forwarder.deploy();
    await forwarder.waitForDeployment();
    const forwarderAddress = await forwarder.getAddress();
    deployedContracts.forwarder = forwarderAddress;

    console.log("✅ Forwarder deployed to:", forwarderAddress);
    console.log("");

    // 4. DEPLOY PAYMASTER CONTRACT
    console.log("💰 [4/7] Deploying Paymaster Contract...");
    const Paymaster = await ethers.getContractFactory("SimplePaymaster");
    const paymaster = await Paymaster.deploy(tokenAddress);
    await paymaster.waitForDeployment();
    const paymasterAddress = await paymaster.getAddress();
    deployedContracts.paymaster = paymasterAddress;

    console.log("✅ Paymaster deployed to:", paymasterAddress);
    console.log("");

    // 5. DEPLOY MINES CONTRACT
    console.log("💎 [5/7] Deploying Mines Contract...");
    try {
      const Mines = await ethers.getContractFactory("mines");
      const mines = await Mines.deploy(
        tokenAddress, // token
        deployerAddress, // treasury
        deployerAddress, // game operator
        forwarderAddress // trusted forwarder
      );
      await mines.waitForDeployment();
      const minesAddress = await mines.getAddress();
      deployedContracts.mines = minesAddress;

      console.log("✅ Mines deployed to:", minesAddress);
    } catch (error) {
      console.log("⚠️  Mines contract deployment failed:", error.message);
      deployedContracts.mines = "NOT_DEPLOYED";
    }
    console.log("");

    // 6. DEPLOY ROULETTE CONTRACT
    console.log("🎰 [6/7] Deploying Roulette Contract...");
    try {
      const Roulette = await ethers.getContractFactory("Roulette");
      const roulette = await Roulette.deploy(tokenAddress);
      await roulette.waitForDeployment();
      const rouletteAddress = await roulette.getAddress();
      deployedContracts.roulette = rouletteAddress;

      console.log("✅ Roulette deployed to:", rouletteAddress);
    } catch (error) {
      console.log("⚠️  Roulette contract deployment failed:", error.message);
      deployedContracts.roulette = "NOT_DEPLOYED";
    }
    console.log("");

    // 7. DEPLOY WHEEL CONTRACT
    console.log("🎲 [7/7] Deploying Wheel Contract...");
    try {
      const Wheel = await ethers.getContractFactory("Wheel");
      const wheel = await Wheel.deploy(tokenAddress);
      await wheel.waitForDeployment();
      const wheelAddress = await wheel.getAddress();
      deployedContracts.wheel = wheelAddress;

      console.log("✅ Wheel deployed to:", wheelAddress);
    } catch (error) {
      console.log("⚠️  Wheel contract deployment failed:", error.message);
      deployedContracts.wheel = "NOT_DEPLOYED";
    }
    console.log("");

    // CONFIGURATION PHASE
    console.log("🔧 CONFIGURING CONTRACTS...");
    console.log("============================");

    // Set CasinoWallet as roulette contract in Token
    console.log("🔗 Setting CasinoWallet as authorized contract in Token...");
    const setRouletteContract = await token.setRouletteContract(
      casinoWalletAddress
    );
    await setRouletteContract.wait();
    console.log("✅ CasinoWallet authorized in Token contract");

    // Approve CasinoWallet for gasless transactions
    console.log("🔗 Approving CasinoWallet for gasless transactions...");
    const approveContract = await paymaster.setContractApproval(
      casinoWalletAddress,
      true
    );
    await approveContract.wait();
    console.log("✅ CasinoWallet approved for gasless transactions");

    // Approve game contracts for gasless transactions (if deployed)
    if (deployedContracts.mines !== "NOT_DEPLOYED") {
      console.log("🔗 Approving Mines for gasless transactions...");
      const approveMines = await paymaster.setContractApproval(
        deployedContracts.mines,
        true
      );
      await approveMines.wait();
      console.log("✅ Mines approved for gasless transactions");
    }

    if (deployedContracts.roulette !== "NOT_DEPLOYED") {
      console.log("🔗 Approving Roulette for gasless transactions...");
      const approveRoulette = await paymaster.setContractApproval(
        deployedContracts.roulette,
        true
      );
      await approveRoulette.wait();
      console.log("✅ Roulette approved for gasless transactions");
    }

    if (deployedContracts.wheel !== "NOT_DEPLOYED") {
      console.log("🔗 Approving Wheel for gasless transactions...");
      const approveWheel = await paymaster.setContractApproval(
        deployedContracts.wheel,
        true
      );
      await approveWheel.wait();
      console.log("✅ Wheel approved for gasless transactions");
    }

    console.log("");

    // DEPLOYMENT SUMMARY
    const endTime = Date.now();
    const deploymentTime = (endTime - startTime) / 1000;

    console.log("🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!");
    console.log("=====================================");
    console.log(
      "⏱️  Total deployment time:",
      deploymentTime.toFixed(2),
      "seconds"
    );
    console.log(
      "💰 Final balance:",
      ethers.formatEther(await deployer.provider.getBalance(deployerAddress)),
      "ETH"
    );
    console.log("");

    console.log("📄 DEPLOYED CONTRACT ADDRESSES:");
    console.log("================================");
    console.log("🪙  APTC Token:", deployedContracts.token);
    console.log("🏦  CasinoWallet:", deployedContracts.casinoWallet);
    console.log("⚡  Forwarder:", deployedContracts.forwarder);
    console.log("💰  Paymaster:", deployedContracts.paymaster);
    console.log("💎  Mines:", deployedContracts.mines);
    console.log("🎰  Roulette:", deployedContracts.roulette);
    console.log("🎲  Wheel:", deployedContracts.wheel);
    console.log("👤  Admin Address:", deployerAddress);
    console.log("");

    // GENERATE .ENV UPDATE
    console.log("📝 ENVIRONMENT VARIABLES UPDATE:");
    console.log("=================================");
    const envVars = [
      `NEXT_PUBLIC_TOKEN_ADDRESS=${deployedContracts.token}`,
      `NEXT_PUBLIC_CASINO_WALLET_ADDRESS=${deployedContracts.casinoWallet}`,
      `NEXT_PUBLIC_FORWARDER_ADDRESS=${deployedContracts.forwarder}`,
      `NEXT_PUBLIC_PAYMASTER_ADDRESS=${deployedContracts.paymaster}`,
      `NEXT_PUBLIC_SERVER_SIGNER_ADDRESS=${deployerAddress}`,
      `NEXT_PUBLIC_GAME_OPERATOR_ADDRESS=${deployerAddress}`,
      `NEXT_PUBLIC_TREASURY_ADDRESS=${deployerAddress}`,
      `NEXT_PUBLIC_MINES_CONTRACT_ADDRESS=${deployedContracts.mines}`,
      `NEXT_PUBLIC_ROULETTE_CONTRACT_ADDRESS=${deployedContracts.roulette}`,
      `NEXT_PUBLIC_WHEEL_CONTRACT_ADDRESS=${deployedContracts.wheel}`,
    ];

    envVars.forEach((envVar) => console.log(envVar));
    console.log("");

    // SAVE DEPLOYMENT INFO TO FILE
    const deploymentInfo = {
      network: "Ethereum Sepolia Testnet",
      deployer: deployerAddress,
      timestamp: new Date().toISOString(),
      deploymentTime: deploymentTime,
      contracts: deployedContracts,
      envVars: envVars,
    };

    const deploymentFile = path.join(
      __dirname,
      `deployment-sepolia-${Date.now()}.json`
    );
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    console.log("💾 Deployment info saved to:", deploymentFile);
    console.log("");

    // VERIFICATION COMMANDS
    console.log("✅ ETHERSCAN VERIFICATION COMMANDS:");
    console.log("===================================");
    console.log(
      `npx hardhat verify --network ethereumSepolia ${deployedContracts.token}`
    );
    console.log(
      `npx hardhat verify --network ethereumSepolia ${deployedContracts.casinoWallet} "${deployedContracts.token}" "${deployerAddress}" "${deployerAddress}"`
    );
    console.log(
      `npx hardhat verify --network ethereumSepolia ${deployedContracts.forwarder}`
    );
    console.log(
      `npx hardhat verify --network ethereumSepolia ${deployedContracts.paymaster} "${deployedContracts.token}"`
    );

    if (deployedContracts.mines !== "NOT_DEPLOYED") {
      console.log(
        `npx hardhat verify --network ethereumSepolia ${deployedContracts.mines} "${deployedContracts.token}" "${deployerAddress}" "${deployerAddress}" "${deployedContracts.forwarder}"`
      );
    }

    if (deployedContracts.roulette !== "NOT_DEPLOYED") {
      console.log(
        `npx hardhat verify --network ethereumSepolia ${deployedContracts.roulette} "${deployedContracts.token}"`
      );
    }

    if (deployedContracts.wheel !== "NOT_DEPLOYED") {
      console.log(
        `npx hardhat verify --network ethereumSepolia ${deployedContracts.wheel} "${deployedContracts.token}"`
      );
    }

    console.log("");

    // NEXT STEPS
    console.log("🚀 NEXT STEPS:");
    console.log("==============");
    console.log("1. Copy the environment variables above to your .env file");
    console.log(
      "2. Run the verification commands to verify contracts on Etherscan"
    );
    console.log(
      "3. Fund your relayer wallet with Sepolia ETH for gasless transactions"
    );
    console.log(
      "4. Update your frontend configuration with the new contract addresses"
    );
    console.log("5. Start your game server: node offchain-game-server.js");
    console.log(
      "6. Start your relayer service: node gasless-relayer-service.js"
    );
    console.log("7. Test the frontend: npm run dev");
    console.log("");

    console.log("🎰 APT CASINO DEPLOYMENT COMPLETE! 🎰");
  } catch (error) {
    console.error("❌ DEPLOYMENT FAILED:");
    console.error("Error:", error.message);

    if (error.message.includes("insufficient funds")) {
      console.log("\n💡 Solution: Get more Sepolia ETH from faucets:");
      console.log("   - https://sepolia-faucet.pk910.de/");
      console.log("   - https://faucet.sepolia.dev/");
    }

    process.exit(1);
  }
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
