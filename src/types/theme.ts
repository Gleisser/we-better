// Theme Types and Configurations

export type ThemeMode = 'light' | 'dark' | 'auto';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

/**
 * Core theme color palette
 */
export interface ThemeColors {
  // Base colors
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    elevated: string;
  };

  // Text colors
  text: {
    primary: string;
    secondary: string;
    muted: string;
    inverse: string;
  };

  // Interactive colors
  interactive: {
    primary: string;
    secondary: string;
    accent: string;
    hover: string;
    active: string;
    disabled: string;
  };

  // Status colors
  status: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };

  // Border and outline colors
  border: {
    primary: string;
    secondary: string;
    muted: string;
    focus: string;
  };

  // Overlay colors
  overlay: {
    backdrop: string;
    modal: string;
    tooltip: string;
  };
}

/**
 * Theme shadows and elevations
 */
export interface ThemeShadows {
  none: string;
  small: string;
  medium: string;
  large: string;
  xlarge: string;
  inner: string;
}

/**
 * Theme gradients
 */
export interface ThemeGradients {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
}

/**
 * Complete theme configuration
 */
export interface ThemeConfig {
  mode: ThemeMode;
  colors: ThemeColors;
  shadows: ThemeShadows;
  gradients: ThemeGradients;
  cssVariables: Record<string, string>;
}

/**
 * Theme context state
 */
export interface ThemeContextState {
  // Current theme settings
  currentTheme: ThemeConfig;
  themeMode: ThemeMode;
  timeBasedTheme: boolean;

  // System detection
  systemTheme: 'light' | 'dark';
  timeOfDay: TimeOfDay;

  // State management
  isLoading: boolean;

  // Actions
  setThemeMode: (mode: ThemeMode) => void;
  setTimeBasedTheme: (enabled: boolean) => void;
  toggleTheme: () => void;
}

/**
 * Time-based theme colors (for use with time-based theming)
 */
export interface TimeBasedThemeColors {
  gradientStart: string;
  gradientMiddle: string;
  gradientEnd: string;
  accentRGB: string;
}

// Light Theme Configuration
export const LIGHT_THEME: ThemeConfig = {
  mode: 'light',
  colors: {
    background: {
      primary: '#ffffff',
      secondary: '#f8f9fa',
      tertiary: '#f1f3f4',
      elevated: '#ffffff',
    },
    text: {
      primary: '#1a1a1a',
      secondary: '#5f6368',
      muted: '#9aa0a6',
      inverse: '#ffffff',
    },
    interactive: {
      primary: '#8B5CF6',
      secondary: '#D946EF',
      accent: '#06B6D4',
      hover: '#7C3AED',
      active: '#6D28D9',
      disabled: '#D1D5DB',
    },
    status: {
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
    },
    border: {
      primary: '#e2e8f0',
      secondary: '#cbd5e1',
      muted: '#f1f5f9',
      focus: '#8B5CF6',
    },
    overlay: {
      backdrop: 'rgba(0, 0, 0, 0.5)',
      modal: 'rgba(255, 255, 255, 0.95)',
      tooltip: 'rgba(0, 0, 0, 0.9)',
    },
  },
  shadows: {
    none: 'none',
    small: '0 1px 2px rgba(0, 0, 0, 0.05)',
    medium: '0 4px 12px rgba(0, 0, 0, 0.1)',
    large: '0 8px 32px rgba(0, 0, 0, 0.15)',
    xlarge: '0 20px 60px rgba(0, 0, 0, 0.2)',
    inner: 'inset 0 1px 1px rgba(0, 0, 0, 0.05)',
  },
  gradients: {
    primary: 'linear-gradient(135deg, #8B5CF6 0%, #D946EF 100%)',
    secondary: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
    accent: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
    background: 'linear-gradient(to bottom, #ffffff, #f8f9fa)',
    surface: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(248, 249, 250, 0.9))',
  },
  cssVariables: {},
};

// Dark Theme Configuration
export const DARK_THEME: ThemeConfig = {
  mode: 'dark',
  colors: {
    background: {
      primary: '#0a0a0a',
      secondary: '#1a1a1a',
      tertiary: '#262626',
      elevated: '#1f1f1f',
    },
    text: {
      primary: '#ffffff',
      secondary: '#cccccc',
      muted: '#999999',
      inverse: '#000000',
    },
    interactive: {
      primary: '#8B5CF6',
      secondary: '#D946EF',
      accent: '#06B6D4',
      hover: '#9F7AEA',
      active: '#B794F6',
      disabled: '#4A5568',
    },
    status: {
      success: '#34D399',
      warning: '#FBBF24',
      error: '#F87171',
      info: '#60A5FA',
    },
    border: {
      primary: 'rgba(255, 255, 255, 0.1)',
      secondary: 'rgba(255, 255, 255, 0.08)',
      muted: 'rgba(255, 255, 255, 0.05)',
      focus: '#8B5CF6',
    },
    overlay: {
      backdrop: 'rgba(0, 0, 0, 0.8)',
      modal: 'rgba(26, 26, 26, 0.95)',
      tooltip: 'rgba(255, 255, 255, 0.9)',
    },
  },
  shadows: {
    none: 'none',
    small: '0 1px 2px rgba(0, 0, 0, 0.3)',
    medium: '0 4px 12px rgba(0, 0, 0, 0.4)',
    large: '0 8px 32px rgba(0, 0, 0, 0.5)',
    xlarge: '0 20px 60px rgba(0, 0, 0, 0.6)',
    inner: 'inset 0 1px 1px rgba(255, 255, 255, 0.05)',
  },
  gradients: {
    primary: 'linear-gradient(135deg, #8B5CF6 0%, #D946EF 100%)',
    secondary: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
    accent: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
    background: 'linear-gradient(to bottom, #0a0a0a, #1a1a1a)',
    surface: 'linear-gradient(135deg, rgba(26, 26, 26, 0.9), rgba(38, 38, 38, 0.9))',
  },
  cssVariables: {},
};

