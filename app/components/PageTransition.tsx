'use client';

import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageVariants } from '../lib/utils/transitions';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
  variants?: typeof pageVariants;
}

export default function PageTransition({ 
  children, 
  className = '', 
  variants = pageVariants 
}: PageTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={variants}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

interface AnimatedProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

interface AnimatedButtonProps extends AnimatedProps {
  onClick?: () => void;
}

// Animated components for common elements
export const AnimatedContainer = ({ children, className = '', delay = 0 }: AnimatedProps) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ 
      opacity: 1,
      transition: { 
        delay,
        duration: 0.5 
      }
    }}
    className={className}
  >
    {children}
  </motion.div>
);

export const AnimatedItem = ({ children, className = '', delay = 0 }: AnimatedProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ 
      opacity: 1, 
      y: 0,
      transition: { 
        delay,
        duration: 0.4 
      }
    }}
    className={className}
  >
    {children}
  </motion.div>
);

export const AnimatedButton = ({ children, className = '', onClick = () => {} }: AnimatedButtonProps) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className={className}
    onClick={onClick}
  >
    {children}
  </motion.button>
); 