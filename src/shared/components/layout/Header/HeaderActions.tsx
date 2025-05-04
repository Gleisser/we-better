import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BellIcon } from '@/shared/components/common/icons';
import NotificationsPopup from '../NotificationsPopup/NotificationsPopup';
import type { NotificationItem } from '../NotificationsPopup/NotificationsPopup';
import { MobileNotifications } from '../NotificationsPanel/MobileNotifications';
import ProfileMenu from './ProfileMenu/ProfileMenu';
import { useHeader } from '@/shared/contexts/HeaderContext';
import styles from './HeaderActions.module.css';

const HeaderActions = (): JSX.Element => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationCount] = useState(10);
  const { activePopup, setActivePopup } = useHeader();
  const [isMobile, setIsMobile] = useState(false);

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
      {/* Theme Toggle */}
      <button
        className={styles.themeToggle}
        onClick={() => setIsDarkMode(!isDarkMode)}
        aria-label="Toggle theme"
      >
        {isDarkMode ? (
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
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707"
            />
          </svg>
        )}
      </button>

      {/* Notifications */}
      <div className={styles.notificationContainer}>
        <button
          className={styles.notificationButton}
          aria-label="Notifications"
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
