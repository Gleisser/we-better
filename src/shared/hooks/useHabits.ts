import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { AUTH_SCOPED_QUERY_META } from '@/core/config/react-query';
import { useAuth } from './useAuth';
import * as habitsService from '@/core/services/habitsService';
import {
  Habit,
  HabitLog,
  HabitLogsResponse,
  HabitStats,
  HabitStatus,
} from '@/core/services/habitsService';

interface UseHabitsOptions {
  category?: string;
  showArchived?: boolean;
}

interface UseHabitsReturn {
  habits: Habit[];
  isLoading: boolean;
  error: Error | null;
  stats: HabitStats | null;
  fetchHabits: (category?: string, showArchived?: boolean) => Promise<void>;
  createHabit: (name: string, category: string, startDate?: string) => Promise<Habit | null>;
  updateHabit: (id: string, data: Partial<Habit>) => Promise<Habit | null>;
  archiveHabit: (id: string) => Promise<boolean>;
  logHabitCompletion: (
    habitId: string,
    date: string,
    status: HabitStatus,
    notes?: string
  ) => Promise<HabitLog | null>;
  getHabitLogs: (
    habitId: string,
    startDate?: string,
    endDate?: string
  ) => Promise<HabitLogsResponse | null>;
  deleteHabitLog: (logId: string) => Promise<boolean>;
  refreshStats: () => Promise<void>;
}

interface UseHabitLogsMapReturn {
  logsByHabit: Record<string, HabitLog[]>;
  isLoading: boolean;
  error: Error | null;
  refetchHabitLogs: (habitId: string) => Promise<void>;
}

const habitsQueryKeyPrefix = (userId: string | null) => ['habits', userId ?? 'anonymous'] as const;

const habitsListQueryKey = (userId: string | null, category?: string, showArchived = false) =>
  [
    ...habitsQueryKeyPrefix(userId),
    'list',
    category ?? 'all',
    showArchived ? 'withArchived' : 'activeOnly',
  ] as const;

const habitLogsQueryKeyPrefix = (userId: string | null, habitId: string) =>
  ['habitLogs', userId ?? 'anonymous', habitId] as const;

const habitLogsQueryKey = (
  userId: string | null,
  habitId: string,
  startDate?: string,
  endDate?: string
) => [...habitLogsQueryKeyPrefix(userId, habitId), startDate ?? 'any', endDate ?? 'any'] as const;

const habitStatsQueryKey = (userId: string | null) =>
  [...habitsQueryKeyPrefix(userId), 'stats'] as const;

const loadHabits = async (category?: string, showArchived = false): Promise<Habit[]> => {
  const response = await habitsService.getHabits(category, true, showArchived);
  return response?.habits ?? [];
};

const loadHabitLogs = async (
  habitId: string,
  startDate?: string,
  endDate?: string
): Promise<HabitLogsResponse> => {
  const response = await habitsService.getHabitLogs(habitId, startDate, endDate);

  if (!response) {
    throw new Error('Failed to fetch habit logs');
  }

  return response;
};

const updateHabitAcrossCaches = (
  habits: Habit[] | undefined,
  habitId: string,
  updater: (habit: Habit) => Habit
): Habit[] | undefined => {
  if (!habits) {
    return habits;
  }

  return habits.map(habit => (habit.id === habitId ? updater(habit) : habit));
};

export const useHabitLogsMap = (
  habitIds: string[],
  startDate?: string,
  endDate?: string
): UseHabitLogsMapReturn => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const stableHabitIds = useMemo(() => Array.from(new Set(habitIds)).sort(), [habitIds]);

  const logQueries = useQueries({
    queries: stableHabitIds.map(habitId => ({
      queryKey: habitLogsQueryKey(userId, habitId, startDate, endDate),
      queryFn: async () => {
        const response = await loadHabitLogs(habitId, startDate, endDate);
        return response.logs;
      },
      enabled: Boolean(userId),
      meta: AUTH_SCOPED_QUERY_META,
    })),
  });

  const logsByHabit = useMemo<Record<string, HabitLog[]>>(
    () =>
      stableHabitIds.reduce<Record<string, HabitLog[]>>((accumulator, habitId, index) => {
        accumulator[habitId] = logQueries[index]?.data ?? [];
        return accumulator;
      }, {}),
    [logQueries, stableHabitIds]
  );

  const firstError = logQueries.find(query => query.error instanceof Error)?.error ?? null;

  const refetchHabitLogs = useCallback(
    async (habitId: string): Promise<void> => {
      if (!userId) {
        return;
      }

      await queryClient.fetchQuery({
        queryKey: habitLogsQueryKey(userId, habitId, startDate, endDate),
        queryFn: async () => {
          const response = await loadHabitLogs(habitId, startDate, endDate);
          return response.logs;
        },
        meta: AUTH_SCOPED_QUERY_META,
      });
    },
    [endDate, queryClient, startDate, userId]
  );

  return {
    logsByHabit,
    isLoading: logQueries.some(query => query.isLoading),
    error: firstError instanceof Error ? firstError : null,
    refetchHabitLogs,
  };
};

