# 🚀 APT CASINO - SEPOLIA TESTNET DEPLOYMENT GUIDE

# =====================================================

## 📋 PRE-DEPLOYMENT CHECKLIST

### 1. Setup Environment

```bash
# Copy environment file for Sepolia testnet
cp .env.local.example .env.local

# Edit .env.local with your actual values
nano .env.local
```

### 2. Required Environment Variables for Sepolia:

```bash
# Sepolia testnet configuration
RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
PRIVATE_KEY=0xYourAdminWalletPrivateKey
RELAYER_PRIVATE_KEY=0xYourRelayerWalletPrivateKey

# Sepolia explorer API for verification
ETHEREUM_SEPOLIA_EXPLORER_API=your_etherscan_api_key
```

### 3. Fund Your Wallets

```bash
# Get Sepolia ETH from faucets:
# - https://sepolia-faucet.pk910.de/
# - https://faucet.sepolia.dev/
# - https://www.alchemy.com/faucets/ethereum-sepolia

# Fund both wallets:
# - Admin wallet: ~0.1 ETH (for deployment)
# - Relayer wallet: ~0.05 ETH (for gasless transactions)
```

## 🔧 DEPLOYMENT COMMANDS

### Navigate to web3-contracts directory:

```bash
cd web3-contracts/
```

### Step 1: Deploy Token Contract (APTC)

```bash
npx hardhat run scripts/deploy.js --network ethereumSepolia

# Alternative if using the token-specific script:
npx hardhat run ../scripts/deploy-token.js --network ethereumSepolia
```

### Step 2: Deploy CasinoWallet Contract

```bash
# Note: You'll need to update the script with your token address first
npx hardhat run ../scripts/deploy-offchain-casino.js --network ethereumSepolia
```

### Step 3: Deploy Gasless Infrastructure

```bash
# Update deploy-gasless.js with your token address first
npx hardhat run ../scripts/deploy-gasless.js --network ethereumSepolia
```

## 🔄 ALTERNATIVE: All-in-One Deployment

### Create a comprehensive deployment script:

```bash
# Create deployment script
cat > deploy-all-sepolia.js << 'EOF'
const { ethers } = require("hardhat");

async function main() {
  console.log("🎰 Deploying APT Casino to Sepolia Testnet...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");

  // 1. Deploy Token
  console.log("\n📄 Deploying APTC Token...");
  const Token = await ethers.getContractFactory("Token");
  const token = await Token.deploy();
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("✅ Token deployed to:", tokenAddress);

  // 2. Deploy CasinoWallet
  console.log("\n🏦 Deploying CasinoWallet...");
  const CasinoWallet = await ethers.getContractFactory("CasinoWallet");
  const casinoWallet = await CasinoWallet.deploy(
    tokenAddress,
    deployer.address  // serverSigner (admin wallet)
  );
  await casinoWallet.waitForDeployment();
  const casinoWalletAddress = await casinoWallet.getAddress();
  console.log("✅ CasinoWallet deployed to:", casinoWalletAddress);

  // 3. Deploy GameForwarder
  console.log("\n⚡ Deploying GameForwarder...");
  const GameForwarder = await ethers.getContractFactory("GameForwarder");
  const forwarder = await GameForwarder.deploy();
  await forwarder.waitForDeployment();
  const forwarderAddress = await forwarder.getAddress();
  console.log("✅ GameForwarder deployed to:", forwarderAddress);

  // 4. Deploy GamePaymaster
  console.log("\n💰 Deploying GamePaymaster...");
  const GamePaymaster = await ethers.getContractFactory("GamePaymaster");
  const paymaster = await GamePaymaster.deploy(tokenAddress);
  await paymaster.waitForDeployment();
  const paymasterAddress = await paymaster.getAddress();
  console.log("✅ GamePaymaster deployed to:", paymasterAddress);

  // 5. Configure contracts
  console.log("\n🔧 Configuring contracts...");

  // Set CasinoWallet in Token contract
  await token.setRouletteContract(casinoWalletAddress);
  console.log("✅ CasinoWallet set in Token contract");

  // Approve CasinoWallet for gasless transactions
  await paymaster.setContractApproval(casinoWalletAddress, true);
  console.log("✅ CasinoWallet approved for gasless transactions");

  // 6. Summary
  console.log("\n🎉 DEPLOYMENT COMPLETE!");
  console.log("=====================================");
  console.log("📄 Token Address:", tokenAddress);
  console.log("🏦 CasinoWallet Address:", casinoWalletAddress);
  console.log("⚡ Forwarder Address:", forwarderAddress);
  console.log("💰 Paymaster Address:", paymasterAddress);
  console.log("=====================================");

  console.log("\n📝 Update your .env.local with these addresses:");
  console.log("NEXT_PUBLIC_TOKEN_ADDRESS=" + tokenAddress);
  console.log("NEXT_PUBLIC_CASINO_WALLET_ADDRESS=" + casinoWalletAddress);
  console.log("NEXT_PUBLIC_FORWARDER_ADDRESS=" + forwarderAddress);
  console.log("NEXT_PUBLIC_PAYMASTER_ADDRESS=" + paymasterAddress);
  console.log("NEXT_PUBLIC_SERVER_SIGNER_ADDRESS=" + deployer.address);
  console.log("NEXT_PUBLIC_RELAYER_ADDRESS=YOUR_RELAYER_WALLET_ADDRESS");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
EOF

# Run the all-in-one deployment
npx hardhat run deploy-all-sepolia.js --network ethereumSepolia
```

