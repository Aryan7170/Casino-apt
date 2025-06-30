import { useState } from 'react';
import { useAccount } from 'wagmi';
import { TreasuryManager } from './TreasuryManager';

export const TreasuryTest = () => {
    const { address } = useAccount();
    const { sendTokensToUser, handleGameResult, getTreasuryBalance, loading, error } = TreasuryManager();
    const [treasuryBalance, setTreasuryBalance] = useState('0');
    const [message, setMessage] = useState('');

    const testGetTokens = async () => {
        if (!address) {
            setMessage('Please connect your wallet first');
            return;
        }

        try {
            setMessage('Getting test tokens...');
            await sendTokensToUser(address, 100);
            setMessage('Test tokens received!');
            await updateTreasuryBalance();
        } catch (error) {
            setMessage(`Error: ${error.message}`);
        }
    };

    const testWinGame = async () => {
        if (!address) {
            setMessage('Please connect your wallet first');
            return;
        }

        try {
            setMessage('Testing win scenario...');
            await handleGameResult(address, 50, true, 100); // Bet 50, win 100
            setMessage('Win test completed!');
            await updateTreasuryBalance();
        } catch (error) {
            setMessage(`Error: ${error.message}`);
        }
    };

    const testLoseGame = async () => {
        if (!address) {
            setMessage('Please connect your wallet first');
            return;
        }

        try {
            setMessage('Testing lose scenario...');
            await handleGameResult(address, 50, false, 0); // Bet 50, lose
            setMessage('Lose test completed!');
            await updateTreasuryBalance();
        } catch (error) {
            setMessage(`Error: ${error.message}`);
        }
    };

    const updateTreasuryBalance = async () => {
        try {
            const balance = await getTreasuryBalance();
            setTreasuryBalance(balance);
        } catch (error) {
            console.error('Error updating treasury balance:', error);
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Treasury System Test</h2>
            
            <div className="mb-4">
                <p className="text-gray-600">Treasury Balance: {treasuryBalance} APTC</p>
            </div>

            <div className="space-y-4">
                <button
                    onClick={testGetTokens}
                    disabled={loading || !address}
                    className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
                >
                    Test Get Tokens
                </button>

                <button
                    onClick={testWinGame}
                    disabled={loading || !address}
                    className="w-full py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
                >
                    Test Win Scenario
                </button>

                <button
                    onClick={testLoseGame}
                    disabled={loading || !address}
                    className="w-full py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400"
                >
                    Test Lose Scenario
                </button>

                <button
                    onClick={updateTreasuryBalance}
                    className="w-full py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                    Refresh Treasury Balance
                </button>
            </div>

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