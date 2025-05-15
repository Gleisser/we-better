import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useNetworkStatus } from '@/shared/hooks/useNetworkStatus';
import * as habitsService from '@/core/services/habitsService';
import { Habit, HabitStatus, HabitLog, HabitStats } from '@/core/services/habitsService';
import { habitsStorage } from '@/core/database';

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
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [stats, setStats] = useState<HabitStats | null>(null);

  // Fetch habits from the API or local storage if offline
  const fetchHabits = useCallback(
    async (category?: string, showArchived = false) => {
      if (!isAuthenticated) {
        setError(new Error('User not authenticated'));
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // If offline, use IndexedDB
        if (!networkStatus.isOnline) {
          // Get user ID from auth context if available, or use a fallback
          const userId = 'current_user'; // Replace with actual user ID

          // Fetch from IndexedDB
          const offlineHabits = await habitsStorage.getHabits(userId, {
            category,
            archived: showArchived,
          });

          setHabits(offlineHabits);
          return;
        }

        // If online, fetch from API
        const response = await habitsService.getHabits(category, true, showArchived);

        if (response) {
          setHabits(response.habits);

          // Also update IndexedDB for offline access
          await habitsStorage.saveHabits(response.habits);
        }
      } catch (err) {
        // If offline, don't show an error, just try to use cached data
        if (!networkStatus.isOnline) {
          setError(new Error('You are offline. Using cached data.'));

          try {
            // Try to get cached data as a fallback
            const userId = 'current_user'; // Replace with actual user ID
            const offlineHabits = await habitsStorage.getHabits(userId, {
              category,
              archived: showArchived,
            });

            if (offlineHabits.length > 0) {
              setHabits(offlineHabits);
              setError(null); // Clear error if we found cached data
            }
          } catch (cacheErr) {
            console.error('Failed to load from cache:', cacheErr);
          }
        } else {
          setError(err instanceof Error ? err : new Error('Failed to fetch habits'));
          console.error('Error fetching habits:', err);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated, networkStatus.isOnline]
  );

  // Refresh habit statistics
  const refreshStats = useCallback(async (): Promise<void> => {
    if (!isAuthenticated) {
      setError(new Error('User not authenticated'));
      return;
    }

    try {
      setError(null);

      // If offline, try to get cached stats
      if (!networkStatus.isOnline) {
        const userId = 'current_user'; // Replace with actual user ID
        const cachedStats = await habitsStorage.getCachedHabitStats(userId);
        if (cachedStats) {
          setStats(cachedStats);
        }
        return;
      }

      // If online, get fresh stats from API
      const habitStats = await habitsService.getHabitStats();
      if (habitStats) {
        setStats(habitStats);

        // Cache the stats for offline use
        const userId = 'current_user'; // Replace with actual user ID
        await habitsStorage.cacheHabitStats(userId, habitStats);
      }
    } catch (err) {
      if (!networkStatus.isOnline) {
        setError(new Error('Unable to fetch stats while offline'));
      } else {
        setError(err instanceof Error ? err : new Error('Failed to fetch habit stats'));
        console.error('Error fetching habit stats:', err);
      }
    }
  }, [isAuthenticated, networkStatus.isOnline]);

  // Listen for online status changes
  useEffect(() => {
    // When coming back online after being offline, refresh data
    if (networkStatus.isOnline && networkStatus.wasOffline && isAuthenticated) {
      fetchHabits();
      refreshStats();
    }
  }, [
    networkStatus.isOnline,
    networkStatus.wasOffline,
    isAuthenticated,
    fetchHabits,
    refreshStats,
  ]);

  // Create a new habit
  const createHabit = useCallback(
    async (name: string, category: string, startDate?: string): Promise<Habit | null> => {
      if (!isAuthenticated) {
        setError(new Error('User not authenticated'));
        return null;
      }

      try {
        setIsLoading(true);
        setError(null);

        const newHabit = await habitsService.createHabit(name, category, startDate);

        if (newHabit) {
          setHabits(prevHabits => [...prevHabits, newHabit]);
          return newHabit;
        }
        return null;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to create habit'));
        console.error('Error creating habit:', err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated]
  );

  // Update an existing habit
  const updateHabit = useCallback(
    async (id: string, data: Partial<Habit>): Promise<Habit | null> => {
      if (!isAuthenticated) {
        setError(new Error('User not authenticated'));
        return null;
      }

      try {
        setIsLoading(true);
        setError(null);

        const updatedHabit = await habitsService.updateHabit(id, data);

        if (updatedHabit) {
          setHabits(prevHabits =>
            prevHabits.map(habit => (habit.id === id ? updatedHabit : habit))
          );
          return updatedHabit;
        }
        return null;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to update habit'));
        console.error('Error updating habit:', err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated]
  );

  // Archive a habit (soft delete)
  const archiveHabit = useCallback(
    async (id: string): Promise<boolean> => {
      if (!isAuthenticated) {
        setError(new Error('User not authenticated'));
        return false;
      }

      try {
        setIsLoading(true);
        setError(null);

        const success = await habitsService.archiveHabit(id);

        if (success) {
          // Remove habit from local state or mark as archived
          setHabits(prevHabits => prevHabits.filter(habit => habit.id !== id));
          return true;
        }
        return false;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to archive habit'));
        console.error('Error archiving habit:', err);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated]
  );

  // Log a habit completion or update an existing log
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
        setError(null);

        const log = await habitsService.logHabitStatus(habitId, date, status, notes);

        if (log) {
          // After logging, fetch the updated habit to get the new streak
          const updatedHabit = await habitsService.getHabitById(habitId);
          if (updatedHabit) {
            setHabits(prevHabits =>
              prevHabits.map(habit => (habit.id === habitId ? updatedHabit : habit))
            );
          }
          return log;
        }
        return null;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to log habit completion'));
        console.error('Error logging habit completion:', err);
        return null;
      }
    },
    [isAuthenticated]
  );

  // Get logs for a specific habit
  const getHabitLogs = useCallback(
    async (
      habitId: string,
      startDate?: string,
      endDate?: string
    ): Promise<habitsService.HabitLogsResponse | null> => {
      if (!isAuthenticated) {
        setError(new Error('User not authenticated'));
        return null;
      }

      try {
        setError(null);
        return await habitsService.getHabitLogs(habitId, startDate, endDate);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to get habit logs'));
        console.error('Error getting habit logs:', err);
        return null;
      }
    },
    [isAuthenticated]
  );

  // Delete a habit log
  const deleteHabitLog = useCallback(
    async (logId: string): Promise<boolean> => {
      if (!isAuthenticated) {
        setError(new Error('User not authenticated'));
        return false;
      }

      try {
        setError(null);
        return await habitsService.deleteHabitLog(logId);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to delete habit log'));
        console.error('Error deleting habit log:', err);
        return false;
      }
    },
    [isAuthenticated]
  );

  return {
    habits,
    isLoading,
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
