import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { motion } from 'framer-motion';
import { MiniKit, tokenToDecimals, Tokens } from '@worldcoin/minikit-js';

type Screen = 'lobby' | 'training' | 'match' | 'results';

interface MatchProps {
  setScreen: Dispatch<SetStateAction<Screen>>;
}

type MatchState = 'betting' | 'waiting_opponent' | 'countdown' | 'playing' | 'finished';

const Match: React.FC<MatchProps> = ({ setScreen }) => {
  const [matchState, setMatchState] = useState<MatchState>('betting');
  const [betAmount, setBetAmount] = useState('10');
  const [countdown, setCountdown] = useState(3);
  const [timer, setTimer] = useState(5); // 5-second match
  const [playerClicks, setPlayerClicks] = useState(0);
  const [opponentClicks, setOpponentClicks] = useState(0); // Simulated opponent

  // Countdown logic
  useEffect(() => {
    if (matchState !== 'countdown') return;
    if (countdown > 0) {
      const interval = setInterval(() => setCountdown(prev => prev - 1), 1000);
      return () => clearInterval(interval);
    } else {
      setMatchState('playing');
    }
  }, [matchState, countdown]);

  // Game timer logic
  useEffect(() => {
    if (matchState !== 'playing') return;
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
        // Simulate opponent clicks
        if (Math.random() > 0.3) { // Opponent clicks ~70% of the time
            setOpponentClicks(prev => prev + Math.floor(Math.random() * 2) + 1);
        }
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setMatchState('finished');
    }
  }, [matchState, timer]);

  const handleConfirmBet = async () => {
    const escrowAddress = process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS;
    if (!escrowAddress || escrowAddress.includes("REPLACE_WITH")) {
      alert("Escrow contract address is not configured in .env.local");
      return;
    }

    if (!MiniKit.isInstalled()) {
      alert("Please open this app in the World App to make a transaction.");
      return;
    }

    try {
      setMatchState('waiting_opponent');

      // TODO: This reference should be generated and fetched from your backend for security.
      const reference = crypto.randomUUID().replace(/-/g, "");

      const payload = {
        reference,
        to: escrowAddress,
        tokens: [
          {
            symbol: Tokens.WLD,
            token_amount: tokenToDecimals(Number(betAmount), Tokens.WLD).toString(),
          },
        ],
        description: `Bet for World Click Fight match`,
      };

      console.log("Initiating payment with payload:", payload);

      // This triggers the payment modal in World App
      const { finalPayload } = await MiniKit.commandsAsync.pay(payload);

      if (finalPayload.status === 'error') {
        // The documentation says 'failed', but the types suggest 'error'. Trusting the types.
        console.error("Payment error payload:", finalPayload);
        throw new Error('Payment failed or was rejected by the user.');
      }

      // The documentation says 'transaction_id', but the types might differ.
      // Let's assume a common alternative like 'transactionHash'.
      console.log('Transaction successful! Hash:', (finalPayload as any).transactionHash);
      
      // TODO: Send the finalPayload to your backend to verify the transaction
      // using the Developer Portal API and the transaction_id.

      // For now, we'll just simulate the rest of the flow.
      setTimeout(() => {
        setCountdown(3);
        setTimer(5);
        setPlayerClicks(0);
        setOpponentClicks(0);
        setMatchState('countdown');
      }, 2000);

    } catch (error) {
      console.error("Payment error:", error);
      alert(`Payment failed: ${error instanceof Error ? error.message : String(error)}`);
      setMatchState('betting'); // Return to betting screen on error
    }
  };

  const handleClick = () => {
    if (matchState === 'playing') {
      setPlayerClicks(prev => prev + 1);
    }
  };

  const renderContent = () => {
    switch (matchState) {
      case 'betting':
        return (
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Place Your Bet</h2>
            <div className="flex items-center justify-center mb-6">
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                className="w-32 p-2 text-center text-2xl font-bold bg-gray-700 rounded-lg"
              />
              <span className="ml-4 text-2xl font-bold">COIN</span>
            </div>
            <motion.button whileTap={{ scale: 0.97 }} transition={{ duration: 0.12 }} onClick={handleConfirmBet} className="px-8 py-3 bg-green-600 text-lg font-semibold rounded-lg">
              Confirm Bet
            </motion.button>
             <button onClick={() => setScreen('lobby')} className="block mt-4 mx-auto text-sm text-gray-400 hover:underline">Back to Lobby</button>
          </div>
        );
      case 'waiting_opponent':
        return <p className="text-2xl animate-pulse">Waiting for opponent...</p>;
      case 'countdown':
        return <p className="text-9xl font-bold">{countdown > 0 ? countdown : 'FIGHT!'}</p>;
      case 'playing':
        return (
            <div className="w-full h-full flex flex-col items-center justify-center">
                <p className="absolute top-4 text-2xl font-mono">{timer.toFixed(0)}s</p>
                <div className="w-full flex justify-around items-center">
                    <div className="text-center">
                        <p className="text-lg">You</p>
                        <p className="text-6xl font-bold">{playerClicks}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-lg">Opponent</p>
                        <p className="text-6xl font-bold">{opponentClicks}</p>
                    </div>
                </div>
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.08 }}
                    className="absolute bottom-10 w-48 h-24 bg-blue-600 rounded-lg text-white text-2xl font-bold"
                    onClick={handleClick}
                >
                    Click!
                </motion.button>
            </div>
        );
    case 'finished':
        const playerWon = playerClicks > opponentClicks;
        return (
            <div className="text-center">
                <h2 className={`text-5xl font-bold mb-4 ${playerWon ? 'text-green-400' : 'text-red-400'}`}>
                    {playerWon ? 'You Won!' : 'You Lost'}
                </h2>
                <p className="text-2xl mb-6">{playerClicks} to {opponentClicks}</p>
                <motion.button whileTap={{ scale: 0.97 }} transition={{ duration: 0.12 }} onClick={() => setMatchState('betting')} className="px-6 py-2 bg-blue-600 rounded-lg mb-2">Rematch</motion.button>
                <button onClick={() => setScreen('lobby')} className="text-sm text-gray-400 hover:underline">Back to Lobby</button>
            </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-md h-96 flex flex-col items-center justify-center p-6 bg-gray-800 rounded-lg relative">
      {renderContent()}
    </div>
  );
};

export default Match;
