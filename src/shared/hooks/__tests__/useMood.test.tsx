import React, { StrictMode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useMood } from '../useMood';
import { useAuth } from '@/shared/hooks/useAuth';
import {
  fetchMoodEntries,
  fetchMonthlyMoodPulse,
  fetchWeeklyMoodPulse,
} from '@/core/services/moodService';
import { getLocalDateString } from '@/utils/helpers/dateUtils';

vi.mock('@/shared/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/core/services/moodService', async importOriginal => {
  const actual = await importOriginal<typeof import('@/core/services/moodService')>();

  return {
    ...actual,
    fetchMoodEntries: vi.fn(),
    fetchWeeklyMoodPulse: vi.fn(),
    fetchMonthlyMoodPulse: vi.fn(),
    saveMoodEntry: vi.fn(),
  };
});

const mockedUseAuth = vi.mocked(useAuth);
const mockedFetchMoodEntries = vi.mocked(fetchMoodEntries);
const mockedFetchWeeklyMoodPulse = vi.mocked(fetchWeeklyMoodPulse);
const mockedFetchMonthlyMoodPulse = vi.mocked(fetchMonthlyMoodPulse);

const createWrapper = (): React.FC<{ children: React.ReactNode }> => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <StrictMode>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </StrictMode>
    );
  };
};

