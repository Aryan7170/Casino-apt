const hre = require("hardhat");

async function main() {
  console.log("Deploying contracts...");

  // Deploy Token contract first
  const Token = await hre.ethers.getContractFactory("Token");
  const token = await Token.deploy();
  await token.waitForDeployment();
  const tokenContractAddress = await token.getAddress();
  // const treasuryAddress = await token.treasury();
  console.log("Token contract deployed to:", tokenContractAddress);

  // Deploy Roulette contract with Token address
  const Roulette = await hre.ethers.getContractFactory("Roulette");
  const roulette = await Roulette.deploy(tokenContractAddress);
  await roulette.waitForDeployment();
  const rouletteContractAddress = await roulette.getAddress();
  console.log("Roulette contract deployed to:", rouletteContractAddress);

  // Set Roulette contract address in Token contract
  const setRouletteTx = await token.setRouletteContract(rouletteContractAddress);
  await setRouletteTx.wait();
  console.log("Roulette contract address set in Token contract");

  console.log("Deployment completed!");
  console.log("Token Address:", tokenContractAddress);
  console.log("Roulette Address:", rouletteContractAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 