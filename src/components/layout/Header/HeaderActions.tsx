import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SettingsIcon, LogoutIcon } from '@/components/common/icons';
import NotificationsPopup from '../NotificationsPopup/NotificationsPopup';
import ProfileMenu from './ProfileMenu/ProfileMenu';
import { useHeader } from '@/contexts/HeaderContext';
import styles from './HeaderActions.module.css';

const HeaderActions = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationCount] = useState(10);
  const { activePopup, setActivePopup } = useHeader();

  // Close popups when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
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
          <svg 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            className={styles.themeIcon}
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" 
            />
          </svg>
        ) : (
          <svg 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            className={styles.themeIcon}
          >
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
          <svg 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            className={styles.notificationIcon}
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
            />
          </svg>
          {notificationCount > 0 && (
            <motion.span 
              className={styles.notificationBadge}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
            >
              {notificationCount}
            </motion.span>
          )}
        </button>

        <AnimatePresence>
          {activePopup === 'notifications' && (
            <NotificationsPopup onClose={() => setActivePopup(null)} />
          )}
        </AnimatePresence>
      </div>

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
          {activePopup === 'profile' && (
            <ProfileMenu onClose={() => setActivePopup(null)} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default HeaderActions; 