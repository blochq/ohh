'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

// Create context with default values to avoid undefined errors
const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  setTheme: () => {},
});

export const useTheme = () => {
  return useContext(ThemeContext);
};

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // On mount, read the theme from localStorage or use system preference
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.dataset.theme = savedTheme;
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else if (prefersDark) {
      setTheme('dark');
      document.documentElement.dataset.theme = 'dark';
      document.documentElement.classList.add('dark');
    }
  }, []);

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    document.documentElement.dataset.theme = newTheme;
    localStorage.setItem('theme', newTheme);
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const value = {
    theme,
    setTheme: changeTheme
  };

  // Avoid hydration mismatch by rendering children only after mounting on client side
  return (
    <ThemeContext.Provider value={value}>
      {mounted ? children : null}
    </ThemeContext.Provider>
  );
} 