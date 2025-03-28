export interface Theme {
  id: string;
  name: string;
  backgroundGradient: string;
  accentColor: string;
  fontFamily: string;
  isDark: boolean;
}

export const themes: Theme[] = [
  {
    id: 'light',
    name: 'Light',
    backgroundGradient: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
    accentColor: '#0066ff',
    fontFamily: 'Arial, sans-serif',
    isDark: false
  },
  {
    id: 'dark',
    name: 'Dark',
    backgroundGradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    accentColor: '#4e9eff',
    fontFamily: 'Arial, sans-serif',
    isDark: true
  },
  {
    id: 'nature',
    name: 'Nature',
    backgroundGradient: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
    accentColor: '#43a047',
    fontFamily: 'Georgia, serif',
    isDark: false
  },
  {
    id: 'ocean',
    name: 'Ocean',
    backgroundGradient: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
    accentColor: '#1976d2',
    fontFamily: 'Tahoma, sans-serif',
    isDark: false
  },
  {
    id: 'sunset',
    name: 'Sunset',
    backgroundGradient: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)',
    accentColor: '#e91e63',
    fontFamily: 'Verdana, sans-serif',
    isDark: false
  },
  {
    id: 'minimal',
    name: 'Minimal',
    backgroundGradient: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
    accentColor: '#424242',
    fontFamily: 'Helvetica, sans-serif',
    isDark: false
  },
  {
    id: 'cosmic',
    name: 'Cosmic',
    backgroundGradient: 'linear-gradient(135deg, #311b92 0%, #4527a0 100%)',
    accentColor: '#7c4dff',
    fontFamily: 'Roboto, sans-serif',
    isDark: true
  },
  {
    id: 'forest',
    name: 'Forest',
    backgroundGradient: 'linear-gradient(135deg, #2e7d32 0%, #388e3c 100%)',
    accentColor: '#81c784',
    fontFamily: 'Cambria, serif',
    isDark: true
  }
];

export const DEFAULT_VISION_BOARD_THEME_ID = 'minimal'; 