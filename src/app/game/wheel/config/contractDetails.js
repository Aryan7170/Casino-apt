import { CHAIN_IDS, CONTRACTS, RPC_URLS } from "@/config/contracts";
import { useChainId } from 'wagmi';
import { useEffect } from 'react';


// Remove top-level await for chainId
export function getChainId() {
  if (typeof window !== 'undefined' && window.ethereum) {
    return window.ethereum.request({ method: 'eth_chainId' });
  }
  return null;
}
// Get contract configuration for current chain
export const getContractConfig = (chainId) => {
	if (chainId === CHAIN_IDS.ETHEREUM_SEPOLIA) {
		return CONTRACTS.ETHEREUM_SEPOLIA;
	} else if (chainId === CHAIN_IDS.MANTLE_SEPOLIA) {
		return CONTRACTS.MANTLE_SEPOLIA;
	} else if (chainId === CHAIN_IDS.PHAROS_DEVNET) {
		return CONTRACTS.PHAROS_DEVNET;
	} else if (chainId === CHAIN_IDS.BINANCE_TESTNET) {
		return CONTRACTS.BINANCE_TESTNET;
	}
	return null;
};

export const getRpcURLConfig = (chainId) => {
	if (chainId === CHAIN_IDS.ETHEREUM_SEPOLIA) {
		return RPC_URLS.ETHEREUM_SEPOLIA;
	} else if (chainId === CHAIN_IDS.MANTLE_SEPOLIA) {
		return RPC_URLS.MANTLE_SEPOLIA;
	} else if (chainId === CHAIN_IDS.PHAROS_DEVNET) {
		return RPC_URLS.PHAROS_DEVNET;
	} else if (chainId === CHAIN_IDS.BINANCE_TESTNET) {
		return RPC_URLS.BINANCE_TESTNET;
	}
	return null;
};

// Hook to get contract details
export const useContractDetails = () => {
	const chainId = useChainId();
	useEffect(() => {
		console.log('Current chainId in useContractDetails:', chainId);
	}, [chainId]);

	// Try both number and string for config lookup
	let contractConfig = getContractConfig(chainId);
	if (!contractConfig) contractConfig = getContractConfig(String(chainId));
	let rpcURLConfig = getRpcURLConfig(chainId);
	if (!rpcURLConfig) rpcURLConfig = getRpcURLConfig(String(chainId));

	if (!contractConfig) {
		console.error('No contract config found for chainId:', chainId);
	}
	
	return {
		wheelContractAddress: contractConfig?.wheel?.address || null,
		tokenContractAddress: contractConfig?.token?.address || null,
		wheelABI: contractConfig?.wheel?.abi || null,
		tokenABI: contractConfig?.token?.abi || null,
		rpcURL: rpcURLConfig,
		contractConfig
	};
};