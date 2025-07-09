const { ethers } = require("hardhat");

async function main() {
  const amount = ethers.parseEther("1000"); // Add 1000 tokens
  
  const tokenAddress = "0x1DE498144F2A7A4c7D85d09C0B12999FD1a435c2";
  const rouletteAddress = "0x18B5E45eFEd35c55a67316b45968242C82d2523E";

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