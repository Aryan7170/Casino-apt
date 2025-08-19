const hre = require("hardhat");

async function main() {
  console.log("Deploying Gasless Infrastructure...");

  // Deploy Forwarder
  console.log("Deploying GameForwarder...");
  const GameForwarder = await hre.ethers.getContractFactory("GameForwarder");
  const forwarder = await GameForwarder.deploy();
  await forwarder.waitForDeployment();
  const forwarderAddress = await forwarder.getAddress();
  console.log("GameForwarder deployed to:", forwarderAddress);

  // Deploy Paymaster
  console.log("Deploying GamePaymaster...");
  const GamePaymaster = await hre.ethers.getContractFactory("GamePaymaster");
  // You'll need to replace this with your actual token address
  const tokenAddress = "0x_YOUR_TOKEN_ADDRESS_HERE";
  const paymaster = await GamePaymaster.deploy(tokenAddress);
  await paymaster.waitForDeployment();
  const paymasterAddress = await paymaster.getAddress();
  console.log("GamePaymaster deployed to:", paymasterAddress);

  // Deploy updated Mines contract with gasless support
  console.log("Deploying SecureMines with gasless support...");
  const SecureMines = await hre.ethers.getContractFactory("SecureMines");
  const treasuryAddress = "0xFF9582E3898599D2cF0Abdc06321789dc345e529";
  const [deployer] = await hre.ethers.getSigners();
  
  const minesContract = await SecureMines.deploy(
    tokenAddress,
    treasuryAddress,
    deployer.address,
    forwarderAddress
  );
  await minesContract.waitForDeployment();
  const minesAddress = await minesContract.getAddress();
  console.log("SecureMines deployed to:", minesAddress);

  // Setup configurations
  console.log("Setting up configurations...");
  
  // Approve the mines contract for gasless transactions
  await paymaster.setContractApproval(minesAddress, true);
  console.log("Mines contract approved for gasless transactions");

  // Set up relayer (in production, this would be your backend relayer address)
  const relayerAddress = deployer.address; // Replace with actual relayer
  await forwarder.setRelayerApproval(relayerAddress, true);
  console.log("Relayer approved for forwarder");

  // Fund paymaster with some ETH for gas payments
  const fundAmount = hre.ethers.parseEther("1.0"); // 1 ETH
  await paymaster.fundPaymaster({ value: fundAmount });
  console.log("Paymaster funded with 1 ETH");

  console.log("\n=== Deployment Summary ===");
  console.log("GameForwarder:", forwarderAddress);
  console.log("GamePaymaster:", paymasterAddress);
  console.log("SecureMines:", minesAddress);
  console.log("Token Address:", tokenAddress);
  console.log("Treasury Address:", treasuryAddress);
  console.log("Relayer Address:", relayerAddress);

  // Verify contracts
  console.log("\nWaiting for block confirmations...");
  await forwarder.deploymentTransaction().wait(6);
  await paymaster.deploymentTransaction().wait(6);
  await minesContract.deploymentTransaction().wait(6);

  console.log("Verifying contracts...");
  try {
    await hre.run("verify:verify", {
      address: forwarderAddress,
      constructorArguments: [],
    });
    console.log("GameForwarder verified");
  } catch (e) {
    console.log("GameForwarder verification failed:", e.message);
  }

  try {
    await hre.run("verify:verify", {
      address: paymasterAddress,
      constructorArguments: [tokenAddress],
    });
    console.log("GamePaymaster verified");
  } catch (e) {
    console.log("GamePaymaster verification failed:", e.message);
  }

  try {
    await hre.run("verify:verify", {
      address: minesAddress,
      constructorArguments: [tokenAddress, treasuryAddress, deployer.address, forwarderAddress],
    });
    console.log("SecureMines verified");
  } catch (e) {
    console.log("SecureMines verification failed:", e.message);
  }

  // Save addresses to a file for frontend use
  const addresses = {
    forwarder: forwarderAddress,
    paymaster: paymasterAddress,
    minesContract: minesAddress,
    token: tokenAddress,
    treasury: treasuryAddress,
    relayer: relayerAddress,
    network: hre.network.name,
    chainId: hre.network.config.chainId
  };

  const fs = require('fs');
  fs.writeFileSync(
    'gasless-addresses.json',
    JSON.stringify(addresses, null, 2)
  );
  console.log("\nAddresses saved to gasless-addresses.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
