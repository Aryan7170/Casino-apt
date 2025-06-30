import { useState } from 'react';
import { useAccount } from 'wagmi';
import { TreasuryManager } from './TreasuryManager';
import { useToken } from '@/hooks/useToken';

export const TreasuryUI = () => {
    const { address } = useAccount();
    const { sendTokensToUser, loading, error } = TreasuryManager();
    const { balance, refresh } = useToken(address);
    const [amount, setAmount] = useState('100');
    const [message, setMessage] = useState('');

    const handleGetTokens = async () => {
        if (!address) {
            setMessage('Please connect your wallet first');
            return;
        }

        try {
            setMessage('Getting tokens from treasury...');
            await sendTokensToUser(address, amount);
            setMessage('Tokens received successfully!');
            refresh(); // Refresh the balance
        } catch (error) {
            setMessage(`Error: ${error.message}`);
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">APT Casino Treasury</h2>
            
            <div className="mb-4">
                <p className="text-gray-600">Your APTC Balance: {balance}</p>
            </div>

            <div className="mb-4">
                <label className="block text-gray-700 mb-2">Amount of APTC to get:</label>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full p-2 border rounded"
                    min="1"
                />
            </div>

            <button
                onClick={handleGetTokens}
                disabled={loading || !address}
                className={`w-full py-2 px-4 rounded ${
                    loading || !address
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-500 hover:bg-blue-600'
                } text-white`}
            >
                {loading ? 'Processing...' : 'Get APTC Tokens'}
            </button>

            {message && (
                <div className={`mt-4 p-2 rounded ${
                    message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                }`}>
                    {message}
                </div>
            )}
        </div>
    );
}; 