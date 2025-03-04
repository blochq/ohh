'use client';

import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  hoverEffect?: boolean;
  delay?: number;
  onClick?: () => void;
}

export default function AnimatedCard({
  children,
  className = '',
  hoverEffect = true,
  delay = 0,
  onClick
}: AnimatedCardProps) {
  // Base classes for the card
  const baseClasses = 'rounded-lg overflow-hidden';
  
  // Combine all classes
  const cardClasses = `${baseClasses} ${className}`;
  
  // Animation variants
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 20 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        delay,
        ease: 'easeOut'
      }
    },
    hover: hoverEffect ? { 
      y: -5,
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      transition: { 
        duration: 0.3,
        ease: 'easeOut'
      }
    } : {}
  };

  return (
    <motion.div
      className={cardClasses}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      variants={cardVariants}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
} 