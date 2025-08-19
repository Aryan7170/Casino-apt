import { useContractDetails } from "../src/app/game/roulette/contractDetails";
import { treasuryAddress } from "../src/config/contracts";

const { ethers } = require("ethers");

async function mintTokens() {
  const { tokenContractAddress, tokenABI, rpcURL } = useContractDetails();

  const provider = new ethers.JsonRpcProvider(rpcURL);
  const privateKey =
    "cf4235da669935a29fa95d5afc417b5023675dc6ccb99dc13b1f8fdb398933d7";
  const wallet = new ethers.Wallet(privateKey, provider);

  const tokenAddress = tokenContractAddress;

  const contractABI = tokenABI;

  const contract = new ethers.Contract(tokenAddress, contractABI, wallet);
  const recipient = treasuryAddress;
  const amount = 1000;

  try {
    const tx = await contract.mint(
      recipient,
      ethers.parseEther(amount.toString(), 18)
    );
    await tx.wait();

    console.log("Minted tokens to wallet address:", wallet.address);
    console.log("Minted tokens to recipient:", recipient);
  } catch (error) {
    console.log("Error:", error);
  }
}

mintTokens();
