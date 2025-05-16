import { useQueryClient, UseQueryResult } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';
import { useQueuedQuery } from './useQueuedQuery';
import { useQueuedMutation } from './useQueuedMutation';
import {
  Habit,
  HabitStatus,
  HabitsResponse,
  HabitLog,
  HabitLogsResponse,
  HabitStats,
  HabitStreak,
} from '../services/habitsService';
import { RequestPriority } from '../database/db';

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

  let url = `/api/habits?limit=${limit}&offset=${offset}`;
  if (category) url += `&category=${category}`;
  if (active !== undefined) url += `&active=${active}`;
  if (archived !== undefined) url += `&archived=${archived}`;

  return useQueuedQuery<HabitsResponse>({
    queryKey: habitsKeys.list(filters) as unknown as string[],
    endpoint: url,
    queue: {
      cacheDuration: 5 * 60 * 1000, // 5 minutes
      priority: RequestPriority.HIGH,
    },
  });
}

/**
 * Hook to fetch a single habit by ID
 */
export function useHabit(id: string): UseQueryResult<Habit, unknown> {
  return useQueuedQuery<Habit>({
    queryKey: habitsKeys.detail(id) as unknown as string[],
    endpoint: `/api/habits/${id}`,
    enabled: !!id, // Only run query if id is provided
    queue: {
      cacheDuration: 5 * 60 * 1000, // 5 minutes
      priority: RequestPriority.HIGH,
    },
  });
}

/**
 * Hook to create a new habit with optimistic updates
 */
export function useCreateHabit(): UseMutationResult<
  Habit | null,
  unknown,
  { name: string; category: string; startDate?: string }
> {
  const queryClient = useQueryClient();

  return useQueuedMutation({
    endpoint: '/api/habits',
    method: 'POST',
    queue: {
      priority: RequestPriority.HIGH,
      tags: ['habit', 'create'],
    },
    // Optimistically update the habits list
    onMutate: async newHabitData => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: habitsKeys.lists() });

      // Get current habits list
      const previousHabits = queryClient.getQueryData<HabitsResponse>(
        habitsKeys.list({ active: true, archived: false })
      );

      // Create an optimistic habit with temporary ID
      const optimisticHabit: Habit = {
        id: `temp-${Date.now()}`,
        user_id: 'current-user', // Will be assigned by the server
        name: newHabitData.name,
        category: newHabitData.category,
        streak: 0,
        start_date: newHabitData.startDate || new Date().toISOString().split('T')[0],
        active: true,
        archived: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Update the cache with optimistic data
      if (previousHabits) {
        queryClient.setQueryData(habitsKeys.list({ active: true, archived: false }), {
          habits: [optimisticHabit, ...previousHabits.habits],
          total: previousHabits.total + 1,
        });
      }

      // Return context for potential rollback
      return { previousHabits, optimisticHabit };
    },

    onSuccess: (newHabit, _, context) => {
      // If we have a real habit from the server and an optimistic one, update the cache
      if (newHabit?.id && context?.optimisticHabit) {
        // Replace the optimistic habit with the real one in any lists
        const listsQueries = queryClient.getQueriesData<HabitsResponse>({
          queryKey: habitsKeys.lists(),
        });

        listsQueries.forEach(([queryKey, queryData]) => {
          if (queryData?.habits) {
            queryClient.setQueryData(queryKey, {
              ...queryData,
              habits: queryData.habits.map(habit =>
                habit.id === context.optimisticHabit.id ? newHabit : habit
              ),
            });
          }
        });

        // Add the real habit to its detail cache
        queryClient.setQueryData(habitsKeys.detail(newHabit.id), newHabit);
      }

      // Invalidate relevant queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: habitsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: habitsKeys.stats() });
    },

    onError: (_, __, context) => {
      // If the mutation fails, revert to the previous state
      if (context?.previousHabits) {
        queryClient.setQueryData(
          habitsKeys.list({ active: true, archived: false }),
          context.previousHabits
        );
      }
    },
  });
}

/**
 * Hook to update an existing habit with optimistic updates
 */
export function useUpdateHabit(): UseMutationResult<
  Habit | null,
  unknown,
  { id: string; data: Partial<Habit> }
