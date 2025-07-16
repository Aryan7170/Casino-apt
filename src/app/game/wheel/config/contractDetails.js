import { CHAIN_ID, CONTRACTS, RPC_URLS } from "@/config/contracts";


const chainId = await window.ethereum.request({ method: 'eth_chainId' });
console.log('Detected Chain ID:', chainId);
// Get contract configuration for current chain
export const getContractConfig = (chainId) => {
	if (chainId === CHAIN_ID.ETHEREUM_SEPOLIA) {
		return CONTRACTS.ETHEREUM_SEPOLIA;
	} else if (chainId === CHAIN_ID.MANTLE_SEPOLIA) {
		return CONTRACTS.MANTLE_SEPOLIA;
	} else if (chainId === CHAIN_ID.PHAROS_DEVNET) {
		return CONTRACTS.PHAROS_DEVNET;
	} else if (chainId === CHAIN_ID.BINANCE_TESTNET) {
		return CONTRACTS.BINANCE_TESTNET;
	}
	return null;
};

export const getRpcURLConfig = (chainId) => {
	if (chainId === CHAIN_ID.ETHEREUM_SEPOLIA) {
		return RPC_URLS.ETHEREUM_SEPOLIA;
	} else if (chainId === CHAIN_ID.MANTLE_SEPOLIA) {
		return RPC_URLS.MANTLE_SEPOLIA;
	} else if (chainId === CHAIN_ID.PHAROS_DEVNET) {
		return RPC_URLS.PHAROS_DEVNET;
	} else if (chainId === CHAIN_ID.BINANCE_TESTNET) {
		return RPC_URLS.BINANCE_TESTNET;
	}
	return null;
};

// Hook to get contract details
export const useContractDetails = () => {
	const contractConfig = getContractConfig(chainId);
	const rpcURLConfig = getRpcURLConfig(chainId);
	
	return {
		wheelContractAddress: contractConfig?.wheel?.address || null,
		tokenContractAddress: contractConfig?.token?.address || null,
		wheelABI: contractConfig?.wheel?.abi || null,
		tokenABI: contractConfig?.token?.abi || null,
		rpcURL: rpcURLConfig,
		contractConfig
	};
};

