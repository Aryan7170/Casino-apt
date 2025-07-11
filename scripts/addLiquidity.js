const { ethers } = require("hardhat");

async function main() {
  const amount = ethers.parseEther("1000"); // Add 1000 tokens
  
  const tokenAddress = "0xB67aD31D42c13c4Bc3c96BeB89D288162f5a9D61";
  const rouletteAddress = "0xc3e58B9Dc37Fa64cBe18DAC234465E2B5CCF80a1";

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