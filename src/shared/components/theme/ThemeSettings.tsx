import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeToggle, useTimeBasedThemeSettings } from '@/shared/hooks/useTheme';
import { useUserPreferences } from '@/shared/hooks/useUserPreferences';
import styles from './ThemeSettings.module.css';

interface ThemeSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const ThemeSettings: React.FC<ThemeSettingsProps> = ({ isOpen, onClose }) => {
  const { currentMode, effectiveTheme, isDark } = useThemeToggle();
  const { timeBasedTheme: timeBasedEnabled, currentTimeOfDay } = useTimeBasedThemeSettings();
  const { preferences, updateThemeMode, updateTimeBasedTheme, updatePreferences, isLoading } =
    useUserPreferences();

  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<'light' | 'dark' | 'auto'>('light');

  /**
   * Handle theme mode change
   */
  const handleThemeModeChange = async (mode: 'light' | 'dark' | 'auto'): Promise<void> => {
    try {
      await updateThemeMode(mode);
    } catch (error) {
      console.error('Failed to update theme mode:', error);
    }
  };

  /**
   * Handle time-based theme toggle
   */
  const handleTimeBasedThemeToggle = async (): Promise<void> => {
    try {
      await updateTimeBasedTheme(!timeBasedEnabled);
    } catch (error) {
      console.error('Failed to update time-based theme:', error);
    }
  };

  /**
   * Handle accessibility settings
   */
  const handleAccessibilityChange = async (
    setting: 'reduced_motion' | 'high_contrast',
    value: boolean
  ): Promise<void> => {
    try {
      await updatePreferences({ [setting]: value });
    } catch (error) {
      console.error('Failed to update accessibility setting:', error);
    }
  };

  /**
   * Preview theme functionality
   */
  const startPreview = (theme: 'light' | 'dark' | 'auto'): void => {
    setIsPreviewMode(true);
    setPreviewTheme(theme);
    // Apply preview theme to document
    document.documentElement.setAttribute('data-theme-preview', theme);
  };

  const stopPreview = (): void => {
    setIsPreviewMode(false);
    // Remove preview theme
    document.documentElement.removeAttribute('data-theme-preview');
  };

