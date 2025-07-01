import { motion } from 'framer-motion';
import { useThemeToggle } from '@/shared/hooks/useTheme';
import { useUserPreferences } from '@/shared/hooks/useUserPreferences';
import { CheckmarkIcon } from '@/shared/components/common/icons';
import styles from './ThemeSelector.module.css';

interface ThemeOption {
  id: 'light' | 'dark';
  name: string;
  description: string;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'light',
    name: 'Light Mode',
    description: 'Clean and bright interface',
  },
  {
    id: 'dark',
    name: 'Dark Mode',
    description: 'Easy on the eyes',
  },
];

interface ThemeSelectorProps {
  className?: string;
}

const ThemeSelector = ({ className }: ThemeSelectorProps): JSX.Element => {
  const { currentMode, effectiveTheme } = useThemeToggle();
  const { updateThemeMode, isLoading } = useUserPreferences();

  const handleThemeSelect = async (themeId: 'light' | 'dark'): Promise<void> => {
    if (isLoading) return;

    try {
      await updateThemeMode(themeId);
    } catch (error) {
      console.error('Failed to update theme:', error);
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
        <h3 className={styles.title}>Themes</h3>
        <p className={styles.subtitle}>Choose your style or customize your theme</p>
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
              <h4 className={styles.themeName}>{option.name}</h4>
              <p className={styles.themeDescription}>{option.description}</p>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Auto mode indicator */}
      {currentMode === 'auto' && (
        <div className={styles.autoModeIndicator}>
          <p className={styles.autoModeText}>
            Auto mode is enabled - currently using {effectiveTheme} theme based on system preference
          </p>
        </div>
      )}
    </div>
  );
};

export default ThemeSelector;
