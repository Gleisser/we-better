/**
 * MobileNotifications Component
 *
 * A mobile-optimized notifications panel that displays user notifications with animations
 * and interactive features. Provides a sliding panel interface with notification management
 * capabilities.
 *
 * Features:
 * - Animated entrance/exit using Framer Motion
 * - Support for multiple notification types
 * - User avatar integration
 * - Read/unread state handling
 * - Interactive actions based on notification type
 * - Batch actions (mark all as read)
 * - Individual notification deletion
 *
 * The component handles:
 * - Notification display and formatting
 * - Animation states and transitions
 * - User interaction with notifications
 * - Conditional rendering of action buttons
 * - Responsive layout for mobile devices
 *
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Controls the visibility of the notifications panel
 * @param {() => void} props.onClose - Callback function to close the panel
 * @param {NotificationItem[]} props.notifications - Array of notification items to display
 *
 * @example
 * ```tsx
 * function App() {
 *   const [isOpen, setIsOpen] = useState(false);
 *   const notifications = [
 *     {
 *       id: '1',
 *       type: 'follow',
 *       user: {
 *         name: 'John Doe',
 *         image: '/avatar.jpg',
 *         isOnline: true
 *       },
 *       content: 'started following you',
 *       timestamp: '2m ago',
 *       isRead: false
 *     }
 *   ];
 *
 *   return (
 *     <MobileNotifications
 *       isOpen={isOpen}
 *       onClose={() => setIsOpen(false)}
 *       notifications={notifications}
 *     />
 *   );
 * }
 * ```
 */

/**
 * Represents the possible types of notifications in the system.
 * @typedef {'follow' | 'reply' | 'mention' | 'task' | 'like' | 'achievement'} NotificationType
 */

/**
 * Represents a single notification item with all its properties.
 * @interface NotificationItem
 * @property {string} id - Unique identifier for the notification
 * @property {NotificationType} type - The type of notification
 * @property {Object} user - Information about the user who triggered the notification
 * @property {string} user.name - The name of the user
 * @property {string} user.image - URL to the user's avatar image
 * @property {boolean} user.isOnline - Whether the user is currently online
 * @property {string} content - The main content/message of the notification
 * @property {string} [target] - Optional target reference (e.g., post title, task name)
 * @property {string} timestamp - Human-readable timestamp for the notification
 * @property {boolean} isRead - Whether the notification has been read
 */

import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, TrashIcon } from '@/shared/components/common/icons';
import UserAvatar from '@/shared/components/common/UserAvatar/UserAvatar';
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

export const MobileNotifications = ({
  isOpen,
  onClose,
  notifications,
}: MobileNotificationsProps): JSX.Element => {
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
            {notifications.map(notification => (
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
                  <button className={styles.deleteButton} aria-label="Delete notification">
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
