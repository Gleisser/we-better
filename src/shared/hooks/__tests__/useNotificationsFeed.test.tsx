import React, { StrictMode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useNotificationsFeed, useUnreadNotificationsCount } from '../useNotificationsFeed';
import { useAuth } from '@/shared/hooks/useAuth';
import { notificationsService } from '@/core/services/notificationsService';

vi.mock('@/shared/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/core/services/notificationsService', () => ({
  notificationsService: {
    getNotifications: vi.fn(),
    getUnreadCount: vi.fn(),
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
  },
}));

const mockedUseAuth = vi.mocked(useAuth);
const mockedNotificationsService = vi.mocked(notificationsService);

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

describe('notifications hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseAuth.mockReturnValue({
      user: { id: 'user-123', email: 'user@example.com' },
      isLoading: false,
      isAuthenticated: true,
      unreadNotificationCount: 3,
      refreshUnreadNotificationCount: vi.fn().mockResolvedValue(3),
      decrementUnreadNotificationCount: vi.fn(),
      clearUnreadNotificationCount: vi.fn(),
      checkAuth: vi.fn(),
      logout: vi.fn(),
    });
    mockedNotificationsService.getNotifications.mockResolvedValue({
      data: {
        notifications: [],
        total: 0,
      },
      error: null,
    });
    mockedNotificationsService.getUnreadCount.mockResolvedValue({
      data: {
        unread: 3,
      },
      error: null,
    });
  });

  it('reads the unread badge from shared auth state and skips the feed when disabled', async () => {
    const { result } = renderHook(
      () => ({
        unread: useUnreadNotificationsCount(),
        feed: useNotificationsFeed({ enabled: false }),
      }),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => expect(result.current.unread.unreadCount).toBe(3));

    expect(result.current.feed.notifications).toEqual([]);
    expect(mockedNotificationsService.getUnreadCount).not.toHaveBeenCalled();
    expect(mockedNotificationsService.getNotifications).not.toHaveBeenCalled();
  });

  it('supports deferred unread-count activation and only refreshes on demand', async () => {
    const refreshUnreadNotificationCount = vi.fn().mockResolvedValue(3);
    mockedUseAuth.mockReturnValue({
      user: { id: 'user-123', email: 'user@example.com' },
      isLoading: false,
      isAuthenticated: true,
      unreadNotificationCount: 3,
      refreshUnreadNotificationCount,
      decrementUnreadNotificationCount: vi.fn(),
      clearUnreadNotificationCount: vi.fn(),
      checkAuth: vi.fn(),
      logout: vi.fn(),
    });

    const { result, rerender } = renderHook(
      ({ enabled }) => useUnreadNotificationsCount({ enabled, refetchOnMount: false }),
      {
        initialProps: { enabled: false },
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.unreadCount).toBe(0);
    expect(refreshUnreadNotificationCount).not.toHaveBeenCalled();

    await act(async () => {
      rerender({ enabled: true });
    });

    await waitFor(() => expect(result.current.unreadCount).toBe(3));
    expect(refreshUnreadNotificationCount).not.toHaveBeenCalled();

    await act(async () => {
      await result.current.refetch();
    });

    expect(refreshUnreadNotificationCount).toHaveBeenCalledTimes(1);
  });
});
