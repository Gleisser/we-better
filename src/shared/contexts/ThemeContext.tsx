import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  ThemeContextState,
  ThemeMode,
  ThemeConfig,
  getThemeConfig,
  applyCSSVariables,
} from '@/types/theme';
import { useTimeBasedTheme } from '@/shared/hooks/useTimeBasedTheme';

/**
 * Theme Context for managing application theme state
 */
export const ThemeContext = createContext<ThemeContextState | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  initialThemeMode?: ThemeMode;
  initialTimeBasedTheme?: boolean;
}

/**
 * ThemeProvider component that manages theme state and provides theme context
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialThemeMode = 'auto',
  initialTimeBasedTheme = true,
}) => {
  // State management
  const [themeMode, setThemeModeState] = useState<ThemeMode>(initialThemeMode);
  const [timeBasedTheme, setTimeBasedThemeState] = useState<boolean>(initialTimeBasedTheme);
  const [isLoading, setIsLoading] = useState(true);
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('dark');

  // Integration with existing time-based theme hook
  const { timeOfDay, theme: timeThemeColors } = useTimeBasedTheme();

  // Derived state
  const currentTheme: ThemeConfig = getThemeConfig(
    themeMode,
    timeBasedTheme ? timeOfDay : undefined
  );

  /**
   * Initialize theme from localStorage and system preferences
   */
  const initializeTheme = useCallback(() => {
    try {
      // Get saved preferences from localStorage
      const savedThemeMode = localStorage.getItem('theme-mode') as ThemeMode;
      const savedTimeBasedTheme = localStorage.getItem('time-based-theme');

      // Detect system theme preference
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

      // Apply saved preferences or defaults
      if (savedThemeMode && ['light', 'dark', 'auto'].includes(savedThemeMode)) {
        setThemeModeState(savedThemeMode);
      }

      if (savedTimeBasedTheme !== null) {
        setTimeBasedThemeState(savedTimeBasedTheme === 'true');
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Failed to initialize theme:', error);
      setIsLoading(false);
    }
  }, []);

  /**
   * Set theme mode and persist to localStorage
   */
  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      localStorage.setItem('theme-mode', mode);
    } catch (error) {
      console.error('Failed to save theme mode to localStorage:', error);
    }
  }, []);

  /**
   * Set time-based theme preference and persist to localStorage
   */
  const setTimeBasedTheme = useCallback((enabled: boolean) => {
    setTimeBasedThemeState(enabled);
    try {
      localStorage.setItem('time-based-theme', enabled.toString());
    } catch (error) {
      console.error('Failed to save time-based theme preference to localStorage:', error);
    }
  }, []);

  /**
   * Toggle between light and dark themes
   */
  const toggleTheme = useCallback(() => {
    if (themeMode === 'auto') {
      // If auto, switch to the opposite of current system theme
      setThemeMode(systemTheme === 'dark' ? 'light' : 'dark');
    } else if (themeMode === 'light') {
      setThemeMode('dark');
    } else {
      setThemeMode('light');
    }
  }, [themeMode, systemTheme, setThemeMode]);

  /**
   * Handle system theme changes
   */
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleSystemThemeChange = (e: MediaQueryListEvent): void => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, []);

  /**
   * Apply CSS variables when theme changes
   */
  useEffect(() => {
    if (!isLoading && currentTheme.cssVariables) {
      applyCSSVariables(currentTheme.cssVariables);

      // Apply theme mode as data attribute for CSS targeting
      document.documentElement.setAttribute('data-theme', currentTheme.mode);

      // Apply theme class for backward compatibility
      document.documentElement.className = `theme-${currentTheme.mode}`;
    }
  }, [currentTheme, isLoading]);

  /**
   * Initialize theme on mount
   */
  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  /**
   * Prevent flash of unstyled content (FOUC)
   */
  useEffect(() => {
    if (!isLoading) {
      // Remove any loading classes that might hide content
      document.documentElement.classList.remove('theme-loading');
    }
  }, [isLoading]);

  /**
   * Integration with existing time-based theme system
   */
  useEffect(() => {
    if (timeBasedTheme && timeThemeColors) {
      // Apply time-based gradients as CSS variables
      const timeBasedVariables = {
        '--gradient-start': timeThemeColors.gradientStart,
        '--gradient-middle': timeThemeColors.gradientMiddle,
        '--gradient-end': timeThemeColors.gradientEnd,
        '--accent-rgb': timeThemeColors.accentRGB,
      };

      applyCSSVariables(timeBasedVariables);
    }
  }, [timeBasedTheme, timeThemeColors]);

  const contextValue: ThemeContextState = {
    // Current theme settings
    currentTheme,
    themeMode,
    timeBasedTheme,

    // System detection
    systemTheme,
    timeOfDay,

    // State management
    isLoading,

    // Actions
    setThemeMode,
    setTimeBasedTheme,
    toggleTheme,
  };

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
};

export default ThemeProvider;
