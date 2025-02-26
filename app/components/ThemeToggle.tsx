'use client';

import React from 'react';
import { useTheme } from '../providers/ThemeProvider';

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <button 
      onClick={toggleTheme}
      className="relative inline-flex h-7 w-14 items-center rounded-full bg-gray-200 p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-brand-black dark:bg-gray-700 dark:focus:ring-white"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <span 
        className={`flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-md transform transition-transform duration-300 ${
          theme === 'dark' ? 'translate-x-7 bg-brand-black' : 'translate-x-0'
        }`}
      >
        {/* Sun icon for light mode */}
        {theme === 'light' && (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-brand-black" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
        )}
        
        {/* Moon icon for dark mode */}
        {theme === 'dark' && (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        )}
      </span>
      
      <span className="sr-only">
        {theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      </span>
    </button>
  );
};

export default ThemeToggle; 