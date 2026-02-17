import { useCallback, useMemo, useState } from 'react';
import {
  MoodEntry,
  MoodId,
  WeeklyMoodPulseResponse,
  fetchMoodEntries as fetchMoodEntriesFromApi,
  fetchWeeklyMoodPulse as fetchWeeklyMoodPulseFromApi,
  saveMoodEntry as saveMoodEntryToApi,
} from '@/core/services/moodService';
import { getLocalDateString } from '@/utils/helpers/dateUtils';

interface UseMoodReturn {
  entries: MoodEntry[];
  weeklyPulse: WeeklyMoodPulseResponse | null;
  isLoading: boolean;
  isWeeklyPulseLoading: boolean;
  error: Error | null;
  fetchMoodEntries: (
    startDate?: string,
    endDate?: string,
    limit?: number,
    offset?: number
  ) => Promise<void>;
  saveMoodEntry: (moodId: MoodId, date?: string) => Promise<MoodEntry | null>;
  fetchWeeklyPulse: (endDate?: string) => Promise<void>;
  refreshMoodAndPulse: (endDate?: string) => Promise<void>;
  getMoodForDate: (date: string) => MoodEntry | null;
  todayMood: MoodEntry | null;
}

export const useMood = (): UseMoodReturn => {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [weeklyPulse, setWeeklyPulse] = useState<WeeklyMoodPulseResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isWeeklyPulseLoading, setIsWeeklyPulseLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchMoodEntries = useCallback(
    async (startDate?: string, endDate?: string, limit = 35, offset = 0): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetchMoodEntriesFromApi(startDate, endDate, limit, offset);
        if (response) {
          setEntries(response.entries);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch mood entries'));
        console.error('Error fetching mood entries:', err);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const saveMoodEntry = useCallback(
    async (moodId: MoodId, date = getLocalDateString()): Promise<MoodEntry | null> => {
      const previousEntries = entries;
      const tempEntry: MoodEntry = {
        id: `temp-${date}`,
        user_id: '',
        date,
        mood_id: moodId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setEntries(prev => {
        const next = prev.filter(entry => entry.date !== date);
        return [tempEntry, ...next];
      });

      try {
        setError(null);
        const saved = await saveMoodEntryToApi(moodId, date);

        if (!saved) {
          throw new Error('Failed to save mood entry');
        }

        setEntries(prev => {
          const next = prev.filter(entry => entry.date !== date);
          return [saved, ...next];
        });

        await fetchWeeklyPulseFromApi(date).then(pulse => {
          if (pulse) {
            setWeeklyPulse(pulse);
          }
        });

        return saved;
      } catch (err) {
        setEntries(previousEntries);
        setError(err instanceof Error ? err : new Error('Failed to save mood entry'));
        console.error('Error saving mood entry:', err);
        return null;
      }
    },
    [entries]
  );

  const getMoodForDate = useCallback(
    (date: string): MoodEntry | null => entries.find(entry => entry.date === date) || null,
    [entries]
  );

  const fetchWeeklyPulse = useCallback(async (endDate?: string): Promise<void> => {
    try {
      setIsWeeklyPulseLoading(true);
      setError(null);

      const response = await fetchWeeklyMoodPulseFromApi(endDate);
      if (response) {
        setWeeklyPulse(response);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch weekly mood pulse'));
      console.error('Error fetching weekly mood pulse:', err);
    } finally {
      setIsWeeklyPulseLoading(false);
    }
  }, []);

  const refreshMoodAndPulse = useCallback(
    async (endDate = getLocalDateString()): Promise<void> => {
      const startDate = getLocalDateString(
        new Date(new Date(`${endDate}T00:00:00`).getTime() - 27 * 24 * 60 * 60 * 1000)
      );
      await Promise.all([fetchMoodEntries(startDate, endDate, 35, 0), fetchWeeklyPulse(endDate)]);
    },
    [fetchMoodEntries, fetchWeeklyPulse]
  );

  const todayMood = useMemo(() => getMoodForDate(getLocalDateString()), [getMoodForDate]);

  return {
    entries,
    weeklyPulse,
    isLoading,
    isWeeklyPulseLoading,
    error,
    fetchMoodEntries,
    saveMoodEntry,
    fetchWeeklyPulse,
    refreshMoodAndPulse,
    getMoodForDate,
    todayMood,
  };
};
