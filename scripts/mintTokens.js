const { ethers } = require("ethers");

async function mintTokens() {
    const provider = new ethers.providers.JsonRpcProvider("https://rpc.sepolia.mantle.xyz");
    const privateKey = "cf4235da669935a29fa95d5afc417b5023675dc6ccb99dc13b1f8fdb398933d7";
    const wallet = new ethers.Wallet(privateKey, provider);
    const tokenContractAddress = "0xe5735e5E41465b5AA6f7f2176982024a244A4692";
    const contractABI = [
        "function mint(address to, uint256 amount) public",
        "function balanceOf(address account) public view returns (uint256)",
    ];

    const contract = new ethers.Contract(tokenContractAddress, contractABI, wallet);
    const recipient = "0xFF9582E3898599D2cF0Abdc06321789dc345e529";
    const amount = 1000;

    try {
        const tx = await contract.mint(recipient, ethers.utils.parseEther(amount.toString(), 18));
        await tx.wait();

        console.log("Minted tokens to wallet address:", wallet.address);
        console.log("Minted tokens to recipient:", recipient);
    } catch(error) {
        console.log("Error:", error);
    }
}

mintTokens(); 