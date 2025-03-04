'use client';

import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

interface PageTransitionsProps {
  children: ReactNode;
}

export default function PageTransitions({ children }: PageTransitionsProps) {
  const pathname = usePathname();

  // Animation variants for page transitions
  const pageVariants = {
    initial: { 
      opacity: 0,
      y: 10
    },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        ease: 'easeInOut'
      }
    },
    exit: { 
      opacity: 0,
      y: -10,
      transition: {
        duration: 0.3,
        ease: 'easeInOut'
      }
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        className="min-h-screen"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
} 