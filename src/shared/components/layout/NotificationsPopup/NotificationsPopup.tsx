import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { XIcon } from '@/shared/components/common/icons';
import { useCommonTranslation } from '@/shared/hooks/useTranslation';
import type { NotificationFeedItemDto } from '@/core/services/notificationsService';
import NotificationEventAvatar from '@/shared/components/layout/NotificationEventAvatar';
import styles from './NotificationsPopup.module.css';

interface NotificationsPopupProps {
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

const NotificationsPopup = ({
  onClose,
  notifications,
  unreadCount,
  isLoading,
  onMarkAsRead,
  onMarkAllAsRead,
}: NotificationsPopupProps): JSX.Element => {
  const { t, currentLanguage } = useCommonTranslation();
  const navigate = useNavigate();

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
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

      <div className={styles.notificationsList}>
        {isLoading && (
          <div className={styles.notificationItem}>
            <div className={styles.content}>
              <span className={styles.timestamp}>{t('common.actions.loading') as string}</span>
            </div>
          </div>
        )}

        {!isLoading && notifications.length === 0 && (
          <div className={styles.notificationItem}>
            <div className={styles.content}>
              <div className={styles.userAction}>
                <span className={styles.action}>
                  {t('notificationsPage.emptyState.title') as string}
                </span>
              </div>
              <span className={styles.timestamp}>
                {t('notificationsPage.emptyState.description') as string}
              </span>
            </div>
          </div>
        )}

        {!isLoading &&
          notifications.map(notification => (
            <div key={notification.id} className={styles.notificationItem}>
              <NotificationEventAvatar eventType={notification.event_type} />
              <div className={styles.content}>
                <div className={styles.userAction}>
                  <span className={styles.userName}>{notification.title}</span>
                </div>
                <span className={styles.action}>{notification.body}</span>
                <span className={styles.timestamp}>
                  {formatRelativeTimestamp(notification.created_at, currentLanguage)}
                </span>
                {!notification.read_at && (
                  <div className={styles.actions}>
                    <button
                      className={styles.replyButton}
                      onClick={() => {
                        onMarkAsRead(notification.id);
                      }}
                    >
                      {t('notificationsPage.actions.markAsRead') as string}
                    </button>
                  </div>
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
        <button
          className={styles.viewAllButton}
          onClick={() => {
            navigate('/app/notifications');
            onClose();
          }}
        >
          {t('header.viewAllNotifications') as string}
        </button>
      </div>
    </motion.div>
  );
};

export default NotificationsPopup;
