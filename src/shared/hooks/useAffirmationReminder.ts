import { useState, useEffect } from 'react';

interface ReminderSettings {
  enabled: boolean;
  time: string; // 24h format "HH:mm"
  days: number[]; // 0-6 (Sunday-Saturday)
}

export const useAffirmationReminder = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [settings, setSettings] = useState<ReminderSettings>(() => {
    const stored = localStorage.getItem('affirmationReminder');
    return stored ? JSON.parse(stored) : {
      enabled: false,
      time: "09:00",
      days: [1, 2, 3, 4, 5] // Monday to Friday by default
    };
  });

  // Request notification permission
  const requestPermission = async () => {
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  // Schedule notification
  const scheduleReminder = () => {
    if (!settings.enabled || permission !== 'granted') return;

    const [hours, minutes] = settings.time.split(':').map(Number);
    const now = new Date();
    const reminderTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hours,
      minutes
    );

    // If time has passed today, schedule for tomorrow
    if (reminderTime.getTime() < now.getTime()) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }

    const timeUntilReminder = reminderTime.getTime() - now.getTime();

    setTimeout(() => {
      if (settings.days.includes(reminderTime.getDay())) {
        new Notification('Daily Affirmation Reminder', {
          body: "It's time for your daily affirmation!",
          icon: '/path/to/icon.png', // Add your icon path
          badge: '/path/to/badge.png', // Add your badge path
        });
      }
      scheduleReminder(); // Schedule next reminder
    }, timeUntilReminder);
  };

  // Update settings
  const updateSettings = (newSettings: Partial<ReminderSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('affirmationReminder', JSON.stringify(updated));
    
    if (updated.enabled && permission === 'granted') {
      scheduleReminder();
    }
  };

  // Initialize reminders
  useEffect(() => {
    const checkPermission = async () => {
      setPermission(Notification.permission);
      if (settings.enabled && Notification.permission === 'granted') {
        scheduleReminder();
      }
    };

    checkPermission();
  }, []);

  return {
    settings,
    permission,
    requestPermission,
    updateSettings
  };
}; 