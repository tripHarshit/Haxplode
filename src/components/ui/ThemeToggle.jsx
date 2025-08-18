import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = ({ className = '' }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative inline-flex h-10 w-20 items-center justify-center rounded-full
        bg-gradient-to-r from-blue-500 to-purple-600
        dark:from-blue-600 dark:to-purple-700
        transition-all duration-300 ease-in-out
        hover:scale-105 hover:shadow-lg
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        dark:focus:ring-offset-gray-900
        ${className}
      `}
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      {/* Toggle handle */}
      <div
        className={`
          absolute left-1 h-8 w-8 rounded-full bg-white
          shadow-lg transition-all duration-300 ease-in-out
          flex items-center justify-center
          ${isDarkMode ? 'translate-x-10' : 'translate-x-0'}
        `}
      >
        {isDarkMode ? (
          <Moon className="h-4 w-4 text-gray-800" />
        ) : (
          <Sun className="h-4 w-4 text-yellow-500" />
        )}
      </div>
      
      {/* Background icons */}
      <div className="flex w-full justify-between px-2">
        <Sun className="h-4 w-4 text-white opacity-60" />
        <Moon className="h-4 w-4 text-white opacity-60" />
      </div>
    </button>
  );
};

export default ThemeToggle;