describe('useMood', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const today = getLocalDateString();

    mockedUseAuth.mockReturnValue({
      user: { id: 'user-123', email: 'user@example.com' },
      isLoading: false,
      isAuthenticated: true,
      checkAuth: vi.fn(),
      logout: vi.fn(),
    });

    mockedFetchMoodEntries.mockResolvedValue({
      entries: [
        {
          id: 'mood-1',
          user_id: 'user-123',
          date: today,
          mood_id: 'balanced',
          created_at: '2026-03-11T00:00:00.000Z',
          updated_at: '2026-03-11T00:00:00.000Z',
        },
      ],
      total: 1,
    });

    mockedFetchWeeklyMoodPulse.mockResolvedValue({
      window: {
        start_date: '2026-03-05',
        end_date: '2026-03-11',
        days: 7,
      },
      coverage: {
        logged_days: 1,
        missing_days: 6,
      },
      current_week: {
        average_score: 3,
        average_mood_id: 'balanced',
        days: [],
      },
      comparison: {
        previous_average_score: 3,
        delta_score: 0,
        direction: 'stable',
      },
    });

    mockedFetchMonthlyMoodPulse.mockResolvedValue({
      window: {
        start_date: '2026-02-13',
        end_date: '2026-03-11',
        days: 28,
      },
      coverage: {
        logged_days: 1,
        missing_days: 27,
      },
      current_week: {
        average_score: 3,
        average_mood_id: 'balanced',
        days: [],
      },
      comparison: {
        previous_average_score: 3,
        delta_score: 0,
        direction: 'stable',
      },
    });
  });

  it('dedupes the initial mood reads across StrictMode remounts and multiple consumers', async () => {
    const { result } = renderHook(
      () => ({
        first: useMood(),
        second: useMood(),
      }),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => expect(result.current.first.todayMood?.id).toBe('mood-1'));

    expect(result.current.second.todayMood?.id).toBe('mood-1');
    expect(mockedFetchMoodEntries).toHaveBeenCalledTimes(1);
    expect(mockedFetchWeeklyMoodPulse).toHaveBeenCalledTimes(1);
    expect(mockedFetchMonthlyMoodPulse).toHaveBeenCalledTimes(1);
  });

  it('serves dashboard overview mood data without firing the legacy mood queries', async () => {
    const initialData = {
      entries: [
        {
          id: 'mood-2',
          user_id: 'user-123',
          date: getLocalDateString(),
          mood_id: 'bright' as const,
          created_at: '2026-03-11T00:00:00.000Z',
          updated_at: '2026-03-11T00:00:00.000Z',
        },
      ],
      weeklyPulse: {
        window: {
          start_date: '2026-03-05',
          end_date: '2026-03-11',
          days: 7,
        },
        coverage: {
          logged_days: 1,
          missing_days: 6,
        },
        current_week: {
          average_score: 4,
          average_mood_id: 'bright' as const,
          days: [
            {
              date: getLocalDateString(),
              mood_id: 'bright' as const,
              score: 4,
            },
          ],
        },
        comparison: {
          previous_average_score: 3,
          delta_score: 1,
          direction: 'up' as const,
        },
      },
      monthlyPulse: {
        window: {
          start_date: '2026-02-13',
          end_date: '2026-03-11',
          days: 28,
        },
        coverage: {
          logged_days: 1,
          missing_days: 27,
        },
        current_week: {
          average_score: 4,
          average_mood_id: 'bright' as const,
          days: [
            {
              date: getLocalDateString(),
              mood_id: 'bright' as const,
              score: 4,
            },
          ],
        },
        comparison: {
          previous_average_score: 3,
          delta_score: 1,
          direction: 'up' as const,
        },
      },
    };

    const { result } = renderHook(() => useMood(undefined, { enabled: false, initialData }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.todayMood?.id).toBe('mood-2'));

    expect(result.current.todayMood?.mood_id).toBe('bright');
    expect(result.current.weeklyPulse?.comparison.direction).toBe('up');
    expect(result.current.monthlyPulse?.comparison.direction).toBe('up');
    expect(mockedFetchMoodEntries).not.toHaveBeenCalled();
    expect(mockedFetchWeeklyMoodPulse).not.toHaveBeenCalled();
    expect(mockedFetchMonthlyMoodPulse).not.toHaveBeenCalled();
  });

  it('hydrates dashboard overview mood data that arrives after mount', async () => {
    const initialData = {
      entries: [
        {
          id: 'mood-3',
          user_id: 'user-123',
          date: getLocalDateString(),
          mood_id: 'bright' as const,
          created_at: '2026-03-11T00:00:00.000Z',
          updated_at: '2026-03-11T00:00:00.000Z',
        },
      ],
      weeklyPulse: {
        window: {
          start_date: '2026-03-05',
          end_date: '2026-03-11',
          days: 7,
        },
        coverage: {
          logged_days: 1,
          missing_days: 6,
        },
        current_week: {
          average_score: 4,
          average_mood_id: 'bright' as const,
          days: [
            {
              date: getLocalDateString(),
              mood_id: 'bright' as const,
              score: 4,
            },
          ],
        },
        comparison: {
          previous_average_score: 3,
          delta_score: 1,
          direction: 'up' as const,
        },
      },
      monthlyPulse: {
        window: {
          start_date: '2026-02-13',
          end_date: '2026-03-11',
          days: 28,
        },
        coverage: {
          logged_days: 1,
          missing_days: 27,
        },
        current_week: {
          average_score: 4,
          average_mood_id: 'bright' as const,
          days: [
            {
              date: getLocalDateString(),
              mood_id: 'bright' as const,
              score: 4,
            },
          ],
        },
        comparison: {
          previous_average_score: 3,
          delta_score: 1,
          direction: 'up' as const,
        },
      },
    };

    const { result, rerender } = renderHook(
      ({ moodData }: { moodData: typeof initialData | null }) =>
        useMood(undefined, { enabled: false, initialData: moodData }),
      {
        initialProps: { moodData: null },
        wrapper: createWrapper(),
      }
    );

    expect(result.current.todayMood).toBeNull();

    rerender({ moodData: initialData });

    await waitFor(() => expect(result.current.todayMood?.id).toBe('mood-3'));

    expect(result.current.weeklyPulse?.comparison.direction).toBe('up');
    expect(result.current.monthlyPulse?.comparison.direction).toBe('up');
    expect(mockedFetchMoodEntries).not.toHaveBeenCalled();
    expect(mockedFetchWeeklyMoodPulse).not.toHaveBeenCalled();
    expect(mockedFetchMonthlyMoodPulse).not.toHaveBeenCalled();
  });
});
