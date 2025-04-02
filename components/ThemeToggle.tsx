'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // After mounting, we can show the toggle
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const isDark = theme === 'dark';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  // Animation variants
  const toggleVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { 
      opacity: 1, 
      scale: 1,
      rotate: isDark ? 180 : 0,
      transition: { 
        duration: 0.5,
        ease: [0.175, 0.885, 0.32, 1.275] // Custom cubic bezier for a nice spring effect
      }
    },
    tap: { scale: 0.9 }
  };

  // Icon variants
  const sunVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { 
      opacity: isDark ? 0 : 1, 
      y: isDark ? -10 : 0,
      transition: { duration: 0.3 }
    }
  };

  const moonVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: isDark ? 1 : 0, 
      y: isDark ? 0 : 10,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.button
      className="relative w-10 h-10 flex items-center justify-center rounded-full focus:outline-none bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white"
      onClick={toggleTheme}
      initial="initial"
      animate="animate"
      whileTap="tap"
      variants={toggleVariants}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <div className="relative w-6 h-6">
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="absolute inset-0 w-6 h-6"
          initial="hidden"
          animate="visible"
          variants={sunVariants}
        >
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </motion.svg>
        
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="absolute inset-0 w-6 h-6"
          initial="hidden"
          animate="visible"
          variants={moonVariants}
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </motion.svg>
      </div>
    </motion.button>
  );
} 