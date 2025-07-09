import { ethers } from 'ethers';
import { NETWORKS, CONTRACTS } from '../config/contracts';

const CHAIN_IDS = {
  MANTLE_SEPOLIA: '0x138b', // 5003
  PHAROS_DEVNET: '0xc352', // 50002
  BINANCE_TESTNET: '0x61', // 97
};

export const getProvider = () => {
  if (typeof window === 'undefined' || !window.ethereum) {
    // Default to Mantle Sepolia if not in browser
    return new ethers.JsonRpcProvider(NETWORKS.MANTLE_SEPOLIA.rpcUrl || 'https://rpc.sepolia.mantle.xyz');
  }
  return new ethers.BrowserProvider(window.ethereum);
};

const getCurrentChainKey = async () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    if (chainId === CHAIN_IDS.MANTLE_SEPOLIA) return 'MANTLE_SEPOLIA';
    if (chainId === CHAIN_IDS.PHAROS_DEVNET) return 'PHAROS_DEVNET';
    if (chainId === CHAIN_IDS.BINANCE_TESTNET) return 'BINANCE_TESTNET';
  }
  // Default fallback
  return 'MANTLE_SEPOLIA';
};

export const getTokenContract = async (withSigner = false) => {
  const provider = getProvider();
  const chainKey = await getCurrentChainKey();
  const contractConfig = CONTRACTS[chainKey]?.token || CONTRACTS.MANTLE_SEPOLIA.token;
  const contract = new ethers.Contract(
    contractConfig.address,
    contractConfig.abi,
    provider
  );
  if (withSigner) {
    const signer = await provider.getSigner();
    return contract.connect(signer);
  }
  return contract;
};

export const getRouletteContract = async (withSigner = false) => {
  const provider = getProvider();
  const chainKey = await getCurrentChainKey();
  const contractConfig = CONTRACTS[chainKey]?.roulette || CONTRACTS.MANTLE_SEPOLIA.roulette;
  const contract = new ethers.Contract(
    contractConfig.address,
    contractConfig.abi,
    provider
  );
  if (withSigner) {
    const signer = await provider.getSigner();
    return contract.connect(signer);
  }
  return contract;
};

export const getMinesContract = async (withSigner = false) => {
  const provider = getProvider();
  const chainKey = await getCurrentChainKey();
  const contractConfig = CONTRACTS[chainKey]?.mines || CONTRACTS.MANTLE_SEPOLIA.mines;
  const contract = new ethers.Contract(
    contractConfig.address,
    contractConfig.abi,
    provider
  );
  if (withSigner) {
    const signer = await provider.getSigner();
    return contract.connect(signer);
  }
  return contract;
};

export const switchToPharosSepolia = async () => {
  if (typeof window === 'undefined' || !window.ethereum) return;
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: NETWORKS.PHAROS_DEVNET.chainId }],
    });
  } catch (error) {
    if (error.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [NETWORKS.PHAROS_DEVNET],
      });
    }
  }
};

export const switchToBinanceTestnet = async () => {
  if (typeof window === 'undefined' || !window.ethereum) return;
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: NETWORKS.BINANCE_TESTNET.chainId }],
    });
  } catch (error) {
    if (error.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [NETWORKS.BINANCE_TESTNET],
      });
    }
  }
};

export const formatTokenAmount = (amount, decimals = 18) => {
  return ethers.formatUnits(amount, decimals);
};

export const parseTokenAmount = (amount, decimals = 18) => {
  return ethers.parseUnits(amount.toString(), decimals);
}; 