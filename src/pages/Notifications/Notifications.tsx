import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCommonTranslation } from '@/shared/hooks/useTranslation';
import { useNotificationsFeed } from '@/shared/hooks/useNotificationsFeed';
import type { NotificationFeedItemDto } from '@/core/services/notificationsService';
import styles from './Notifications.module.css';

interface TimeGroup {
  label: string;
  notifications: NotificationFeedItemDto[];
}

const formatRelativeTime = (timestamp: string, language: string): string => {
  const date = new Date(timestamp);
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

  return language === 'pt' ? 'Agora mesmo' : 'Just now';
};

const toDateKey = (value: string): string => {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const Notifications = (): JSX.Element => {
  const { t, currentLanguage } = useCommonTranslation();
  const navigate = useNavigate();
  const {
    notifications,
    total,
    unreadCount,
    hasMore,
    isLoading,
    isLoadingMore,
    markAsRead,
    markAllAsRead,
    loadMore,
  } = useNotificationsFeed({
    pageSize: 20,
    unreadRefreshIntervalMs: 20_000,
  });

  const groupedNotifications = useMemo<TimeGroup[]>(() => {
    const today = toDateKey(new Date().toISOString());
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = toDateKey(yesterdayDate.toISOString());
    const locale = currentLanguage === 'pt' ? 'pt-BR' : 'en-US';

    const groups = new Map<string, NotificationFeedItemDto[]>();

    for (const notification of notifications) {
      const dateKey = toDateKey(notification.created_at);
      const label =
        dateKey === today
          ? (t('notificationsPage.timeGroups.today') as string) || 'Today'
          : dateKey === yesterday
            ? (t('notificationsPage.timeGroups.yesterday') as string) || 'Yesterday'
            : new Date(notification.created_at).toLocaleDateString(locale, {
                day: 'numeric',
                month: 'short',
              });

      const existing = groups.get(label) ?? [];
      existing.push(notification);
      groups.set(label, existing);
    }

    return Array.from(groups.entries()).map(([label, items]) => ({
      label,
      notifications: items,
    }));
  }, [currentLanguage, notifications, t]);

  return (
    <div className={styles.notificationsPage}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>{t('notificationsPage.title') as string}</h1>
          <button
            className={styles.markAllButton}
            onClick={() => {
              void markAllAsRead();
            }}
            disabled={unreadCount === 0 || isLoading}
          >
            {t('notificationsPage.markAllAsRead') as string}
          </button>
        </div>
        <p className={styles.subtitle}>
          {
            t('notificationsPage.notificationCount', {
              count: total,
            }) as string
          }
        </p>
      </div>

      <div className={styles.content}>
        {isLoading && <p className={styles.subtitle}>{t('common.actions.loading') as string}</p>}

        {!isLoading && groupedNotifications.length === 0 && (
          <p className={styles.subtitle}>
            {t('notificationsPage.emptyState.description') as string}
          </p>
        )}

        {!isLoading &&
          groupedNotifications.map((group, groupIndex) => (
            <motion.div
              key={group.label}
              className={styles.timeGroup}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: groupIndex * 0.05 }}
            >
              <h2 className={styles.timeGroupLabel}>{group.label}</h2>
              <div className={styles.notificationsList}>
                {group.notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`${styles.notificationItem} ${notification.read_at ? styles.read : ''}`}
                  >
                    <div className={styles.notificationContent}>
                      <div className={styles.notificationHeader}>
                        <h3 className={styles.notificationTitle}>{notification.title}</h3>
                        <span className={styles.timestamp}>
                          {formatRelativeTime(notification.created_at, currentLanguage)}
                        </span>
                      </div>
                      <p className={styles.notificationDescription}>{notification.body}</p>
                    </div>

                    {!notification.read_at ? (
                      <button
                        className={styles.viewButton}
                        onClick={() => {
                          void markAsRead(notification.id);
                        }}
                      >
                        {t('notificationsPage.actions.markAsRead') as string}
                      </button>
                    ) : (
                      <button
                        className={styles.viewButton}
                        onClick={() => {
                          if (!notification.cta_url) return;
                          if (notification.cta_url.startsWith('/')) {
                            navigate(notification.cta_url);
                            return;
                          }
                          window.location.assign(notification.cta_url);
                        }}
                      >
                        {t('notificationsPage.actions.view') as string}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}

        {!isLoading && hasMore && (
          <button
            className={styles.markAllButton}
            onClick={() => {
              void loadMore();
            }}
            disabled={isLoadingMore}
          >
            {isLoadingMore
              ? (t('common.actions.loading') as string)
              : (t('common.actions.next') as string)}
          </button>
        )}
      </div>
    </div>
  );
};

export default Notifications;
