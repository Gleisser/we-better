import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, TrashIcon } from '@/components/common/icons';
import UserAvatar from '@/components/common/UserAvatar/UserAvatar';
import styles from './MobileNotifications.module.css';

type NotificationType = 'follow' | 'reply' | 'mention' | 'task' | 'like' | 'achievement';

interface NotificationItem {
  id: string;
  type: NotificationType;
  user: {
    name: string;
    image: string;
    isOnline: boolean;
  };
  content: string;
  target?: string;
  timestamp: string;
  isRead: boolean;
}

interface MobileNotificationsProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
}

export const MobileNotifications = ({ isOpen, onClose, notifications }: MobileNotificationsProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className={styles.overlay}
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        >
          <div className={styles.header}>
            <h2 className={styles.title}>Notifications</h2>
            <button 
              onClick={onClose}
              className={styles.closeButton}
              aria-label="Close notifications"
            >
              <XIcon className={styles.closeIcon} />
            </button>
          </div>
          
          <div className={styles.content}>
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`${styles.notificationItem} ${!notification.isRead ? styles.unread : ''}`}
              >
                <div className={styles.notificationHeader}>
                  <UserAvatar 
                    name={notification.user.name}
                    image={notification.user.image}
                    isOnline={notification.user.isOnline}
                    size="sm"
                  />
                  <div className={styles.notificationInfo}>
                    <div className={styles.userAction}>
                      <span className={styles.userName}>{notification.user.name}</span>
                      <span className={styles.action}>{notification.content}</span>
                      {notification.target && (
                        <span className={styles.target}>{notification.target}</span>
                      )}
                    </div>
                    <span className={styles.timestamp}>{notification.timestamp}</span>
                  </div>
                  <button 
                    className={styles.deleteButton}
                    aria-label="Delete notification"
                  >
                    <TrashIcon className={styles.trashIcon} />
                  </button>
                </div>

                <div className={styles.actions}>
                  {notification.type === 'follow' && (
                    <button className={styles.followButton}>Follow back</button>
                  )}
                  {notification.type === 'reply' && (
                    <>
                      <button className={styles.replyButton}>Reply</button>
                      <button className={styles.viewButton}>View</button>
                    </>
                  )}
                  {notification.type === 'task' && (
                    <button className={styles.viewButton}>View task</button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className={styles.footer}>
            <button className={styles.markReadButton}>Mark all as read</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 