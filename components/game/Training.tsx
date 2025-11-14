import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

interface TrainingProps {
  setScreen: (screen: 'lobby') => void;
}

type GameState = 'idle' | 'countdown' | 'playing' | 'finished';

const Training: React.FC<TrainingProps> = ({ setScreen }) => {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [countdown, setCountdown] = useState(3);
  const [timer, setTimer] = useState(5);
  const [clickCount, setClickCount] = useState(0);

  // Countdown logic
  useEffect(() => {
    if (gameState !== 'countdown') return;

    if (countdown > 0) {
      const interval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setGameState('playing');
    }
  }, [gameState, countdown]);

  // Game timer logic
  useEffect(() => {
    if (gameState !== 'playing') return;

    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setGameState('finished');
    }
  }, [gameState, timer]);

  const handleStart = () => {
    setClickCount(0);
    setCountdown(3);
    setTimer(5);
    setGameState('countdown');
  };

  const handleClick = () => {
    if (gameState === 'playing') {
      setClickCount(prev => prev + 1);
    }
  };

  const renderContent = () => {
    switch (gameState) {
      case 'countdown':
        return <p className="text-9xl font-bold">{countdown}</p>;
      case 'playing':
        return (
          <motion.div 
            className="w-full h-full flex flex-col items-center justify-center cursor-pointer"
            onClick={handleClick}
            whileTap={{ scale: 0.99 }}
            transition={{ duration: 0.08 }}
          >
            <p className="absolute top-4 right-4 text-2xl font-mono">{timer.toFixed(0)}s</p>
            <p className="text-9xl font-bold select-none">{clickCount}</p>
            <p className="absolute bottom-4 text-lg text-gray-400 select-none">Tap anywhere</p>
          </motion.div>
        );
      case 'finished':
        return (
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Results</h2>
            <p className="text-5xl mb-2">{(clickCount / 5).toFixed(2)}</p>
            <p className="text-lg text-gray-400 mb-6">Clicks Per Second</p>
            <motion.button whileTap={{ scale: 0.97 }} transition={{ duration: 0.12 }} onClick={handleStart} className="px-6 py-2 bg-blue-600 rounded-lg mb-2">Try Again</motion.button>
            <button onClick={() => setScreen('lobby')} className="text-sm text-gray-400 hover:underline">Back to Lobby</button>
          </div>
        );
      case 'idle':
      default:
        return (
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Training Room</h2>
            <p className="mb-6 text-gray-300">Click the button as fast as you can for 5 seconds.</p>
            <motion.button whileTap={{ scale: 0.97 }} transition={{ duration: 0.12 }} onClick={handleStart} className="px-8 py-4 bg-blue-600 text-xl font-semibold rounded-lg">Start</motion.button>
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-md h-96 flex flex-col items-center justify-center p-6 bg-gray-800 rounded-lg relative">
      {renderContent()}
    </div>
  );
};

export default Training;
