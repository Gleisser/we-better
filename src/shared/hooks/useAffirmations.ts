import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { AUTH_SCOPED_QUERY_META } from '@/core/config/react-query';
import {
  PersonalAffirmation,
  AffirmationReminderSettings,
  AffirmationStreak,
  AffirmationLog,
  AffirmationStats,
  AffirmationCategory,
  AffirmationIntensity,
  ReminderFrequency,
  fetchPersonalAffirmation,
  createPersonalAffirmation as createPersonalAffirmationApi,
  updatePersonalAffirmation as updatePersonalAffirmationApi,
  deletePersonalAffirmation as deletePersonalAffirmationApi,
  logAffirmation as logAffirmationApi,
  fetchAffirmationLogs,
  checkTodayStatus as checkTodayStatusApi,
  fetchAffirmationStreak,
  fetchAffirmationStats,
  fetchBasicStats,
  fetchReminderSettings,
  upsertReminderSettings,
  updateReminderSettings as updateReminderSettingsApi,
  transformTimeFormat,
  transformTimeToBackend,
  getDaysOfWeekForFrequency,
} from '@/core/services/affirmationsService';
import { pushSubscriptionService } from '@/core/services/pushSubscriptionService';
import { useAuth } from '@/shared/hooks/useAuth';

export interface UseAffirmationsReturn {
  personalAffirmation: PersonalAffirmation | null;
  reminderSettings: AffirmationReminderSettings | null;
  streak: AffirmationStreak | null;
  stats: AffirmationStats | null;
  logs: AffirmationLog[];
  hasAffirmedToday: boolean;
  isLoading: boolean;
  error: Error | null;
  fetchPersonalAffirmation: () => Promise<void>;
  createPersonalAffirmation: (
    text: string,
    category?: AffirmationCategory,
    intensity?: AffirmationIntensity
  ) => Promise<PersonalAffirmation | null>;
  updatePersonalAffirmation: (
    id: string,
    updates: {
      text?: string;
      category?: AffirmationCategory;
      intensity?: AffirmationIntensity;
      is_active?: boolean;
    }
  ) => Promise<PersonalAffirmation | null>;
  deletePersonalAffirmation: (id: string) => Promise<void>;
  logAffirmation: (
    affirmationText: string,
    affirmationId?: string,
    date?: string
  ) => Promise<AffirmationLog | null>;
  fetchLogs: (
    startDate?: string,
    endDate?: string,
    limit?: number,
    offset?: number
  ) => Promise<void>;
  checkTodayStatus: () => Promise<void>;
  fetchStreak: () => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchBasicStats: () => Promise<void>;
  fetchReminderSettings: () => Promise<void>;
  saveReminderSettings: (settings: {
    is_enabled: boolean;
    reminder_time: string;
    frequency: ReminderFrequency;
    days_of_week?: number[];
    notification_sound?: string;
    notification_message?: string;
  }) => Promise<AffirmationReminderSettings | null>;
  updateReminderSettings: (settings: {
    is_enabled?: boolean;
    reminder_time?: string;
    frequency?: ReminderFrequency;
    days_of_week?: number[];
    notification_sound?: string;
    notification_message?: string;
  }) => Promise<AffirmationReminderSettings | null>;
  clearError: () => void;
  refetch: () => Promise<void>;
}

interface UseAffirmationsOptions {
  loadPersonalAffirmation?: boolean;
  loadReminderSettings?: boolean;
  loadStreak?: boolean;
  loadTodayStatus?: boolean;
}

const affirmationsQueryKeyPrefix = (userId: string | null) =>
  ['affirmations', userId ?? 'anonymous'] as const;

const personalAffirmationQueryKey = (userId: string | null) =>
  [...affirmationsQueryKeyPrefix(userId), 'personal'] as const;

const reminderSettingsQueryKey = (userId: string | null) =>
  [...affirmationsQueryKeyPrefix(userId), 'reminderSettings'] as const;

const streakQueryKey = (userId: string | null) =>
  [...affirmationsQueryKeyPrefix(userId), 'streak'] as const;

const todayStatusQueryKey = (userId: string | null) =>
  [...affirmationsQueryKeyPrefix(userId), 'todayStatus'] as const;

const statsQueryKey = (userId: string | null) =>
  [...affirmationsQueryKeyPrefix(userId), 'stats'] as const;

