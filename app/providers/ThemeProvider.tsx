'use client';

import React, { createContext, useContext } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

export const ThemeContext = createContext({
  theme: 'light',
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </NextThemesProvider>
  );
}   