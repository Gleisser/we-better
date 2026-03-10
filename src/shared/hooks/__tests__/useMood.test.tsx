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
});
