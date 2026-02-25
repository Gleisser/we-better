import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  NotificationFeedItemDto,
  notificationsService,
} from '@/core/services/notificationsService';

interface UseNotificationsFeedOptions {
  pageSize?: number;
  unreadOnly?: boolean;
  unreadRefreshIntervalMs?: number;
}

interface UseNotificationsFeedReturn {
  notifications: NotificationFeedItemDto[];
  total: number;
  unreadCount: number;
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
}

export function useNotificationsFeed(
  options: UseNotificationsFeedOptions = {}
): UseNotificationsFeedReturn {
  const pageSize = Math.max(1, options.pageSize ?? 20);
  const unreadOnly = options.unreadOnly ?? false;
  const unreadRefreshIntervalMs = options.unreadRefreshIntervalMs ?? 30_000;

  const [notifications, setNotifications] = useState<NotificationFeedItemDto[]>([]);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasMore = useMemo(() => notifications.length < total, [notifications.length, total]);

  const refreshUnreadCount = useCallback(async () => {
    const { data } = await notificationsService.getUnreadCount();
    if (data) {
      setUnreadCount(data.unread);
    }
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const [feedResult, unreadResult] = await Promise.all([
      notificationsService.getNotifications({
        limit: pageSize,
        offset: 0,
        unreadOnly,
      }),
      notificationsService.getUnreadCount(),
    ]);

    if (feedResult.error || !feedResult.data) {
      setError(feedResult.error || 'Failed to load notifications');
      setNotifications([]);
      setTotal(0);
      setUnreadCount(unreadResult.data?.unread ?? 0);
      setIsLoading(false);
      return;
    }

    setNotifications(feedResult.data.notifications);
    setTotal(feedResult.data.total);
    setUnreadCount(unreadResult.data?.unread ?? 0);
    setIsLoading(false);
  }, [pageSize, unreadOnly]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) {
      return;
    }

    setIsLoadingMore(true);
    setError(null);

    const result = await notificationsService.getNotifications({
      limit: pageSize,
      offset: notifications.length,
      unreadOnly,
    });

    if (result.error || !result.data) {
      setError(result.error || 'Failed to load more notifications');
      setIsLoadingMore(false);
      return;
    }

    const nextData = result.data;
    setNotifications(previous => [...previous, ...nextData.notifications]);
    setTotal(nextData.total);
    setIsLoadingMore(false);
  }, [hasMore, isLoadingMore, notifications.length, pageSize, unreadOnly]);

  const markAsRead = useCallback(
    async (notificationId: string): Promise<boolean> => {
      const previous = notifications;
      setNotifications(current =>
        current.map(item =>
          item.id === notificationId
            ? {
                ...item,
                read_at: item.read_at || new Date().toISOString(),
              }
            : item
        )
      );

      const result = await notificationsService.markAsRead(notificationId);
      if (!result.success) {
        setNotifications(previous);
        setError(result.error || 'Failed to mark notification as read');
        return false;
      }

      await refreshUnreadCount();
      return true;
    },
    [notifications, refreshUnreadCount]
  );

  const markAllAsRead = useCallback(async (): Promise<boolean> => {
    const previous = notifications;
    const nowIso = new Date().toISOString();
    setNotifications(current =>
      current.map(item => ({ ...item, read_at: item.read_at ?? nowIso }))
    );

    const result = await notificationsService.markAllAsRead();
    if (!result.success) {
      setNotifications(previous);
      setError(result.error || 'Failed to mark all notifications as read');
      return false;
    }

    await refreshUnreadCount();
    return true;
  }, [notifications, refreshUnreadCount]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void refreshUnreadCount();
    }, unreadRefreshIntervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [refreshUnreadCount, unreadRefreshIntervalMs]);

  return {
    notifications,
    total,
    unreadCount,
    hasMore,
    isLoading,
    isLoadingMore,
    error,
    refresh,
    loadMore,
    markAsRead,
    markAllAsRead,
  };
}

export default useNotificationsFeed;
