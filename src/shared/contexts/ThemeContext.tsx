import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  ThemeContextState,
  ThemeMode,
  ThemeConfig,
  getThemeConfig,
  applyCSSVariables,
} from '@/types/theme';
import { useTimeBasedTheme } from '@/shared/hooks/useTimeBasedTheme';
import { useUserPreferences } from '@/shared/hooks/useUserPreferences';

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
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Integration with existing time-based theme hook
  const { timeOfDay, theme: timeThemeColors } = useTimeBasedTheme();

  // User preferences integration
  const { preferences, isLoading: preferencesLoading } = useUserPreferences();

  /**
   * Get effective theme mode considering auto mode and time-based preferences
   */
  const getEffectiveThemeMode = useCallback((): 'light' | 'dark' => {
    if (themeMode === 'auto') {
      if (timeBasedTheme) {
        // Use time-based theme logic
        const hour = new Date().getHours();

        // Morning (6-11): Light
        // Afternoon (12-16): Light
        // Evening (17-20): Dark
        // Night (21-5): Dark
        if (hour >= 6 && hour < 17) {
          return 'light';
        } else {
          return 'dark';
        }
      } else {
        // Use system preference
        return systemTheme;
      }
    }

    return themeMode as 'light' | 'dark';
  }, [themeMode, timeBasedTheme, systemTheme]);

  // Derived state
  const effectiveThemeMode = getEffectiveThemeMode();
  const currentTheme: ThemeConfig = getThemeConfig(
    effectiveThemeMode,
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
   * Sync with user preferences from backend
   */
  useEffect(() => {
    if (preferences && !preferencesLoading) {
      setThemeModeState(preferences.theme_mode);
      setTimeBasedThemeState(preferences.time_based_theme);
    }
  }, [preferences, preferencesLoading]);

  /**
   * Set theme mode and persist to localStorage
   */
  const setThemeMode = useCallback((mode: ThemeMode) => {
    setIsTransitioning(true);
    setThemeModeState(mode);

    try {
      localStorage.setItem('theme-mode', mode);
    } catch (error) {
      console.error('Failed to save theme mode to localStorage:', error);
    }

    // Reset transition state after animation
    setTimeout(() => setIsTransitioning(false), 300);
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
      // If auto, switch to the opposite of current effective theme
      setThemeMode(effectiveThemeMode === 'dark' ? 'light' : 'dark');
    } else if (themeMode === 'light') {
      setThemeMode('dark');
    } else {
      setThemeMode('light');
    }
  }, [themeMode, effectiveThemeMode, setThemeMode]);

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
   * Auto-refresh theme every hour for time-based themes
   */
  useEffect(() => {
    if (themeMode === 'auto' && timeBasedTheme) {
      const interval = setInterval(
        () => {
          // Force re-evaluation of theme
          const newEffectiveMode = getEffectiveThemeMode();
          if (newEffectiveMode !== effectiveThemeMode) {
            setIsTransitioning(true);
            setTimeout(() => setIsTransitioning(false), 300);
          }
        },
        60 * 60 * 1000
      ); // Check every hour

      return () => clearInterval(interval);
    }
  }, [themeMode, timeBasedTheme, getEffectiveThemeMode, effectiveThemeMode]);

  /**
   * Apply CSS variables when theme changes
   */
  useEffect(() => {
    if (!isLoading && currentTheme.cssVariables) {
      // Add transition class for smooth theme changes
      if (isTransitioning) {
        document.documentElement.classList.add('theme-transitioning');
      } else {
        document.documentElement.classList.remove('theme-transitioning');
      }

      applyCSSVariables(currentTheme.cssVariables);

      // Apply theme mode as data attribute for CSS targeting
      document.documentElement.setAttribute('data-theme', currentTheme.mode);
      document.documentElement.setAttribute('data-time-of-day', timeOfDay);
      document.documentElement.setAttribute('data-time-based-theme', timeBasedTheme.toString());

      // Apply theme class for backward compatibility
      document.documentElement.className = `theme-${currentTheme.mode} time-${timeOfDay}`;
    }
  }, [currentTheme, isLoading, isTransitioning, timeOfDay, timeBasedTheme]);

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
        '--time-gradient': `linear-gradient(135deg, ${timeThemeColors.gradientStart}, ${timeThemeColors.gradientMiddle}, ${timeThemeColors.gradientEnd})`,
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
