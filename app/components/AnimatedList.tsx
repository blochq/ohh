'use client';

import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface AnimatedListProps {
  children: ReactNode;
  className?: string;
  itemClassName?: string;
  staggerDelay?: number;
  initialDelay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  type?: 'ul' | 'ol' | 'div';
}

export default function AnimatedList({
  children,
  className = '',
  itemClassName = '',
  staggerDelay = 0.1,
  initialDelay = 0.2,
  direction = 'up',
  type = 'ul'
}: AnimatedListProps) {
  // Container animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: initialDelay,
        when: 'beforeChildren'
      }
    }
  };

  // Item animation variants based on direction
  const getItemVariants = () => {
    switch (direction) {
      case 'up':
        return {
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
      case 'down':
        return {
          hidden: { opacity: 0, y: -20 },
          visible: {
            opacity: 1,
            y: 0,
            transition: {
              duration: 0.4,
              ease: 'easeOut'
            }
          }
        };
      case 'left':
        return {
          hidden: { opacity: 0, x: 20 },
          visible: {
            opacity: 1,
            x: 0,
            transition: {
              duration: 0.4,
              ease: 'easeOut'
            }
          }
        };
      case 'right':
        return {
          hidden: { opacity: 0, x: -20 },
          visible: {
            opacity: 1,
            x: 0,
            transition: {
              duration: 0.4,
              ease: 'easeOut'
            }
          }
        };
      default:
        return {
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
    }
  };

  // Wrap each child with motion.li or motion.div
  const animateChildren = () => {
    return React.Children.map(children, (child) => {
      if (!React.isValidElement(child)) return child;

      const itemElement = type === 'div' ? 'div' : 'li';
      
      return React.createElement(
        `motion.${itemElement}`,
        {
          variants: getItemVariants(),
          className: itemClassName
        },
        child
      );
    });
  };

  // Render the appropriate container element
  const Container = type === 'ul' 
    ? motion.ul 
    : type === 'ol' 
      ? motion.ol 
      : motion.div;

  return (
    <Container
      className={className}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {animateChildren()}
    </Container>
  );
} 