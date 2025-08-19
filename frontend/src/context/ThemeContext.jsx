import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage first, then default to light mode
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    // Default to light mode instead of system preference
    return false;
  });

  useEffect(() => {
    // Update document class when theme changes
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const setTheme = (theme) => {
    setIsDarkMode(theme === 'dark');
  };

  const value = {
    isDarkMode,
    theme: isDarkMode ? 'dark' : 'light',
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  // Be resilient if used outside provider (e.g., during route-level mounting)
  if (!context) {
    return {
      isDarkMode: false,
      theme: 'light',
      toggleTheme: () => {},
      setTheme: () => {},
    };
  }
  return context;
};

// Force light mode for specific screens without changing saved preference
export const useForceLightMode = () => {
  const { isDarkMode } = useTheme();
  useEffect(() => {
    const wasDark = document.documentElement.classList.contains('dark');
    // Ensure light mode styles
    document.documentElement.classList.remove('dark');
    // Restore previous state on unmount if it was dark and user preference is dark
    return () => {
      if (wasDark && isDarkMode) {
        document.documentElement.classList.add('dark');
      }
    };
  }, [isDarkMode]);
};
