const hre = require("hardhat");

async function main() {
  console.log("🎰 APT Casino - Complete Deployment to Sepolia");
  console.log("=".repeat(50));

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

  if (balance < hre.ethers.parseEther("0.1")) {
    console.log(
      "⚠️  Warning: Low balance. You may need more ETH for deployment."
    );
  }
  console.log("");

  // Store all addresses for final summary
  const deployedContracts = {};

  try {
    // Step 1: Deploy Token
    console.log("1️⃣ Deploying Token Contract...");
    const Token = await hre.ethers.getContractFactory("Token");
    const token = await Token.deploy();
    await token.waitForDeployment();
    const tokenAddress = await token.getAddress();
    deployedContracts.token = tokenAddress;
    console.log("✅ Token deployed to:", tokenAddress);
    console.log("");

    // Step 2: Deploy Forwarder
    console.log("2️⃣ Deploying GameForwarder...");
    const GameForwarder = await hre.ethers.getContractFactory("GameForwarder");
    const forwarder = await GameForwarder.deploy();
    await forwarder.waitForDeployment();
    const forwarderAddress = await forwarder.getAddress();
    deployedContracts.forwarder = forwarderAddress;
    console.log("✅ GameForwarder deployed to:", forwarderAddress);
    console.log("");

    // Step 3: Deploy Paymaster
    console.log("3️⃣ Deploying GamePaymaster...");
    const GamePaymaster = await hre.ethers.getContractFactory("GamePaymaster");
    const paymaster = await GamePaymaster.deploy(tokenAddress);
    await paymaster.waitForDeployment();
    const paymasterAddress = await paymaster.getAddress();
    deployedContracts.paymaster = paymasterAddress;
    console.log("✅ GamePaymaster deployed to:", paymasterAddress);
    console.log("");

    // Step 4: Deploy CasinoWallet
    console.log("4️⃣ Deploying CasinoWallet...");
    const CasinoWallet = await hre.ethers.getContractFactory("CasinoWallet");
    const casinoWallet = await CasinoWallet.deploy(
      tokenAddress,
      deployer.address, // Server signer (use deployer for testing)
      deployer.address // Relayer (use deployer for testing)
    );
    await casinoWallet.waitForDeployment();
    const casinoWalletAddress = await casinoWallet.getAddress();
    deployedContracts.casinoWallet = casinoWalletAddress;
    console.log("✅ CasinoWallet deployed to:", casinoWalletAddress);
    console.log("");

    // Step 5: Deploy SecureMines
    console.log("5️⃣ Deploying SecureMines...");
    const SecureMines = await hre.ethers.getContractFactory("SecureMines");
    const treasuryAddress = "0xFF9582E3898599D2cF0Abdc06321789dc345e529";
    const minesContract = await SecureMines.deploy(
      tokenAddress,
      treasuryAddress,
      deployer.address,
      forwarderAddress
    );
    await minesContract.waitForDeployment();
    const minesAddress = await minesContract.getAddress();
    deployedContracts.mines = minesAddress;
    console.log("✅ SecureMines deployed to:", minesAddress);
    console.log("");

    // Step 6: Deploy Roulette
    console.log("6️⃣ Deploying Roulette...");
    const Roulette = await hre.ethers.getContractFactory("Roulette");
    const roulette = await Roulette.deploy(tokenAddress);
    await roulette.waitForDeployment();
    const rouletteAddress = await roulette.getAddress();
    deployedContracts.roulette = rouletteAddress;
    console.log("✅ Roulette deployed to:", rouletteAddress);
    console.log("");

    // Step 7: Deploy WheelGame
    console.log("7️⃣ Deploying WheelGame...");
    const WheelGame = await hre.ethers.getContractFactory("WheelGame");
    const wheelGame = await WheelGame.deploy(tokenAddress, deployer.address);
    await wheelGame.waitForDeployment();
    const wheelAddress = await wheelGame.getAddress();
    deployedContracts.wheel = wheelAddress;
    console.log("✅ WheelGame deployed to:", wheelAddress);
    console.log("");

    // Step 8: Setup configurations
    console.log("8️⃣ Setting up configurations...");

    // Approve game contracts for gasless transactions
    await paymaster.setContractApproval(minesAddress, true);
    console.log("✅ Mines contract approved for gasless");

    await paymaster.setContractApproval(rouletteAddress, true);
    console.log("✅ Roulette contract approved for gasless");

    await paymaster.setContractApproval(wheelAddress, true);
    console.log("✅ Wheel contract approved for gasless");

    // Set up relayer
    await forwarder.setRelayerApproval(deployer.address, true);
    console.log("✅ Deployer approved as relayer");

    // Fund paymaster
    const fundAmount = hre.ethers.parseEther("0.1");
    await paymaster.fundPaymaster({ value: fundAmount });
    console.log("✅ Paymaster funded with 0.1 ETH");

    // Setup unlimited gasless
    await paymaster.updateAutoWhitelistSettings(
      true, // enabled
      hre.ethers.MaxUint256, // unlimited free gas
      hre.ethers.MaxUint256 // unlimited duration
    );
    console.log("✅ Unlimited gasless configured");
    console.log("");

    // Final Summary
    console.log("🎉 DEPLOYMENT COMPLETE!");
    console.log("=".repeat(50));
    console.log("📋 Contract Addresses:");
    console.log(`Token:          ${deployedContracts.token}`);
    console.log(`Forwarder:      ${deployedContracts.forwarder}`);
    console.log(`Paymaster:      ${deployedContracts.paymaster}`);
    console.log(`CasinoWallet:   ${deployedContracts.casinoWallet}`);
    console.log(`Mines:          ${deployedContracts.mines}`);
    console.log(`Roulette:       ${deployedContracts.roulette}`);
    console.log(`Wheel:          ${deployedContracts.wheel}`);
    console.log("");
    console.log("📝 Environment Variables for .env.production:");
    console.log("=".repeat(50));
    console.log(`NEXT_PUBLIC_TOKEN_ADDRESS=${deployedContracts.token}`);
    console.log(`NEXT_PUBLIC_FORWARDER_ADDRESS=${deployedContracts.forwarder}`);
    console.log(`NEXT_PUBLIC_PAYMASTER_ADDRESS=${deployedContracts.paymaster}`);
    console.log(
      `NEXT_PUBLIC_CASINO_WALLET_ADDRESS=${deployedContracts.casinoWallet}`
    );
    console.log(`NEXT_PUBLIC_MINES_ADDRESS=${deployedContracts.mines}`);
    console.log(`NEXT_PUBLIC_ROULETTE_ADDRESS=${deployedContracts.roulette}`);
    console.log(`NEXT_PUBLIC_WHEEL_ADDRESS=${deployedContracts.wheel}`);
    console.log(`NEXT_PUBLIC_SERVER_SIGNER_ADDRESS=${deployer.address}`);
    console.log(`NEXT_PUBLIC_RELAYER_ADDRESS=${deployer.address}`);
    console.log(`NEXT_PUBLIC_GAME_OPERATOR_ADDRESS=${deployer.address}`);
    console.log("");
    console.log("🚀 Next Steps:");
    console.log(
      "1. Copy the environment variables above to your .env.production"
    );
    console.log(
      "2. Update src/config/contracts.js with the contract addresses"
    );
    console.log("3. Deploy your frontend to Vercel");
    console.log("4. Test the gasless transactions!");
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
