'use client';

import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import Container from './Container';
import { pageVariants } from '../lib/utils/transitions';

interface AnimatedLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  title?: string;
  subtitle?: string;
}

export default function AnimatedLayout({
  children,
  showHeader = true,
  maxWidth = 'md',
  title,
  subtitle
}: AnimatedLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-white dark:bg-black p-4">
      {showHeader && (
        <motion.header 
          className="flex justify-between items-center mb-8 pt-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Logo size="md" className="text-gradient" />
          <ThemeToggle />
        </motion.header>
      )}

      <Container maxWidth={maxWidth}>
        {(title || subtitle) && (
          <motion.div 
            className="mb-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {title && (
              <h1 className="text-3xl md:text-4xl font-semibold mb-2 text-gradient">{title}</h1>
            )}
            {subtitle && (
              <p className="text-gray-600 dark:text-gray-300">{subtitle}</p>
            )}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={pageVariants}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </Container>
    </div>
  );
} 