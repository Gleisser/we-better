import React, { StrictMode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSessionsHistory, useSessionsOverview } from '../useSessionsOverview';
import { useAuth } from '@/shared/hooks/useAuth';
import { sessionsService } from '@/core/services/sessionsService';

vi.mock('@/shared/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/core/services/sessionsService', () => ({
  sessionsService: {
    getSessionsOverview: vi.fn(),
    getHistory: vi.fn(),
  },
}));

const mockedUseAuth = vi.mocked(useAuth);
const mockedSessionsService = vi.mocked(sessionsService);

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

describe('session queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseAuth.mockReturnValue({
      user: { id: 'user-123', email: 'user@example.com' },
      isLoading: false,
      isAuthenticated: true,
      checkAuth: vi.fn(),
      logout: vi.fn(),
    });
    mockedSessionsService.getSessionsOverview.mockResolvedValue({
      data: {
        summary: {
          totalSessions: 2,
          activeSessions: 1,
          currentSessionId: 'session-1',
          lastLogin: null,
          suspiciousSessions: 0,
          trustedDevices: 1,
        },
        recentSessions: [],
      },
      error: null,
    });
    mockedSessionsService.getHistory.mockResolvedValue({
      data: {
        sessions: [{ id: 'session-1' }],
      },
      error: null,
    });
  });

  it('dedupes the initial sessions overview load across StrictMode remounts and multiple consumers', async () => {
    const { result } = renderHook(
      () => ({
        first: useSessionsOverview(),
        second: useSessionsOverview(),
      }),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => expect(result.current.first.summary.totalSessions).toBe(2));
    expect(result.current.second.summary.totalSessions).toBe(2);
    expect(mockedSessionsService.getSessionsOverview).toHaveBeenCalledTimes(1);
  });

  it('keeps session history lazy until explicitly enabled', async () => {
    const { result, rerender } = renderHook(
      ({ enabled }) => useSessionsHistory({ enabled, limit: 50, offset: 0 }),
      {
        initialProps: { enabled: false },
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.sessions).toEqual([]);
    expect(mockedSessionsService.getHistory).not.toHaveBeenCalled();

    await act(async () => {
      rerender({ enabled: true });
    });

    await waitFor(() => expect(result.current.sessions).toHaveLength(1));
    expect(mockedSessionsService.getHistory).toHaveBeenCalledTimes(1);
  });
});
