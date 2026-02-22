import { useCallback, useEffect, useState } from 'react';
import {
  notificationSettingsService,
  NotificationSettingsDto,
} from '@/core/services/notificationSettingsService';

const FALLBACK_NOTIFICATION_SETTINGS: NotificationSettingsDto = {
  email_notifications: true,
  push_notifications: false,
  in_app_notifications: true,
  email_goals_reminders: true,
  email_habits_reminders: true,
  email_weekly_insights: true,
  email_milestone_achievements: true,
  email_marketing: false,
  push_goals_reminders: false,
  push_habits_reminders: false,
  push_daily_affirmations: false,
  push_milestone_achievements: true,
  timezone: 'UTC',
  quiet_hours_enabled: true,
  quiet_hours_start: '22:00:00',
  quiet_hours_end: '07:00:00',
  habit_reminder_time: '20:00:00',
  goal_review_reminder_time: '09:00:00',
  email_dream_challenge_reminders: true,
  push_dream_challenge_reminders: false,
  email_habit_streak_achievements: true,
  push_habit_streak_achievements: true,
};

interface UseNotificationSettingsReturn {
  settings: NotificationSettingsDto;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateSettings: (patch: Partial<NotificationSettingsDto>) => Promise<boolean>;
  clearError: () => void;
}

export function useNotificationSettings(): UseNotificationSettingsReturn {
  const [settings, setSettings] = useState<NotificationSettingsDto>(FALLBACK_NOTIFICATION_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const { data, error: fetchError } = await notificationSettingsService.getSettings();
    if (fetchError || !data) {
      setError(fetchError || 'Failed to load notification settings');
      setSettings(FALLBACK_NOTIFICATION_SETTINGS);
      setIsLoading(false);
      return;
    }

    setSettings(data);
    setIsLoading(false);
  }, []);

  const updateSettings = useCallback(
    async (patch: Partial<NotificationSettingsDto>): Promise<boolean> => {
      setIsSaving(true);
      setError(null);

      const previous = settings;
      setSettings(current => ({ ...current, ...patch }));

      const { data, error: updateError } = await notificationSettingsService.updateSettings(patch);
      if (updateError || !data) {
        setSettings(previous);
        setError(updateError || 'Failed to update notification settings');
        setIsSaving(false);
        return false;
      }

      setSettings(data);
      setIsSaving(false);
      return true;
    },
    [settings]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  return {
    settings,
    isLoading,
    isSaving,
    error,
    refresh: loadSettings,
    updateSettings,
    clearError,
  };
}

export default useNotificationSettings;
