const hre = require("hardhat");

/**
 * Setup script for unlimited gasless transactions
 * This script will:
 * 1. Deploy or get existing contracts
 * 2. Approve all game contracts for gasless transactions
 * 3. Configure unlimited settings
 */
async function main() {
  console.log("Setting up unlimited gasless transactions...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Using account:", deployer.address);

  // Contract addresses - update these with your deployed addresses
  const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS || ""; // Your APTC token address
  const ROULETTE_ADDRESS = process.env.ROULETTE_ADDRESS || ""; // Your Roulette contract address
  const PAYMASTER_ADDRESS = process.env.PAYMASTER_ADDRESS || ""; // Your Paymaster contract address
  const FORWARDER_ADDRESS = process.env.FORWARDER_ADDRESS || ""; // Your Forwarder contract address

  // Get contract instances
  const Paymaster = await hre.ethers.getContractFactory("GamePaymaster");
  const Forwarder = await hre.ethers.getContractFactory("GameForwarder");
  const Roulette = await hre.ethers.getContractFactory("Roulette");

  let paymaster, forwarder, roulette;

  try {
    if (PAYMASTER_ADDRESS) {
      paymaster = await Paymaster.attach(PAYMASTER_ADDRESS);
      console.log("✓ Connected to existing Paymaster at:", PAYMASTER_ADDRESS);
    } else {
      console.log(
        "⚠️  No PAYMASTER_ADDRESS provided, skipping Paymaster setup"
      );
      return;
    }

    if (FORWARDER_ADDRESS) {
      forwarder = await Forwarder.attach(FORWARDER_ADDRESS);
      console.log("✓ Connected to existing Forwarder at:", FORWARDER_ADDRESS);
    }

    if (ROULETTE_ADDRESS) {
      roulette = await Roulette.attach(ROULETTE_ADDRESS);
      console.log("✓ Connected to existing Roulette at:", ROULETTE_ADDRESS);
    }

    // Setup unlimited gasless configuration
    console.log("\n📋 Configuring unlimited gasless transactions...");

    // 1. Approve Roulette contract for gasless transactions
    if (ROULETTE_ADDRESS) {
      console.log("Approving Roulette contract for gasless transactions...");
      const approveTx = await paymaster.setContractApproval(
        ROULETTE_ADDRESS,
        true
      );
      await approveTx.wait();
      console.log("✓ Roulette contract approved for gasless transactions");
    }

    // 2. Approve Forwarder as relayer (if addresses are provided)
    if (FORWARDER_ADDRESS && forwarder) {
      console.log("Approving deployer as relayer...");
      const relayerTx = await forwarder.setRelayerApproval(
        deployer.address,
        true
      );
      await relayerTx.wait();
      console.log("✓ Deployer approved as relayer");
    }

    // 3. Update auto-whitelist settings (already set to unlimited in contract)
    console.log("Updating auto-whitelist settings...");
    const autoWhitelistTx = await paymaster.updateAutoWhitelistSettings(
      true, // enabled
      hre.ethers.MaxUint256, // unlimited free gas
      hre.ethers.MaxUint256 // unlimited duration
    );
    await autoWhitelistTx.wait();
    console.log("✓ Auto-whitelist settings updated to unlimited");

    // 4. Update gas limits
    console.log("Updating gas limits...");
    const gasLimitsTx = await paymaster.updateGasLimits(
      500000, // max gas per transaction
      hre.ethers.MaxUint256 // unlimited daily gas limit
    );
    await gasLimitsTx.wait();
    console.log("✓ Gas limits updated to unlimited");

    // 5. Fund paymaster with native currency for gas payments
    console.log("Funding paymaster with native currency...");
    const fundAmount = hre.ethers.parseEther("1.0"); // Fund with 1 ETH/native token
    const fundTx = await paymaster.fundPaymaster({ value: fundAmount });
    await fundTx.wait();
    console.log(
      "✓ Paymaster funded with",
      hre.ethers.formatEther(fundAmount),
      "native tokens"
    );

    // 6. Verify configuration
    console.log("\n🔍 Verifying configuration...");

    if (ROULETTE_ADDRESS) {
      const isApproved = await paymaster.approvedContracts(ROULETTE_ADDRESS);
      console.log("Roulette contract approved:", isApproved);
    }

    const autoWhitelistEnabled = await paymaster.autoWhitelistEnabled();
    const freeGasAmount = await paymaster.newUserFreeGasAmount();
    const dailyLimit = await paymaster.dailyGasLimitPerUser();

    console.log("Auto-whitelist enabled:", autoWhitelistEnabled);
    console.log(
      "Free gas amount:",
      freeGasAmount.toString() === hre.ethers.MaxUint256.toString()
        ? "unlimited"
        : freeGasAmount.toString()
    );
    console.log(
      "Daily gas limit:",
      dailyLimit.toString() === hre.ethers.MaxUint256.toString()
        ? "unlimited"
        : dailyLimit.toString()
    );

    console.log("\n🎉 Unlimited gasless transactions setup completed!");
    console.log("\n📋 Summary:");
    console.log("- All users now have unlimited free gas");
    console.log("- No daily limits");
    console.log("- All approved contracts support gasless transactions");
    console.log("- New users are automatically whitelisted");

    console.log("\n⚠️  Next steps:");
    console.log("1. Make sure your relayer service is running");
    console.log("2. Add other game contracts using setContractApproval()");
    console.log(
      "3. Update your frontend to reflect unlimited gasless transactions"
    );
  } catch (error) {
    console.error("❌ Error during setup:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