const logsQueryKey = (
  userId: string | null,
  startDate?: string,
  endDate?: string,
  limit = 20,
  offset = 0
) =>
  [
    ...affirmationsQueryKeyPrefix(userId),
    'logs',
    startDate ?? 'any',
    endDate ?? 'any',
    limit,
    offset,
  ] as const;

const normalizeReminderSettings = (
  settings: AffirmationReminderSettings | null
): AffirmationReminderSettings | null => {
  if (!settings || !settings.reminder_time) {
    return settings;
  }

  return {
    ...settings,
    reminder_time: transformTimeFormat(settings.reminder_time),
  };
};

const syncReminderPushSubscription = async (isEnabled: boolean | undefined): Promise<void> => {
  if (!isEnabled) {
    return;
  }

  const result = await pushSubscriptionService.subscribeCurrentBrowser();
  if (!result.success) {
    console.warn('Failed to register push subscription for affirmation reminder:', result.error);
  }
};

export const useAffirmations = (options: UseAffirmationsOptions = {}): UseAffirmationsReturn => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [manualError, setManualError] = useState<Error | null>(null);
  const loadPersonalAffirmation = options.loadPersonalAffirmation ?? true;
  const loadReminderSettings = options.loadReminderSettings ?? true;
  const loadStreak = options.loadStreak ?? true;
  const loadTodayStatus = options.loadTodayStatus ?? true;

  const personalAffirmationQuery = useQuery({
    queryKey: personalAffirmationQueryKey(userId),
    queryFn: async () => fetchPersonalAffirmation(),
    enabled: Boolean(userId) && loadPersonalAffirmation,
    meta: AUTH_SCOPED_QUERY_META,
  });

  const reminderSettingsQuery = useQuery({
    queryKey: reminderSettingsQueryKey(userId),
    queryFn: async () => normalizeReminderSettings(await fetchReminderSettings()),
    enabled: Boolean(userId) && loadReminderSettings,
    meta: AUTH_SCOPED_QUERY_META,
  });

  const streakQuery = useQuery({
    queryKey: streakQueryKey(userId),
    queryFn: async () => fetchAffirmationStreak(),
    enabled: Boolean(userId) && loadStreak,
    meta: AUTH_SCOPED_QUERY_META,
  });

  const todayStatusQuery = useQuery({
    queryKey: todayStatusQueryKey(userId),
    queryFn: async () => checkTodayStatusApi(),
    enabled: Boolean(userId) && loadTodayStatus,
    meta: AUTH_SCOPED_QUERY_META,
  });

  const statsQuery = useQuery({
    queryKey: statsQueryKey(userId),
    queryFn: async () => fetchAffirmationStats(),
    enabled: false,
    meta: AUTH_SCOPED_QUERY_META,
  });

  const createPersonalAffirmationMutation = useMutation({
    mutationFn: async ({
      text,
      category,
      intensity,
    }: {
      text: string;
      category?: AffirmationCategory;
      intensity?: AffirmationIntensity;
    }) => createPersonalAffirmationApi(text, category, intensity),
    onSuccess: affirmation => {
      queryClient.setQueryData(personalAffirmationQueryKey(userId), affirmation);
    },
  });

  const updatePersonalAffirmationMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: {
        text?: string;
        category?: AffirmationCategory;
        intensity?: AffirmationIntensity;
        is_active?: boolean;
      };
    }) => {
      const affirmation = await updatePersonalAffirmationApi(id, updates);

      if (!affirmation) {
        throw new Error('Failed to update affirmation');
      }

      return affirmation;
    },
    onSuccess: affirmation => {
      queryClient.setQueryData(personalAffirmationQueryKey(userId), affirmation);
    },
  });

  const deletePersonalAffirmationMutation = useMutation({
    mutationFn: async (id: string) => {
      const success = await deletePersonalAffirmationApi(id);

      if (!success) {
        throw new Error('Failed to delete affirmation');
      }

      return true;
    },
    onSuccess: () => {
      queryClient.setQueryData(personalAffirmationQueryKey(userId), null);
    },
  });

  const saveReminderSettingsMutation = useMutation({
    mutationFn: async (settings: {
      is_enabled: boolean;
      reminder_time: string;
      frequency: ReminderFrequency;
      days_of_week?: number[];
      notification_sound?: string;
      notification_message?: string;
    }) => {
      const backendSettings = {
        ...settings,
        reminder_time: transformTimeToBackend(settings.reminder_time),
        days_of_week: settings.days_of_week ?? getDaysOfWeekForFrequency(settings.frequency),
      };

      const reminderSettings = await upsertReminderSettings(backendSettings);
      return normalizeReminderSettings(reminderSettings);
    },
    onSuccess: async reminderSettings => {
      queryClient.setQueryData(reminderSettingsQueryKey(userId), reminderSettings);
      await syncReminderPushSubscription(reminderSettings?.is_enabled);
    },
  });

  const updateReminderSettingsMutation = useMutation({
    mutationFn: async (settings: {
      is_enabled?: boolean;
      reminder_time?: string;
      frequency?: ReminderFrequency;
      days_of_week?: number[];
      notification_sound?: string;
      notification_message?: string;
    }) => {
      const backendSettings = { ...settings };

      if (backendSettings.reminder_time) {
        backendSettings.reminder_time = transformTimeToBackend(backendSettings.reminder_time);
      }

      if (backendSettings.frequency && !backendSettings.days_of_week) {
        backendSettings.days_of_week = getDaysOfWeekForFrequency(backendSettings.frequency);
      }

      const reminderSettings = await updateReminderSettingsApi(backendSettings);
      return normalizeReminderSettings(reminderSettings);
    },
    onSuccess: async (reminderSettings, settings) => {
      queryClient.setQueryData(reminderSettingsQueryKey(userId), reminderSettings);
      await syncReminderPushSubscription(settings.is_enabled);
    },
  });

  const fetchPersonalAffirmationData = useCallback(async (): Promise<void> => {
    await personalAffirmationQuery.refetch();
  }, [personalAffirmationQuery]);

  const createPersonalAffirmation = useCallback(
    async (
      text: string,
      category?: AffirmationCategory,
      intensity?: AffirmationIntensity
    ): Promise<PersonalAffirmation | null> => {
      try {
        const affirmation = await createPersonalAffirmationMutation.mutateAsync({
          text,
          category,
          intensity,
        });
        setManualError(null);
        return affirmation;
      } catch (error) {
        setManualError(error instanceof Error ? error : new Error('Failed to create affirmation'));
        throw error;
      }
    },
    [createPersonalAffirmationMutation]
  );

  const updatePersonalAffirmation = useCallback(
    async (
      id: string,
      updates: {
        text?: string;
        category?: AffirmationCategory;
        intensity?: AffirmationIntensity;
        is_active?: boolean;
      }
    ): Promise<PersonalAffirmation | null> => {
      try {
        const affirmation = await updatePersonalAffirmationMutation.mutateAsync({ id, updates });
        setManualError(null);
        return affirmation;
      } catch (error) {
        setManualError(error instanceof Error ? error : new Error('Failed to update affirmation'));
        throw error;
      }
    },
    [updatePersonalAffirmationMutation]
  );

  const deletePersonalAffirmation = useCallback(
    async (id: string): Promise<void> => {
      try {
        await deletePersonalAffirmationMutation.mutateAsync(id);
        setManualError(null);
      } catch (error) {
        const nextError =
          error instanceof Error ? error : new Error('Failed to delete affirmation');
        setManualError(nextError);
        throw nextError;
      }
    },
    [deletePersonalAffirmationMutation]
  );

  const logAffirmation = useCallback(
    async (
      affirmationText: string,
      affirmationId?: string,
      date?: string
    ): Promise<AffirmationLog | null> => {
      try {
        const log = await logAffirmationApi(affirmationText, affirmationId, date);

        if (!log) {
          throw new Error('Failed to log affirmation');
        }

        queryClient.setQueryData(todayStatusQueryKey(userId), true);
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: streakQueryKey(userId) }),
          queryClient.invalidateQueries({ queryKey: statsQueryKey(userId) }),
        ]);
        setManualError(null);
        return log;
      } catch (error) {
        setManualError(error instanceof Error ? error : new Error('Failed to log affirmation'));
        throw error;
      }
    },
    [queryClient, userId]
  );

  const fetchLogs = useCallback(
    async (startDate?: string, endDate?: string, limit = 20, offset = 0): Promise<void> => {
      await queryClient.fetchQuery({
        queryKey: logsQueryKey(userId, startDate, endDate, limit, offset),
        queryFn: async () => {
          const response = await fetchAffirmationLogs(startDate, endDate, limit, offset);
          return response?.logs ?? [];
        },
        meta: AUTH_SCOPED_QUERY_META,
      });
    },
    [queryClient, userId]
  );

  const checkTodayStatus = useCallback(async (): Promise<void> => {
    await todayStatusQuery.refetch();
  }, [todayStatusQuery]);

  const fetchStreak = useCallback(async (): Promise<void> => {
    await streakQuery.refetch();
  }, [streakQuery]);

  const fetchStats = useCallback(async (): Promise<void> => {
    await statsQuery.refetch();
  }, [statsQuery]);

  const fetchBasicStatsData = useCallback(async (): Promise<void> => {
    await queryClient.fetchQuery({
      queryKey: statsQueryKey(userId),
      queryFn: async () => fetchBasicStats(),
      meta: AUTH_SCOPED_QUERY_META,
    });
  }, [queryClient, userId]);

  const fetchReminderSettingsData = useCallback(async (): Promise<void> => {
    await reminderSettingsQuery.refetch();
  }, [reminderSettingsQuery]);

  const saveReminderSettings = useCallback(
    async (settings: {
      is_enabled: boolean;
      reminder_time: string;
      frequency: ReminderFrequency;
      days_of_week?: number[];
      notification_sound?: string;
      notification_message?: string;
    }): Promise<AffirmationReminderSettings | null> => {
      try {
        const reminderSettings = await saveReminderSettingsMutation.mutateAsync(settings);
        setManualError(null);
        return reminderSettings;
      } catch (error) {
        setManualError(
          error instanceof Error ? error : new Error('Failed to save reminder settings')
        );
        throw error;
      }
    },
    [saveReminderSettingsMutation]
  );

  const updateReminderSettings = useCallback(
    async (settings: {
      is_enabled?: boolean;
      reminder_time?: string;
      frequency?: ReminderFrequency;
      days_of_week?: number[];
      notification_sound?: string;
      notification_message?: string;
    }): Promise<AffirmationReminderSettings | null> => {
      try {
        const reminderSettings = await updateReminderSettingsMutation.mutateAsync(settings);
        setManualError(null);
        return reminderSettings;
      } catch (error) {
        setManualError(
          error instanceof Error ? error : new Error('Failed to update reminder settings')
        );
        throw error;
      }
    },
    [updateReminderSettingsMutation]
  );

  const clearError = useCallback(() => {
    setManualError(null);
  }, []);

  const refetch = useCallback(async (): Promise<void> => {
    await Promise.all([
      personalAffirmationQuery.refetch(),
      reminderSettingsQuery.refetch(),
      streakQuery.refetch(),
      todayStatusQuery.refetch(),
    ]);
  }, [personalAffirmationQuery, reminderSettingsQuery, streakQuery, todayStatusQuery]);

  return {
    personalAffirmation: personalAffirmationQuery.data ?? null,
    reminderSettings: reminderSettingsQuery.data ?? null,
    streak: streakQuery.data ?? null,
    stats: statsQuery.data ?? null,
    logs: [],
    hasAffirmedToday: todayStatusQuery.data ?? false,
    isLoading:
      (loadPersonalAffirmation && personalAffirmationQuery.isLoading) ||
      (loadReminderSettings && reminderSettingsQuery.isLoading) ||
      (loadStreak && streakQuery.isLoading) ||
      (loadTodayStatus && todayStatusQuery.isLoading) ||
      createPersonalAffirmationMutation.isPending ||
      updatePersonalAffirmationMutation.isPending ||
      deletePersonalAffirmationMutation.isPending ||
      saveReminderSettingsMutation.isPending ||
      updateReminderSettingsMutation.isPending,
    error:
      manualError ||
      (loadPersonalAffirmation && personalAffirmationQuery.error instanceof Error
        ? personalAffirmationQuery.error
        : null) ||
      (loadReminderSettings && reminderSettingsQuery.error instanceof Error
        ? reminderSettingsQuery.error
        : null) ||
      (loadStreak && streakQuery.error instanceof Error ? streakQuery.error : null) ||
      (loadTodayStatus && todayStatusQuery.error instanceof Error
        ? todayStatusQuery.error
        : null) ||
      (statsQuery.error instanceof Error ? statsQuery.error : null),
    fetchPersonalAffirmation: fetchPersonalAffirmationData,
    createPersonalAffirmation,
    updatePersonalAffirmation,
    deletePersonalAffirmation,
    logAffirmation,
    fetchLogs,
    checkTodayStatus,
    fetchStreak,
    fetchStats,
    fetchBasicStats: fetchBasicStatsData,
    fetchReminderSettings: fetchReminderSettingsData,
    saveReminderSettings,
    updateReminderSettings,
    clearError,
    refetch,
  };
};
