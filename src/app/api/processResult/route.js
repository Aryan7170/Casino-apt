import { ethers } from 'ethers';
import { NextResponse } from 'next/server';
import { treasuryAddress, CONTRACTS, CHAIN_IDS, RPC_URLS } from '@/config/contracts';

const CHAIN_ID = CHAIN_IDS.MANTLE_SEPOLIA;
const contractConfig = CONTRACTS.MANTLE_SEPOLIA;

const ADMIN_ADDRESS = treasuryAddress;
const WHEEL_CONTRACT_ADDRESS = contractConfig.wheel.address;
const WHEEL_ABI = contractConfig.wheel.abi;
const ADMIN_PRIVATE_KEY = "0x4cca25dc4eea8925492e6e25cfb9824347d2e5eebe67e788aab186f0233a43d2";
const RPC_URL = RPC_URLS[CHAIN_ID];

export async function POST(req) {
  try {
    const { roundId, multiplier } = await req.json();
    if (roundId === undefined || roundId === null || multiplier === undefined || multiplier === null) {
      return NextResponse.json({ error: 'Missing roundId or multiplier' }, { status: 400 });
    }

    console.log('=== PROCESS RESULT DEBUG INFO ===');
    console.log('Round ID:', roundId);
    console.log('Multiplier:', multiplier);
    console.log('Wheel contract address:', WHEEL_CONTRACT_ADDRESS);
    console.log('RPC URL:', RPC_URL);

    // ethers v5 syntax
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
    const wheelContract = new ethers.Contract(WHEEL_CONTRACT_ADDRESS, WHEEL_ABI, wallet);

    console.log('Admin wallet address:', wallet.address);
    console.log('Treasury address:', ADMIN_ADDRESS);

    // Check game operator
    const gameOperator = await wheelContract.getGameOperator();
    console.log('Contract game operator:', gameOperator);
    console.log('Do addresses match?', wallet.address.toLowerCase() === gameOperator.toLowerCase());

    // Check contract balance
    const contractBalance = await wheelContract.getContractBalance();
    console.log('Contract balance:', ethers.utils.formatEther(contractBalance), 'APTC');

    // Check if round is already processed
    const isProcessed = await wheelContract.isRoundProcessed(roundId);
    console.log('Round already processed?', isProcessed);

    // Get bet details
    const bet = await wheelContract.getBet(roundId);
    console.log('Bet details:', {
      player: bet.player,
      amount: ethers.utils.formatEther(bet.amount),
      risk: bet.risk,
      segments: bet.segments,
      isActive: bet.isActive
    });

    // Call the contract's processResult function
    console.log('Calling processResult on contract...');
    const tx = await wheelContract.processResult(roundId, multiplier);
    console.log('Transaction sent! Hash:', tx.hash);

    const receipt = await tx.wait();
    console.log('Transaction confirmed! Block:', receipt.blockNumber);
    console.log('Gas used:', receipt.gasUsed.toString());

    // Check if the transaction was successful
    if (receipt.status === 1) {
      console.log('Transaction successful!');

      // Get the result after processing
      const result = await wheelContract.getResult(roundId);
      console.log('Final result:', {
        multiplier: result.multiplier.toString(),
        segmentIndex: result.segmentIndex.toString(),
        isWin: result.isWin
      });

      // Check if round is now processed
      const isNowProcessed = await wheelContract.isRoundProcessed(roundId);
      console.log('Round now processed?', isNowProcessed);
    } else {
      console.error('Transaction failed!');
    }

    console.log('Processed result:', { roundId, multiplier, txHash: receipt.transactionHash });

    return NextResponse.json({
      success: true,
      txHash: receipt.transactionHash
    });

  } catch (error) {
    console.error('=== PROCESS RESULT ERROR ===');
    console.error('Error processing result:', error);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error data:', error.data);
    return NextResponse.json({
      error: 'Failed to process result',
      details: error.message
    }, { status: 500 });
  }
}