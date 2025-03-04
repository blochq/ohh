'use client';

import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface AnimatedIconProps {
  children: ReactNode;
  className?: string;
  animation?: 'pulse' | 'spin' | 'bounce' | 'shake' | 'float' | 'none';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  hoverEffect?: boolean;
  onClick?: () => void;
}

export default function AnimatedIcon({
  children,
  className = '',
  animation = 'none',
  size = 'md',
  color = 'currentColor',
  hoverEffect = true,
  onClick
}: AnimatedIconProps) {
  // Size classes
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10'
  };

  // Animation variants
  const getAnimationVariants = () => {
    switch (animation) {
      case 'pulse':
        return {
          animate: {
            scale: [1, 1.1, 1],
            opacity: [1, 0.8, 1],
            transition: {
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }
          }
        };
      case 'spin':
        return {
          animate: {
            rotate: 360,
            transition: {
              duration: 2,
              repeat: Infinity,
              ease: 'linear'
            }
          }
        };
      case 'bounce':
        return {
          animate: {
            y: [0, -10, 0],
            transition: {
              duration: 1,
              repeat: Infinity,
              ease: 'easeInOut'
            }
          }
        };
      case 'shake':
        return {
          animate: {
            x: [0, -5, 5, -5, 5, 0],
            transition: {
              duration: 0.5,
              repeat: Infinity,
              repeatDelay: 2,
              ease: 'easeInOut'
            }
          }
        };
      case 'float':
        return {
          animate: {
            y: [0, -5, 0],
            transition: {
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut'
            }
          }
        };
      default:
        return {
          animate: {}
        };
    }
  };

  // Hover effect
  const hoverVariants = hoverEffect
    ? {
        hover: {
          scale: 1.1,
          transition: {
            duration: 0.2,
            ease: 'easeInOut'
          }
        },
        tap: {
          scale: 0.95,
          transition: {
            duration: 0.1,
            ease: 'easeInOut'
          }
        }
      }
    : {};

  // Combine all variants
  const variants = {
    ...getAnimationVariants(),
    ...hoverVariants
  };

  // Combine all classes
  const iconClasses = `${sizeClasses[size]} ${className}`;

  return (
    <motion.div
      className={iconClasses}
      style={{ color }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1, ...variants.animate }}
      whileHover={hoverEffect ? 'hover' : undefined}
      whileTap={hoverEffect ? 'tap' : undefined}
      variants={variants}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
} 