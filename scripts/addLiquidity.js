import { useContractDetails } from '../src/app/game/roulette/contractDetails';

const { ethers } = require("hardhat");

const {
  rouletteContractAddress,
  tokenContractAddress,
} = useContractDetails();

async function main() {
  const amount = ethers.parseEther("1000"); // Add 1000 tokens
  
  const tokenAddress = tokenContractAddress;
  const rouletteAddress = rouletteContractAddress;

  const Token = await ethers.getContractFactory("Token");
  const token = Token.attach(tokenAddress);

  console.log("Transferring tokens to roulette contract...");
  const tx = await token.transfer(rouletteAddress, amount);
  await tx.wait();
  
  const balance = await token.balanceOf(rouletteAddress);
  console.log("New roulette contract balance:", ethers.formatEther(balance), "tokens");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });