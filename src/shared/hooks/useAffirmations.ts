/**
 * Custom hook for affirmations management
 * Follows the same patterns as useGoals for consistency
 */

import { useState, useCallback, useEffect } from 'react';
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
  createPersonalAffirmation,
  updatePersonalAffirmation,
  deletePersonalAffirmation,
  logAffirmation,
  fetchAffirmationLogs,
  checkTodayStatus,
  fetchAffirmationStreak,
  fetchAffirmationStats,
  fetchBasicStats,
  fetchReminderSettings,
  upsertReminderSettings,
  updateReminderSettings,
  transformTimeFormat,
  transformTimeToBackend,
  getDaysOfWeekForFrequency,
} from '@/core/services/affirmationsService';

// Hook return type
export interface UseAffirmationsReturn {
  // State
  personalAffirmation: PersonalAffirmation | null;
  reminderSettings: AffirmationReminderSettings | null;
  streak: AffirmationStreak | null;
  stats: AffirmationStats | null;
  logs: AffirmationLog[];
  hasAffirmedToday: boolean;
  isLoading: boolean;
  error: Error | null;

  // Personal affirmation operations
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

  // Affirmation logging
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

  // Streak and statistics
  fetchStreak: () => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchBasicStats: () => Promise<void>;

  // Reminder settings operations
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

  // Utility
  clearError: () => void;
  refetch: () => Promise<void>;
}

