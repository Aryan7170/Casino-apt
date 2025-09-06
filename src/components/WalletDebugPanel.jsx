"use client";
import { useAccount, useBalance } from 'wagmi';
import { useToken } from '@/hooks/useToken';
import useWalletStatus from '@/hooks/useWalletStatus';

export default function WalletDebugPanel() {
  const { address, isConnected, isConnecting, isDisconnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const { balance: tokenBalance, error: tokenError } = useToken(address);
  const walletStatus = useWalletStatus();

  const isDev = process.env.NODE_ENV === 'development';
  
  if (!isDev) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2 text-yellow-400">🔧 Wallet Debug</h3>
      
      <div className="space-y-1">
        <div>Status: <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
          {isConnecting ? 'Connecting...' : isConnected ? 'Connected' : isDisconnected ? 'Disconnected' : 'Unknown'}
        </span></div>
        
        <div>Address: <span className="text-blue-400">
          {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'None'}
        </span></div>
        
        <div>Native: <span className="text-green-400">
          {balance ? `${balance.formatted} ${balance.symbol}` : 'Loading...'}
        </span></div>
        
        <div>Token: <span className="text-purple-400">
          {tokenBalance ? `${tokenBalance} APTC` : tokenError ? 'Error' : 'Loading...'}
        </span></div>
        
        <div>LocalStorage: <span className="text-orange-400">
          {typeof window !== 'undefined' && localStorage.getItem('walletConnected') === 'true' ? 'Connected' : 'Not Connected'}
        </span></div>
        
        <div>Provider: <span className="text-cyan-400">
          {typeof window !== 'undefined' && window.ethereum ? 'Available' : 'Not Available'}
        </span></div>
      </div>
      
      <button 
        onClick={() => {
          console.log('🔧 Wallet Debug Info:', {
            account: { address, isConnected, isConnecting, isDisconnected },
            balance,
            tokenBalance,
            tokenError,
            walletStatus,
            localStorage: typeof window !== 'undefined' ? {
              walletConnected: localStorage.getItem('walletConnected'),
              walletAddress: localStorage.getItem('walletAddress')
            } : 'N/A'
          });
        }}
        className="mt-2 px-2 py-1 bg-blue-600 rounded text-xs"
      >
        Log Debug Info
      </button>
    </div>
  );
}
