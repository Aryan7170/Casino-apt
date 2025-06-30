import { ethers } from "ethers";

export const mint = async (recipient, amount) => {
    try {
        const provider = new ethers.providers.JsonRpcProvider("https://rpc.sepolia.mantle.xyz");
        const privateKey = process.env.NEXT_PUBLIC_PRIVATE_KEY; // Make sure to set this in your .env file
        const wallet = new ethers.Wallet(privateKey, provider);
        const contractAddress = "0x60672ccafd719eb569858003ed3b0ac0f6e63954"; // Your deployed token address
        const contractABI = [
            "function mint(address to, uint256 amount) public",
            "function balanceOf(address account) public view returns (uint256)",
        ];
        const contract = new ethers.Contract(contractAddress, contractABI, wallet);
        
        const tx = await contract.mint(recipient, ethers.utils.parseEther(amount.toString()));
        const receipt = await tx.wait();

        console.log("Minted tokens to wallet address:", recipient);
        console.log("Transaction hash:", receipt.transactionHash);

        return receipt;
    } catch (error) {
        console.error("Minting error:", error);
        throw error;
    }
};

const recipient = "0xFfbfce3f171911044b6D91d700548AEd9A662420";
const amount = 1000;
mint(recipient, amount);



