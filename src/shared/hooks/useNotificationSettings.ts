import { useCallback, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AUTH_SCOPED_QUERY_META } from '@/core/config/react-query';
import {
  notificationSettingsService,
  NotificationSettingsDto,
} from '@/core/services/notificationSettingsService';
import { useAuth } from '@/shared/hooks/useAuth';

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

export const notificationSettingsQueryKey = (userId: string | null) =>
  ['notificationSettings', userId ?? 'anonymous'] as const;

export function useNotificationSettings(): UseNotificationSettingsReturn {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [error, setError] = useState<string | null>(null);

  const query = useQuery({
    queryKey: notificationSettingsQueryKey(userId),
    queryFn: async (): Promise<NotificationSettingsDto> => {
      const result = await notificationSettingsService.getSettings();
      if (result.error || !result.data) {
        throw new Error(result.error || 'Failed to load notification settings');
      }

      return result.data;
    },
    enabled: Boolean(userId),
    meta: AUTH_SCOPED_QUERY_META,
  });

  const updateMutation = useMutation({
    mutationFn: async (
      patch: Partial<NotificationSettingsDto>
    ): Promise<NotificationSettingsDto> => {
      const result = await notificationSettingsService.updateSettings(patch);
      if (result.error || !result.data) {
        throw new Error(result.error || 'Failed to update notification settings');
      }

      return result.data;
    },
    onMutate: async patch => {
      setError(null);
      await queryClient.cancelQueries({ queryKey: notificationSettingsQueryKey(userId) });
      const previous = queryClient.getQueryData<NotificationSettingsDto>(
        notificationSettingsQueryKey(userId)
      );

      queryClient.setQueryData<NotificationSettingsDto>(
        notificationSettingsQueryKey(userId),
        current => ({
          ...(current ?? FALLBACK_NOTIFICATION_SETTINGS),
          ...patch,
        })
      );

      return { previous };
    },
    onSuccess: data => {
      queryClient.setQueryData(notificationSettingsQueryKey(userId), data);
    },
    onError: (mutationError, _patch, context) => {
      queryClient.setQueryData(
        notificationSettingsQueryKey(userId),
        context?.previous ?? FALLBACK_NOTIFICATION_SETTINGS
      );
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : 'Failed to update notification settings'
      );
    },
  });

  const updateSettings = useCallback(
    async (patch: Partial<NotificationSettingsDto>): Promise<boolean> => {
      if (!userId) {
        setError('Not authenticated');
        return false;
      }

      try {
        await updateMutation.mutateAsync(patch);
        return true;
      } catch {
        return false;
      }
    },
    [updateMutation, userId]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    settings: query.data ?? FALLBACK_NOTIFICATION_SETTINGS,
    isLoading: Boolean(userId) && query.isLoading,
    isSaving: updateMutation.isPending,
    error: error || (query.error instanceof Error ? query.error.message : null),
    refresh: async () => {
      await query.refetch();
    },
    updateSettings,
    clearError,
  };
}

export default useNotificationSettings;