export const useAffirmations = (): UseAffirmationsReturn => {
  // State
  const [personalAffirmation, setPersonalAffirmation] = useState<PersonalAffirmation | null>(null);
  const [reminderSettings, setReminderSettings] = useState<AffirmationReminderSettings | null>(
    null
  );
  const [streak, setStreak] = useState<AffirmationStreak | null>(null);
  const [stats, setStats] = useState<AffirmationStats | null>(null);
  const [logs, setLogs] = useState<AffirmationLog[]>([]);
  const [hasAffirmedToday, setHasAffirmedToday] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Helper function to handle errors
  const handleError = useCallback((error: unknown) => {
    const errorObj = error instanceof Error ? error : new Error('An unknown error occurred');
    setError(errorObj);
    console.error('Affirmations hook error:', errorObj);
  }, []);

  // Fetch personal affirmation
  const fetchPersonalAffirmationData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const affirmation = await fetchPersonalAffirmation();
      setPersonalAffirmation(affirmation);
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  // Create personal affirmation
  const createPersonalAffirmationData = useCallback(
    async (
      text: string,
      category?: AffirmationCategory,
      intensity?: AffirmationIntensity
    ): Promise<PersonalAffirmation | null> => {
      try {
        setError(null);
        const newAffirmation = await createPersonalAffirmation(text, category, intensity);

        if (newAffirmation) {
          setPersonalAffirmation(newAffirmation);
        }

        return newAffirmation;
      } catch (err) {
        handleError(err);
        throw err;
      }
    },
    [handleError]
  );

  // Update personal affirmation
  const updatePersonalAffirmationData = useCallback(
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
        setError(null);

        // Optimistic update
        if (personalAffirmation) {
          setPersonalAffirmation(prev => (prev ? { ...prev, ...updates } : null));
        }

        const updatedAffirmation = await updatePersonalAffirmation(id, updates);

        if (updatedAffirmation) {
          setPersonalAffirmation(updatedAffirmation);
        }

        return updatedAffirmation;
      } catch (err) {
        handleError(err);
        // Revert optimistic update on error
        await fetchPersonalAffirmationData();
        throw err;
      }
    },
    [handleError, fetchPersonalAffirmationData, personalAffirmation]
  );

  // Delete personal affirmation
  const deletePersonalAffirmationData = useCallback(
    async (id: string): Promise<void> => {
      try {
        setError(null);

        // Optimistic removal
        setPersonalAffirmation(null);

        await deletePersonalAffirmation(id);
      } catch (err) {
        handleError(err);
        // Revert optimistic update on error
        await fetchPersonalAffirmationData();
        throw err;
      }
    },
    [handleError, fetchPersonalAffirmationData]
  );

  // Fetch streak
  const fetchStreakData = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      const streakData = await fetchAffirmationStreak();
      setStreak(streakData);
    } catch (err) {
      handleError(err);
    }
  }, [handleError]);

  // Fetch comprehensive stats
  const fetchStatsData = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      const statsData = await fetchAffirmationStats();
      setStats(statsData);
    } catch (err) {
      handleError(err);
    }
  }, [handleError]);

  // Log affirmation
  const logAffirmationData = useCallback(
    async (
      affirmationText: string,
      affirmationId?: string,
      date?: string
    ): Promise<AffirmationLog | null> => {
      try {
        setError(null);

        const logEntry = await logAffirmation(affirmationText, affirmationId, date);

        if (logEntry) {
          // Add to logs state
          setLogs(prevLogs => [logEntry, ...prevLogs]);

          // Update today status
          const today = new Date().toISOString().split('T')[0];
          if (logEntry.date === today) {
            setHasAffirmedToday(true);
          }

          // Refresh streak and stats
          await fetchStreakData();
          await fetchStatsData();
        }

        return logEntry;
      } catch (err) {
        handleError(err);
        throw err;
      }
    },
    [handleError, fetchStreakData, fetchStatsData]
  );

  // Fetch logs
  const fetchLogsData = useCallback(
    async (startDate?: string, endDate?: string, limit = 20, offset = 0): Promise<void> => {
      try {
        setError(null);

        const logsResponse = await fetchAffirmationLogs(startDate, endDate, limit, offset);

        if (logsResponse) {
          setLogs(logsResponse.logs);
        }
      } catch (err) {
        handleError(err);
      }
    },
    [handleError]
  );

  // Check today status
  const checkTodayStatusData = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      const todayStatus = await checkTodayStatus();
      setHasAffirmedToday(todayStatus);
    } catch (err) {
      handleError(err);
    }
  }, [handleError]);

  // Fetch basic stats (backwards compatibility)
  const fetchBasicStatsData = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      const basicStats = await fetchBasicStats();
      setStats(basicStats);
    } catch (err) {
      handleError(err);
    }
  }, [handleError]);

  // Fetch reminder settings
  const fetchReminderSettingsData = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      const settings = await fetchReminderSettings();

      // Transform time format for frontend
      if (settings && settings.reminder_time) {
        settings.reminder_time = transformTimeFormat(settings.reminder_time);
      }

      setReminderSettings(settings);
    } catch (err) {
      handleError(err);
    }
  }, [handleError]);

  // Save reminder settings
  const saveReminderSettingsData = useCallback(
    async (settings: {
      is_enabled: boolean;
      reminder_time: string;
      frequency: ReminderFrequency;
      days_of_week?: number[];
      notification_sound?: string;
      notification_message?: string;
    }): Promise<AffirmationReminderSettings | null> => {
      try {
        setError(null);

        // Transform time format for backend
        const backendSettings = {
          ...settings,
          reminder_time: transformTimeToBackend(settings.reminder_time),
          days_of_week: settings.days_of_week || getDaysOfWeekForFrequency(settings.frequency),
        };

        const savedSettings = await upsertReminderSettings(backendSettings);

        if (savedSettings) {
          // Transform time format back for frontend
          savedSettings.reminder_time = transformTimeFormat(savedSettings.reminder_time);
          setReminderSettings(savedSettings);
        }

        return savedSettings;
      } catch (err) {
        handleError(err);
        throw err;
      }
    },
    [handleError]
  );

  // Update reminder settings
  const updateReminderSettingsData = useCallback(
    async (settings: {
      is_enabled?: boolean;
      reminder_time?: string;
      frequency?: ReminderFrequency;
      days_of_week?: number[];
      notification_sound?: string;
      notification_message?: string;
    }): Promise<AffirmationReminderSettings | null> => {
      try {
        setError(null);

        // Transform time format for backend if provided
        const backendSettings = { ...settings };
        if (settings.reminder_time) {
          backendSettings.reminder_time = transformTimeToBackend(settings.reminder_time);
        }

        // Set days_of_week based on frequency if frequency is provided but days_of_week is not
        if (settings.frequency && !settings.days_of_week) {
          backendSettings.days_of_week = getDaysOfWeekForFrequency(settings.frequency);
        }

        const updatedSettings = await updateReminderSettings(backendSettings);

        if (updatedSettings) {
          // Transform time format back for frontend
          updatedSettings.reminder_time = transformTimeFormat(updatedSettings.reminder_time);
          setReminderSettings(updatedSettings);
        }

        return updatedSettings;
      } catch (err) {
        handleError(err);
        throw err;
      }
    },
    [handleError]
  );

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Refetch all data
  const refetch = useCallback(async (): Promise<void> => {
    await Promise.all([
      fetchPersonalAffirmationData(),
      fetchReminderSettingsData(),
      fetchStreakData(),
      fetchStatsData(),
      checkTodayStatusData(),
      fetchLogsData(),
    ]);
  }, [
    fetchPersonalAffirmationData,
    fetchReminderSettingsData,
    fetchStreakData,
    fetchStatsData,
    checkTodayStatusData,
    fetchLogsData,
  ]);

  // Auto-fetch on mount
  useEffect(() => {
    const initializeData = async (): Promise<void> => {
      await Promise.all([
        fetchPersonalAffirmationData(),
        fetchReminderSettingsData(),
        fetchStreakData(),
        checkTodayStatusData(),
      ]);
    };

    initializeData();
  }, [
    fetchPersonalAffirmationData,
    fetchReminderSettingsData,
    fetchStreakData,
    checkTodayStatusData,
  ]);

  return {
    // State
    personalAffirmation,
    reminderSettings,
    streak,
    stats,
    logs,
    hasAffirmedToday,
    isLoading,
    error,

    // Personal affirmation operations
    fetchPersonalAffirmation: fetchPersonalAffirmationData,
    createPersonalAffirmation: createPersonalAffirmationData,
    updatePersonalAffirmation: updatePersonalAffirmationData,
    deletePersonalAffirmation: deletePersonalAffirmationData,

    // Affirmation logging
    logAffirmation: logAffirmationData,
    fetchLogs: fetchLogsData,
    checkTodayStatus: checkTodayStatusData,

    // Streak and statistics
    fetchStreak: fetchStreakData,
    fetchStats: fetchStatsData,
    fetchBasicStats: fetchBasicStatsData,

    // Reminder settings operations
    fetchReminderSettings: fetchReminderSettingsData,
    saveReminderSettings: saveReminderSettingsData,
    updateReminderSettings: updateReminderSettingsData,

    // Utility
    clearError,
    refetch,
  };
};
