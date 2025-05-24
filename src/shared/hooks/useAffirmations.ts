import { useCallback } from 'react';
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryKey,
  UseQueryResult,
  UseMutationResult,
  InitialDataFunction,
} from '@tanstack/react-query';
import { useAuth } from './useAuth';
import * as affirmationsService from '@/core/services/affirmationsService';
import {
  PersonalAffirmation,
  AffirmationReminderSettings,
  AffirmationStreak,
  AffirmationLog,
  AffirmationStats,
  AffirmationCategory,
  AffirmationIntensity,
  ReminderFrequency,
  AffirmationLogsResponse,
  AffirmationLogsResponse,
} from '@/core/services/affirmationsService';

// Query Keys
export const PERSONAL_AFFIRMATION_KEY = 'personalAffirmation'; // Exported
export const AFFIRMATION_REMINDER_SETTINGS_KEY = 'affirmationReminderSettings';
export const AFFIRMATION_STREAK_KEY = 'affirmationStreak';
const AFFIRMATION_STATS_KEY = 'affirmationStats';
const AFFIRMATION_LOGS_KEY = 'affirmationLogs';
const AFFIRMATION_TODAY_STATUS_KEY = 'affirmationTodayStatus';

// Variable types for mutations
interface CreatePersonalAffirmationVariables {
  text: string;
  category?: AffirmationCategory;
  intensity?: AffirmationIntensity;
}

interface UpdatePersonalAffirmationVariables {
  id: string;
  updates: Partial<Omit<PersonalAffirmation, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
}

interface LogAffirmationVariables {
  affirmationText: string;
  affirmationId?: string;
  date?: string;
}

interface SaveReminderSettingsVariables {
  is_enabled: boolean;
  reminder_time: string; // Frontend format HH:MM
  frequency: ReminderFrequency;
  days_of_week?: number[];
  notification_sound?: string;
  notification_message?: string;
}

interface UpdateReminderSettingsVariables extends Partial<SaveReminderSettingsVariables> {}


// Hook return type
export interface UseAffirmationsReturn {
  personalAffirmationQuery: UseQueryResult<PersonalAffirmation | null, Error>;
  reminderSettingsQuery: UseQueryResult<AffirmationReminderSettings | null, Error>;
  affirmationStreakQuery: UseQueryResult<AffirmationStreak | null, Error>;
  affirmationStatsQuery: UseQueryResult<AffirmationStats | null, Error>;
  affirmationLogsQuery: (
    startDate?: string,
    endDate?: string,
    limit?: number,
    offset?: number
  ) => UseQueryResult<AffirmationLogsResponse | null, Error>;
  affirmationTodayStatusQuery: UseQueryResult<boolean, Error>;

  createPersonalAffirmationMutation: UseMutationResult<
    PersonalAffirmation | null,
    Error,
    CreatePersonalAffirmationVariables
  >;
  updatePersonalAffirmationMutation: UseMutationResult<
    PersonalAffirmation | null,
    Error,
    UpdatePersonalAffirmationVariables
  >;
  deletePersonalAffirmationMutation: UseMutationResult<boolean, Error, string>;

  logAffirmationMutation: UseMutationResult<AffirmationLog | null, Error, LogAffirmationVariables>;

  saveReminderSettingsMutation: UseMutationResult<
    AffirmationReminderSettings | null,
    Error,
    SaveReminderSettingsVariables
  >;
  updateReminderSettingsMutation: UseMutationResult<
    AffirmationReminderSettings | null,
    Error,
    UpdateReminderSettingsVariables
  >;

  refetchAll: () => Promise<void>;
}

interface UseAffirmationsProps {
  initialPersonalAffirmation?: PersonalAffirmation | null | InitialDataFunction<PersonalAffirmation | null>;
}

