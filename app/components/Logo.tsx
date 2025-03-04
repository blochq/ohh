'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  withText?: boolean;
  animated?: boolean;
}

const Logo: React.FC<LogoProps> = ({
  size = 'md',
  className = '',
  withText = true,
  animated = true,
}) => {
  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'w-8 h-8';
      case 'md':
        return 'w-10 h-10';
      case 'lg':
        return 'w-12 h-12';
      case 'xl':
        return 'w-16 h-16';
      default:
        return 'w-10 h-10';
    }
  };

  const textSizeClasses: Record<string, string> = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl'
  };

  const logoVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.5,
        ease: [0.175, 0.885, 0.32, 1.275] // Custom cubic bezier for a nice spring effect
      }
    },
    hover: animated ? { 
      scale: 1.05,
      transition: { 
        duration: 0.3,
        ease: 'easeInOut'
      }
    } : {}
  };

  const LogoContent = () => (
    <div className="flex items-center">
      <div className={twMerge(getSizeClass(), 'relative rounded-full', className)}>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
        <div className="absolute inset-0.5 bg-white dark:bg-black rounded-full"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-brand-black dark:text-white font-bold">O</span>
        </div>
      </div>
      {withText && (
        <div className="ml-2 font-bold">
          <span className={`${textSizeClasses[size]} tracking-tight text-brand-black dark:text-white`}>
            Ohh<span className="text-brand-blue">.tc</span>
          </span>
        </div>
      )}
    </div>
  );

  return animated ? (
    <Link href="/">
      <motion.div
        className="inline-block"
        initial="initial"
        animate="animate"
        whileHover="hover"
        variants={logoVariants}
      >
        <LogoContent />
      </motion.div>
    </Link>
  ) : (
    <Link href="/">
      <LogoContent />
    </Link>
  );
};

export default Logo; 