> {
  const queryClient = useQueryClient();

  return useQueuedMutation({
    endpoint: '/api/habits',
    method: 'PUT',
    queue: {
      priority: RequestPriority.HIGH,
      tags: ['habit', 'update'],
    },
    mutationFn: ({ id, data }) => {
      // Custom mutationFn that includes the id in the endpoint
      const endpoint = `/api/habits/${id}`;
      return fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }).then(response => {
        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        return response.json();
      });
    },

    // Optimistically update the habit
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: habitsKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: habitsKeys.lists() });

      // Get the current habit
      const previousHabit = queryClient.getQueryData<Habit>(habitsKeys.detail(id));

      // If we don't have the habit in cache, we can't do an optimistic update
      if (!previousHabit) return { previousHabit: null };

      // Create an optimistic habit by merging the current habit with updates
      const optimisticHabit: Habit = {
        ...previousHabit,
        ...data,
        updated_at: new Date().toISOString(),
      };

      // Update the habit in the cache
      queryClient.setQueryData(habitsKeys.detail(id), optimisticHabit);

      // Also update any lists that contain this habit
      const listsQueries = queryClient.getQueriesData<HabitsResponse>({
        queryKey: habitsKeys.lists(),
      });

      const previousLists: Record<string, HabitsResponse | undefined> = {};

      listsQueries.forEach(([queryKey, queryData]) => {
        previousLists[queryKey.toString()] = queryData;

        if (queryData?.habits) {
          const updatedHabits = queryData.habits.map(habit =>
            habit.id === id ? optimisticHabit : habit
          );

          // If archiving or changing active status, we might need to filter it out
          let filteredHabits = updatedHabits;
          if (typeof data.archived !== 'undefined' || typeof data.active !== 'undefined') {
            // Extract filter from query key to determine if habit should be included
            const filterKey = queryKey[2] as { active?: boolean; archived?: boolean };
            if (filterKey) {
              if (
                typeof filterKey.active !== 'undefined' &&
                data.active !== undefined &&
                data.active !== filterKey.active
              ) {
                filteredHabits = updatedHabits.filter(h => h.id !== id);
              }

              if (
                typeof filterKey.archived !== 'undefined' &&
                data.archived !== undefined &&
                data.archived !== filterKey.archived
              ) {
                filteredHabits = updatedHabits.filter(h => h.id !== id);
              }
            }
          }

          queryClient.setQueryData(queryKey, {
            ...queryData,
            habits: filteredHabits,
            // Adjust total if the habit was filtered out
            total:
              filteredHabits.length !== updatedHabits.length
                ? queryData.total - 1
                : queryData.total,
          });
        }
      });

      return { previousHabit, previousLists };
    },

    onSuccess: (updatedHabit, { id }, _context) => {
      if (updatedHabit) {
        // Update the specific habit in cache with server data
        queryClient.setQueryData(habitsKeys.detail(id), updatedHabit);
      }

      // Invalidate necessary queries
      queryClient.invalidateQueries({ queryKey: habitsKeys.lists() });

      // Check if active or archived properties exist and are not null before accessing
      const hasActiveChange = updatedHabit && 'active' in updatedHabit;
      const hasArchivedChange = updatedHabit && 'archived' in updatedHabit;

      if (hasActiveChange || hasArchivedChange) {
        queryClient.invalidateQueries({ queryKey: habitsKeys.stats() });
      }
    },

    onError: (_, { id }, context) => {
      // Revert the habit to its previous state
      if (context?.previousHabit) {
        queryClient.setQueryData(habitsKeys.detail(id), context.previousHabit);
      }

      // Revert any lists
      if (context?.previousLists) {
        Object.entries(context.previousLists).forEach(([queryKeyStr, queryData]) => {
          if (queryData) {
            // Parse the string back to a query key
            const queryKey = JSON.parse(queryKeyStr);
            queryClient.setQueryData(queryKey, queryData);
          }
        });
      }
    },
  });
}

/**
 * Hook to archive a habit with optimistic updates
 */
