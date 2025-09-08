import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCommonTranslation } from '@/shared/hooks/useTranslation';
import styles from './Notifications.module.css';

// Notification icons components
const DroneIcon = ({ className }: { className?: string }): JSX.Element => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2M7 4h10M7 4L5.5 6M17 4l1.5 2M12 6v6M9 12h6"
    />
  </svg>
);

const TeamIcon = ({ className }: { className?: string }): JSX.Element => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const FarmIcon = ({ className }: { className?: string }): JSX.Element => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2z"
    />
  </svg>
);

const ChartIcon = ({ className }: { className?: string }): JSX.Element => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 19V9a2 2 0 00-2-2h-2a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z"
    />
  </svg>
);

// Types
interface NotificationItem {
  id: string;
  type: string;
  title: string;
  description: string;
  icon: ({ className }: { className?: string }) => JSX.Element;
  timestamp: number;
  isRead: boolean;
}

// Mock notification data
const generateMockNotifications = (): NotificationItem[] => [
  {
    id: '1',
    type: 'goalAchievement',
    title: 'Goal Achievement Unlocked',
    description:
      'Congratulations! You have achieved 3 goals so far this year. Keep up the excellent work!',
    icon: ChartIcon,
    timestamp: Date.now() - 3600000, // 1h ago
    isRead: false,
  },
  {
    id: '2',
    type: 'habitStreak',
    title: 'Habit Streak Milestone',
    description:
      'Amazing! You have maintained your "Morning Meditation" habit for 7 days straight 🔥',
    icon: TeamIcon,
    timestamp: Date.now() - 7200000, // 2h ago
    isRead: false,
  },
  {
    id: '3',
    type: 'newHabit',
    title: 'New Habit Created',
    description: 'Your new habit "Daily Reading" has been successfully created and scheduled',
    icon: FarmIcon,
    timestamp: Date.now() - 14400000, // 4h ago
    isRead: false,
  },
  {
    id: '4',
    type: 'dreamProgress',
    title: 'Dream Board Progress Update',
    description:
      'You have completed 2 out of 5 milestones for your "Learn Spanish" dream. You are 40% there!',
    icon: DroneIcon,
    timestamp: Date.now() - 86400000, // Yesterday
    isRead: true,
  },
  {
    id: '5',
    type: 'weeklyReview',
    title: 'Weekly Review Available',
    description: 'Your weekly review is ready! See your progress and plan for the upcoming week',
    icon: TeamIcon,
    timestamp: Date.now() - 86400000 - 3600000, // Yesterday
    isRead: true,
  },
  {
    id: '6',
    type: 'lifeWheelUpdate',
    title: 'Life Wheel Assessment Complete',
    description:
      'Your Life Wheel shows significant improvement in Career (85%) and Health (78%) this month!',
    icon: ChartIcon,
    timestamp: Date.now() - 2592000000, // 30 days ago
    isRead: false,
  },
];

interface TimeGroup {
  label: string;
  notifications: NotificationItem[];
}

const Notifications = (): JSX.Element => {
  const { t, currentLanguage } = useCommonTranslation();
  const [notifications] = useState(generateMockNotifications());

  // Helper functions
  const formatRelativeTime = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) {
      return currentLanguage === 'pt' ? `${days}d atrás` : `${days}d ago`;
    } else if (hours > 0) {
      return currentLanguage === 'pt' ? `${hours}h atrás` : `${hours}h ago`;
    } else {
      return currentLanguage === 'pt' ? 'Agora mesmo' : 'Just now';
    }
  };

  const getOlderGroupLabel = (timestamp: number, language: string): string => {
    const date = new Date(timestamp);
    const locale = language === 'pt' ? 'pt-BR' : 'en-US';
    return date.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
  };

  // Memoize translated values to prevent infinite re-renders
  const translations = useMemo(
    () => ({
      title: t('notificationsPage.title') as string,
      markAllAsRead: t('notificationsPage.markAllAsRead') as string,
      notificationCount: t('notificationsPage.notificationCount', {
        count: notifications.length,
      }) as string,
      timeGroups: {
        today: t('notificationsPage.timeGroups.today') as string,
        yesterday: t('notificationsPage.timeGroups.yesterday') as string,
        older: t('notificationsPage.timeGroups.older') as string,
      },
      actions: {
        view: t('notificationsPage.actions.view') as string,
      },
    }),
    [t, notifications.length]
  );

  // Group notifications by time
  const groupedNotifications = useMemo(() => {
    const now = Date.now();
    const oneDayAgo = now - 86400000;
    const twoDaysAgo = now - 172800000;

    const groups: TimeGroup[] = [];

    const todayNotifications = notifications.filter(n => n.timestamp > oneDayAgo);
    const yesterdayNotifications = notifications.filter(
      n => n.timestamp <= oneDayAgo && n.timestamp > twoDaysAgo
    );
    const olderNotifications = notifications.filter(n => n.timestamp <= twoDaysAgo);

    if (todayNotifications.length > 0) {
      groups.push({
        label: translations.timeGroups.today,
        notifications: todayNotifications.sort((a, b) => b.timestamp - a.timestamp),
      });
    }

    if (yesterdayNotifications.length > 0) {
      groups.push({
        label: translations.timeGroups.yesterday,
        notifications: yesterdayNotifications.sort((a, b) => b.timestamp - a.timestamp),
      });
    }

    if (olderNotifications.length > 0) {
      groups.push({
        label: getOlderGroupLabel(olderNotifications[0].timestamp, currentLanguage),
        notifications: olderNotifications.sort((a, b) => b.timestamp - a.timestamp),
      });
    }

    return groups;
  }, [notifications, translations.timeGroups, currentLanguage]);

  return (
    <div className={styles.notificationsPage}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>{translations.title}</h1>
          <button className={styles.markAllButton}>{translations.markAllAsRead}</button>
        </div>
        <p className={styles.subtitle}>{translations.notificationCount}</p>
      </div>

      {/* Notifications List */}
      <div className={styles.content}>
        {groupedNotifications.map((group, groupIndex) => (
          <motion.div
            key={group.label}
            className={styles.timeGroup}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: groupIndex * 0.1 }}
          >
            <h2 className={styles.timeGroupLabel}>{group.label}</h2>

            <div className={styles.notificationsList}>
              <AnimatePresence>
                {group.notifications.map((notification, index) => {
                  const IconComponent = notification.icon;
                  return (
                    <motion.div
                      key={notification.id}
                      className={`${styles.notificationItem} ${notification.isRead ? styles.read : ''}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      <div className={styles.notificationIcon}>
                        <IconComponent className={styles.icon} />
                      </div>

                      <div className={styles.notificationContent}>
                        <div className={styles.notificationHeader}>
                          <h3 className={styles.notificationTitle}>
                            {t(`notificationsPage.types.${notification.type}`) as string}
                          </h3>
                          <span className={styles.timestamp}>
                            {formatRelativeTime(notification.timestamp)}
                          </span>
                        </div>
                        <p className={styles.notificationDescription}>{notification.description}</p>
                      </div>

                      <button className={styles.viewButton}>{translations.actions.view}</button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
