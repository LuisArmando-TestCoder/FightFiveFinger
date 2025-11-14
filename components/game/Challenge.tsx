import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dispatch, SetStateAction } from 'react';

type Screen = 'lobby' | 'training' | 'match' | 'results' | 'challenge';

interface ChallengeProps {
  setScreen: Dispatch<SetStateAction<Screen>>;
}

const Challenge: React.FC<ChallengeProps> = ({ setScreen }) => {
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Generate a unique room ID
    const roomId = `room_${crypto.randomUUID().slice(0, 8)}`;
    // Construct the full invitation link
    const link = `${window.location.origin}?room_id=${roomId}`;
    setInviteLink(link);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    });
  };

  return (
    <div className="w-full max-w-sm p-6 bg-gray-800 rounded-lg text-center">
      <h2 className="text-3xl font-bold mb-4">Challenge a Friend</h2>
      <p className="mb-6 text-gray-300">Share this link with a friend to start a match.</p>
      
      <div className="p-4 mb-6 bg-gray-700 rounded-lg font-mono text-sm break-all">
        {inviteLink}
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.12 }}
        onClick={handleCopy}
        className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors mb-4"
      >
        {copied ? 'Copied!' : 'Copy Link'}
      </motion.button>

      <button onClick={() => setScreen('lobby')} className="text-sm text-gray-400 hover:underline">
        Back to Lobby
      </button>
    </div>
  );
};

export default Challenge;
