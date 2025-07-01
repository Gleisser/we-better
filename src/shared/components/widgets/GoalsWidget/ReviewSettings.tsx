import { useState } from 'react';
import { motion } from 'framer-motion';
import { XIcon } from '@/shared/components/common/icons';
import { useCommonTranslation } from '@/shared/hooks/useTranslation';
import styles from './ReviewSettings.module.css';
import { ReviewSettings, ReviewFrequency, NotificationMethod } from './types';
import { Portal } from '@/shared/components/common/Portal/Portal';
import { calculateInitialReviewDate } from './reviewUtils';

interface ReviewSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ReviewSettings;
  onSave: (settings: ReviewSettings) => void;
}

export const ReviewSettingsModal = ({
  isOpen,
  onClose,
  settings,
  onSave,
}: ReviewSettingsModalProps): JSX.Element => {
  const { t } = useCommonTranslation();
  const [localSettings, setLocalSettings] = useState<ReviewSettings>(settings);

  const FREQUENCY_OPTIONS: { value: ReviewFrequency; label: string }[] = [
    { value: 'daily', label: t('widgets.goals.reviewSettings.frequencies.daily') as string },
    { value: 'weekly', label: t('widgets.goals.reviewSettings.frequencies.weekly') as string },
    { value: 'monthly', label: t('widgets.goals.reviewSettings.frequencies.monthly') as string },
  ];

  const NOTIFICATION_OPTIONS: { value: NotificationMethod; label: string; icon: string }[] = [
    {
      value: 'email',
      label: t('widgets.goals.reviewSettings.notificationTypes.email') as string,
      icon: '📧',
    },
    {
      value: 'sms',
      label: t('widgets.goals.reviewSettings.notificationTypes.sms') as string,
      icon: '📱',
    },
    {
      value: 'push',
      label: t('widgets.goals.reviewSettings.notificationTypes.push') as string,
      icon: '🔔',
    },
  ];

  const handleFrequencyChange = (frequency: ReviewFrequency): void => {
    setLocalSettings(prev => ({
      ...prev,
      frequency,
      // Recalculate next review date when frequency changes
      nextReviewDate: calculateInitialReviewDate(frequency),
    }));
  };

  const toggleNotification = (method: NotificationMethod): void => {
    setLocalSettings(prev => ({
      ...prev,
      notifications: prev.notifications.includes(method)
        ? prev.notifications.filter(n => n !== method)
        : [...prev.notifications, method],
    }));
  };

  const handleSave = (): void => {
    onSave(localSettings);
    onClose();
  };

  return (
    <Portal>
      <motion.div
        className={styles.overlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: isOpen ? 1 : 0 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className={styles.modal}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
        >
          <div className={styles.header}>
            <h2 className={styles.title}>{t('widgets.goals.reviewSettings.title')}</h2>
            <button
              className={styles.closeButton}
              onClick={onClose}
              aria-label={t('widgets.goals.reviewSettings.closeSettings') as string}
            >
              <XIcon className={styles.closeIcon} />
            </button>
          </div>

          <div className={styles.content}>
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>{t('widgets.goals.reviewSettings.frequency')}</h3>
              <div className={styles.frequencyOptions}>
                {FREQUENCY_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    className={`${styles.frequencyButton} ${
                      localSettings.frequency === option.value ? styles.selected : ''
                    }`}
                    onClick={() => handleFrequencyChange(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                {t('widgets.goals.reviewSettings.notifications')}
              </h3>
              <div className={styles.notificationOptions}>
                {NOTIFICATION_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    className={`${styles.notificationButton} ${
                      localSettings.notifications.includes(option.value) ? styles.selected : ''
                    }`}
                    onClick={() => toggleNotification(option.value)}
                  >
                    <span className={styles.notificationIcon}>{option.icon}</span>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                {t('widgets.goals.reviewSettings.reminderSettings')}
              </h3>
              <div className={styles.reminderSettings}>
                <label className={styles.label}>
                  {t('widgets.goals.reviewSettings.reminderText')}
                  <select
                    className={styles.select}
                    value={localSettings.reminderDays}
                    onChange={e =>
                      setLocalSettings(prev => ({
                        ...prev,
                        reminderDays: Number(e.target.value),
                      }))
                    }
                  >
                    <option value={1}>{t('widgets.goals.reviewSettings.reminderOptions.1')}</option>
                    <option value={3}>{t('widgets.goals.reviewSettings.reminderOptions.3')}</option>
                    <option value={7}>{t('widgets.goals.reviewSettings.reminderOptions.7')}</option>
                  </select>
                  {t('widgets.goals.reviewSettings.beforeReview')}
                </label>
              </div>
            </div>
          </div>

          <div className={styles.footer}>
            <button className={styles.cancelButton} onClick={onClose}>
              {t('actions.cancel')}
            </button>
            <button className={styles.saveButton} onClick={handleSave}>
              {t('widgets.goals.reviewSettings.saveChanges')}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </Portal>
  );
};
