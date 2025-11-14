import { motion } from 'framer-motion';
import React from 'react';

interface ScreenTransitionProps {
  children: React.ReactNode;
  key: string; // React key is required for AnimatePresence to work
}

const animation = {
  initial: { opacity: 0, y: 12 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.26, // 260ms
      ease: [0.22, 1, 0.36, 1] as any // cubic-bezier(0.22, 1, 0.36, 1)
    }
  },
  exit: { 
    opacity: 0, 
    y: -12,
    transition: {
      duration: 0.18, // 180ms
      ease: [0.22, 1, 0.36, 1] as any
    }
  },
};

const ScreenTransition: React.FC<ScreenTransitionProps> = ({ children, key }) => {
  return (
    <motion.div
      key={key}
      variants={animation}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full"
    >
      {children}
    </motion.div>
  );
};

export default ScreenTransition;
