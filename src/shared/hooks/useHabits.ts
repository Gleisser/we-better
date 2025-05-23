import { useCallback, useMemo } from 'react';
import { useAuth } from './useAuth';
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryKey,
  UseQueryResult,
  UseMutationResult,
} from '@tanstack/react-query';
import * as habitsService from '@/core/services/habitsService';
import {
  Habit,
  HabitStatus,
  HabitLog,
  HabitStats,
  HabitsResponse,
  HabitLogsResponse,
} from '@/core/services/habitsService';

// Query Keys
const HABITS_QUERY_KEY = 'habits';
const HABIT_STATS_QUERY_KEY = 'habitStats';
const HABIT_LOGS_QUERY_KEY = 'habitLogs'; // For individual log fetches
const BATCH_HABIT_LOGS_KEY = 'batchHabitLogs'; // For batch log fetches

// New type for Habit with embedded logs
export interface HabitWithLogs extends Habit {
  logs: HabitLog[];
}

export interface HabitsWithLogsResponse {
  habits: HabitWithLogs[];
  total: number;
}
interface UseHabitsReturn {
  habitsWithLogsQuery: UseQueryResult<HabitsWithLogsResponse | null, Error>; // Updated
  statsQuery: UseQueryResult<HabitStats | null, Error>;
  createHabitMutation: UseMutationResult<Habit | null, Error, { name: string; category: string; startDate?: string }>;
  updateHabitMutation: UseMutationResult<Habit | null, Error, { id: string; data: Partial<Habit> }>;
  archiveHabitMutation: UseMutationResult<boolean, Error, string>;
  logHabitCompletionMutation: UseMutationResult<
    HabitLog | null,
    Error,
    { habitId: string; date: string; status: HabitStatus; notes?: string }
  >;
  deleteHabitLogMutation: UseMutationResult<boolean, Error, string>;
  getHabitLogs: (
    habitId: string,
    startDate?: string,
    endDate?: string
  ) => Promise<HabitLogsResponse | null>;
}

