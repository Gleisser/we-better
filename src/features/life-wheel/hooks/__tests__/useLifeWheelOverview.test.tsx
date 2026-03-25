import React, { StrictMode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getLifeWheelOverview } from '@/features/life-wheel/api/lifeWheelApi';
import { useAuth } from '@/shared/hooks/useAuth';
import { useLifeWheelOverview } from '../useLifeWheelOverview';

vi.mock('@/shared/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/features/life-wheel/api/lifeWheelApi', () => ({
  getLifeWheelOverview: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);
const mockedGetLifeWheelOverview = vi.mocked(getLifeWheelOverview);

const createWrapper = (): React.FC<{ children: React.ReactNode }> => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
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

describe('useLifeWheelOverview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseAuth.mockReturnValue({
      user: { id: 'user-123', email: 'user@example.com' },
      isLoading: false,
      isAuthenticated: true,
      checkAuth: vi.fn(),
      logout: vi.fn(),
    });
    mockedGetLifeWheelOverview.mockResolvedValue({
      success: true,
      hasEntryToday: false,
      currentEntry: {
        id: 'entry-1',
        date: '2026-03-25T10:00:00.000Z',
        categories: [],
      },
      history: {
        entries: [
          {
            id: 'entry-1',
            date: '2026-03-25T10:00:00.000Z',
            categories: [],
          },
        ],
        total: 1,
      },
    });
  });

  it('dedupes the initial overview load across StrictMode remounts and multiple consumers', async () => {
    const { result } = renderHook(
      () => ({
        first: useLifeWheelOverview(),
        second: useLifeWheelOverview(),
      }),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => expect(result.current.first.overview?.currentEntry?.id).toBe('entry-1'));
    expect(result.current.second.overview?.history.entries).toHaveLength(1);
    expect(mockedGetLifeWheelOverview).toHaveBeenCalledTimes(1);
  });
});
