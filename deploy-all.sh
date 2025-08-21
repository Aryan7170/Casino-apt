#!/bin/bash

# APT Casino Complete Deployment Script for Sepolia Testnet
# This script will deploy all contracts in the correct order

set -e  # Exit on any error

echo "🎰 APT Casino - Complete Deployment Script"
echo "=========================================="
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create .env file with your private keys"
    echo "Copy .env.example to .env and fill in your values"
    exit 1
fi

# Load environment variables
source .env

# Check required environment variables
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Error: PRIVATE_KEY not set in .env file"
    exit 1
fi

echo "✅ Environment variables loaded"
echo "📡 Network: Ethereum Sepolia"
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🚀 Starting deployment process..."
echo ""

# Step 1: Deploy Token Contract
echo "1️⃣ Deploying Token Contract..."
npx hardhat run scripts/deploy-token.js --network ethereumSepolia
echo ""

# Step 2: Deploy Gasless Infrastructure
echo "2️⃣ Deploying Gasless Infrastructure..."
npx hardhat run scripts/deploy-gasless.js --network ethereumSepolia
echo ""

# Step 3: Deploy Casino Wallet
echo "3️⃣ Deploying Casino Wallet..."
npx hardhat run scripts/deploy-offchain-casino.js --network ethereumSepolia
echo ""

# Step 4: Deploy Game Contracts
echo "4️⃣ Deploying Game Contracts..."
cd web3-contracts
npx hardhat run scripts/deploy.js --network ethereumSepolia
cd ..
echo ""

# Step 5: Setup Gasless Configuration
echo "5️⃣ Setting up Gasless Configuration..."
npx hardhat run scripts/setup-unlimited-gasless.js --network ethereumSepolia
echo ""

echo "🎉 Deployment Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Copy the contract addresses from the output above"
echo "2. Update your .env.production file with the addresses"
echo "3. Fund your relayer wallet with some ETH"
echo "4. Deploy your frontend to Vercel"
echo ""
echo "💡 Don't forget to save all contract addresses for your frontend configuration!"
