'use client';

import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface AnimatedTextProps {
  children: ReactNode;
  className?: string;
  element?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
  animation?: 'fade' | 'slide' | 'scale' | 'highlight' | 'gradient' | 'none';
  delay?: number;
  staggerChildren?: boolean;
  staggerDelay?: number;
}

export default function AnimatedText({
  children,
  className = '',
  element = 'p',
  animation = 'fade',
  delay = 0,
  staggerChildren = false,
  staggerDelay = 0.03
}: AnimatedTextProps) {
  // Animation variants
  const getVariants = () => {
    switch (animation) {
      case 'fade':
        return {
          hidden: { opacity: 0 },
          visible: { 
            opacity: 1,
            transition: { 
              duration: 0.5,
              delay,
              ease: 'easeOut'
            }
          }
        };
      case 'slide':
        return {
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
      case 'scale':
        return {
          hidden: { opacity: 0, scale: 0.9 },
          visible: { 
            opacity: 1, 
            scale: 1,
            transition: { 
              duration: 0.5,
              delay,
              ease: [0.175, 0.885, 0.32, 1.275]
            }
          }
        };
      case 'highlight':
        return {
          hidden: { 
            opacity: 0,
            backgroundColor: 'rgba(59, 130, 246, 0)' 
          },
          visible: { 
            opacity: 1,
            backgroundColor: ['rgba(59, 130, 246, 0)', 'rgba(59, 130, 246, 0.2)', 'rgba(59, 130, 246, 0)'],
            transition: { 
              duration: 1.5,
              delay,
              ease: 'easeOut',
              backgroundColor: {
                times: [0, 0.5, 1],
                duration: 1.5
              }
            }
          }
        };
      case 'gradient':
        return {
          hidden: { opacity: 0 },
          visible: { 
            opacity: 1,
            transition: { 
              duration: 0.5,
              delay,
              ease: 'easeOut'
            }
          }
        };
      default:
        return {
          hidden: { opacity: 1 },
          visible: { opacity: 1 }
        };
    }
  };

  // Letter animation for staggered text
  const letterVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: 'easeOut'
      }
    }
  };

  // Container variants for staggered text
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delay,
        when: 'beforeChildren'
      }
    }
  };

  // Split text into letters for staggered animation
  const renderStaggeredText = () => {
    if (typeof children !== 'string') return children;
    
    return (
      <motion.span
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="inline-block"
      >
        {Array.from(children).map((letter, index) => (
          <motion.span
            key={index}
            variants={letterVariants}
            className="inline-block"
          >
            {letter === ' ' ? '\u00A0' : letter}
          </motion.span>
        ))}
      </motion.span>
    );
  };

  // Add gradient class if animation is gradient
  const combinedClassName = `${className} ${animation === 'gradient' ? 'text-gradient' : ''}`;

  // Render the appropriate element
  const renderElement = () => {
    const props = {
      className: combinedClassName,
      initial: "hidden",
      animate: "visible",
      variants: getVariants()
    };

    if (staggerChildren) {
      return React.createElement(
        `motion.${element}`,
        props,
        renderStaggeredText()
      );
    }

    return React.createElement(
      `motion.${element}`,
      props,
      children
    );
  };

  return renderElement();
} 