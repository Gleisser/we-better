import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { BellIcon, XIcon } from '@/shared/components/common/icons';
import styles from './ReminderSettings.module.css';

type ReminderSettings = {
  enabled: boolean;
  time: string;
  days: number[];
};

interface ReminderSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  settings: {
    enabled: boolean;
    time: string;
    days: number[];
  };
  onUpdate: (settings: ReminderSettings) => void;
  onRequestPermission: () => Promise<boolean>;
  permission: NotificationPermission;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const ReminderSettings = ({
  isOpen,
  onClose,
  settings,
  onUpdate,
  onRequestPermission,
  permission
}: ReminderSettingsProps) => {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleToggleDay = (day: number) => {
    const newDays = localSettings.days.includes(day)
      ? localSettings.days.filter(d => d !== day)
      : [...localSettings.days, day].sort();
    
    const newSettings = { ...localSettings, days: newDays };
    setLocalSettings(newSettings);
    onUpdate(newSettings);
  };

  const handleTimeChange = (time: string) => {
    const newSettings = { ...localSettings, time };
    setLocalSettings(newSettings);
    onUpdate(newSettings);
  };

  const handleToggleEnabled = async () => {
    if (!localSettings.enabled && permission !== 'granted') {
      const granted = await onRequestPermission();
      if (!granted) return;
    }

    const newSettings = { ...localSettings, enabled: !localSettings.enabled };
    setLocalSettings(newSettings);
    onUpdate(newSettings);
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className={styles.container}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <div className={styles.header}>
              <div className={styles.title}>
                <BellIcon className={styles.bellIcon} />
                <span>Reminder Settings</span>
              </div>
              <button onClick={onClose} className={styles.closeButton}>
                <XIcon className={styles.closeIcon} />
              </button>
            </div>

            <div className={styles.content}>
              <div className={styles.enableSwitch}>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={localSettings.enabled}
                    onChange={handleToggleEnabled}
                  />
                  <span className={styles.slider} />
                </label>
                <span>Enable daily reminders</span>
              </div>

              <div className={styles.timeSection}>
                <label>Reminder Time</label>
                <input
                  type="time"
                  value={localSettings.time}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className={styles.timeInput}
                />
              </div>

              <div className={styles.daysSection}>
                <label>Repeat on</label>
                <div className={styles.dayButtons}>
                  {DAYS.map((day, index) => (
                    <button
                      key={day}
                      className={`${styles.dayButton} ${
                        localSettings.days.includes(index) ? styles.selected : ''
                      }`}
                      onClick={() => handleToggleDay(index)}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}; 