export const useHabits = (category?: string, showArchived = false): UseHabitsReturn => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const defaultLogStartDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30); // Last 30 days
    return date.toISOString().split('T')[0];
  }, []);

  const defaultLogEndDate = useMemo(() => {
    return new Date().toISOString().split('T')[0]; // Today
  }, []);

  // Step 1: Fetch habits
  const habitsQueryKey: QueryKey = [HABITS_QUERY_KEY, category, showArchived];
  const rawHabitsQuery = useQuery<HabitsResponse | null, Error, HabitsResponse | null, QueryKey>(
    habitsQueryKey,
    () => habitsService.getHabits(category, true, showArchived),
    {
      enabled: isAuthenticated,
    }
  );

  // Step 2: Fetch logs for these habits in batch
  const habitIds = useMemo(
    () => rawHabitsQuery.data?.habits.map(h => h.id) || [],
    [rawHabitsQuery.data]
  );

  const batchHabitLogsQueryKey: QueryKey = [
    BATCH_HABIT_LOGS_KEY,
    habitIds.join(','), // Create a stable key from habitIds
    defaultLogStartDate,
    defaultLogEndDate,
  ];

  const batchHabitLogsQuery = useQuery<Record<string, HabitLog[]>, Error>(
    batchHabitLogsQueryKey,
    async () => {
      if (!habitIds.length) {
        return {};
      }
      const logPromises = habitIds.map(id =>
        habitsService.getHabitLogs(id, defaultLogStartDate, defaultLogEndDate)
      );
      const results = await Promise.all(logPromises);
      const logsMap: Record<string, HabitLog[]> = {};
      results.forEach((response, index) => {
        if (response) {
          logsMap[habitIds[index]] = response.logs;
        } else {
          logsMap[habitIds[index]] = [];
        }
      });
      return logsMap;
    },
    {
      enabled: isAuthenticated && rawHabitsQuery.isSuccess && habitIds.length > 0,
    }
  );

  // Step 3: Combine habits and their logs
  const habitsWithLogsQuery = useMemo((): UseQueryResult<HabitsWithLogsResponse | null, Error> => {
    const { data: habitsData, isLoading: habitsLoading, error: habitsError, ...restHabitsQuery } = rawHabitsQuery;
    const { data: logsData, isLoading: logsLoading, error: logsError, ...restLogsQuery } = batchHabitLogsQuery;

    if (habitsLoading) {
      return { isLoading: true, data: null, error: null, ...restHabitsQuery, ...restLogsQuery } as UseQueryResult<HabitsWithLogsResponse | null, Error>;
    }
    if (habitsError) {
      return { isLoading: false, data: null, error: habitsError, ...restHabitsQuery, ...restLogsQuery } as UseQueryResult<HabitsWithLogsResponse | null, Error>;
    }
    if (!habitsData) {
      return { isLoading: false, data: null, error: null, ...restHabitsQuery, ...restLogsQuery } as UseQueryResult<HabitsWithLogsResponse | null, Error>;
    }

    // If logs are still loading but habits are fetched, we can show habits without logs yet, or show loading.
    // For simplicity here, let's consider it loading if logs are not ready for combining.
    if (habitIds.length > 0 && logsLoading && !logsData) {
       return { isLoading: true, data: null, error: null, ...restHabitsQuery, ...restLogsQuery,  refetch: rawHabitsQuery.refetch } as UseQueryResult<HabitsWithLogsResponse | null, Error>;
    }
    if (logsError) {
       return { isLoading: false, data: null, error: logsError, ...restHabitsQuery, ...restLogsQuery, refetch: rawHabitsQuery.refetch } as UseQueryResult<HabitsWithLogsResponse | null, Error>;
    }


    const combinedHabits: HabitWithLogs[] = habitsData.habits.map(habit => ({
      ...habit,
      logs: logsData?.[habit.id] || [],
    }));

    return {
      data: { habits: combinedHabits, total: habitsData.total },
      isLoading: false, // Becomes false once habits are loaded and logs attempt has settled (even if logsData is empty)
      error: null,
      ...restHabitsQuery, // Spread other properties like status, refetch, etc.
       // Manually merging other relevant properties from batchHabitLogsQuery if needed,
      // but typically the primary query's (rawHabitsQuery) properties are dominant.
      isSuccess: rawHabitsQuery.isSuccess && (habitIds.length === 0 || batchHabitLogsQuery.isSuccess),
      isFetching: rawHabitsQuery.isFetching || batchHabitLogsQuery.isFetching,
      // Add other relevant properties from rawHabitsQuery or batchHabitLogsQuery as needed
    } as UseQueryResult<HabitsWithLogsResponse | null, Error>;
  }, [rawHabitsQuery, batchHabitLogsQuery, habitIds]);


  // Fetch habit statistics
  const statsQueryKey: QueryKey = [HABIT_STATS_QUERY_KEY];
  const statsQuery = useQuery<HabitStats | null, Error, HabitStats | null, QueryKey>(
    statsQueryKey,
    habitsService.getHabitStats,
    {
      enabled: isAuthenticated,
    }
  );

  // Create a new habit
  const createHabitMutation = useMutation<
    Habit | null,
    Error,
    { name: string; category: string; startDate?: string }
  >(
    async ({ name, category: cat, startDate }) => habitsService.createHabit(name, cat, startDate),
    {
      enabled: isAuthenticated,
      onSuccess: () => {
        queryClient.invalidateQueries(habitsQueryKey);
        queryClient.invalidateQueries(statsQueryKey);
      },
    }
  );

  // Update an existing habit
  const updateHabitMutation = useMutation<
    Habit | null,
    Error,
    { id: string; data: Partial<Habit> }
  >(
    async ({ id, data }) => habitsService.updateHabit(id, data),
    {
      enabled: isAuthenticated,
      onSuccess: (updatedHabit, variables) => {
        queryClient.invalidateQueries(habitsQueryKey);
        queryClient.invalidateQueries(statsQueryKey);
        // Optionally, update the specific habit in the cache
        if (updatedHabit) {
          queryClient.setQueryData<HabitsResponse | null>(habitsQueryKey, oldData => {
            if (!oldData) return null;
            return {
              ...oldData,
              habits: oldData.habits.map(h => (h.id === variables.id ? updatedHabit : h)),
            };
          });
        }
      },
    }
  );

  // Archive a habit
  const archiveHabitMutation = useMutation<boolean, Error, string>(
    async (id) => habitsService.archiveHabit(id),
    {
      enabled: isAuthenticated,
      onSuccess: (success, id) => {
        if (success) {
          queryClient.invalidateQueries(habitsQueryKey);
          queryClient.invalidateQueries(statsQueryKey);
          // Optimistically remove from cache or refetch
          queryClient.setQueryData<HabitsResponse | null>(habitsQueryKey, oldData => {
            if (!oldData) return null;
            return {
              ...oldData,
              habits: oldData.habits.filter(h => h.id !== id),
            };
          });
        }
      },
    }
  );

  // Log a habit completion
  const logHabitCompletionMutation = useMutation<
    HabitLog | null,
    Error,
    { habitId: string; date: string; status: HabitStatus; notes?: string }
  >(
    async ({ habitId, date, status, notes }) =>
      habitsService.logHabitStatus(habitId, date, status, notes),
    {
      enabled: isAuthenticated,
      onSuccess: (log, variables) => {
        if (log) {
          queryClient.invalidateQueries(habitsQueryKey); // Invalidate all habits as streaks might change
          queryClient.invalidateQueries(statsQueryKey);
          queryClient.invalidateQueries([HABIT_LOGS_QUERY_KEY, variables.habitId]);
        }
      },
    }
  );

  // Delete a habit log
  const deleteHabitLogMutation = useMutation<boolean, Error, string>(
    async (logId) => habitsService.deleteHabitLog(logId),
    {
      enabled: isAuthenticated,
      onSuccess: (success, logId) => {
        if (success) {
          // Need to know which habit this log belonged to for invalidation,
          // or invalidate all logs, or all habits (as streaks could change)
          queryClient.invalidateQueries([HABIT_LOGS_QUERY_KEY]); // Broad invalidation
          queryClient.invalidateQueries(habitsQueryKey);
          queryClient.invalidateQueries(statsQueryKey);
        }
      },
    }
  );

  // Get logs for a specific habit - uses queryClient.fetchQuery as per recommendation
  const getHabitLogs = useCallback(
    async (
      habitId: string,
      startDate?: string,
      endDate?: string
    ): Promise<HabitLogsResponse | null> => {
      if (!isAuthenticated) {
        // Or throw an error, React Query will catch it if this function is used in a queryFn
        console.error('User not authenticated - getHabitLogs');
        return null;
      }
      const queryKey: QueryKey = [HABIT_LOGS_QUERY_KEY, habitId, startDate, endDate];
      try {
        return await queryClient.fetchQuery(
          queryKey,
          () => habitsService.getHabitLogs(habitId, startDate, endDate),
          {
            staleTime: 1000 * 60 * 1, // Logs might change, but not as rapidly as habits list
          }
        );
      } catch (err) {
        // queryClient.fetchQuery throws, so this catch might not be strictly necessary
        // unless we want to do specific error handling here before re-throwing or returning null.
        console.error('Error fetching habit logs via queryClient:', err);
        throw err; // Re-throw to be caught by component or error boundary
      }
    },
    [isAuthenticated, queryClient]
  );


  // The old useEffect for initial data fetching is no longer needed.
  // useQuery handles fetching when the component mounts and when `enabled` status changes.

  return {
    habitsQuery,
    statsQuery,
    createHabitMutation,
    updateHabitMutation,
    archiveHabitMutation,
    logHabitCompletionMutation,
    deleteHabitLogMutation,
    getHabitLogs,
  };
};
