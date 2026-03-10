import React, { StrictMode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
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

  it('keeps the unread badge polling separate from the feed and skips the feed when disabled', async () => {
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
    expect(mockedNotificationsService.getUnreadCount).toHaveBeenCalledTimes(1);
    expect(mockedNotificationsService.getNotifications).not.toHaveBeenCalled();
  });
});
