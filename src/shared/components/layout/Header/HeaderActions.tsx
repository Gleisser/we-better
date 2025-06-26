import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BellIcon } from '@/shared/components/common/icons';
import NotificationsPopup from '../NotificationsPopup/NotificationsPopup';
import type { NotificationItem } from '../NotificationsPopup/NotificationsPopup';
import { MobileNotifications } from '../NotificationsPanel/MobileNotifications';
import ProfileMenu from './ProfileMenu/ProfileMenu';
import { useHeader } from '@/shared/hooks/useHeader';
import LanguageSwitcher from '@/shared/components/i18n/LanguageSwitcher';
import { useCommonTranslation } from '@/shared/hooks/useTranslation';
import { useThemeToggle } from '@/shared/hooks/useTheme';
import { useUserPreferences } from '@/shared/hooks/useUserPreferences';
import styles from './HeaderActions.module.css';

const HeaderActions = (): JSX.Element => {
  const { t } = useCommonTranslation();
  const [notificationCount] = useState(10);
  const { activePopup, setActivePopup } = useHeader();
  const [isMobile, setIsMobile] = useState(false);

  // Theme functionality
  const { currentMode, effectiveTheme, toggleTheme, isDark } = useThemeToggle();
  const { updateThemeMode, isLoading: preferencesLoading } = useUserPreferences();

  // Handle theme toggle with backend sync
  const handleThemeToggle = async (): Promise<void> => {
    // Optimistically update UI
    toggleTheme();

    // Sync with backend
    try {
      let newMode: 'light' | 'dark' | 'auto';

      if (currentMode === 'auto') {
        // If auto, switch to opposite of current effective theme
        newMode = effectiveTheme === 'dark' ? 'light' : 'dark';
      } else if (currentMode === 'light') {
        newMode = 'dark';
      } else {
        newMode = 'light';
      }

      await updateThemeMode(newMode);
    } catch (error) {
      console.error('Failed to sync theme preference:', error);
      // The UI will still work with localStorage fallback
    }
  };

  // Mock notifications data with undefined images to trigger initials fallback
  const notifications: NotificationItem[] = [
    {
      id: '1',
      type: 'reply',
      user: {
        name: 'Tommy Lee',
        image: '/placeholder.jpg',
        isOnline: true,
      },
      content: 'replied to you in',
      target: 'Generic File',
      timestamp: '7 November 2023 • 12:35 AM',
      isRead: false,
    },
    {
      id: '2',
      type: 'follow',
      user: {
        name: 'Jennifer Lee',
        image: '/placeholder.jpg',
        isOnline: true,
      },
      content: 'followed you',
      timestamp: '6 November 2023 • 9:12 PM',
      isRead: false,
    },
    {
      id: '3',
      type: 'task',
      user: {
        name: 'Eve Monroe',
        image: '/placeholder.jpg',
        isOnline: false,
      },
      content: 'assigned a task to you',
      target: '#JP-2137',
      timestamp: '6 November 2023 • 8:56 PM',
      isRead: false,
    },
  ];

  // Check if mobile
  useEffect(() => {
    const checkIfMobile = (): void => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Close popups when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent): void => {
      const target = e.target as HTMLElement;
      if (!target.closest(`.${styles.actionsContainer}`)) {
        setActivePopup(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setActivePopup]);

  return (
    <div className={styles.actionsContainer}>
      {/* Language Switcher */}
      <LanguageSwitcher variant="buttons" className={styles.languageSwitcher} />

      {/* Theme Toggle */}
      <button
        className={styles.themeToggle}
        onClick={handleThemeToggle}
        disabled={preferencesLoading}
        aria-label={t('header.toggleTheme') as string}
        title={`Current: ${currentMode} (${effectiveTheme})`}
      >
        {isDark ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={styles.themeIcon}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={styles.themeIcon}>
            <circle cx="12" cy="12" r="5" />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 1v2m0 16v2m9-9h-2M4 12H2m15.364 6.364l-1.414-1.414M6.343 6.343L4.929 4.929m12.728 0l-1.414 1.414M6.343 17.657l-1.414 1.414"
            />
          </svg>
        )}

        {/* Loading indicator */}
        {preferencesLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-theme-bg-elevated/80 rounded-xl">
            <div className="w-3 h-3 border border-theme-interactive-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </button>

      {/* Notifications */}
      <div className={styles.notificationContainer}>
        <button
          className={styles.notificationButton}
          aria-label={t('header.notifications') as string}
          onClick={() => setActivePopup(activePopup === 'notifications' ? null : 'notifications')}
        >
          <BellIcon className={styles.notificationIcon} />
          {notificationCount > 0 && (
            <motion.span
              className={styles.notificationBadge}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            >
              {notificationCount}
            </motion.span>
          )}
        </button>

        {/* Desktop Notifications */}
        {!isMobile && activePopup === 'notifications' && (
          <NotificationsPopup onClose={() => setActivePopup(null)} />
        )}
      </div>

      {/* Mobile Notifications - Render outside the notification container */}
      {isMobile && activePopup === 'notifications' && (
        <MobileNotifications
          isOpen={true}
          onClose={() => setActivePopup(null)}
          notifications={notifications}
        />
      )}

      {/* Profile */}
      <div className={styles.profileContainer}>
        <button
          className={styles.profileButton}
          onClick={() => setActivePopup(activePopup === 'profile' ? null : 'profile')}
          aria-expanded={activePopup === 'profile'}
          aria-haspopup="true"
        >
          <div className={styles.profileFallback}>
            <span>GS</span>
          </div>
          <div className={styles.profileStatus} />
        </button>

        <AnimatePresence>
          {activePopup === 'profile' && <ProfileMenu onClose={() => setActivePopup(null)} />}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default HeaderActions;
