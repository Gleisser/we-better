import { motion, AnimatePresence } from 'framer-motion';
import { XIcon } from '@/components/common/icons';
import styles from './MobileNotifications.module.css';

export const MobileNotifications = ({ isOpen, onClose, notifications }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className={styles.overlay}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          <div className={styles.header}>
            <h2>Notifications</h2>
            <button onClick={onClose}>
              <XIcon className={styles.closeIcon} />
            </button>
          </div>
          
          <div className={styles.content}>
            {notifications.map(notification => (
              <div key={notification.id} className={styles.notificationItem}>
                {/* Notification content */}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 