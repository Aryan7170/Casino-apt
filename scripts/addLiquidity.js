const { ethers } = require("hardhat");

async function main() {
  const amount = ethers.parseEther("1000"); // Add 1000 tokens
  
  const tokenAddress = "0x60672ccafd719eb569858003ed3b0ac0f6e63954";
  const rouletteAddress = "0xfa339164994ea5d08fd898af81ffa8a5c4982974";

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