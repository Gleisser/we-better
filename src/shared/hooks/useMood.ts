import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { AUTH_SCOPED_QUERY_META } from '@/core/config/react-query';
import {
  MoodEntry,
  MoodEntriesResponse,
  MoodId,
  WeeklyMoodPulseResponse,
  fetchMoodEntries as fetchMoodEntriesFromApi,
  fetchMonthlyMoodPulse as fetchMonthlyMoodPulseFromApi,
  fetchWeeklyMoodPulse as fetchWeeklyMoodPulseFromApi,
  saveMoodEntry as saveMoodEntryToApi,
} from '@/core/services/moodService';
import { useAuth } from '@/shared/hooks/useAuth';
import { getLocalDateString } from '@/utils/helpers/dateUtils';
import type { QueryBehaviorOptions } from '@/shared/hooks/utils/queryBehavior';

interface UseMoodReturn {
  entries: MoodEntry[];
  weeklyPulse: WeeklyMoodPulseResponse | null;
  monthlyPulse: WeeklyMoodPulseResponse | null;
  isLoading: boolean;
  isWeeklyPulseLoading: boolean;
  isMonthlyPulseLoading: boolean;
  error: Error | null;
  fetchMoodEntries: (
    startDate?: string,
    endDate?: string,
    limit?: number,
    offset?: number
  ) => Promise<void>;
  saveMoodEntry: (moodId: MoodId, date?: string) => Promise<MoodEntry | null>;
  fetchWeeklyPulse: (endDate?: string) => Promise<void>;
  fetchMonthlyPulse: (endDate?: string) => Promise<void>;
  refreshMoodAndPulse: (endDate?: string) => Promise<void>;
  getMoodForDate: (date: string) => MoodEntry | null;
  todayMood: MoodEntry | null;
}

interface MoodEntriesQueryParams {
  startDate?: string;
  endDate?: string;
  limit: number;
  offset: number;
}

const MOOD_HISTORY_DAYS = 28;
const DEFAULT_MOOD_LIMIT = 35;
const DEFAULT_MOOD_OFFSET = 0;

const moodQueryKeyPrefix = (userId: string | null) => ['mood', userId ?? 'anonymous'] as const;

const moodEntriesQueryKey = (userId: string | null, params: MoodEntriesQueryParams) =>
  [
    ...moodQueryKeyPrefix(userId),
    'entries',
    params.startDate ?? 'any',
    params.endDate ?? 'any',
    params.limit,
    params.offset,
  ] as const;

const moodPulseQueryKey = (userId: string | null, windowDays: 7 | 28, endDate?: string) =>
  [...moodQueryKeyPrefix(userId), 'pulse', windowDays, endDate ?? 'latest'] as const;

const getHistoryStartDate = (endDate = getLocalDateString()): string => {
  const normalizedEndDate = new Date(`${endDate}T00:00:00`);
  normalizedEndDate.setDate(normalizedEndDate.getDate() - (MOOD_HISTORY_DAYS - 1));
  return getLocalDateString(normalizedEndDate);
};

const createDefaultEntriesParams = (): MoodEntriesQueryParams => {
  const endDate = getLocalDateString();

  return {
    startDate: getHistoryStartDate(endDate),
    endDate,
    limit: DEFAULT_MOOD_LIMIT,
    offset: DEFAULT_MOOD_OFFSET,
  };
};

const areEntriesParamsEqual = (
  left: MoodEntriesQueryParams,
  right: MoodEntriesQueryParams
): boolean =>
  left.startDate === right.startDate &&
  left.endDate === right.endDate &&
  left.limit === right.limit &&
  left.offset === right.offset;

const loadMoodEntries = async (params: MoodEntriesQueryParams): Promise<MoodEntriesResponse> => {
  const response = await fetchMoodEntriesFromApi(
    params.startDate,
    params.endDate,
    params.limit,
    params.offset
  );

  if (!response) {
    throw new Error('Failed to fetch mood entries');
  }

  return response;
};

const loadMoodPulse = async (
  windowDays: 7 | 28,
  endDate?: string
): Promise<WeeklyMoodPulseResponse> => {
  const response =
    windowDays === 7
      ? await fetchWeeklyMoodPulseFromApi(endDate)
      : await fetchMonthlyMoodPulseFromApi(endDate);

  if (!response) {
    throw new Error(`Failed to fetch ${windowDays === 7 ? 'weekly' : 'monthly'} mood pulse`);
  }

  return response;
};

const upsertMoodEntry = (entries: MoodEntry[], nextEntry: MoodEntry): MoodEntry[] => {
  const nextEntries = entries.filter(entry => entry.date !== nextEntry.date);
  return [nextEntry, ...nextEntries];
};