export const useAffirmations = ({ initialPersonalAffirmation }: UseAffirmationsProps = {}): UseAffirmationsReturn => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const STALE_TIME = 1000 * 60 * 5; // 5 minutes

  // --- Queries ---
  const personalAffirmationQuery = useQuery<PersonalAffirmation | null, Error, PersonalAffirmation | null, QueryKey>(
    [PERSONAL_AFFIRMATION_KEY],
    affirmationsService.fetchPersonalAffirmation,
    { 
      enabled: isAuthenticated,
      initialData: initialPersonalAffirmation,
      staleTime: STALE_TIME,
    }
  );

  const reminderSettingsQuery = useQuery<AffirmationReminderSettings | null, Error, AffirmationReminderSettings | null, QueryKey>(
    [AFFIRMATION_REMINDER_SETTINGS_KEY],
    affirmationsService.fetchReminderSettings,
    {
      enabled: isAuthenticated,
      select: (data) => {
        if (data && data.reminder_time) {
          return { ...data, reminder_time: affirmationsService.transformTimeFormat(data.reminder_time) };
        }
        return data;
      },
    }
  );

  const affirmationStreakQuery = useQuery<AffirmationStreak | null, Error, AffirmationStreak | null, QueryKey>(
    [AFFIRMATION_STREAK_KEY],
    affirmationsService.fetchAffirmationStreak,
    { enabled: isAuthenticated }
  );

  const affirmationStatsQuery = useQuery<AffirmationStats | null, Error, AffirmationStats | null, QueryKey>(
    [AFFIRMATION_STATS_KEY],
    affirmationsService.fetchAffirmationStats, // Using the more comprehensive stats fetcher
    { enabled: isAuthenticated }
  );

  const affirmationLogsQuery = (
    startDate?: string,
    endDate?: string,
    limit = 20,
    offset = 0
  ): UseQueryResult<AffirmationLogsResponse | null, Error> => {
    return useQuery<AffirmationLogsResponse | null, Error, AffirmationLogsResponse | null, QueryKey>(
      [AFFIRMATION_LOGS_KEY, startDate, endDate, limit, offset],
      () => affirmationsService.fetchAffirmationLogs(startDate, endDate, limit, offset),
      { enabled: isAuthenticated }
    );
  };

  const affirmationTodayStatusQuery = useQuery<boolean, Error, boolean, QueryKey>(
    [AFFIRMATION_TODAY_STATUS_KEY],
    affirmationsService.checkTodayStatus,
    { enabled: isAuthenticated }
  );

  // --- Mutations ---

  const createPersonalAffirmationMutation = useMutation<
    PersonalAffirmation | null,
    Error,
    CreatePersonalAffirmationVariables
  >(
    ({ text, category, intensity }) =>
      affirmationsService.createPersonalAffirmation(text, category, intensity),
    {
      enabled: isAuthenticated,
      onSuccess: (data) => {
        queryClient.setQueryData([PERSONAL_AFFIRMATION_KEY], data);
        queryClient.invalidateQueries([PERSONAL_AFFIRMATION_KEY]);
      },
    }
  );

  const updatePersonalAffirmationMutation = useMutation<
    PersonalAffirmation | null,
    Error,
    UpdatePersonalAffirmationVariables
  >(
    ({ id, updates }) => affirmationsService.updatePersonalAffirmation(id, updates),
    {
      enabled: isAuthenticated,
      onMutate: async ({ updates }) => {
        await queryClient.cancelQueries([PERSONAL_AFFIRMATION_KEY]);
        const previousAffirmation = queryClient.getQueryData<PersonalAffirmation | null>([PERSONAL_AFFIRMATION_KEY]);
        if (previousAffirmation !== undefined) { // Ensure it's not undefined before setting
           queryClient.setQueryData<PersonalAffirmation | null>(
            [PERSONAL_AFFIRMATION_KEY],
            (old) => (old ? { ...old, ...updates } : null)
          );
        }
        return { previousAffirmation };
      },
      onError: (_err, _variables, context) => {
        if (context?.previousAffirmation !== undefined) {
          queryClient.setQueryData([PERSONAL_AFFIRMATION_KEY], context.previousAffirmation);
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries([PERSONAL_AFFIRMATION_KEY]);
      },
    }
  );

  const deletePersonalAffirmationMutation = useMutation<boolean, Error, string>(
    (id) => affirmationsService.deletePersonalAffirmation(id),
    {
      enabled: isAuthenticated,
      onMutate: async () => {
        await queryClient.cancelQueries([PERSONAL_AFFIRMATION_KEY]);
        const previousAffirmation = queryClient.getQueryData<PersonalAffirmation | null>([PERSONAL_AFFIRMATION_KEY]);
        queryClient.setQueryData<PersonalAffirmation | null>([PERSONAL_AFFIRMATION_KEY], null);
        return { previousAffirmation };
      },
      onError: (_err, _variables, context) => {
        if (context?.previousAffirmation !== undefined) {
          queryClient.setQueryData([PERSONAL_AFFIRMATION_KEY], context.previousAffirmation);
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries([PERSONAL_AFFIRMATION_KEY]);
      },
    }
  );

  const logAffirmationMutation = useMutation<AffirmationLog | null, Error, LogAffirmationVariables>(
    ({ affirmationText, affirmationId, date }) =>
      affirmationsService.logAffirmation(affirmationText, affirmationId, date),
    {
      enabled: isAuthenticated,
      onSuccess: (newLog) => {
        queryClient.invalidateQueries([AFFIRMATION_STREAK_KEY]);
        queryClient.invalidateQueries([AFFIRMATION_STATS_KEY]);
        queryClient.invalidateQueries([AFFIRMATION_LOGS_KEY]);
        queryClient.invalidateQueries([AFFIRMATION_TODAY_STATUS_KEY]);
        // Optionally, add to logs cache if displaying paginated logs and new log fits current view
         if (newLog) {
          queryClient.setQueryData<AffirmationLogsResponse | null>(
            [AFFIRMATION_LOGS_KEY], // Use a generic key or the specific one if params match
            (oldData) => {
              if (!oldData) return { logs: [newLog], total: 1 };
              return {
                ...oldData,
                logs: [newLog, ...oldData.logs], // Add to beginning
                total: oldData.total + 1,
              };
            }
          );
        }
      },
    }
  );

  const saveReminderSettingsMutation = useMutation<
    AffirmationReminderSettings | null,
    Error,
    SaveReminderSettingsVariables
  >(
    (settings) => {
      const backendSettings = {
        ...settings,
        reminder_time: affirmationsService.transformTimeToBackend(settings.reminder_time),
        days_of_week:
          settings.days_of_week || affirmationsService.getDaysOfWeekForFrequency(settings.frequency),
      };
      return affirmationsService.upsertReminderSettings(backendSettings);
    },
    {
      enabled: isAuthenticated,
      onSuccess: (data) => {
        if (data && data.reminder_time) {
          data.reminder_time = affirmationsService.transformTimeFormat(data.reminder_time);
        }
        queryClient.setQueryData([AFFIRMATION_REMINDER_SETTINGS_KEY], data);
        queryClient.invalidateQueries([AFFIRMATION_REMINDER_SETTINGS_KEY]);
      },
    }
  );

  const updateReminderSettingsMutation = useMutation<
    AffirmationReminderSettings | null,
    Error,
    UpdateReminderSettingsVariables
  >(
    (settings) => {
      const backendSettings: affirmationsService.AffirmationReminderSettings = { ...settings } as any; // Cast for partial
      if (settings.reminder_time) {
        backendSettings.reminder_time = affirmationsService.transformTimeToBackend(settings.reminder_time);
      }
      if (settings.frequency && !settings.days_of_week) {
        backendSettings.days_of_week = affirmationsService.getDaysOfWeekForFrequency(settings.frequency);
      }
      return affirmationsService.updateReminderSettings(backendSettings);
    },
    {
      enabled: isAuthenticated,
      onSuccess: (data) => {
         if (data && data.reminder_time) {
          data.reminder_time = affirmationsService.transformTimeFormat(data.reminder_time);
        }
        queryClient.setQueryData([AFFIRMATION_REMINDER_SETTINGS_KEY], data);
        // Optimistically update, then invalidate
        queryClient.invalidateQueries([AFFIRMATION_REMINDER_SETTINGS_KEY]);
      },
    }
  );

  const refetchAll = useCallback(async (): Promise<void> => {
    await queryClient.invalidateQueries([PERSONAL_AFFIRMATION_KEY]);
    await queryClient.invalidateQueries([AFFIRMATION_REMINDER_SETTINGS_KEY]);
    await queryClient.invalidateQueries([AFFIRMATION_STREAK_KEY]);
    await queryClient.invalidateQueries([AFFIRMATION_STATS_KEY]);
    await queryClient.invalidateQueries([AFFIRMATION_TODAY_STATUS_KEY]);
    await queryClient.invalidateQueries([AFFIRMATION_LOGS_KEY]); // Invalidate all log sets
    // Consider refetching active queries instead of just invalidating if immediate refresh is needed
    // For example: await Promise.all([...])
  }, [queryClient]);


  return {
    personalAffirmationQuery,
    reminderSettingsQuery,
    affirmationStreakQuery,
    affirmationStatsQuery,
    affirmationLogsQuery,
    affirmationTodayStatusQuery,
    createPersonalAffirmationMutation,
    updatePersonalAffirmationMutation,
    deletePersonalAffirmationMutation,
    logAffirmationMutation,
    saveReminderSettingsMutation,
    updateReminderSettingsMutation,
    refetchAll,
  };
};
