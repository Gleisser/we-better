import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useNetworkStatus } from '@/shared/hooks/useNetworkStatus';
import * as habitsService from '@/core/services/habitsService';
import { Habit, HabitStatus, HabitLog, HabitStats } from '@/core/services/habitsService';
import { habitsStorage } from '@/core/database';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface UseHabitsReturn {
  habits: Habit[];
  isLoading: boolean;
  error: Error | null;
  stats: HabitStats | null;
  isOnline: boolean;
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
  ) => Promise<habitsService.HabitLogsResponse | null>;
  deleteHabitLog: (logId: string) => Promise<boolean>;
  refreshStats: () => Promise<void>;
}

export const useHabits = (): UseHabitsReturn => {
  const { isAuthenticated } = useAuth();
  const { status: networkStatus } = useNetworkStatus();
  const queryClient = useQueryClient();
  const [error, setError] = useState<Error | null>(null);

  // Query keys
  const habitsKey = 'habits';
  const statsKey = 'habitStats';
  const getLogsKey = (habitId: string): string[] => ['habitLogs', habitId];

  // Fetch habits from the API or local storage if offline
  const fetchHabitsFromSource = useCallback(
    async ({ queryKey }: { queryKey: unknown[] }) => {
      const [_, category, showArchived] = queryKey as [
        string,
        string | undefined,
        boolean | undefined,
      ];

      if (!isAuthenticated) {
        throw new Error('User not authenticated');
      }

      try {
        // If offline, use IndexedDB
        if (!networkStatus.isOnline) {
          // Get user ID from auth context if available, or use a fallback
          const userId = 'current_user'; // Replace with actual user ID

          // Fetch from IndexedDB
          const offlineHabits = await habitsStorage.getHabits(userId, {
            category,
            archived: showArchived,
          });

          return offlineHabits;
        }

        // If online, fetch from API
        const response = await habitsService.getHabits(category, true, showArchived);

        if (response) {
          // Also update IndexedDB for offline access
          await habitsStorage.saveHabits(response.habits);
          return response.habits;
        }

        return [];
      } catch (err) {
        console.error('Error fetching habits:', err);
        throw err;
      }
    },
    [isAuthenticated, networkStatus.isOnline]
  );

  // Use React Query to fetch and cache habits
  const { data: habits = [], isLoading: isHabitsLoading } = useQuery({
    queryKey: [habitsKey],
    queryFn: fetchHabitsFromSource,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  // Fetch habits with category filter
  const fetchHabits = useCallback(
    async (category?: string, showArchived = false) => {
      if (!isAuthenticated) {
        setError(new Error('User not authenticated'));
        return;
      }

      try {
        setError(null);
        await queryClient.fetchQuery({
          queryKey: [habitsKey, category, showArchived],
          queryFn: fetchHabitsFromSource,
        });
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch habits'));
      }
    },
    [isAuthenticated, queryClient, fetchHabitsFromSource]
  );

  // Fetch habit statistics
  const fetchStatsFromSource = useCallback(async () => {
    if (!isAuthenticated) {
      throw new Error('User not authenticated');
    }

    try {
      // If offline, try to get cached stats
      if (!networkStatus.isOnline) {
        const userId = 'current_user'; // Replace with actual user ID
        const cachedStats = await habitsStorage.getCachedHabitStats(userId);
        if (cachedStats) {
          return cachedStats;
        }
        throw new Error('No cached stats available offline');
      }

      // If online, get fresh stats from API
      const habitStats = await habitsService.getHabitStats();
      if (habitStats) {
        // Cache the stats for offline use
        const userId = 'current_user'; // Replace with actual user ID
        await habitsStorage.cacheHabitStats(userId, habitStats);
        return habitStats;
      }

      return null;
    } catch (err) {
      console.error('Error fetching habit stats:', err);
      throw err;
    }
  }, [isAuthenticated, networkStatus.isOnline]);

  // Use React Query for stats
  const { data: stats = null, isLoading: isStatsLoading } = useQuery({
    queryKey: [statsKey],
    queryFn: fetchStatsFromSource,
    enabled: isAuthenticated,
    staleTime: 10 * 60 * 1000, // Consider data fresh for 10 minutes
    retry: networkStatus.isOnline ? 3 : 0, // Don't retry if offline
  });

  // Fetch logs for a specific habit
  const fetchHabitLogsFromSource = useCallback(
    async ({ queryKey }: { queryKey: unknown[] }) => {
      const [_, habitId, startDate, endDate] = queryKey as [
        string,
        string,
        string | undefined,
        string | undefined,
      ];

      if (!isAuthenticated) {
        throw new Error('User not authenticated');
      }

      try {
        // If offline, fetch from IndexedDB
        if (!networkStatus.isOnline) {
          const logs = await habitsStorage.getHabitLogs(habitId, startDate, endDate);
          return { logs, total: logs.length };
        }

        // If online, fetch from API
        const logsResponse = await habitsService.getHabitLogs(habitId, startDate, endDate);

        if (logsResponse) {
          // Cache logs for offline use
          await habitsStorage.saveHabitLogs(logsResponse.logs);
          return logsResponse;
        }

        return { logs: [], total: 0 };
      } catch (err) {
        console.error('Error fetching habit logs:', err);
        throw err;
      }
    },
    [isAuthenticated, networkStatus.isOnline]
  );

  // Get logs for a specific habit
  const getHabitLogs = useCallback(
    async (habitId: string, startDate?: string, endDate?: string) => {
      if (!isAuthenticated) {
        setError(new Error('User not authenticated'));
        return null;
      }

      try {
        setError(null);
        return await queryClient.fetchQuery({
          queryKey: [...getLogsKey(habitId), startDate || '', endDate || ''],
          queryFn: fetchHabitLogsFromSource,
          staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
        });
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to get habit logs'));
        return null;
      }
    },
    [isAuthenticated, queryClient, fetchHabitLogsFromSource]
  );

  // Refresh the stats
  const refreshStats = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      await queryClient.invalidateQueries({ queryKey: [statsKey] });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to refresh habit stats'));
    }
  }, [queryClient]);

  // Create habit mutation
  const createHabitMutation = useMutation({
    mutationFn: async ({
      name,
      category,
      startDate,
    }: {
      name: string;
      category: string;
      startDate?: string;
    }) => {
      return await habitsService.createHabit(name, category, startDate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [habitsKey] });
      queryClient.invalidateQueries({ queryKey: [statsKey] });
    },
    onError: err => {
      setError(err instanceof Error ? err : new Error('Failed to create habit'));
    },
  });

  // Create a new habit
  const createHabit = useCallback(
    async (name: string, category: string, startDate?: string): Promise<Habit | null> => {
      if (!isAuthenticated) {
        setError(new Error('User not authenticated'));
        return null;
      }

      try {
        const newHabit = await createHabitMutation.mutateAsync({ name, category, startDate });
        return newHabit || null;
      } catch (err) {
        console.error('Error creating habit:', err);
        return null;
      }
    },
    [isAuthenticated, createHabitMutation]
  );

  // Update habit mutation
  const updateHabitMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Habit> }) => {
      return await habitsService.updateHabit(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [habitsKey] });
      queryClient.invalidateQueries({ queryKey: [statsKey] });
    },
    onError: err => {
      setError(err instanceof Error ? err : new Error('Failed to update habit'));
    },
  });

  // Update an existing habit
  const updateHabit = useCallback(
    async (id: string, data: Partial<Habit>): Promise<Habit | null> => {
      if (!isAuthenticated) {
        setError(new Error('User not authenticated'));
        return null;
      }

      try {
        const updatedHabit = await updateHabitMutation.mutateAsync({ id, data });
        return updatedHabit;
      } catch (err) {
        console.error('Error updating habit:', err);
        return null;
      }
    },
    [isAuthenticated, updateHabitMutation]
  );

  // Archive habit mutation
  const archiveHabitMutation = useMutation({
    mutationFn: async (id: string) => {
      return await habitsService.archiveHabit(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [habitsKey] });
      queryClient.invalidateQueries({ queryKey: [statsKey] });
    },
    onError: err => {
      setError(err instanceof Error ? err : new Error('Failed to archive habit'));
    },
  });

  // Archive a habit
  const archiveHabit = useCallback(
    async (id: string): Promise<boolean> => {
      if (!isAuthenticated) {
        setError(new Error('User not authenticated'));
        return false;
      }

      try {
        const success = await archiveHabitMutation.mutateAsync(id);
        return success;
      } catch (err) {
        console.error('Error archiving habit:', err);
        return false;
      }
    },
    [isAuthenticated, archiveHabitMutation]
  );

  // Log habit completion mutation
  const logHabitMutation = useMutation({
    mutationFn: async ({
      habitId,
      date,
      status,
      notes,
    }: {
      habitId: string;
      date: string;
      status: HabitStatus;
      notes?: string;
    }) => {
      return await habitsService.logHabitStatus(habitId, date, status, notes);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: getLogsKey(variables.habitId) });
      queryClient.invalidateQueries({ queryKey: [habitsKey] });
      queryClient.invalidateQueries({ queryKey: [statsKey] });
    },
    onError: err => {
      setError(err instanceof Error ? err : new Error('Failed to log habit completion'));
    },
  });

  // Log a habit completion
  const logHabitCompletion = useCallback(
    async (
      habitId: string,
      date: string,
      status: HabitStatus,
      notes?: string
    ): Promise<HabitLog | null> => {
      if (!isAuthenticated) {
        setError(new Error('User not authenticated'));
        return null;
      }

      try {
        const log = await logHabitMutation.mutateAsync({ habitId, date, status, notes });
        return log;
      } catch (err) {
        console.error('Error logging habit completion:', err);
        return null;
      }
    },
    [isAuthenticated, logHabitMutation]
  );

  // Delete habit log mutation
  const deleteLogMutation = useMutation({
    mutationFn: async (logId: string) => {
      return await habitsService.deleteHabitLog(logId);
    },
    onSuccess: () => {
      // We'll need to invalidate the logs queries for all habits since we don't know which habit this log was for
      queryClient.invalidateQueries({ queryKey: ['habitLogs'] });
      queryClient.invalidateQueries({ queryKey: [statsKey] });
    },
    onError: err => {
      setError(err instanceof Error ? err : new Error('Failed to delete habit log'));
    },
  });

  // Delete a habit log
  const deleteHabitLog = useCallback(
    async (logId: string): Promise<boolean> => {
      if (!isAuthenticated) {
        setError(new Error('User not authenticated'));
        return false;
      }

      try {
        return await deleteLogMutation.mutateAsync(logId);
      } catch (err) {
        console.error('Error deleting habit log:', err);
        return false;
      }
    },
    [isAuthenticated, deleteLogMutation]
  );

  return {
    habits,
    isLoading: isHabitsLoading || isStatsLoading,
    error,
    stats,
    isOnline: networkStatus.isOnline,
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
