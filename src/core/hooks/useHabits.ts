import { useQuery, useMutation, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';
import {
  getHabits,
  getHabitById,
  createHabit,
  updateHabit,
  archiveHabit,
  getHabitLogs,
  getHabitStats,
  getHabitStreak,
  logHabitStatus,
  deleteHabitLog,
  Habit,
  HabitStatus,
  HabitsResponse,
  HabitLog,
  HabitLogsResponse,
  HabitStats,
  HabitStreak,
} from '../services/habitsService';

// Query keys
export const habitsKeys = {
  all: ['habits'] as const,
  lists: () => [...habitsKeys.all, 'list'] as const,
  list: (filters: {
    category?: string;
    active?: boolean;
    archived?: boolean;
    limit?: number;
    offset?: number;
  }) => [...habitsKeys.lists(), filters] as const,
  details: () => [...habitsKeys.all, 'detail'] as const,
  detail: (id: string) => [...habitsKeys.details(), id] as const,
  logs: () => [...habitsKeys.all, 'logs'] as const,
  habitLogs: (
    habitId: string,
    filters?: {
      startDate?: string;
      endDate?: string;
      limit?: number;
      offset?: number;
    }
  ) => [...habitsKeys.logs(), habitId, filters] as const,
  stats: () => [...habitsKeys.all, 'stats'] as const,
  streaks: () => [...habitsKeys.all, 'streaks'] as const,
  habitStreak: (habitId: string) => [...habitsKeys.streaks(), habitId] as const,
};

/**
 * Hook to fetch habits with filtering options
 */
export function useHabits(
  filters: {
    category?: string;
    active?: boolean;
    archived?: boolean;
    limit?: number;
    offset?: number;
  } = {}
): UseQueryResult<HabitsResponse, unknown> {
  const { category, active, archived, limit = 20, offset = 0 } = filters;

  return useQuery({
    queryKey: habitsKeys.list(filters),
    queryFn: () => getHabits(category, active, archived, limit, offset),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch a single habit by ID
 */
export function useHabit(id: string): UseQueryResult<Habit, unknown> {
  return useQuery({
    queryKey: habitsKeys.detail(id),
    queryFn: () => getHabitById(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!id, // Only run query if id is provided
  });
}

/**
 * Hook to create a new habit
 */
export function useCreateHabit(): UseMutationResult<
  Habit | null,
  unknown,
  { name: string; category: string; startDate?: string }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      name,
      category,
      startDate,
    }: {
      name: string;
      category: string;
      startDate?: string;
    }) => createHabit(name, category, startDate),
    onSuccess: () => {
      // Invalidate habits list to trigger refetch
      queryClient.invalidateQueries({ queryKey: habitsKeys.lists() });
    },
  });
}

/**
 * Hook to update an existing habit
 */
export function useUpdateHabit(): UseMutationResult<
  Habit | null,
  unknown,
  { id: string; data: Partial<Habit> }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Habit> }) => updateHabit(id, data),
    onSuccess: updatedHabit => {
      if (updatedHabit?.id) {
        // Update the specific habit in cache
        queryClient.invalidateQueries({ queryKey: habitsKeys.detail(updatedHabit.id) });
        // Also invalidate lists that might contain this habit
        queryClient.invalidateQueries({ queryKey: habitsKeys.lists() });
      }
    },
  });
}

/**
 * Hook to archive a habit
 */
export function useArchiveHabit(): UseMutationResult<boolean, unknown, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => archiveHabit(id),
    onSuccess: (_, id) => {
      // Invalidate the specific habit and lists
      queryClient.invalidateQueries({ queryKey: habitsKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: habitsKeys.lists() });
    },
  });
}

/**
 * Hook to fetch logs for a specific habit
 */
export function useHabitLogs(
  habitId: string,
  options?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }
): UseQueryResult<HabitLogsResponse | null, unknown> {
  const { startDate, endDate, limit = 30, offset = 0 } = options || {};

  return useQuery({
    queryKey: habitsKeys.habitLogs(habitId, { startDate, endDate, limit, offset }),
    queryFn: () => getHabitLogs(habitId, startDate, endDate, limit, offset),
    enabled: !!habitId, // Only run query if habitId is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to log a habit completion
 */
export function useLogHabit(): UseMutationResult<
  HabitLog | null,
  unknown,
  {
    habitId: string;
    date: string;
    status: HabitStatus;
    notes?: string;
  }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      habitId,
      date,
      status,
      notes,
    }: {
      habitId: string;
      date: string;
      status: HabitStatus;
      notes?: string;
    }) => logHabitStatus(habitId, date, status, notes),
    onSuccess: (result, variables) => {
      if (result) {
        // Invalidate logs for the specific habit
        queryClient.invalidateQueries({
          queryKey: habitsKeys.habitLogs(variables.habitId),
        });
        // Also invalidate the habit itself since streak might have changed
        queryClient.invalidateQueries({
          queryKey: habitsKeys.detail(variables.habitId),
        });
        // Invalidate streak data
        queryClient.invalidateQueries({
          queryKey: habitsKeys.habitStreak(variables.habitId),
        });
        // Invalidate overall stats
        queryClient.invalidateQueries({
          queryKey: habitsKeys.stats(),
        });
      }
    },
  });
}

