import { useWriteContract, useReadContract, useAccount, useWaitForTransactionReceipt } from 'wagmi';
import { useState } from "react";
import { parseEther, formatEther } from 'viem';
import { treasuryAddress } from '@/config/contracts';
import { useContractDetails } from '@/app/game/roulette/contractDetails';

const TREASURY_ADDRESS = treasuryAddress;

export const TreasuryManager = () => {
    const {
        tokenABI,
        tokenContractAddress,
    } = useContractDetails();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { address } = useAccount();


    const TOKEN_CONTRACT_ADDRESS = tokenContractAddress;
    const TOKEN_ABI = tokenABI;

    const { writeContractAsync } = useWriteContract();
    const { waitForTransactionReceipt } = useWaitForTransactionReceipt();
    
    const { data: treasuryBalance } = useReadContract({
        address: TOKEN_CONTRACT_ADDRESS,
        abi: TOKEN_ABI,
        functionName: 'balanceOf',
        args: [TREASURY_ADDRESS],
        watch: true,
    });

    const sendTokensToUser = async (userAddress, amount) => {
        setLoading(true);
        setError(null);
        
        try {
            if (!treasuryBalance || treasuryBalance < parseEther(amount.toString())) {
                throw new Error("Treasury doesn't have enough tokens");
            }

            const hash = await writeContractAsync({
                address: TOKEN_CONTRACT_ADDRESS,
                abi: TOKEN_ABI,
                functionName: 'transfer',
                args: [userAddress, parseEther(amount.toString())],
            });

            // Wait for transaction confirmation
            await waitForTransactionReceipt({ hash });

            console.log("Tokens sent to user:", userAddress);
            console.log("Transaction hash:", hash);
            
            return hash;
        } catch (error) {
            console.error("Error sending tokens:", error);
            let errorMessage = error.message;
            
            if (error.message.includes("already known")) {
                errorMessage = "Transaction is already being processed. Please wait.";
            }
            
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleGameResult = async (userAddress, betAmount, isWin, winAmount) => {
        setLoading(true);
        setError(null);
        
        try {
            if (isWin && winAmount > 0) {
                const hash = await writeContractAsync({
                    address: TOKEN_CONTRACT_ADDRESS,
                    abi: TOKEN_ABI,
                    functionName: 'transfer',
                    args: [userAddress, parseEther(winAmount.toString())],
                });
                
                // Wait for transaction confirmation
                await waitForTransactionReceipt({ hash });
                
                console.log("Winnings sent to player:", userAddress);
                return hash;
            } else if (betAmount > 0) {
                const hash = await writeContractAsync({
                    address: TOKEN_CONTRACT_ADDRESS,
                    abi: TOKEN_ABI,
                    functionName: 'transferFrom',
                    args: [userAddress, TREASURY_ADDRESS, parseEther(betAmount.toString())],
                });
                
                // Wait for transaction confirmation
                await waitForTransactionReceipt({ hash });
                
                console.log("Lost bet amount returned to treasury");
                return hash;
            }
        } catch (error) {
            console.error("Error handling game result:", error);
            let errorMessage = error.message;
            
            if (error.message.includes("already known")) {
                errorMessage = "Transaction is already being processed. Please wait.";
            }
            
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const getTreasuryBalance = () => {
        if (!treasuryBalance) return "0";
        return formatEther(treasuryBalance);
    };

    return {
        sendTokensToUser,
        handleGameResult,
        getTreasuryBalance,
        loading,
        error
    };
}; 