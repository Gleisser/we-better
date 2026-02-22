import { motion, AnimatePresence } from 'framer-motion';
import { XIcon } from '@/shared/components/common/icons';
import type { NotificationFeedItemDto } from '@/core/services/notificationsService';
import { useCommonTranslation } from '@/shared/hooks/useTranslation';
import styles from './MobileNotifications.module.css';

interface MobileNotificationsProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationFeedItemDto[];
  unreadCount: number;
  isLoading: boolean;
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
}

const formatRelativeTimestamp = (value: string, language: string): string => {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.max(0, Math.floor(diffMs / 60_000));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return language === 'pt' ? `${days}d atrás` : `${days}d ago`;
  }
  if (hours > 0) {
    return language === 'pt' ? `${hours}h atrás` : `${hours}h ago`;
  }
  if (minutes > 0) {
    return language === 'pt' ? `${minutes}m atrás` : `${minutes}m ago`;
  }
  return language === 'pt' ? 'Agora' : 'Just now';
};

export const MobileNotifications = ({
  isOpen,
  onClose,
  notifications,
  unreadCount,
  isLoading,
  onMarkAsRead,
  onMarkAllAsRead,
}: MobileNotificationsProps): JSX.Element => {
  const { t, currentLanguage } = useCommonTranslation();

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
            <h2 className={styles.title}>{t('notifications.title') as string}</h2>
            <button
              onClick={onClose}
              className={styles.closeButton}
              aria-label={t('common.actions.close') as string}
            >
              <XIcon className={styles.closeIcon} />
            </button>
          </div>

          <div className={styles.content}>
            {isLoading && <p className={styles.action}>{t('common.actions.loading') as string}</p>}

            {!isLoading && notifications.length === 0 && (
              <p className={styles.action}>{t('notificationsPage.emptyState.title') as string}</p>
            )}

            {!isLoading &&
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`${styles.notificationItem} ${!notification.read_at ? styles.unread : ''}`}
                >
                  <div className={styles.notificationHeader}>
                    <div className={styles.notificationInfo}>
                      <div className={styles.userAction}>
                        <span className={styles.userName}>{notification.title}</span>
                      </div>
                      <span className={styles.action}>{notification.body}</span>
                      <span className={styles.timestamp}>
                        {formatRelativeTimestamp(notification.created_at, currentLanguage)}
                      </span>
                    </div>
                    {!notification.read_at && (
                      <button
                        className={styles.replyButton}
                        onClick={() => {
                          onMarkAsRead(notification.id);
                        }}
                      >
                        {t('notificationsPage.actions.markAsRead') as string}
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>

          <div className={styles.footer}>
            <button
              className={styles.markReadButton}
              onClick={onMarkAllAsRead}
              disabled={unreadCount === 0 || isLoading}
            >
              {t('header.markAllAsRead') as string}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
