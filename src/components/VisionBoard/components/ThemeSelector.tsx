import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { themes } from '../constants/themes';
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
    <AnimatePresence>
      {visible && (
        <motion.div
          className={styles.themeSelectorOverlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={styles.themeSelector}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.themeSelectorHeader}>
              <h3>Choose a Theme</h3>
              <button 
                className={styles.closeButton}
                onClick={onClose}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            
            <div className={styles.themeSelectorContent}>
              {themes.map(theme => (
                <div
                  key={theme.id}
                  className={`${styles.themeOption} ${theme.id === currentThemeId ? styles.selected : ''}`}
                  onClick={() => {
                    onThemeChange(theme.id);
                  }}
                >
                  <div 
                    className={styles.themePreview}
                    style={{ 
                      background: theme.backgroundGradient,
                      fontFamily: theme.fontFamily,
                      color: theme.isDark ? '#ffffff' : '#000000',
                      border: theme.id === currentThemeId ? `2px solid ${theme.accentColor}` : 'none'
                    }}
                  >
                    <div 
                      className={styles.themePreviewAccent}
                      style={{ backgroundColor: theme.accentColor }}
                    ></div>
                  </div>
                  <div className={styles.themeName}>{theme.name}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 