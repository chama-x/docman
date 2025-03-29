/**
 * Theme-related type definitions
 */

/**
 * Available theme modes
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Theme context state interface
 */
export interface ThemeContextState {
  /**
   * Current theme mode
   */
  mode: ThemeMode;
  
  /**
   * Whether the theme is currently in dark mode (including system preference)
   */
  isDarkMode: boolean;
  
  /**
   * Function to toggle between light and dark mode
   */
  toggleTheme: () => void;
  
  /**
   * Function to set a specific theme mode
   */
  setTheme: (mode: ThemeMode) => void;
}

/**
 * Theme configuration options
 */
export interface ThemeConfig {
  /**
   * Default theme mode
   */
  defaultMode?: ThemeMode;
  
  /**
   * Whether to store theme preference in localStorage
   */
  persistTheme?: boolean;
  
  /**
   * Custom storage key for theme preference
   */
  storageKey?: string;
}

/**
 * CSS theme variables interface (for TypeScript type checking)
 */
export interface ThemeVariables {
  /**
   * Primary color variables
   */
  primary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  
  /**
   * Background colors
   */
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  
  /**
   * Text colors
   */
  text: {
    primary: string;
    secondary: string;
    muted: string;
  };
} 