export function useArchiveHabit(): UseMutationResult<boolean, unknown, string> {
  const queryClient = useQueryClient();

  return useQueuedMutation({
    endpoint: '/api/habits',
    method: 'PUT',
    queue: {
      priority: RequestPriority.HIGH,
      tags: ['habit', 'archive'],
    },
    mutationFn: id => {
      // Custom mutationFn that includes the id in the endpoint
      const endpoint = `/api/habits/${id}/archive`;
      return fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      }).then(response => {
        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        return response.json();
      });
    },

    // Optimistically update the habit
    onMutate: async id => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: habitsKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: habitsKeys.lists() });

      // Get the current habit
      const previousHabit = queryClient.getQueryData<Habit>(habitsKeys.detail(id));

      // If we don't have the habit in cache, we can't do an optimistic update
      if (!previousHabit) return { previousHabit: null };

      // Create an optimistic archived habit
      const optimisticHabit: Habit = {
        ...previousHabit,
        archived: true,
        active: false,
        archive_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Update the habit in the cache
      queryClient.setQueryData(habitsKeys.detail(id), optimisticHabit);

      // Store previous lists for potential rollback
      const listsQueries = queryClient.getQueriesData<HabitsResponse>({
        queryKey: habitsKeys.lists(),
      });

      const previousLists: Record<string, HabitsResponse | undefined> = {};

      // Update habit in lists or remove it if it no longer matches filters
      listsQueries.forEach(([queryKey, queryData]) => {
        previousLists[queryKey.toString()] = queryData;

        if (queryData?.habits) {
          // Extract filter from query key to determine if habit should be included
          const filterKey = queryKey[2] as { active?: boolean; archived?: boolean };

          let updatedHabits = queryData.habits;

          if (
            filterKey &&
            ((typeof filterKey.active !== 'undefined' && filterKey.active === true) ||
              (typeof filterKey.archived !== 'undefined' && filterKey.archived === false))
          ) {
            // Remove habit from active or non-archived lists
            updatedHabits = queryData.habits.filter(h => h.id !== id);
          } else if (
            filterKey &&
            typeof filterKey.archived !== 'undefined' &&
            filterKey.archived === true
          ) {
            // Add or update habit in archived lists
            const habitIndex = queryData.habits.findIndex(h => h.id === id);
            if (habitIndex >= 0) {
              updatedHabits = [
                ...queryData.habits.slice(0, habitIndex),
                optimisticHabit,
                ...queryData.habits.slice(habitIndex + 1),
              ];
            } else {
              updatedHabits = [optimisticHabit, ...queryData.habits];
            }
          }

          queryClient.setQueryData(queryKey, {
            ...queryData,
            habits: updatedHabits,
            total: updatedHabits.length, // Update total count
          });
        }
      });

      return { previousHabit, previousLists };
    },

    onSuccess: (_, id) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: habitsKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: habitsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: habitsKeys.stats() });
      queryClient.invalidateQueries({ queryKey: habitsKeys.habitStreak(id) });
    },

    onError: (_, id, context) => {
      // Revert the habit to its previous state
      if (context?.previousHabit) {
        queryClient.setQueryData(habitsKeys.detail(id), context.previousHabit);
      }

      // Revert any lists
      if (context?.previousLists) {
        Object.entries(context.previousLists).forEach(([queryKeyStr, queryData]) => {
          if (queryData) {
            const queryKey = JSON.parse(queryKeyStr);
            queryClient.setQueryData(queryKey, queryData);
          }
        });
      }
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

  let url = `/api/habits/logs?habit_id=${habitId}&limit=${limit}&offset=${offset}`;
  if (startDate) url += `&start_date=${startDate}`;
  if (endDate) url += `&end_date=${endDate}`;

  return useQueuedQuery<HabitLogsResponse | null>({
    queryKey: habitsKeys.habitLogs(habitId, {
      startDate,
      endDate,
      limit,
      offset,
    }) as unknown as string[],
    endpoint: url,
    enabled: !!habitId, // Only run query if habitId is provided
    queue: {
      cacheDuration: 5 * 60 * 1000, // 5 minutes
      priority: RequestPriority.MEDIUM,
    },
  });
}

