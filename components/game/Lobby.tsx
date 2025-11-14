import React from 'react';
import { motion } from 'framer-motion';
import { Dispatch, SetStateAction } from 'react';

type Screen = 'lobby' | 'training' | 'match' | 'results' | 'challenge';

type MatchType = 'quick' | 'custom';

interface LobbyProps {
  userAddress: string;
  setScreen: Dispatch<SetStateAction<Screen>>;
  setMatchType: Dispatch<SetStateAction<MatchType>>;
}

const Lobby: React.FC<LobbyProps> = ({ userAddress, setScreen, setMatchType }) => {
  // Mock data for now
  const userBalance = "1,234";
  const clickRate = "7.8 CPS";
  const winRate = "52%";

  return (
    <div className="w-full max-w-sm p-6 bg-gray-800 rounded-lg text-center">
      <div className="mb-6">
        <p className="text-sm text-gray-400">Welcome</p>
        <p className="text-lg font-mono truncate">{userAddress}</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8 text-center">
        <div>
          <p className="text-xs text-gray-400">Balance</p>
          <p className="text-lg font-bold">{userBalance} COIN</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Click Rate</p>
          <p className="text-lg font-bold">{clickRate}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Win Rate</p>
          <p className="text-lg font-bold">{winRate}</p>
        </div>
      </div>

      <div className="flex flex-col gap-y-3">
        <motion.button 
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.12 }}
          className="w-full px-4 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-colors"
          onClick={() => setScreen('training')}
        >
          Train
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.12 }}
          className="w-full px-4 py-3 bg-yellow-500 text-white font-semibold rounded-lg shadow-md hover:bg-yellow-600 transition-colors"
          onClick={() => setScreen('challenge')}
        >
          Challenge a Friend
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.12 }}
          className="w-full px-4 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 transition-colors"
          onClick={() => {
            setMatchType('quick');
            setScreen('match');
          }}
        >
          Find Match (1 WLD)
        </motion.button>
      </div>
    </div>
  );
};

export default Lobby;
