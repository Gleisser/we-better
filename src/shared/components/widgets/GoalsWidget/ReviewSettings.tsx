import { useState } from 'react';
import { motion } from 'framer-motion';
import { XIcon } from '@/shared/components/common/icons';
import styles from './ReviewSettings.module.css';
import { ReviewSettings, ReviewFrequency, NotificationMethod } from './types';
import { Portal } from '@/shared/components/common/Portal/Portal';

interface ReviewSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ReviewSettings;
  onSave: (settings: ReviewSettings) => void;
}

const FREQUENCY_OPTIONS: { value: ReviewFrequency; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Every 2 Weeks' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Every 3 Months' }
];

const NOTIFICATION_OPTIONS: { value: NotificationMethod; label: string; icon: string }[] = [
  { value: 'email', label: 'Email', icon: '📧' },
  { value: 'sms', label: 'SMS', icon: '📱' },
  { value: 'push', label: 'Push Notification', icon: '🔔' }
];

export const ReviewSettingsModal = ({ 
  isOpen, 
  onClose, 
  settings,
  onSave 
}: ReviewSettingsModalProps) => {
  const [localSettings, setLocalSettings] = useState<ReviewSettings>(settings);

  const handleFrequencyChange = (frequency: ReviewFrequency) => {
    setLocalSettings(prev => ({ ...prev, frequency }));
  };

  const toggleNotification = (method: NotificationMethod) => {
    setLocalSettings(prev => ({
      ...prev,
      notifications: prev.notifications.includes(method)
        ? prev.notifications.filter(n => n !== method)
        : [...prev.notifications, method]
    }));
  };

  const handleSave = () => {
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
            <h2 className={styles.title}>Review Settings</h2>
            <button
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Close settings"
            >
              <XIcon className={styles.closeIcon} />
            </button>
          </div>

          <div className={styles.content}>
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Review Frequency</h3>
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
              <h3 className={styles.sectionTitle}>Notifications</h3>
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
              <h3 className={styles.sectionTitle}>Reminder Settings</h3>
              <div className={styles.reminderSettings}>
                <label className={styles.label}>
                  Start reminding me
                  <select
                    className={styles.select}
                    value={localSettings.reminderDays}
                    onChange={(e) => setLocalSettings(prev => ({
                      ...prev,
                      reminderDays: Number(e.target.value)
                    }))}
                  >
                    <option value={1}>1 day</option>
                    <option value={3}>3 days</option>
                    <option value={7}>1 week</option>
                  </select>
                  before review date
                </label>
              </div>
            </div>
          </div>

          <div className={styles.footer}>
            <button className={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <button className={styles.saveButton} onClick={handleSave}>
              Save Changes
            </button>
          </div>
        </motion.div>
      </motion.div>
    </Portal>
  );
}; 