// Time-based themes (for integration with existing useTimeBasedTheme)
export const TIME_BASED_THEMES: Record<TimeOfDay, TimeBasedThemeColors> = {
  morning: {
    gradientStart: 'rgba(30, 30, 40, 0.95)',
    gradientMiddle: 'rgba(40, 40, 60, 0.95)',
    gradientEnd: 'rgba(30, 30, 40, 0.95)',
    accentRGB: '255, 170, 100', // Warm morning glow
  },
  afternoon: {
    gradientStart: 'rgba(20, 20, 30, 0.95)',
    gradientMiddle: 'rgba(30, 30, 45, 0.95)',
    gradientEnd: 'rgba(20, 20, 30, 0.95)',
    accentRGB: '150, 200, 255', // Bright blue sky
  },
  evening: {
    gradientStart: 'rgba(25, 20, 35, 0.95)',
    gradientMiddle: 'rgba(35, 30, 50, 0.95)',
    gradientEnd: 'rgba(25, 20, 35, 0.95)',
    accentRGB: '255, 130, 150', // Sunset pink
  },
  night: {
    gradientStart: 'rgba(10, 10, 20, 0.95)',
    gradientMiddle: 'rgba(20, 20, 35, 0.95)',
    gradientEnd: 'rgba(10, 10, 20, 0.95)',
    accentRGB: '130, 150, 255', // Deep night blue
  },
};

/**
 * Generate CSS variables from theme configuration
 */
export function generateCSSVariables(theme: ThemeConfig): Record<string, string> {
  const variables: Record<string, string> = {};

  // Background variables
  variables['--theme-bg-primary'] = theme.colors.background.primary;
  variables['--theme-bg-secondary'] = theme.colors.background.secondary;
  variables['--theme-bg-tertiary'] = theme.colors.background.tertiary;
  variables['--theme-bg-elevated'] = theme.colors.background.elevated;

  // Text variables
  variables['--theme-text-primary'] = theme.colors.text.primary;
  variables['--theme-text-secondary'] = theme.colors.text.secondary;
  variables['--theme-text-muted'] = theme.colors.text.muted;
  variables['--theme-text-inverse'] = theme.colors.text.inverse;

  // Interactive variables
  variables['--theme-interactive-primary'] = theme.colors.interactive.primary;
  variables['--theme-interactive-secondary'] = theme.colors.interactive.secondary;
  variables['--theme-interactive-accent'] = theme.colors.interactive.accent;
  variables['--theme-interactive-hover'] = theme.colors.interactive.hover;
  variables['--theme-interactive-active'] = theme.colors.interactive.active;
  variables['--theme-interactive-disabled'] = theme.colors.interactive.disabled;

  // Status variables
  variables['--theme-status-success'] = theme.colors.status.success;
  variables['--theme-status-warning'] = theme.colors.status.warning;
  variables['--theme-status-error'] = theme.colors.status.error;
  variables['--theme-status-info'] = theme.colors.status.info;

  // Border variables
  variables['--theme-border-primary'] = theme.colors.border.primary;
  variables['--theme-border-secondary'] = theme.colors.border.secondary;
  variables['--theme-border-muted'] = theme.colors.border.muted;
  variables['--theme-border-focus'] = theme.colors.border.focus;

  // Shadow variables
  variables['--theme-shadow-small'] = theme.shadows.small;
  variables['--theme-shadow-medium'] = theme.shadows.medium;
  variables['--theme-shadow-large'] = theme.shadows.large;
  variables['--theme-shadow-xlarge'] = theme.shadows.xlarge;
  variables['--theme-shadow-inner'] = theme.shadows.inner;

  // Gradient variables
  variables['--theme-gradient-primary'] = theme.gradients.primary;
  variables['--theme-gradient-secondary'] = theme.gradients.secondary;
  variables['--theme-gradient-accent'] = theme.gradients.accent;
  variables['--theme-gradient-background'] = theme.gradients.background;
  variables['--theme-gradient-surface'] = theme.gradients.surface;

  return variables;
}

/**
 * Apply CSS variables to document root
 */
export function applyCSSVariables(variables: Record<string, string>): void {
  const root = document.documentElement;
  Object.entries(variables).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
}

/**
 * Get theme configuration based on mode and time
 */
export function getThemeConfig(mode: ThemeMode, timeOfDay?: TimeOfDay): ThemeConfig {
  let baseTheme: ThemeConfig;

  if (mode === 'auto') {
    // Detect system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    baseTheme = prefersDark ? DARK_THEME : LIGHT_THEME;
  } else {
    baseTheme = mode === 'dark' ? DARK_THEME : LIGHT_THEME;
  }

  // If time-based theming is enabled and timeOfDay is provided,
  // merge time-based colors
  if (timeOfDay) {
    const timeTheme = TIME_BASED_THEMES[timeOfDay];
    baseTheme = {
      ...baseTheme,
      gradients: {
        ...baseTheme.gradients,
        background: `linear-gradient(135deg, ${timeTheme.gradientStart} 0%, ${timeTheme.gradientMiddle} 50%, ${timeTheme.gradientEnd} 100%)`,
      },
    };
  }

  // Generate CSS variables
  baseTheme.cssVariables = generateCSSVariables(baseTheme);

  return baseTheme;
}