export const useMood = (queryOptions?: QueryBehaviorOptions): UseMoodReturn => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [entriesParams, setEntriesParams] = useState<MoodEntriesQueryParams>(() =>
    createDefaultEntriesParams()
  );
  const [weeklyEndDate, setWeeklyEndDate] = useState<string | undefined>(() =>
    getLocalDateString()
  );
  const [monthlyEndDate, setMonthlyEndDate] = useState<string | undefined>(() =>
    getLocalDateString()
  );
  const [manualError, setManualError] = useState<Error | null>(null);

  const currentEntriesQueryKey = useMemo(
    () => moodEntriesQueryKey(userId, entriesParams),
    [entriesParams, userId]
  );
  const currentWeeklyPulseQueryKey = useMemo(
    () => moodPulseQueryKey(userId, 7, weeklyEndDate),
    [userId, weeklyEndDate]
  );
  const currentMonthlyPulseQueryKey = useMemo(
    () => moodPulseQueryKey(userId, 28, monthlyEndDate),
    [monthlyEndDate, userId]
  );

  const entriesQuery = useQuery({
    queryKey: currentEntriesQueryKey,
    queryFn: async () => loadMoodEntries(entriesParams),
    enabled: Boolean(userId),
    meta: AUTH_SCOPED_QUERY_META,
    ...queryOptions,
  });

  const weeklyPulseQuery = useQuery({
    queryKey: currentWeeklyPulseQueryKey,
    queryFn: async () => loadMoodPulse(7, weeklyEndDate),
    enabled: Boolean(userId),
    meta: AUTH_SCOPED_QUERY_META,
    ...queryOptions,
  });

  const monthlyPulseQuery = useQuery({
    queryKey: currentMonthlyPulseQueryKey,
    queryFn: async () => loadMoodPulse(28, monthlyEndDate),
    enabled: Boolean(userId),
    meta: AUTH_SCOPED_QUERY_META,
    ...queryOptions,
  });

  const fetchMoodEntries = useCallback(
    async (
      startDate = entriesParams.startDate,
      endDate = entriesParams.endDate,
      limit = entriesParams.limit,
      offset = entriesParams.offset
    ): Promise<void> => {
      if (!userId) {
        setManualError(new Error('User not authenticated'));
        return;
      }

      const nextParams = { startDate, endDate, limit, offset };

      try {
        await queryClient.fetchQuery({
          queryKey: moodEntriesQueryKey(userId, nextParams),
          queryFn: async () => loadMoodEntries(nextParams),
          meta: AUTH_SCOPED_QUERY_META,
          ...queryOptions,
        });

        setEntriesParams(previousParams =>
          areEntriesParamsEqual(previousParams, nextParams) ? previousParams : nextParams
        );
        setManualError(null);
      } catch (error) {
        setManualError(error instanceof Error ? error : new Error('Failed to fetch mood entries'));
      }
    },
    [entriesParams, queryClient, queryOptions, userId]
  );

  const fetchWeeklyPulse = useCallback(
    async (endDate = weeklyEndDate ?? getLocalDateString()): Promise<void> => {
      if (!userId) {
        setManualError(new Error('User not authenticated'));
        return;
      }

      try {
        await queryClient.fetchQuery({
          queryKey: moodPulseQueryKey(userId, 7, endDate),
          queryFn: async () => loadMoodPulse(7, endDate),
          meta: AUTH_SCOPED_QUERY_META,
          ...queryOptions,
        });

        setWeeklyEndDate(previousEndDate =>
          previousEndDate === endDate ? previousEndDate : endDate
        );
        setManualError(null);
      } catch (error) {
        setManualError(
          error instanceof Error ? error : new Error('Failed to fetch weekly mood pulse')
        );
      }
    },
    [queryClient, queryOptions, userId, weeklyEndDate]
  );

  const fetchMonthlyPulse = useCallback(
    async (endDate = monthlyEndDate ?? getLocalDateString()): Promise<void> => {
      if (!userId) {
        setManualError(new Error('User not authenticated'));
        return;
      }

      try {
        await queryClient.fetchQuery({
          queryKey: moodPulseQueryKey(userId, 28, endDate),
          queryFn: async () => loadMoodPulse(28, endDate),
          meta: AUTH_SCOPED_QUERY_META,
          ...queryOptions,
        });

        setMonthlyEndDate(previousEndDate =>
          previousEndDate === endDate ? previousEndDate : endDate
        );
        setManualError(null);
      } catch (error) {
        setManualError(
          error instanceof Error ? error : new Error('Failed to fetch monthly mood pulse')
        );
      }
    },
    [monthlyEndDate, queryClient, queryOptions, userId]
  );

  const refreshMoodAndPulse = useCallback(
    async (endDate = getLocalDateString()): Promise<void> => {
      if (!userId) {
        setManualError(new Error('User not authenticated'));
        return;
      }

      const nextEntriesParams = {
        startDate: getHistoryStartDate(endDate),
        endDate,
        limit: DEFAULT_MOOD_LIMIT,
        offset: DEFAULT_MOOD_OFFSET,
      };

      try {
        await Promise.all([
          queryClient.fetchQuery({
            queryKey: moodEntriesQueryKey(userId, nextEntriesParams),
            queryFn: async () => loadMoodEntries(nextEntriesParams),
            meta: AUTH_SCOPED_QUERY_META,
          }),
          queryClient.fetchQuery({
            queryKey: moodPulseQueryKey(userId, 7, endDate),
            queryFn: async () => loadMoodPulse(7, endDate),
            meta: AUTH_SCOPED_QUERY_META,
          }),
          queryClient.fetchQuery({
            queryKey: moodPulseQueryKey(userId, 28, endDate),
            queryFn: async () => loadMoodPulse(28, endDate),
            meta: AUTH_SCOPED_QUERY_META,
          }),
        ]);

        setEntriesParams(previousParams =>
          areEntriesParamsEqual(previousParams, nextEntriesParams)
            ? previousParams
            : nextEntriesParams
        );
        setWeeklyEndDate(previousEndDate =>
          previousEndDate === endDate ? previousEndDate : endDate
        );
        setMonthlyEndDate(previousEndDate =>
          previousEndDate === endDate ? previousEndDate : endDate
        );
        setManualError(null);
      } catch (error) {
        setManualError(
          error instanceof Error ? error : new Error('Failed to refresh mood and pulse')
        );
      }
    },
    [queryClient, userId]
  );

  const saveMoodEntryMutation = useMutation({
    mutationFn: async ({ moodId, date }: { moodId: MoodId; date: string }) => {
      const savedMoodEntry = await saveMoodEntryToApi(moodId, date);

      if (!savedMoodEntry) {
        throw new Error('Failed to save mood entry');
      }

      return savedMoodEntry;
    },
    onMutate: async ({ moodId, date }) => {
      const previousEntries = queryClient.getQueryData<MoodEntriesResponse>(currentEntriesQueryKey);
      const temporaryEntry: MoodEntry = {
        id: `temp-${date}`,
        user_id: userId ?? '',
        date,
        mood_id: moodId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      queryClient.setQueryData<MoodEntriesResponse>(currentEntriesQueryKey, currentEntries => {
        const nextEntries = upsertMoodEntry(currentEntries?.entries ?? [], temporaryEntry);

        return {
          entries: nextEntries,
          total: Math.max(currentEntries?.total ?? 0, nextEntries.length),
        };
      });

      return { previousEntries };
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(currentEntriesQueryKey, context?.previousEntries);
    },
    onSuccess: async (savedMoodEntry, { date }) => {
      queryClient.setQueryData<MoodEntriesResponse>(currentEntriesQueryKey, currentEntries => {
        const nextEntries = upsertMoodEntry(currentEntries?.entries ?? [], savedMoodEntry);

        return {
          entries: nextEntries,
          total: Math.max(currentEntries?.total ?? 0, nextEntries.length),
        };
      });

      await Promise.all([
        queryClient.fetchQuery({
          queryKey: moodPulseQueryKey(userId, 7, date),
          queryFn: async () => loadMoodPulse(7, date),
          meta: AUTH_SCOPED_QUERY_META,
        }),
        queryClient.fetchQuery({
          queryKey: moodPulseQueryKey(userId, 28, date),
          queryFn: async () => loadMoodPulse(28, date),
          meta: AUTH_SCOPED_QUERY_META,
        }),
      ]);

      setWeeklyEndDate(previousEndDate => (previousEndDate === date ? previousEndDate : date));
      setMonthlyEndDate(previousEndDate => (previousEndDate === date ? previousEndDate : date));
    },
  });

  const saveMoodEntry = useCallback(
    async (moodId: MoodId, date = getLocalDateString()): Promise<MoodEntry | null> => {
      if (!userId) {
        setManualError(new Error('User not authenticated'));
        return null;
      }

      try {
        const savedMoodEntry = await saveMoodEntryMutation.mutateAsync({ moodId, date });
        setManualError(null);
        return savedMoodEntry;
      } catch (error) {
        setManualError(error instanceof Error ? error : new Error('Failed to save mood entry'));
        return null;
      }
    },
    [saveMoodEntryMutation, userId]
  );

  const entries = useMemo(() => entriesQuery.data?.entries ?? [], [entriesQuery.data]);
  const weeklyPulse = weeklyPulseQuery.data ?? null;
  const monthlyPulse = monthlyPulseQuery.data ?? null;

  const getMoodForDate = useCallback(
    (date: string): MoodEntry | null => entries.find(entry => entry.date === date) || null,
    [entries]
  );

  const error =
    manualError ??
    (entriesQuery.error instanceof Error
      ? entriesQuery.error
      : weeklyPulseQuery.error instanceof Error
        ? weeklyPulseQuery.error
        : monthlyPulseQuery.error instanceof Error
          ? monthlyPulseQuery.error
          : null);
  const todayMood = useMemo(() => getMoodForDate(getLocalDateString()), [getMoodForDate]);

  return {
    entries,
    weeklyPulse,
    monthlyPulse,
    isLoading: entriesQuery.isLoading || saveMoodEntryMutation.isPending,
    isWeeklyPulseLoading: weeklyPulseQuery.isLoading,
    isMonthlyPulseLoading: monthlyPulseQuery.isLoading,
    error,
    fetchMoodEntries,
    saveMoodEntry,
    fetchWeeklyPulse,
    fetchMonthlyPulse,
    refreshMoodAndPulse,
    getMoodForDate,
    todayMood,
  };
};