  const applyPreview = async (): Promise<void> => {
    await handleThemeModeChange(previewTheme);
    stopPreview();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Settings Panel */}
          <motion.div
            className={styles.panel}
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className={styles.header}>
              <h2 className={styles.title}>Theme Settings</h2>
              <button className={styles.closeButton} onClick={onClose} aria-label="Close">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className={styles.content}>
              {/* Current Theme Status */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Current Theme</h3>
                <div className={styles.statusCard}>
                  <div className={styles.statusInfo}>
                    <div className={styles.currentTheme}>
                      <span className={styles.themeMode}>{currentMode}</span>
                      {currentMode === 'auto' && (
                        <span className={styles.effectiveTheme}>({effectiveTheme})</span>
                      )}
                    </div>
                    {timeBasedEnabled && (
                      <div className={styles.timeOfDay}>Current time: {currentTimeOfDay}</div>
                    )}
                  </div>
                  <div className={styles.themePreview}>
                    <div
                      className={`${styles.previewCircle} ${isDark ? styles.dark : styles.light}`}
                    />
                  </div>
                </div>
              </div>

              {/* Theme Mode Selection */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Theme Mode</h3>
                <div className={styles.themeOptions}>
                  {(['light', 'dark', 'auto'] as const).map(mode => (
                    <motion.button
                      key={mode}
                      className={`${styles.themeOption} ${currentMode === mode ? styles.active : ''}`}
                      onClick={() => handleThemeModeChange(mode)}
                      disabled={isLoading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className={styles.optionIcon}>
                        {mode === 'light' && (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <circle cx="12" cy="12" r="5" />
                            <path d="M12 1v2m0 16v2m9-9h-2M4 12H2m15.364 6.364l-1.414-1.414M6.343 6.343L4.929 4.929m12.728 0l-1.414 1.414M6.343 17.657l-1.414 1.414" />
                          </svg>
                        )}
                        {mode === 'dark' && (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                          </svg>
                        )}
                        {mode === 'auto' && (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <circle cx="12" cy="12" r="3" />
                            <path d="M12 1v6m0 10v6M4.22 4.22l4.24 4.24m7.08 7.08l4.24 4.24M1 12h6m10 0h6M4.22 19.78l4.24-4.24m7.08-7.08l4.24-4.24" />
                          </svg>
                        )}
                      </div>
                      <div className={styles.optionContent}>
                        <div className={styles.optionName}>
                          {mode.charAt(0).toUpperCase() + mode.slice(1)}
                        </div>
                        <div className={styles.optionDescription}>
                          {mode === 'light' && 'Always light theme'}
                          {mode === 'dark' && 'Always dark theme'}
                          {mode === 'auto' && 'Follow system preference'}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Time-Based Theme */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Time-Based Theme</h3>
                <div className={styles.toggleSection}>
                  <div className={styles.toggleInfo}>
                    <div className={styles.toggleLabel}>Automatic time-based switching</div>
                    <div className={styles.toggleDescription}>
                      Changes theme based on time of day when in auto mode
                    </div>
                  </div>
                  <motion.button
                    className={`${styles.toggle} ${timeBasedEnabled ? styles.enabled : ''}`}
                    onClick={handleTimeBasedThemeToggle}
                    disabled={isLoading}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className={styles.toggleSlider} />
                  </motion.button>
                </div>

                {timeBasedEnabled && (
                  <motion.div
                    className={styles.timeBasedInfo}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <div className={styles.timeSchedule}>
                      <div className={styles.timeSlot}>
                        <span className={styles.timeRange}>6:00 - 16:59</span>
                        <span className={styles.themeType}>Light theme</span>
                      </div>
                      <div className={styles.timeSlot}>
                        <span className={styles.timeRange}>17:00 - 5:59</span>
                        <span className={styles.themeType}>Dark theme</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Accessibility Options */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Accessibility</h3>

                <div className={styles.toggleSection}>
                  <div className={styles.toggleInfo}>
                    <div className={styles.toggleLabel}>Reduced motion</div>
                    <div className={styles.toggleDescription}>
                      Minimize animations and transitions
                    </div>
                  </div>
                  <motion.button
                    className={`${styles.toggle} ${preferences?.reduced_motion ? styles.enabled : ''}`}
                    onClick={() =>
                      handleAccessibilityChange('reduced_motion', !preferences?.reduced_motion)
                    }
                    disabled={isLoading}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className={styles.toggleSlider} />
                  </motion.button>
                </div>

                <div className={styles.toggleSection}>
                  <div className={styles.toggleInfo}>
                    <div className={styles.toggleLabel}>High contrast</div>
                    <div className={styles.toggleDescription}>
                      Increase contrast for better visibility
                    </div>
                  </div>
                  <motion.button
                    className={`${styles.toggle} ${preferences?.high_contrast ? styles.enabled : ''}`}
                    onClick={() =>
                      handleAccessibilityChange('high_contrast', !preferences?.high_contrast)
                    }
                    disabled={isLoading}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className={styles.toggleSlider} />
                  </motion.button>
                </div>
              </div>

              {/* Theme Preview */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Theme Preview</h3>
                <div className={styles.previewControls}>
                  {(['light', 'dark', 'auto'] as const).map(theme => (
                    <button
                      key={theme}
                      className={`${styles.previewButton} ${isPreviewMode && previewTheme === theme ? styles.active : ''}`}
                      onMouseEnter={() => startPreview(theme)}
                      onMouseLeave={stopPreview}
                      onClick={() => applyPreview()}
                    >
                      Preview {theme}
                    </button>
                  ))}
                </div>
                {isPreviewMode && (
                  <motion.div
                    className={styles.previewNotice}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    Previewing {previewTheme} theme - Click to apply
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ThemeSettings;
