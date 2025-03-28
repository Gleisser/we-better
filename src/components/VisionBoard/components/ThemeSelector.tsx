import React from 'react';
import { themes, Theme } from '../constants/themes';
import styles from '../VisionBoard.module.css';

interface ThemeSelectorProps {
  currentThemeId: string;
  onThemeChange: (themeId: string) => void;
  visible: boolean;
  onClose: () => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentThemeId,
  onThemeChange,
  visible,
  onClose
}) => {
  if (!visible) return null;
  
  return (
    <div className={styles.themeSelectorOverlay} onClick={onClose}>
      <div className={styles.themeSelector} onClick={e => e.stopPropagation()}>
        <div className={styles.themeSelectorHeader}>
          <h3>Choose a Theme</h3>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <div className={styles.themeSelectorContent}>
          {themes.map((theme: Theme) => (
            <div 
              key={theme.id}
              className={`${styles.themeOption} ${theme.id === currentThemeId ? styles.selected : ''}`}
              onClick={() => onThemeChange(theme.id)}
            >
              <div 
                className={styles.themePreview}
                style={{ background: theme.backgroundGradient }}
              >
                <div 
                  className={styles.themePreviewAccent}
                  style={{ background: theme.accentColor }}
                />
              </div>
              <div className={styles.themeName}>{theme.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 