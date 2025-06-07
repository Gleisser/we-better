import { useCallback, useMemo } from 'react';
import { useAuth } from './useAuth';
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryKey,
  UseQueryResult,
  UseMutationResult,
  InitialDataFunction,
  InitialDataFunction, // Make sure InitialDataFunction is imported
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
export const HABITS_QUERY_KEY = 'habits'; // Exported
export const HABIT_STATS_QUERY_KEY = 'habitStats';
export const HABIT_LOGS_QUERY_KEY = 'habitLogs'; // For individual log fetches
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
  habitsWithLogsQuery: UseQueryResult<HabitsWithLogsResponse | null, Error>; 
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

interface UseHabitsProps {
  initialHabitsData?: HabitsWithLogsResponse | null | InitialDataFunction<HabitsWithLogsResponse | null>; // Changed prop name and type
  category?: string;
  showArchived?: boolean;
}

export const useHabits = ({ initialHabitsData, category, showArchived = false }: UseHabitsProps = {}): UseHabitsReturn => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const STALE_TIME = 1000 * 60 * 5; // 5 minutes

  const defaultLogStartDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30); // Last 30 days
    return date.toISOString().split('T')[0];
  }, []);

  const defaultLogEndDate = useMemo(() => {
    return new Date().toISOString().split('T')[0]; // Today
  }, []);

  // Prepare initial data for underlying queries if initialHabitsData is provided
  const initialRawHabits = useMemo(() => {
    if (!initialHabitsData) return undefined;
    return {
      habits: initialHabitsData.habits.map(h => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { logs, ...rawHabit } = h; // Strip logs from the habit object for rawHabitsQuery
        return rawHabit;
      }),
      total: initialHabitsData.total,
    };
  }, [initialHabitsData]);

  const initialBatchLogs = useMemo(() => {
    if (!initialHabitsData) return undefined;
    return initialHabitsData.habits.reduce((acc, h) => {
      acc[h.id] = h.logs;
      return acc;
    }, {} as Record<string, HabitLog[]>);
  }, [initialHabitsData]);


  // Step 1: Fetch habits (raw habits, logs are fetched separately)
  const habitsQueryKey: QueryKey = [HABITS_QUERY_KEY, category, showArchived]; 
  const rawHabitsQuery = useQuery<HabitsResponse | null, Error, HabitsResponse | null, QueryKey>(
    habitsQueryKey,
    () => habitsService.getHabits(category, true, showArchived), 
    {
      enabled: isAuthenticated && !initialHabitsData, // Disable if initialData is provided and fresh
      initialData: initialRawHabits, // Use prepared initial raw habits
      staleTime: STALE_TIME,
    }
  );

  const habitIds = useMemo(
    () => (initialHabitsData?.habits || rawHabitsQuery.data?.habits || []).map(h => h.id),
    [initialHabitsData, rawHabitsQuery.data]
  );

  const batchHabitLogsQueryKey: QueryKey = [
    BATCH_HABIT_LOGS_KEY,
    habitIds.join(','),
    defaultLogStartDate,
    defaultLogEndDate,
  ];

  const batchHabitLogsQuery = useQuery<Record<string, HabitLog[]>, Error>(
    batchHabitLogsQueryKey,
    async () => {
      if (!habitIds.length) return {};
      const logPromises = habitIds.map(id =>
        habitsService.getHabitLogs(id, defaultLogStartDate, defaultLogEndDate)
      );
      const results = await Promise.all(logPromises);
      const logsMap: Record<string, HabitLog[]> = {};
      results.forEach((response, index) => {
        logsMap[habitIds[index]] = response?.logs || [];
      });
      return logsMap;
    },
    {
      enabled: isAuthenticated && habitIds.length > 0 && !initialHabitsData, // Disable if initialData is provided and fresh
      initialData: initialBatchLogs, // Use prepared initial batch logs
      staleTime: STALE_TIME,
    }
  );
  
  // Step 3: Combine habits and their logs
  const habitsWithLogsQuery = useMemo((): UseQueryResult<HabitsWithLogsResponse | null, Error> => {
    if (initialHabitsData && queryClient.getQueryState(habitsQueryKey)?.dataUpdatedAt && Date.now() - (queryClient.getQueryState(habitsQueryKey)?.dataUpdatedAt || 0) < STALE_TIME && queryClient.getQueryState(batchHabitLogsQueryKey)?.dataUpdatedAt && Date.now() - (queryClient.getQueryState(batchHabitLogsQueryKey)?.dataUpdatedAt || 0) < STALE_TIME) {
      return {
        data: initialHabitsData,
        isLoading: false,
        isSuccess: true,
        isError: false,
        error: null,
        // ... other necessary UseQueryResult properties
      } as UseQueryResult<HabitsWithLogsResponse | null, Error>;
    }

    // Fallback to fetching if initialData is not present or stale
    const { data: habitsData, isLoading: habitsLoading, error: habitsError, ...restRawHabits } = rawHabitsQuery;
    const { data: logsData, isLoading: logsLoading, error: logsError, ...restBatchLogs } = batchHabitLogsQuery;

    if (habitsLoading || (habitIds.length > 0 && logsLoading && !initialBatchLogs)) { // Consider initialBatchLogs for loading state
      return { isLoading: true, data: null, error: null, ...restRawHabits, ...restBatchLogs } as UseQueryResult<HabitsWithLogsResponse | null, Error>;
    }
    if (habitsError) {
      return { isLoading: false, data: null, error: habitsError, ...restRawHabits, ...restBatchLogs } as UseQueryResult<HabitsWithLogsResponse | null, Error>;
    }
     if (logsError && habitIds.length > 0 && !initialBatchLogs) { // Consider logsError only if logs were meant to be fetched
      return { isLoading: false, data: null, error: logsError, ...restRawHabits, ...restBatchLogs } as UseQueryResult<HabitsWithLogsResponse | null, Error>;
    }
    if (!habitsData) {
      return { isLoading: false, data: null, error: null, ...restRawHabits, ...restBatchLogs } as UseQueryResult<HabitsWithLogsResponse | null, Error>;
    }

    const actualLogsData = initialBatchLogs && !logsError ? initialBatchLogs : logsData;

    const combinedHabits: HabitWithLogs[] = habitsData.habits.map(habit => ({
      ...habit,
      logs: actualLogsData?.[habit.id] || [],
    }));

    return {
      data: { habits: combinedHabits, total: habitsData.total },
      isLoading: false,
      error: null,
      isSuccess: true, // Assuming success if we reach here
      ...restRawHabits, // Spread other properties like status, refetch, etc.
    } as UseQueryResult<HabitsWithLogsResponse | null, Error>;
  }, [initialHabitsData, rawHabitsQuery, batchHabitLogsQuery, habitIds, queryClient, habitsQueryKey, batchHabitLogsQueryKey, initialBatchLogs]);

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
    habitsWithLogsQuery, 
    statsQuery,
    createHabitMutation,
    updateHabitMutation,
    archiveHabitMutation,
    logHabitCompletionMutation,
    deleteHabitLogMutation,
    getHabitLogs,
  };
};
