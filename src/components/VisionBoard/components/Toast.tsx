import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../VisionBoard.module.css';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  visible: boolean;
  onClose: () => void;
  duration?: number;
  className?: string;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type,
  visible,
  onClose,
  duration = 3000,
  className = ''
}) => {
  // Auto-dismiss toast after duration
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onClose]);
  
  // Get icon based on toast type
  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };
  
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={`${styles.toast} ${styles[`toast-${type}`]} ${className}`}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.3 }}
        >
          <div className={styles.toastIcon}>{getIcon()}</div>
          <div className={styles.toastMessage}>{message}</div>
          <button
            className={styles.toastClose}
            onClick={onClose}
            aria-label="Close notification"
          >
            ×
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 