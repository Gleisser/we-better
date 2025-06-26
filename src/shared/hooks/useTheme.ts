import { useContext } from 'react';
import { ThemeContext } from '@/shared/contexts/ThemeContext';
import { ThemeContextState, ThemeMode, ThemeColors } from '@/types/theme';

/**
 * Custom hook to use the Theme Context
 * Provides access to current theme state and theme actions
 */
export function useTheme(): ThemeContextState {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}

/**
 * Hook to get current theme mode only
 */
export function useThemeMode(): { themeMode: ThemeMode; setThemeMode: (mode: ThemeMode) => void } {
  const { themeMode, setThemeMode } = useTheme();
  return { themeMode, setThemeMode };
}

/**
 * Hook to get current theme colors only
 */
export function useThemeColors(): ThemeColors {
  const { currentTheme } = useTheme();
  return currentTheme.colors;
}

/**
 * Hook to get theme toggle functionality
 */
export function useThemeToggle(): {
  currentMode: ThemeMode;
  effectiveTheme: ThemeMode;
  toggleTheme: () => void;
  isDark: boolean;
  isLight: boolean;
  isAuto: boolean;
} {
  const { themeMode, toggleTheme, systemTheme } = useTheme();

  const getEffectiveTheme = (): ThemeMode => {
    if (themeMode === 'auto') {
      return systemTheme;
    }
    return themeMode;
  };

  return {
    currentMode: themeMode,
    effectiveTheme: getEffectiveTheme(),
    toggleTheme,
    isDark: getEffectiveTheme() === 'dark',
    isLight: getEffectiveTheme() === 'light',
    isAuto: themeMode === 'auto',
  };
}

/**
 * Hook to check if theme is loading
 */
export function useThemeLoading(): boolean {
  const { isLoading } = useTheme();
  return isLoading;
}

/**
 * Hook for time-based theme settings
 */
export function useTimeBasedThemeSettings(): {
  timeBasedTheme: boolean;
  setTimeBasedTheme: (enabled: boolean) => void;
  currentTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
} {
  const { timeBasedTheme, setTimeBasedTheme, timeOfDay } = useTheme();
  return {
    timeBasedTheme,
    setTimeBasedTheme,
    currentTimeOfDay: timeOfDay,
  };
}

export default useTheme;
