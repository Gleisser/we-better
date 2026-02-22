import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { BellIcon, XIcon } from '@/shared/components/common/icons';
import { useCommonTranslation } from '@/shared/hooks/useTranslation';
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
  onUpdate: (settings: ReminderSettings) => void | Promise<void>;
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
  permission,
}: ReminderSettingsProps): JSX.Element => {
  const { t } = useCommonTranslation();
  const [localSettings, setLocalSettings] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setLocalSettings(settings);
    setSaveError(null);
  }, [isOpen, settings]);

  const hasChanges = useMemo(() => {
    const sameEnabled = localSettings.enabled === settings.enabled;
    const sameTime = localSettings.time === settings.time;
    const sameDays =
      localSettings.days.length === settings.days.length &&
      localSettings.days.every((day, index) => day === settings.days[index]);
    return !(sameEnabled && sameTime && sameDays);
  }, [localSettings, settings]);

  const handleToggleDay = (day: number): void => {
    const newDays = localSettings.days.includes(day)
      ? localSettings.days.filter(d => d !== day)
      : [...localSettings.days, day].sort();

    setLocalSettings(previous => ({ ...previous, days: newDays }));
  };

  const handleTimeChange = (time: string): void => {
    setLocalSettings(previous => ({ ...previous, time }));
  };

  const handleToggleEnabled = (): void => {
    setLocalSettings(previous => ({ ...previous, enabled: !previous.enabled }));
  };

  const handleSave = async (): Promise<void> => {
    setSaveError(null);
    setIsSaving(true);

    try {
      if (localSettings.enabled && permission !== 'granted') {
        const granted = await onRequestPermission();
        if (!granted) {
          setSaveError('Please allow browser notification permission to enable reminders.');
          setIsSaving(false);
          return;
        }
      }

      await onUpdate(localSettings);
      onClose();
    } catch {
      setSaveError('Failed to save reminder settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
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
                  onChange={e => handleTimeChange(e.target.value)}
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
                      type="button"
                      onClick={() => handleToggleDay(index)}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              {saveError && <p className={styles.saveError}>{saveError}</p>}

              <div className={styles.footer}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={onClose}
                  disabled={isSaving}
                >
                  {t('actions.cancel') as string}
                </button>
                <button
                  type="button"
                  className={styles.saveButton}
                  onClick={() => {
                    void handleSave();
                  }}
                  disabled={isSaving || !hasChanges}
                >
                  {isSaving
                    ? (t('actions.loading') as string) || 'Saving...'
                    : (t('actions.save') as string) || 'Save'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};