/**
 * Hook to delete a habit log
 */
export function useDeleteHabitLog(): UseMutationResult<
  { result: boolean; habitId: string },
  unknown,
  { logId: string; habitId: string }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ logId, habitId }: { logId: string; habitId: string }) => {
      // Delete the log and return both the result and the habitId for cache invalidation
      return deleteHabitLog(logId).then(result => ({
        result,
        habitId,
      }));
    },
    onSuccess: data => {
      if (data.result && data.habitId) {
        // Invalidate logs for the specific habit
        queryClient.invalidateQueries({
          queryKey: habitsKeys.habitLogs(data.habitId),
        });
        // Also invalidate the habit itself since streak might have changed
        queryClient.invalidateQueries({
          queryKey: habitsKeys.detail(data.habitId),
        });
        // Invalidate streak data
        queryClient.invalidateQueries({
          queryKey: habitsKeys.habitStreak(data.habitId),
        });
        // Invalidate overall stats
        queryClient.invalidateQueries({
          queryKey: habitsKeys.stats(),
        });
      }
    },
  });
}

/**
 * Hook to fetch habit statistics
 */
export function useHabitStats(): UseQueryResult<HabitStats | null, unknown> {
  return useQuery({
    queryKey: habitsKeys.stats(),
    queryFn: () => getHabitStats(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch streak information for a specific habit
 */
export function useHabitStreak(habitId: string): UseQueryResult<HabitStreak | null, unknown> {
  return useQuery({
    queryKey: habitsKeys.habitStreak(habitId),
    queryFn: () => getHabitStreak(habitId),
    enabled: !!habitId, // Only run query if habitId is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch all active habits and their logs for today
 * Useful for daily habit tracking views
 */
export function useTodayHabits(): UseQueryResult<HabitsResponse, unknown> & {
  todayHabits: Array<Habit & { todayLog: HabitLog | null }>;
} {
  const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

  // Get all active habits
  const habitsQuery = useHabits({ active: true, archived: false });

  // Process the data to include today's logs
  const processedData = habitsQuery.data?.habits?.map(habit => {
    // Cast the unknown log to HabitLog type
    const logs = (habitsQuery.data as unknown as { logs?: HabitLog[] })?.logs;
    const todayLog = logs?.find(log => log.habit_id === habit.id && log.date === today) || null;

    return {
      ...habit,
      todayLog,
    };
  });

  return {
    ...habitsQuery,
    todayHabits: processedData || [],
  };
}

/**
 * Hook for habit insights - combines stats and streaks for data visualization
 */
export function useHabitInsights(): {
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  stats: HabitStats | null | undefined;
  longestStreak: number;
  completionRate: number;
  mostConsistentHabit: Habit | null;
  habitsCount: number;
} {
  // Get overall stats
  const statsQuery = useHabitStats();

  // Get all habits to calculate completion rates
  const habitsQuery = useHabits({ limit: 100 });

  // Get the longest streak
  // Using longestEverStreak which is the correct property name
  const longestStreak = statsQuery.data?.longestEverStreak || 0;

  // Calculate completion rate
  // Make sure these properties exist or adjust the calculation
  const completionRate =
    statsQuery.data?.totalHabits && statsQuery.data.totalHabits > 0
      ? Math.round((statsQuery.data.activeHabits / statsQuery.data.totalHabits) * 100)
      : 0;

  // Calculate most consistent habit
  const mostConsistentHabit = habitsQuery.data?.habits?.length
    ? habitsQuery.data.habits.reduce(
        (most, current) => {
          return current.streak > (most?.streak || 0) ? current : most;
        },
        null as Habit | null
      )
    : null;

  return {
    isLoading: statsQuery.isLoading || habitsQuery.isLoading,
    isError: statsQuery.isError || habitsQuery.isError,
    error: statsQuery.error || habitsQuery.error,
    stats: statsQuery.data,
    longestStreak,
    completionRate,
    mostConsistentHabit,
    habitsCount: habitsQuery.data?.habits?.length || 0,
  };
}
