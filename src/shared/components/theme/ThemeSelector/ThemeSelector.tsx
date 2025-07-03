import { motion } from 'framer-motion';
import { useThemeToggle } from '@/shared/hooks/useTheme';
import { useUserPreferences } from '@/shared/hooks/useUserPreferences';
import { useCommonTranslation } from '@/shared/hooks/useTranslation';
import { CheckmarkIcon } from '@/shared/components/common/icons';
import styles from './ThemeSelector.module.css';

interface ThemeOption {
  id: 'light' | 'dark';
  nameKey: string;
  descriptionKey: string;
}

interface ThemeSelectorProps {
  className?: string;
}

const ThemeSelector = ({ className }: ThemeSelectorProps): JSX.Element => {
  const { t } = useCommonTranslation();
  const { currentMode, effectiveTheme, toggleTheme } = useThemeToggle();
  const { updateThemeMode, isLoading } = useUserPreferences();

  const THEME_OPTIONS: ThemeOption[] = [
    {
      id: 'light',
      nameKey: 'settings.themes.lightMode',
      descriptionKey: 'settings.themes.lightDescription',
    },
    {
      id: 'dark',
      nameKey: 'settings.themes.darkMode',
      descriptionKey: 'settings.themes.darkDescription',
    },
  ];

  const handleThemeSelect = async (themeId: 'light' | 'dark'): Promise<void> => {
    if (isLoading) return;

    try {
      // Optimistically update UI first
      toggleTheme();

      // Then sync with backend
      await updateThemeMode(themeId);
    } catch (error) {
      console.error('Failed to update theme:', error);
      // Revert UI change on error by toggling again
      toggleTheme();
    }
  };

  const isSelected = (themeId: 'light' | 'dark'): boolean => {
    if (currentMode === 'auto') {
      return effectiveTheme === themeId;
    }
    return currentMode === themeId;
  };

  const ThemePreview = ({ theme }: { theme: 'light' | 'dark' }): JSX.Element => (
    <div className={`${styles.preview} ${styles[theme]}`}>
      {/* Header */}
      <div className={styles.previewHeader}>
        <div className={styles.previewHeaderContent}>
          <div className={styles.previewLogo} />
          <div className={styles.previewNav}>
            <div className={styles.previewNavItem} />
            <div className={styles.previewNavItem} />
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className={styles.previewSidebar}>
        <div className={styles.previewSidebarItem} />
        <div className={styles.previewSidebarItem} />
        <div className={styles.previewSidebarItem} />
      </div>

      {/* Main Content */}
      <div className={styles.previewMain}>
        <div className={styles.previewCard}>
          <div className={styles.previewCardHeader} />
          <div className={styles.previewCardContent}>
            <div className={styles.previewCardLine} />
            <div className={styles.previewCardLine} />
          </div>
        </div>
        <div className={styles.previewCard}>
          <div className={styles.previewCardHeader} />
          <div className={styles.previewCardContent}>
            <div className={styles.previewCardLine} />
            <div className={styles.previewCardLine} />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`${styles.themeSelector} ${className || ''}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>{t('settings.themes.title')}</h3>
        <p className={styles.subtitle}>{t('settings.themes.description')}</p>
      </div>

      <div className={styles.options}>
        {THEME_OPTIONS.map(option => (
          <motion.button
            key={option.id}
            className={`${styles.themeCard} ${isSelected(option.id) ? styles.selected : ''}`}
            onClick={() => handleThemeSelect(option.id)}
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <div className={styles.previewContainer}>
              <ThemePreview theme={option.id} />

              {/* Selection indicator */}
              {isSelected(option.id) && (
                <motion.div
                  className={styles.selectionIndicator}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <CheckmarkIcon className={styles.checkIcon} />
                </motion.div>
              )}
            </div>

            <div className={styles.themeInfo}>
              <h4 className={styles.themeName}>{t(option.nameKey)}</h4>
              <p className={styles.themeDescription}>{t(option.descriptionKey)}</p>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Auto mode indicator */}
      {currentMode === 'auto' && (
        <div className={styles.autoModeIndicator}>
          <p className={styles.autoModeText}>
            {t('settings.themes.autoModeEnabled', { theme: effectiveTheme })}
          </p>
        </div>
      )}
    </div>
  );
};

export default ThemeSelector;
