'use client';

import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

interface ContainerProps {
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  className?: string;
  animate?: boolean;
  delay?: number;
  padding?: boolean;
  variant?: 'default' | 'card' | 'outlined';
}

export default function Container({
  children,
  maxWidth = 'lg',
  className = '',
  animate = true,
  delay = 0,
  padding = true,
  variant = 'default'
}: ContainerProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full'
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        delay,
        ease: 'easeOut'
      }
    }
  };

  const getVariantClass = () => {
    switch (variant) {
      case 'card':
        return 'bg-white dark:bg-gray-900 rounded-lg shadow-md';
      case 'outlined':
        return 'border border-gray-200 dark:border-gray-800 rounded-lg';
      default:
        return '';
    }
  };

  const containerClasses = twMerge(
    `w-full ${maxWidthClasses[maxWidth]} mx-auto`,
    getVariantClass(),
    padding ? 'px-4 sm:px-6 py-4 sm:py-6' : '',
    className
  );

  return animate ? (
    <motion.div
      className={containerClasses}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {children}
    </motion.div>
  ) : (
    <div className={containerClasses}>{children}</div>
  );
} 