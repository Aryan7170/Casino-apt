# Gasless Transaction Deployment Guide for APT Casino

## Overview

This guide explains how to deploy the gasless transaction infrastructure for APT Casino on Vercel.

## Prerequisites

- Vercel account with CLI installed
- GitHub repository with the APT Casino code
- Deployed smart contracts (already completed)

## Environment Variables Required

Add these to your Vercel project settings:

### Frontend Configuration (NEXT*PUBLIC*\*)

```bash
# Contract Addresses (Already configured)
NEXT_PUBLIC_FORWARDER_ADDRESS=0xA82a29E712df792b3D519bd5f0279D7883729C9c
NEXT_PUBLIC_PAYMASTER_ADDRESS=0x275E9d993646Dc3009a8bf1fD66e21adE9B0FbA9
NEXT_PUBLIC_CASINO_WALLET_ADDRESS=0x7BbbB1BA97d12f6F2F7EDa58Dc04a560502171ED
NEXT_PUBLIC_TOKEN_ADDRESS=0x7B77673eE3Add4c0A60b3Cf86368908305071A34
NEXT_PUBLIC_MINES_CONTRACT_ADDRESS=0x66300174A6D44f7f28334E5Be6Ab74E07a9b7D8c
NEXT_PUBLIC_ROULETTE_CONTRACT_ADDRESS=0xD4DB30704dEDABFb1D31f4363244135E34Ebc445
NEXT_PUBLIC_WHEEL_CONTRACT_ADDRESS=0x594b03d2f01b7Ad08788cCB208D8c5aCfe7cE5eF

# Wallet Configuration (Already configured)
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=acd2a9118b0931623f1fe73b621f5c85
NEXT_PUBLIC_SERVER_SIGNER_ADDRESS=0x0B5ccb67b8536F352150745191fC53dd17994F78

# NEW: Gasless Configuration
NEXT_PUBLIC_RELAYER_URL=https://your-vercel-app.vercel.app/api/relay
NEXT_PUBLIC_GAME_SERVER_URL=https://your-vercel-app.vercel.app/api/game-server
```

### Backend Configuration (Server-only)

```bash
# Server Private Keys (Already configured)
SERVER_PRIVATE_KEY=e6b4a12e5b4e8b8c91bc8f5a2f3d7e9a8b5c4d3e2f1a9b8c7d6e5f4a3b2c1d0e
INFURA_API_KEY=0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d

# NEW: Gasless Specific
GASLESS_ENABLED=true
RELAYER_PRIVATE_KEY=e6b4a12e5b4e8b8c91bc8f5a2f3d7e9a8b5c4d3e2f1a9b8c7d6e5f4a3b2c1d0e
```

## Deployment Steps

### 1. Deploy to Vercel

```bash
# If not already deployed
vercel --prod

# Or if already deployed, redeploy
vercel --prod --force
```

### 2. Update Environment Variables

1. Go to your Vercel dashboard
2. Select your APT Casino project
3. Go to Settings > Environment Variables
4. Add the new gasless variables listed above

### 3. Fund the Paymaster Contract

The paymaster needs ETH to sponsor transactions:

```bash
# Send ETH to the paymaster address
# Address: 0x275E9d993646Dc3009a8bf1fD66e21adE9B0FbA9
# Recommended: 0.1 ETH on Sepolia testnet
```

### 4. Test Gasless Functionality

1. Visit your deployed website
2. Connect a wallet with 0 ETH balance
3. Try placing a bet - it should work without requiring ETH for gas

## API Endpoints Created

Your Vercel deployment will have these new endpoints:

1. **`/api/relay`** - Handles gasless transaction relay
2. **`/api/game-server`** - Off-chain game logic
3. **`/api/gasless-status`** - Check gasless availability

## Security Considerations

1. **Private Key Security**: Store relayer private keys securely in Vercel environment variables
2. **Rate Limiting**: Implement rate limiting on API endpoints to prevent abuse
3. **User Validation**: Add proper user validation and limits
4. **Paymaster Funding**: Monitor paymaster balance and set up auto-funding

## Monitoring

Monitor these metrics:

- Paymaster ETH balance
- API endpoint response times
- Failed transaction rates
- User adoption of gasless features

## Troubleshooting

### Common Issues:

1. **Gasless not working**: Check if `GASLESS_ENABLED=true` is set
2. **Transactions failing**: Verify paymaster has sufficient ETH
3. **API errors**: Check Vercel function logs
4. **Wrong network**: Ensure all contracts are on the same network

### Debug Commands:

```bash
# Check API endpoints
curl https://your-app.vercel.app/api/gasless-status

# View Vercel logs
vercel logs your-app-url
```

## Cost Estimation

### Testnet (Sepolia):

- Paymaster funding: ~0.1 ETH for testing
- Vercel hosting: Free tier sufficient

### Mainnet:

- Paymaster funding: Budget 1-5 ETH depending on usage
- Vercel hosting: May need Pro plan for high traffic

## Next Steps

1. Deploy the infrastructure following this guide
2. Test thoroughly on testnet
3. Monitor performance and costs
4. Consider implementing additional features like:
   - Dynamic gas pricing
   - User spend limits
   - Analytics dashboard
   - Automatic paymaster refunding
