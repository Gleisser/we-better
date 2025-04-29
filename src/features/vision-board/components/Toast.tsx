import React, { useEffect } from 'react';
import styles from '../VisionBoard.module.css';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  visible: boolean;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type,
  visible,
  onClose,
  duration = 3000
}) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onClose]);
  
  if (!visible) return null;
  
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
    <div className={`${styles.toast} ${styles[`toast-${type}`]}`}>
      <div className={styles.toastIcon}>{getIcon()}</div>
      <div className={styles.toastMessage}>{message}</div>
      <button 
        className={styles.toastClose}
        onClick={onClose}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
}; 