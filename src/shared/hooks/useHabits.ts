import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import * as habitsService from '@/core/services/habitsService';
import { Habit, HabitStatus, HabitLog, HabitStats } from '@/core/services/habitsService';

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
    notes?: string,
    originalStatus?: string
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
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [stats, setStats] = useState<HabitStats | null>(null);

  // Fetch habits from the API
  const fetchHabits = useCallback(
    async (category?: string, showArchived = false) => {
      if (!isAuthenticated) {
        setError(new Error('User not authenticated'));
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await habitsService.getHabits(category, true, showArchived);

        if (response) {
          setHabits(response.habits);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch habits'));
        console.error('Error fetching habits:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated]
  );

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
      notes?: string,
      originalStatus?: string
    ): Promise<HabitLog | null> => {
      if (!isAuthenticated) {
        setError(new Error('User not authenticated'));
        return null;
      }

      try {
        setError(null);

        const log = await habitsService.logHabitStatus(
          habitId,
          date,
          status,
          notes,
          originalStatus
        );

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

  // Refresh habit statistics
  const refreshStats = useCallback(async (): Promise<void> => {
    if (!isAuthenticated) {
      setError(new Error('User not authenticated'));
      return;
    }

    try {
      setError(null);
      const habitStats = await habitsService.getHabitStats();
      if (habitStats) {
        setStats(habitStats);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch habit stats'));
      console.error('Error fetching habit stats:', err);
    }
  }, [isAuthenticated]);

  // Initialize data on component mount or when user auth changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchHabits();
      refreshStats();
    } else {
      setHabits([]);
      setStats(null);
    }
  }, [isAuthenticated, fetchHabits, refreshStats]);

  return {
    habits,
    isLoading,
    error,
    stats,
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
