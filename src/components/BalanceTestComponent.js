"use client";
import { useAccount, useBalance, useChainId } from "wagmi";
import { useToken } from "@/hooks/useToken";
import { TOKEN_CONTRACTS } from "@/config/contracts";

export default function BalanceTestComponent() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  // Get native balance
  const { data: nativeBalance, isLoading: nativeLoading } = useBalance({
    address: address,
  });

  // Get token address for current chain
  const tokenAddress = TOKEN_CONTRACTS[chainId]?.address;

  // Get token balance using our hook
  const {
    balance: tokenBalance,
    isLoading: tokenLoading,
    error: tokenError,
  } = useToken(address);

  if (!isConnected) {
    return (
      <div className="p-4 bg-red-900 rounded-lg text-white">
        Wallet not connected
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-900 rounded-lg text-white space-y-2">
      <h3 className="text-lg font-bold">Balance Test Debug</h3>
      <div>Chain ID: {chainId}</div>
      <div>Address: {address}</div>
      <div>
        Token Contract: {tokenAddress || "Not configured for this chain"}
      </div>

      <div>
        Native Balance:{" "}
        {nativeLoading
          ? "Loading..."
          : nativeBalance
          ? `${nativeBalance.formatted} ${nativeBalance.symbol}`
          : "Error loading"}
      </div>

      <div>
        Token Balance:{" "}
        {tokenLoading
          ? "Loading..."
          : tokenError
          ? `Error: ${tokenError}`
          : `${tokenBalance} APTC`}
      </div>
    </div>
  );
}
