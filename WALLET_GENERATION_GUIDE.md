# APT Casino Wallet Generation Guide

## How to Generate Required Wallets

You need to generate 4 separate wallets for different purposes. Here are several methods:

### Method 1: Using MetaMask

1. Install MetaMask browser extension
2. Create new accounts for each wallet type
3. Export private keys (Settings > Security & Privacy > Reveal Private Key)

### Method 2: Using Hardhat Console

```bash
# In your project directory
npx hardhat console

# Generate wallets
const { ethers } = require("hardhat");

// Generate 4 wallets
const deploymentWallet = ethers.Wallet.createRandom();
const serverSignerWallet = ethers.Wallet.createRandom();
const relayerWallet = ethers.Wallet.createRandom();
const operatorWallet = ethers.Wallet.createRandom();

console.log("=== DEPLOYMENT WALLET ===");
console.log("Address:", deploymentWallet.address);
console.log("Private Key:", deploymentWallet.privateKey);
console.log("");

console.log("=== SERVER SIGNER WALLET ===");
console.log("Address:", serverSignerWallet.address);
console.log("Private Key:", serverSignerWallet.privateKey);
console.log("");

console.log("=== RELAYER WALLET ===");
console.log("Address:", relayerWallet.address);
console.log("Private Key:", relayerWallet.privateKey);
console.log("");

console.log("=== OPERATOR WALLET ===");
console.log("Address:", operatorWallet.address);
console.log("Private Key:", operatorWallet.privateKey);
```

### Method 3: Using Node.js Script

```javascript
const { ethers } = require("ethers");

function generateWallet(name) {
  const wallet = ethers.Wallet.createRandom();
  console.log(`=== ${name.toUpperCase()} WALLET ===`);
  console.log(`Address: ${wallet.address}`);
  console.log(`Private Key: ${wallet.privateKey}`);
  console.log("");
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
  };
}

// Generate all required wallets
const wallets = {
  deployment: generateWallet("deployment"),
  serverSigner: generateWallet("server signer"),
  relayer: generateWallet("relayer"),
  operator: generateWallet("operator"),
};
```

### Method 4: Using Online Tools (Less Secure)

- Visit: https://vanity-eth.tk/ or https://www.allprivatekeys.com/ethereum-address-generator
- Generate addresses (but less secure for production)

## Security Recommendations

### 🔒 CRITICAL SECURITY NOTES:

1. **NEVER share private keys publicly**
2. **Store private keys in secure password managers**
3. **Use hardware wallets for mainnet deployments**
4. **Keep server signer key completely separate**
5. **Regularly rotate relayer funds**

### 📋 Wallet Funding Requirements:

- **Deployment Wallet**: Fund with 0.1-0.5 native tokens for contract deployment
- **Relayer Wallet**: Fund with 0.1 native tokens, refill regularly
- **Server Signer**: No funding needed (only signs transactions)
- **Operator Wallet**: Fund with 0.05 native tokens for game operations

### 🏗 After Generation:

1. Save all addresses and private keys securely
2. Fund the deployment and relayer wallets
3. Update your .env.production file
4. Deploy contracts using the deployment wallet
5. Configure contracts with the appropriate wallet addresses

## Environment Variable Template

After generating wallets, your .env.production should look like:

```bash
# Your generated wallet details
PRIVATE_KEY=0x1234...                           # Deployment wallet private key
SERVER_SIGNER_PRIVATE_KEY=0x5678...             # Server signer private key
RELAYER_PRIVATE_KEY=0x9abc...                   # Relayer private key

NEXT_PUBLIC_SERVER_SIGNER_ADDRESS=0xABC...      # Server signer address
NEXT_PUBLIC_RELAYER_ADDRESS=0xDEF...            # Relayer address
NEXT_PUBLIC_GAME_OPERATOR_ADDRESS=0x123...      # Operator address
```