/**
 * Hook to log a habit completion with optimistic updates
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

  return useQueuedMutation({
    endpoint: '/api/habits/logs',
    method: 'POST',
    queue: {
      priority: RequestPriority.HIGH,
      tags: ['habit', 'log'],
    },
    mutationFn: ({ habitId, date, status, notes }) => {
      return fetch('/api/habits/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ habitId, date, status, notes }),
      }).then(response => {
        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        return response.json();
      });
    },

    // Optimistically update the log
    onMutate: async newLog => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: habitsKeys.habitLogs(newLog.habitId),
      });

      // Get existing logs and habit
      const previousLogs = queryClient.getQueryData<HabitLogsResponse>(
        habitsKeys.habitLogs(newLog.habitId)
      );

      const previousHabit = queryClient.getQueryData<Habit>(habitsKeys.detail(newLog.habitId));

      // Create an optimistic log
      const optimisticLog: HabitLog = {
        id: `temp-${Date.now()}`,
        habit_id: newLog.habitId,
        user_id: previousHabit?.user_id || 'current-user',
        date: newLog.date,
        status: newLog.status,
        notes: newLog.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Check if we're updating an existing log or creating a new one
      const existingLogIndex =
        previousLogs?.logs?.findIndex(
          log => log.habit_id === newLog.habitId && log.date === newLog.date
        ) ?? -1;

      // Update logs in the cache
      if (previousLogs) {
        const updatedLogs =
          existingLogIndex >= 0
            ? [
                ...previousLogs.logs.slice(0, existingLogIndex),
                optimisticLog,
                ...previousLogs.logs.slice(existingLogIndex + 1),
              ]
            : [optimisticLog, ...(previousLogs.logs || [])];

        queryClient.setQueryData(habitsKeys.habitLogs(newLog.habitId), {
          ...previousLogs,
          logs: updatedLogs,
          total: existingLogIndex >= 0 ? previousLogs.total : previousLogs.total + 1,
        });
      }

      // Update today's habits if this is a log for today
      const today = new Date().toISOString().split('T')[0];
      if (newLog.date === today) {
        const todayHabitsQueryKey = habitsKeys.list({ active: true, archived: false });
        const previousTodayHabits = queryClient.getQueryData<HabitsResponse>(todayHabitsQueryKey);

        if (previousTodayHabits && previousHabit) {
          const updatedHabits = previousTodayHabits.habits.map(habit => {
            if (habit.id === newLog.habitId) {
              // Calculate potential new streak
              let updatedStreak = habit.streak;
              if (newLog.status === 'completed') {
                updatedStreak = updatedStreak + 1;
              }

              return {
                ...habit,
                streak: updatedStreak,
                todayLog: optimisticLog,
              };
            }
            return habit;
          });

          queryClient.setQueryData(todayHabitsQueryKey, {
            ...previousTodayHabits,
            habits: updatedHabits,
          });
        }
      }

      return {
        previousLogs,
        previousHabit,
        optimisticLog,
      };
    },

    onSuccess: (result, variables) => {
      if (result) {
        // Update the cache with the real log
        const logsQueryKey = habitsKeys.habitLogs(variables.habitId);
        const currentLogs = queryClient.getQueryData<HabitLogsResponse>(logsQueryKey);

        if (currentLogs) {
          // Find and replace optimistic log with real one
          const updatedLogs = currentLogs.logs.map(log =>
            log.date === variables.date && log.habit_id === variables.habitId ? result : log
          );

          queryClient.setQueryData(logsQueryKey, {
            ...currentLogs,
            logs: updatedLogs,
          });
        }

        // Invalidate queries that might have changed
        queryClient.invalidateQueries({ queryKey: habitsKeys.detail(variables.habitId) });
        queryClient.invalidateQueries({ queryKey: habitsKeys.habitStreak(variables.habitId) });
        queryClient.invalidateQueries({ queryKey: habitsKeys.stats() });

        // If logging today's habit, ensure today's habits view is refreshed
        const today = new Date().toISOString().split('T')[0];
        if (variables.date === today) {
          queryClient.invalidateQueries({
            queryKey: habitsKeys.list({ active: true, archived: false }),
          });
        }
      }
    },

    onError: (_, variables, context) => {
      // Revert logs to their previous state
      if (context?.previousLogs) {
        queryClient.setQueryData(habitsKeys.habitLogs(variables.habitId), context.previousLogs);
      }

      // Also revert today's habits if this was for today
      const today = new Date().toISOString().split('T')[0];
      if (variables.date === today && context?.previousHabit) {
        const todayHabitsQueryKey = habitsKeys.list({ active: true, archived: false });
        const currentTodayHabits = queryClient.getQueryData<HabitsResponse>(todayHabitsQueryKey);

        if (currentTodayHabits) {
          const revertedHabits = currentTodayHabits.habits.map(habit =>
            habit.id === variables.habitId
              ? {
                  ...context.previousHabit,
                  todayLog:
                    context.previousLogs?.logs.find(
                      log => log.habit_id === variables.habitId && log.date === today
                    ) || null,
                }
              : habit
          );

          queryClient.setQueryData(todayHabitsQueryKey, {
            ...currentTodayHabits,
            habits: revertedHabits,
          });
        }
      }
    },
  });
}

/**
 * Hook to delete a habit log with optimistic updates
 */
