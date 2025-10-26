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
        type="button"
        className={`${styles.themeToggle} ${isDark ? styles.themeToggleDark : ''}`}
        onClick={handleThemeToggle}
        disabled={preferencesLoading}
        aria-label={t('header.toggleTheme') as string}
        title={`Current: ${currentMode} (${effectiveTheme})`}
      >
        <svg
          viewBox="0 0 69.667 44"
          className={styles.toggleSvg}
          role="presentation"
          focusable="false"
        >
          <g transform="translate(4 4)">
            <rect className={styles.toggleTrack} width="60.667" height="35" rx="17.5" />
            <g className={styles.toggleButton}>
              <g className={styles.sun}>
                <circle className={styles.sunOuter} cx="15.167" cy="15.167" r="15.167" />
                <path
                  className={styles.sunHalo}
                  d="M11.667 0A11.667 11.667 0 1023.334 11.667 11.667 11.667 0 0011.667 0z"
                  transform="translate(3.5 3.5)"
                />
                <circle className={styles.sunInner} cx="19.834" cy="19.834" r="7" />
              </g>

              <g className={styles.moon}>
                <circle className={styles.moonBody} cx="15.167" cy="15.167" r="15.167" />
                <g className={styles.moonPatches} transform="translate(8 2)">
                  <circle cx="18" cy="4.5" r="2" />
                  <circle cx="14.3" cy="18" r="2" />
                  <circle cx="8" cy="8" r="1" />
                  <circle cx="26" cy="19" r="1" />
                  <circle cx="8" cy="22.5" r="1" />
                  <circle cx="24" cy="11.5" r="1.5" />
                </g>
              </g>
            </g>

            <path
              className={styles.cloud}
              d="M44.31 13.375a3.3 3.3 0 011.658.46.7.7 0 01.533-.95 3.589 3.589 0 011.944.384c.025.014-.371-1.456.208-2.009a1.565 1.565 0 012.093-.203 1.346 1.346 0 01.632 1.374c.047.027 1.92-.036 2.434.942s-.641 1.885-.6 1.946a9.03 9.03 0 011.689.661c.41.332.819 1.476-1.2 2.17a5.744 5.744 0 01-2.787-.222c-.948-.365-.875-1.965-.843-1.946s-1.05 1.632-1.944 1.632a3.09 3.09 0 01-1.774-.894 2.836 2.836 0 01-2.053.571c-2.542-.341-1.731-2.42-1.632-2.63a2.758 2.758 0 012.19-1.044z"
              transform="translate(2 4)"
            />

            <g className={styles.stars} transform="translate(8 2)">
              <path d="M.774 0L.566.559 0 .539l.458.394L.25 1.492l.485-.361.458.394L1.024.953l.485-.361-.566-.02z" />
              <path
                d="M1.341.529L.836.472.736 0 .505.46 0 .4l.4.329-.231.46L.605.932l.4.326L.9.786z"
                transform="translate(10 5)"
              />
              <path
                d="M.015 1.065L.475.9l.285.365L.766.772l.46-.164L.745.494.751 0 .481.407 0 .293.285.658z"
                transform="translate(6 20)"
              />
              <path
                d="M1.161 1.6L1.059 1 1.574.722.962.607.86 0 .613.572 0 .457.446.881.2 1.454l.516-.274z"
                transform="translate(16 8)"
              />
              <path
                d="M.873 1.648l.114-.62L1.579.945 1.03.62l.114-.62-.438.464L.157.139l.281.561L0 1.167l.592-.083z"
                transform="translate(20 15)"
              />
              <path
                d="M.593 0l.045.724L0 .982l.7.211.045.724.36-.64.7.211L1.342.935 1.7.294 1.063.552z"
                transform="translate(0 14)"
              />
            </g>
          </g>
        </svg>

        {preferencesLoading && (
          <div className={styles.themeToggleLoading}>
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