export const useHabits = (options: UseHabitsOptions = {}): UseHabitsReturn => {
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  const userId = user?.id ?? null;
  const category = options.category;
  const showArchived = options.showArchived ?? false;
  const [manualError, setManualError] = useState<Error | null>(null);

  const habitsQuery = useQuery({
    queryKey: habitsListQueryKey(userId, category, showArchived),
    queryFn: async () => loadHabits(category, showArchived),
    enabled: Boolean(userId) && isAuthenticated,
    meta: AUTH_SCOPED_QUERY_META,
  });

  const statsQuery = useQuery({
    queryKey: habitStatsQueryKey(userId),
    queryFn: async () => habitsService.getHabitStats(),
    enabled: false,
    meta: AUTH_SCOPED_QUERY_META,
  });

  const createHabitMutation = useMutation({
    mutationFn: async ({
      name,
      habitCategory,
      startDate,
    }: {
      name: string;
      habitCategory: string;
      startDate?: string;
    }) => habitsService.createHabit(name, habitCategory, startDate),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: habitsQueryKeyPrefix(userId) });
    },
  });

  const updateHabitMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Habit> }) => {
      const habit = await habitsService.updateHabit(id, data);

      if (!habit) {
        throw new Error('Failed to update habit');
      }

      return habit;
    },
    onSuccess: updatedHabit => {
      queryClient.setQueriesData<Habit[]>({ queryKey: habitsQueryKeyPrefix(userId) }, habits =>
        updateHabitAcrossCaches(habits, updatedHabit.id, () => ({
          ...updatedHabit,
        }))
      );
    },
  });

  const archiveHabitMutation = useMutation({
    mutationFn: async (habitId: string) => {
      const success = await habitsService.archiveHabit(habitId);

      if (!success) {
        throw new Error('Failed to archive habit');
      }

      return habitId;
    },
    onSuccess: habitId => {
      queryClient.setQueriesData<Habit[]>(
        { queryKey: habitsQueryKeyPrefix(userId) },
        habits => habits?.filter(habit => habit.id !== habitId) ?? []
      );
    },
  });

  const fetchHabits = useCallback(
    async (nextCategory?: string, nextShowArchived = false): Promise<void> => {
      if (!userId) {
        setManualError(new Error('User not authenticated'));
        return;
      }

      try {
        await queryClient.fetchQuery({
          queryKey: habitsListQueryKey(userId, nextCategory, nextShowArchived),
          queryFn: async () => loadHabits(nextCategory, nextShowArchived),
          meta: AUTH_SCOPED_QUERY_META,
        });
        setManualError(null);
      } catch (error) {
        setManualError(error instanceof Error ? error : new Error('Failed to fetch habits'));
      }
    },
    [queryClient, userId]
  );

  const createHabit = useCallback(
    async (name: string, habitCategory: string, startDate?: string): Promise<Habit | null> => {
      if (!userId) {
        setManualError(new Error('User not authenticated'));
        return null;
      }

      try {
        const habit = await createHabitMutation.mutateAsync({ name, habitCategory, startDate });
        setManualError(null);
        return habit;
      } catch (error) {
        setManualError(error instanceof Error ? error : new Error('Failed to create habit'));
        return null;
      }
    },
    [createHabitMutation, userId]
  );

  const updateHabit = useCallback(
    async (id: string, data: Partial<Habit>): Promise<Habit | null> => {
      if (!userId) {
        setManualError(new Error('User not authenticated'));
        return null;
      }

      try {
        const habit = await updateHabitMutation.mutateAsync({ id, data });
        setManualError(null);
        return habit;
      } catch (error) {
        setManualError(error instanceof Error ? error : new Error('Failed to update habit'));
        return null;
      }
    },
    [updateHabitMutation, userId]
  );

  const archiveHabit = useCallback(
    async (id: string): Promise<boolean> => {
      if (!userId) {
        setManualError(new Error('User not authenticated'));
        return false;
      }

      try {
        await archiveHabitMutation.mutateAsync(id);
        setManualError(null);
        return true;
      } catch (error) {
        setManualError(error instanceof Error ? error : new Error('Failed to archive habit'));
        return false;
      }
    },
    [archiveHabitMutation, userId]
  );

  const logHabitCompletion = useCallback(
    async (
      habitId: string,
      date: string,
      status: HabitStatus,
      notes?: string
    ): Promise<HabitLog | null> => {
      if (!userId) {
        setManualError(new Error('User not authenticated'));
        return null;
      }

      try {
        const log = await habitsService.logHabitStatus(habitId, date, status, notes);

        if (!log) {
          throw new Error('Failed to log habit completion');
        }

        queryClient.setQueriesData<HabitLog[]>(
          { queryKey: habitLogsQueryKeyPrefix(userId, habitId) },
          logs => {
            if (!logs) {
              return logs;
            }

            const nextLogs = [...logs];
            const existingIndex = nextLogs.findIndex(entry => entry.date === log.date);

            if (existingIndex >= 0) {
              nextLogs[existingIndex] = log;
              return nextLogs;
            }

            return [...nextLogs, log];
          }
        );
        await queryClient.invalidateQueries({ queryKey: habitsQueryKeyPrefix(userId) });
        setManualError(null);
        return log;
      } catch (error) {
        setManualError(
          error instanceof Error ? error : new Error('Failed to log habit completion')
        );
        return null;
      }
    },
    [queryClient, userId]
  );

  const getHabitLogs = useCallback(
    async (
      habitId: string,
      startDate?: string,
      endDate?: string
    ): Promise<HabitLogsResponse | null> => {
      if (!userId) {
        setManualError(new Error('User not authenticated'));
        return null;
      }

      try {
        const response = await queryClient.fetchQuery({
          queryKey: habitLogsQueryKey(userId, habitId, startDate, endDate),
          queryFn: async () => loadHabitLogs(habitId, startDate, endDate),
          meta: AUTH_SCOPED_QUERY_META,
        });
        setManualError(null);
        return response;
      } catch (error) {
        setManualError(error instanceof Error ? error : new Error('Failed to get habit logs'));
        return null;
      }
    },
    [queryClient, userId]
  );

  const deleteHabitLog = useCallback(
    async (logId: string): Promise<boolean> => {
      if (!userId) {
        setManualError(new Error('User not authenticated'));
        return false;
      }

      try {
        const success = await habitsService.deleteHabitLog(logId);

        if (!success) {
          throw new Error('Failed to delete habit log');
        }

        await queryClient.invalidateQueries({ queryKey: ['habitLogs', userId] });
        setManualError(null);
        return true;
      } catch (error) {
        setManualError(error instanceof Error ? error : new Error('Failed to delete habit log'));
        return false;
      }
    },
    [queryClient, userId]
  );

  const refreshStats = useCallback(async (): Promise<void> => {
    await statsQuery.refetch();
  }, [statsQuery]);

  return {
    habits: habitsQuery.data ?? [],
    isLoading:
      habitsQuery.isLoading ||
      createHabitMutation.isPending ||
      updateHabitMutation.isPending ||
      archiveHabitMutation.isPending,
    error:
      manualError ||
      (habitsQuery.error instanceof Error ? habitsQuery.error : null) ||
      (statsQuery.error instanceof Error ? statsQuery.error : null),
    stats: statsQuery.data ?? null,
    fetchHabits,
    createHabit,
    updateHabit,
    archiveHabit,
    logHabitCompletion,
    getHabitLogs,
    deleteHabitLog,
    refreshStats,
  };
};