export function useDeleteHabitLog(): UseMutationResult<
  { result: boolean; habitId: string },
  unknown,
  { logId: string; habitId: string }
> {
  const queryClient = useQueryClient();

  return useQueuedMutation({
    endpoint: '/api/habits/logs',
    method: 'DELETE',
    queue: {
      priority: RequestPriority.HIGH,
      tags: ['habit', 'delete-log'],
    },
    mutationFn: ({ logId, habitId }) => {
      // Custom mutationFn that includes the id in the endpoint
      const endpoint = `/api/habits/logs/${logId}`;
      return fetch(endpoint, {
        method: 'DELETE',
      }).then(response => {
        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        return response.json().then(result => ({
          result,
          habitId,
        }));
      });
    },

    // Optimistically remove the log
    onMutate: async ({ logId, habitId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: habitsKeys.habitLogs(habitId),
      });

      // Get existing logs
      const previousLogs = queryClient.getQueryData<HabitLogsResponse>(
        habitsKeys.habitLogs(habitId)
      );

      if (!previousLogs) return { previousLogs: null };

      // Find the log to be deleted - we'll need its info for potential rollback
      const logToDelete = previousLogs.logs.find(log => log.id === logId);

      if (!logToDelete) return { previousLogs };

      // Update logs in the cache (remove the log)
      queryClient.setQueryData(habitsKeys.habitLogs(habitId), {
        ...previousLogs,
        logs: previousLogs.logs.filter(log => log.id !== logId),
        total: Math.max(0, previousLogs.total - 1),
      });

      // If this is today's log, update today's habits
      const today = new Date().toISOString().split('T')[0];
      let previousTodayHabits = null;

      if (logToDelete.date === today) {
        const todayHabitsQueryKey = habitsKeys.list({ active: true, archived: false });
        previousTodayHabits = queryClient.getQueryData<HabitsResponse>(todayHabitsQueryKey);

        if (previousTodayHabits) {
          const updatedHabits = previousTodayHabits.habits.map(habit => {
            if (habit.id === habitId) {
              return {
                ...habit,
                todayLog: null,
              };
            }
            return habit;
          });

          queryClient.setQueryData(todayHabitsQueryKey, {
            ...previousTodayHabits,
            habits: updatedHabits,
          });
        }
      }

      return {
        previousLogs,
        previousTodayHabits,
        logToDelete,
      };
    },

    onSuccess: (data, variables) => {
      if (data.result) {
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: habitsKeys.detail(variables.habitId) });
        queryClient.invalidateQueries({ queryKey: habitsKeys.habitStreak(variables.habitId) });
        queryClient.invalidateQueries({ queryKey: habitsKeys.stats() });
      }
    },

    onError: (_, variables, context) => {
      // Revert logs to their previous state
      if (context?.previousLogs) {
        queryClient.setQueryData(habitsKeys.habitLogs(variables.habitId), context.previousLogs);
      }

      // Also revert today's habits if this was for today
      if (
        context?.logToDelete?.date === new Date().toISOString().split('T')[0] &&
        context.previousTodayHabits
      ) {
        const todayHabitsQueryKey = habitsKeys.list({ active: true, archived: false });
        queryClient.setQueryData(todayHabitsQueryKey, context.previousTodayHabits);
      }
    },
  });
}

/**
 * Hook to fetch habit statistics
 */
export function useHabitStats(): UseQueryResult<HabitStats | null, unknown> {
  return useQueuedQuery<HabitStats | null>({
    queryKey: habitsKeys.stats() as unknown as string[],
    endpoint: '/api/habits/stats',
    queue: {
      cacheDuration: 10 * 60 * 1000, // 10 minutes
      priority: RequestPriority.LOW, // Lower priority for stats
    },
  });
}

/**
 * Hook to fetch streak information for a specific habit
 */
export function useHabitStreak(habitId: string): UseQueryResult<HabitStreak | null, unknown> {
  return useQueuedQuery<HabitStreak | null>({
    queryKey: habitsKeys.habitStreak(habitId) as unknown as string[],
    endpoint: `/api/habits/${habitId}/streak`,
    enabled: !!habitId, // Only run query if habitId is provided
    queue: {
      cacheDuration: 5 * 60 * 1000, // 5 minutes
      priority: RequestPriority.MEDIUM,
    },
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
