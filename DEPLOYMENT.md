# APT Casino - Vercel Deployment Guide

## 🚀 Production Deployment on Vercel

This guide will help you deploy APT Casino to Vercel for production use.

### Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Git Repository**: Push your code to GitHub, GitLab, or Bitbucket
3. **Environment Variables**: Have all required API keys and contract addresses ready

### Step 1: Prepare Your Project

1. Clone/download this repository
2. Run the deployment preparation script:
   ```bash
   ./deploy.sh
   ```

### Step 2: Environment Variables Setup

In your Vercel dashboard, configure these environment variables:

#### 🔑 Required Environment Variables

##### Frontend Configuration (Client-side)

```
NEXT_PUBLIC_GAME_SERVER_URL=https://your-game-server.vercel.app
NEXT_PUBLIC_RELAYER_URL=https://your-relayer-service.vercel.app
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id
NEXT_PUBLIC_CASINO_WALLET_ADDRESS=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_FORWARDER_ADDRESS=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_PAYMASTER_ADDRESS=0x0000000000000000000000000000000000000000
```

##### Blockchain Configuration

```
NEXT_PUBLIC_MANTLE_RPC_URL=https://rpc.mantle.xyz
NEXT_PUBLIC_ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID
NEXT_PUBLIC_POLYGON_RPC_URL=https://polygon-rpc.com
NEXT_PUBLIC_BSC_RPC_URL=https://bsc-dataseed.binance.org
```

##### Server-side Configuration

```
PRIVATE_KEY=your_private_key_here
RELAYER_PRIVATE_KEY=your_relayer_private_key_here
NODE_ENV=production
```

##### API Keys (Optional but recommended)

```
INFURA_PROJECT_ID=your_infura_project_id
ALCHEMY_API_KEY=your_alchemy_api_key
GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX
```

### Step 3: Deploy to Vercel

#### Option A: Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

#### Option B: Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Configure environment variables
4. Deploy

### Step 4: Domain Configuration

1. In Vercel dashboard, go to your project settings
2. Navigate to "Domains"
3. Add your custom domain or use the provided vercel.app domain

### Step 5: Performance Optimization

#### Image Optimization

- Images are automatically optimized by Vercel
- WebP and AVIF formats are enabled

#### Caching

- Static assets are cached automatically
- API routes have appropriate cache headers

### 🔧 Configuration Files

The project includes several production-ready configuration files:

- `vercel.json` - Vercel deployment configuration
- `next.config.js` - Next.js production optimizations
- `.env.production` - Production environment template

### 🌐 Supported Networks

The casino supports multiple blockchain networks:

- **Mainnet**: Ethereum, Polygon, Binance Smart Chain
- **Testnet**: Mantle Sepolia, Ethereum Sepolia, BSC Testnet
- **Custom**: Pharos Devnet

### 🔐 Security Features

- Content Security Policy headers
- XSS protection
- Frame options protection
- HTTPS enforcement
- Environment variable validation

### 📊 Monitoring & Analytics

#### Error Tracking

- Built-in error boundaries
- Console logging for production issues

#### Performance Monitoring

- Web Vitals tracking
- Custom analytics integration ready

### 🛠️ Troubleshooting

#### Build Failures

1. Check environment variables are set correctly
2. Ensure all dependencies are installed
3. Verify TypeScript compilation

#### Runtime Errors

1. Check browser console for client-side errors
2. Monitor Vercel function logs for server-side issues
3. Verify Web3 provider connections

#### Performance Issues

1. Use Vercel Analytics to identify bottlenecks
2. Check image optimization settings
3. Monitor bundle size in build output

### 📝 Environment Variables Reference

| Variable                                | Type   | Required | Description                 |
| --------------------------------------- | ------ | -------- | --------------------------- |
| `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` | Public | Yes      | WalletConnect project ID    |
| `NEXT_PUBLIC_GAME_SERVER_URL`           | Public | Yes      | Game server endpoint        |
| `NEXT_PUBLIC_RELAYER_URL`               | Public | Yes      | Gasless transaction relayer |
| `NEXT_PUBLIC_CASINO_WALLET_ADDRESS`     | Public | Yes      | Casino treasury wallet      |
| `PRIVATE_KEY`                           | Secret | Yes      | Backend private key         |
| `INFURA_PROJECT_ID`                     | Secret | No       | Infura API access           |

### 🚨 Security Considerations

1. **Never expose private keys** in client-side environment variables
2. **Use HTTPS** for all production deployments
3. **Validate all inputs** from users
4. **Regular security audits** of smart contracts
5. **Monitor for suspicious activities**

### 📞 Support

For deployment issues:

1. Check Vercel documentation
2. Review project logs in Vercel dashboard
3. Contact the development team

---

**Ready to deploy?** Run `./deploy.sh` and follow the steps above! 🎰
