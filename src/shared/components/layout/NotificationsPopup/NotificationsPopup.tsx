import { useState } from 'react';
import { motion } from 'framer-motion';
import { XIcon, TrashIcon } from '@/shared/components/common/icons';
import { useCommonTranslation } from '@/shared/hooks/useTranslation';
import styles from './NotificationsPopup.module.css';
import UserAvatar from '@/shared/components/common/UserAvatar/UserAvatar';

type Tab = 'all' | 'following' | 'archive';

export type NotificationType = 'follow' | 'reply' | 'mention' | 'task' | 'like' | 'achievement';

export interface NotificationItem {
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

const NotificationsPopup = ({ onClose }: { onClose: () => void }): JSX.Element => {
  const { t } = useCommonTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [notifications] = useState<NotificationItem[]>([
    {
      id: '1',
      type: 'reply',
      user: {
        name: 'Tommy Lee',
        image: '/assets/images/avatars/tommy.jpg',
        isOnline: true,
      },
      content: 'replied to you in',
      target: 'Generic File',
      timestamp: '7 November 2023 • 12:35 AM',
      isRead: false,
    },
    {
      id: '2',
      type: 'follow',
      user: {
        name: 'Jennifer Lee',
        image: '/assets/images/avatars/jennifer.jpg',
        isOnline: true,
      },
      content: 'followed you',
      timestamp: '6 November 2023 • 9:12 PM',
      isRead: false,
    },
    {
      id: '3',
      type: 'task',
      user: {
        name: 'Eve Monroe',
        image: '/assets/images/avatars/eve.jpg',
        isOnline: false,
      },
      content: 'assigned a task to you',
      target: '#JP-2137',
      timestamp: '6 November 2023 • 8:56 PM',
      isRead: false,
    },
    {
      id: '4',
      type: 'like',
      user: {
        name: 'Michael Chen',
        image: '/assets/images/avatars/michael.jpg',
        isOnline: true,
      },
      content: 'liked your article',
      target: 'How to Master TypeScript',
      timestamp: '6 November 2023 • 7:30 PM',
      isRead: true,
    },
    {
      id: '5',
      type: 'mention',
      user: {
        name: 'Sarah Wilson',
        image: '/assets/images/avatars/sarah.jpg',
        isOnline: false,
      },
      content: 'mentioned you in',
      target: 'Team Meeting Notes',
      timestamp: '6 November 2023 • 6:45 PM',
      isRead: true,
    },
    {
      id: '6',
      type: 'achievement',
      user: {
        name: 'System',
        image: '/assets/images/avatars/system.jpg',
        isOnline: true,
      },
      content: 'You earned a new badge',
      target: '🏆 Early Adopter',
      timestamp: '6 November 2023 • 5:20 PM',
      isRead: false,
    },
  ]);

  const tabs = [
    { id: 'all', label: t('notifications.tabs.all'), count: 8 },
    { id: 'following', label: t('notifications.tabs.following'), count: 5 },
    { id: 'archive', label: t('notifications.tabs.archive'), count: 12 },
  ];

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
    >
      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.title}>{t('notifications.title')}</h2>
        <button onClick={onClose} className={styles.closeButton}>
          <XIcon className={styles.closeIcon} />
        </button>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.activeTab : ''}`}
            onClick={() => setActiveTab(tab.id as Tab)}
          >
            {tab.label}
            <span className={styles.count}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className={styles.notificationsList}>
        {notifications.map(notification => (
          <div key={notification.id} className={styles.notificationItem}>
            <UserAvatar
              name={notification.user.name}
              isOnline={notification.user.isOnline}
              size="md"
            />

            <div className={styles.content}>
              <div className={styles.userAction}>
                <span className={styles.userName}>{notification.user.name}</span>
                <span className={styles.action}>{notification.content}</span>
                {notification.target && (
                  <span className={styles.target}>{notification.target}</span>
                )}
              </div>
              <span className={styles.timestamp}>{notification.timestamp}</span>

              <div className={styles.actions}>
                {notification.type === 'follow' && (
                  <button className={styles.followButton}>
                    {t('notifications.actions.followBack')}
                  </button>
                )}
                {notification.type === 'reply' && (
                  <>
                    <button className={styles.replyButton}>
                      {t('notifications.actions.reply')}
                    </button>
                    <button className={styles.viewButton}>{t('notifications.actions.view')}</button>
                  </>
                )}
                {notification.type === 'mention' && (
                  <button className={styles.viewButton}>
                    {t('notifications.actions.viewThread')}
                  </button>
                )}
                {notification.type === 'task' && (
                  <button className={styles.viewButton}>
                    {t('notifications.actions.viewTask')}
                  </button>
                )}
                {notification.type === 'like' && (
                  <button className={styles.viewButton}>
                    {t('notifications.actions.viewArticle')}
                  </button>
                )}
                {notification.type === 'achievement' && (
                  <button className={styles.viewButton}>
                    {t('notifications.actions.viewBadge')}
                  </button>
                )}
              </div>
            </div>

            <button className={styles.deleteButton}>
              <TrashIcon className={styles.trashIcon} />
            </button>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <button className={styles.markReadButton}>{t('header.markAllAsRead')}</button>
        <button className={styles.viewAllButton}>{t('header.viewAllNotifications')}</button>
      </div>
    </motion.div>
  );
};

export default NotificationsPopup;
