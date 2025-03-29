import React from 'react';
import { useTheme } from '@contexts/ThemeContext';
import { ThemeMode } from '@types/index';

/**
 * ThemeSwitcher component props
 */
export interface ThemeSwitcherProps {
  /**
   * Optional CSS class to apply to the component
   */
  className?: string;
}

/**
 * ThemeSwitcher toggles between light and dark mode
 * 
 * @example
 * ```tsx
 * <ThemeSwitcher />
 * ```
 */
export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ className = '' }) => {
  const { isDark, toggleTheme, theme, setTheme } = useTheme();

  // Handle theme dropdown change
  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setTheme(e.target.value as ThemeMode);
  };

  return (
    <div className={`flex items-center ${className}`}>
      {/* Simple toggle button */}
      <button
        type="button"
        onClick={toggleTheme}
        className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? (
          <SunIcon className="h-5 w-5" />
        ) : (
          <MoonIcon className="h-5 w-5" />
        )}
      </button>

      {/* Theme selector dropdown */}
      <select
        value={theme}
        onChange={handleThemeChange}
        className="ml-2 bg-transparent text-sm border-gray-300 rounded-md dark:border-gray-700 dark:text-gray-300 focus:ring-1 focus:ring-blue-500"
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>
    </div>
  );
};

// Sun icon for light mode
const SunIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

// Moon icon for dark mode
const MoonIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

export default ThemeSwitcher; 