## ✅ VERIFICATION COMMANDS

### Verify contracts on Etherscan:

```bash
# Verify Token
npx hardhat verify --network ethereumSepolia TOKEN_ADDRESS

# Verify CasinoWallet
npx hardhat verify --network ethereumSepolia CASINO_WALLET_ADDRESS "TOKEN_ADDRESS" "ADMIN_WALLET_ADDRESS"

# Verify Forwarder
npx hardhat verify --network ethereumSepolia FORWARDER_ADDRESS

# Verify Paymaster
npx hardhat verify --network ethereumSepolia PAYMASTER_ADDRESS "TOKEN_ADDRESS"
```

## 🔧 POST-DEPLOYMENT CONFIGURATION

### Update Environment Variables:

```bash
# Add these to your .env.local file:
NEXT_PUBLIC_TOKEN_ADDRESS=0xYourTokenAddress
NEXT_PUBLIC_CASINO_WALLET_ADDRESS=0xYourCasinoWalletAddress
NEXT_PUBLIC_FORWARDER_ADDRESS=0xYourForwarderAddress
NEXT_PUBLIC_PAYMASTER_ADDRESS=0xYourPaymasterAddress
NEXT_PUBLIC_SERVER_SIGNER_ADDRESS=0xYourAdminWalletAddress
NEXT_PUBLIC_RELAYER_ADDRESS=0xYourRelayerWalletAddress
```

### Test Deployment:

```bash
# Go back to main directory
cd ..

# Start local development
npm run dev

# In another terminal, start game server
node offchain-game-server.js

# In another terminal, start relayer service
node gasless-relayer-service.js
```

## 🐛 TROUBLESHOOTING

### Common Issues:

1. **Insufficient funds:**

   ```bash
   # Check wallet balance
   npx hardhat run --network ethereumSepolia scripts/check-balance.js
   ```

2. **RPC issues:**

   ```bash
   # Try alternative Sepolia RPC
   RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
   # or
   RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
   ```

3. **Gas estimation failed:**

   ```bash
   # Add gas settings to hardhat.config.js
   ethereumSepolia: {
     url: ETHEREUM_SEPOLIA_RPC,
     accounts: [PRIVATE_KEY],
     chainId: 11155111,
     gas: 6000000,
     gasPrice: 20000000000
   }
   ```

4. **Verification failed:**
   ```bash
   # Wait longer before verification
   await contract.deploymentTransaction().wait(6);
   ```

## 📊 MONITORING

### Check contract status:

```bash
# Create monitoring script
cat > monitor-contracts.js << 'EOF'
const { ethers } = require("hardhat");

async function main() {
  const tokenAddress = "YOUR_TOKEN_ADDRESS";
  const casinoWalletAddress = "YOUR_CASINO_WALLET_ADDRESS";

  const token = await ethers.getContractAt("Token", tokenAddress);
  const casinoWallet = await ethers.getContractAt("CasinoWallet", casinoWalletAddress);

  console.log("Token name:", await token.name());
  console.log("Token symbol:", await token.symbol());
  console.log("Token total supply:", ethers.formatEther(await token.totalSupply()));

  console.log("Casino server signer:", await casinoWallet.serverSigner());
  console.log("Casino min deposit:", ethers.formatEther(await casinoWallet.minDeposit()));
}

main();
EOF

npx hardhat run monitor-contracts.js --network ethereumSepolia
```

## 🎯 FINAL CHECKLIST

- [ ] Admin wallet funded with Sepolia ETH
- [ ] Relayer wallet funded with Sepolia ETH
- [ ] All contracts deployed successfully
- [ ] Contracts verified on Etherscan
- [ ] Environment variables updated
- [ ] Frontend connects to contracts
- [ ] Game server starts without errors
- [ ] Relayer service handles gasless transactions
- [ ] Test deposit/withdrawal functionality

Your APT Casino is now deployed on Sepolia testnet! 🎉
