import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocalStorage } from '@hooks/useLocalStorage';
import { ThemeMode } from '@types/index';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  isDark: boolean;
  toggleTheme: () => void;
}

// Create context with undefined as default value
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Theme provider component
 */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Store theme preference in localStorage
  const [theme, setTheme] = useLocalStorage<ThemeMode>('theme', 'system');
  
  const [isDark, setIsDark] = useState<boolean>(false);

  // Toggle between light and dark
  const toggleTheme = (): void => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Apply theme class to document
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    // Handle system preference
    if (theme === 'system') {
      const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemPreference);
      setIsDark(systemPreference === 'dark');
    } else {
      root.classList.add(theme);
      setIsDark(theme === 'dark');
    }
  }, [theme]);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (): void => {
      if (theme === 'system') {
        const systemPreference = mediaQuery.matches ? 'dark' : 'light';
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(systemPreference);
        setIsDark(systemPreference === 'dark');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Create context value
  const contextValue: ThemeContextType = {
    theme,
    setTheme,
    isDark,
    toggleTheme,
  };

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
};

/**
 * Hook to use the theme context
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 