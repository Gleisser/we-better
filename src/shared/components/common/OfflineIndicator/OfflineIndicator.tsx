import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNetworkStatus } from '@/shared/hooks/useNetworkStatus';
import styles from './OfflineIndicator.module.css';

// Icons for different network states
const NetworkIcons = {
  offline: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M8 0C3.6 0 0 3.6 0 8C0 12.4 3.6 16 8 16C12.4 16 16 12.4 16 8C16 3.6 12.4 0 8 0ZM8 14C4.7 14 2 11.3 2 8C2 4.7 4.7 2 8 2C11.3 2 14 4.7 14 8C14 11.3 11.3 14 8 14Z" />
      <path d="M10.5 4L8 6.5L5.5 4L4 5.5L6.5 8L4 10.5L5.5 12L8 9.5L10.5 12L12 10.5L9.5 8L12 5.5L10.5 4Z" />
    </svg>
  ),
  poor: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M8 0C3.6 0 0 3.6 0 8C0 12.4 3.6 16 8 16C12.4 16 16 12.4 16 8C16 3.6 12.4 0 8 0ZM8 14C4.7 14 2 11.3 2 8C2 4.7 4.7 2 8 2C11.3 2 14 4.7 14 8C14 11.3 11.3 14 8 14Z" />
      <path d="M7 11H9V13H7V11Z" />
      <path d="M7 3H9V9H7V3Z" />
    </svg>
  ),
  reconnecting: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M8 0C3.6 0 0 3.6 0 8C0 12.4 3.6 16 8 16C12.4 16 16 12.4 16 8C16 3.6 12.4 0 8 0ZM13.9 7H11.9C11.7 5 10.3 3.5 8.5 3.1V7H7.5V3.1C5.6 3.5 4.3 5 4.1 7H2.1C2.4 4.2 4.9 2 8 2C11.1 2 13.6 4.2 13.9 7ZM8 14C4.9 14 2.4 11.8 2.1 9H4.1C4.3 11 5.6 12.5 7.5 12.9V9H8.5V12.9C10.3 12.5 11.7 11 11.9 9H13.9C13.6 11.8 11.1 14 8 14Z" />
    </svg>
  ),
};

// Messages for different connection states
const ConnectionMessages = {
  offline: 'You are offline. Changes will sync when your connection returns.',
  poor: 'Your connection is slow. Some features may be limited.',
  fair: 'Your connection is unstable.',
  reconnecting: 'Connection restored. Syncing changes...',
  good: '',
};

export interface OfflineIndicatorProps {
  showOnGoodConnection?: boolean;
  autoHideDelay?: number; // in milliseconds
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  showOnGoodConnection = false,
  autoHideDelay = 5000,
}) => {
  const { status, quality, reconnecting } = useNetworkStatus();
  const [visible, setVisible] = useState(false);

  // Determine what state to show
  let currentState: 'offline' | 'poor' | 'fair' | 'reconnecting' | 'good' = 'good';

  if (!status.isOnline) {
    currentState = 'offline';
  } else if (reconnecting) {
    currentState = 'reconnecting';
  } else if (quality === 'poor') {
    currentState = 'poor';
  } else if (quality === 'fair') {
    currentState = 'fair';
  }

  // Effect to handle visibility based on connection status
  useEffect(() => {
    // If we're offline, poor connection, or reconnecting, always show
    if (currentState !== 'good' || (showOnGoodConnection && currentState === 'good')) {
      setVisible(true);

      // For non-offline states, auto-hide after delay
      if (currentState !== 'offline' && autoHideDelay > 0) {
        const timer = setTimeout(() => {
          setVisible(false);
        }, autoHideDelay);

        return () => clearTimeout(timer);
      }
    } else {
      setVisible(false);
    }
  }, [currentState, showOnGoodConnection, autoHideDelay]);

  // Don't render anything if we have a good connection and not showing on good connection
  if (currentState === 'good' && !showOnGoodConnection) {
    return null;
  }

  // Get the appropriate message
  const message = ConnectionMessages[currentState];

  // Get the appropriate icon
  const icon =
    NetworkIcons[currentState === 'fair' ? 'poor' : (currentState as keyof typeof NetworkIcons)] ||
    null;

  // Get the status class
  const statusClass = currentState === 'good' ? '' : styles[currentState];

  // Determine icon animation
  const iconClass = reconnecting ? styles.iconSpin : !status.isOnline ? styles.iconPulse : '';

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={styles.container}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className={`${styles.indicator} ${statusClass}`}>
            {icon && <span className={`${styles.icon} ${iconClass}`}>{icon}</span>}
            <span>{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
