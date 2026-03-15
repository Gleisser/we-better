import React, { StrictMode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAffirmations } from '../useAffirmations';
import { useAuth } from '@/shared/hooks/useAuth';
import {
  checkTodayStatus,
  fetchAffirmationStreak,
  fetchPersonalAffirmation,
  fetchReminderSettings,
} from '@/core/services/affirmationsService';

vi.mock('@/shared/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/core/services/affirmationsService', async importOriginal => {
  const actual = await importOriginal<typeof import('@/core/services/affirmationsService')>();

  return {
    ...actual,
    fetchPersonalAffirmation: vi.fn(),
    fetchReminderSettings: vi.fn(),
    fetchAffirmationStreak: vi.fn(),
    checkTodayStatus: vi.fn(),
    fetchAffirmationStats: vi.fn(),
  };
});

const mockedUseAuth = vi.mocked(useAuth);
const mockedFetchPersonalAffirmation = vi.mocked(fetchPersonalAffirmation);
const mockedFetchReminderSettings = vi.mocked(fetchReminderSettings);
const mockedFetchAffirmationStreak = vi.mocked(fetchAffirmationStreak);
const mockedCheckTodayStatus = vi.mocked(checkTodayStatus);

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

describe('useAffirmations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseAuth.mockReturnValue({
      user: { id: 'user-123', email: 'user@example.com' },
      isLoading: false,
      isAuthenticated: true,
      checkAuth: vi.fn(),
      logout: vi.fn(),
    });
    mockedFetchPersonalAffirmation.mockResolvedValue(null);
    mockedFetchReminderSettings.mockResolvedValue(null);
    mockedFetchAffirmationStreak.mockResolvedValue({
      current_streak: 4,
      longest_streak: 7,
      last_affirmed_date: '2026-03-10',
    });
    mockedCheckTodayStatus.mockResolvedValue(true);
  });

  it('dedupes the shared affirmation bootstrap reads across StrictMode remounts and multiple consumers', async () => {
    const { result } = renderHook(
      () => ({
        first: useAffirmations(),
        second: useAffirmations(),
      }),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => expect(result.current.first.hasAffirmedToday).toBe(true));
    expect(result.current.second.hasAffirmedToday).toBe(true);
    expect(mockedFetchPersonalAffirmation).toHaveBeenCalledTimes(1);
    expect(mockedFetchReminderSettings).toHaveBeenCalledTimes(1);
    expect(mockedFetchAffirmationStreak).toHaveBeenCalledTimes(1);
    expect(mockedCheckTodayStatus).toHaveBeenCalledTimes(1);
  });

  it('can limit dashboard bootstrap to today status only', async () => {
    const { result } = renderHook(
      () =>
        useAffirmations({
          loadPersonalAffirmation: false,
          loadReminderSettings: false,
          loadStreak: false,
          loadTodayStatus: true,
        }),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => expect(result.current.hasAffirmedToday).toBe(true));
    expect(mockedFetchPersonalAffirmation).not.toHaveBeenCalled();
    expect(mockedFetchReminderSettings).not.toHaveBeenCalled();
    expect(mockedFetchAffirmationStreak).not.toHaveBeenCalled();
    expect(mockedCheckTodayStatus).toHaveBeenCalledTimes(1);
  });
});
