import { InfiniteData, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AUTH_SCOPED_QUERY_META } from '@/core/config/react-query';
import {
  NotificationFeedItemDto,
  NotificationsFeedResponse,
  notificationsService,
} from '@/core/services/notificationsService';
import { useAuth } from '@/shared/hooks/useAuth';

export const DEFAULT_NOTIFICATIONS_FEED_PAGE_SIZE = 20;

interface UseNotificationsFeedOptions {
  pageSize?: number;
  unreadOnly?: boolean;
  enabled?: boolean;
}

interface UseUnreadNotificationsCountOptions {
  enabled?: boolean;
  refreshIntervalMs?: number;
  refetchOnMount?: boolean;
}

interface UseUnreadNotificationsCountReturn {
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseNotificationsFeedReturn {
  notifications: NotificationFeedItemDto[];
  total: number;
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
}

const resolveUnreadCountFallback = async (): Promise<number> => 0;

const notificationsFeedQueryKeyPrefix = (userId: string | null) =>
  ['notifications', 'feed', userId ?? 'anonymous'] as const;

const notificationsFeedQueryKey = (userId: string | null, pageSize: number, unreadOnly: boolean) =>
  [...notificationsFeedQueryKeyPrefix(userId), { pageSize, unreadOnly }] as const;

const loadNotificationsPage = async (
  pageSize: number,
  unreadOnly: boolean,
  offset: number
): Promise<NotificationsFeedResponse> => {
  const result = await notificationsService.getNotifications({
    limit: pageSize,
    offset,
    unreadOnly,
  });

  if (result.error || !result.data) {
    throw new Error(result.error || 'Failed to load notifications');
  }

  return result.data;
};

const mapFeedData = (
  data: InfiniteData<NotificationsFeedResponse> | undefined
): NotificationFeedItemDto[] => {
  if (!data) {
    return [];
  }

  return data.pages.flatMap(page => page.notifications);
};

const markNotificationAsRead = (
  data: InfiniteData<NotificationsFeedResponse> | undefined,
  notificationId: string,
  readAt: string
): InfiniteData<NotificationsFeedResponse> | undefined => {
  if (!data) {
    return data;
  }

  return {
    ...data,
    pages: data.pages.map(page => ({
      ...page,
      notifications: page.notifications.map(notification =>
        notification.id === notificationId
          ? {
              ...notification,
              read_at: notification.read_at ?? readAt,
            }
          : notification
      ),
    })),
  };
};

const markAllNotificationsAsRead = (
  data: InfiniteData<NotificationsFeedResponse> | undefined,
  readAt: string
): InfiniteData<NotificationsFeedResponse> | undefined => {
  if (!data) {
    return data;
  }

  return {
    ...data,
    pages: data.pages.map(page => ({
      ...page,
      notifications: page.notifications.map(notification => ({
        ...notification,
        read_at: notification.read_at ?? readAt,
      })),
    })),
  };
};

export function useUnreadNotificationsCount(
  options: UseUnreadNotificationsCountOptions = {}
): UseUnreadNotificationsCountReturn {
  const { user, unreadNotificationCount = 0, refreshUnreadNotificationCount } = useAuth();
  const userId = user?.id ?? null;
  const enabled = Boolean(userId) && (options.enabled ?? true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refreshUnreadCount = refreshUnreadNotificationCount ?? resolveUnreadCountFallback;

  const refetch = useCallback(async (): Promise<void> => {
    if (!enabled) {
      setError(null);
      return;
    }

    setIsLoading(true);

    try {
      await refreshUnreadCount();
      setError(null);
    } catch (refetchError) {
      setError(
        refetchError instanceof Error ? refetchError.message : 'Failed to load unread notifications'
      );
    } finally {
      setIsLoading(false);
    }
  }, [enabled, refreshUnreadCount]);

  useEffect(() => {
    if (!enabled || !options.refetchOnMount) {
      return;
    }

    void refetch();
  }, [enabled, options.refetchOnMount, refetch]);

  useEffect(() => {
    if (!enabled || !options.refreshIntervalMs) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void refetch();
    }, options.refreshIntervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [enabled, options.refreshIntervalMs, refetch]);

  return {
    unreadCount: enabled ? unreadNotificationCount : 0,
    isLoading,
    error,
    refetch,
  };
}

export function useNotificationsFeed(
  options: UseNotificationsFeedOptions = {}
): UseNotificationsFeedReturn {
  const queryClient = useQueryClient();
  const { user, decrementUnreadNotificationCount, clearUnreadNotificationCount } = useAuth();
  const userId = user?.id ?? null;
  const pageSize = Math.max(1, options.pageSize ?? DEFAULT_NOTIFICATIONS_FEED_PAGE_SIZE);
  const unreadOnly = options.unreadOnly ?? false;
  const enabled = Boolean(userId) && (options.enabled ?? true);

  const query = useInfiniteQuery({
    queryKey: notificationsFeedQueryKey(userId, pageSize, unreadOnly),
    queryFn: async ({ pageParam }) => loadNotificationsPage(pageSize, unreadOnly, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loadedCount = allPages.reduce((total, page) => total + page.notifications.length, 0);
      return loadedCount < lastPage.total ? loadedCount : undefined;
    },
    enabled,
    meta: AUTH_SCOPED_QUERY_META,
  });

  const notifications = useMemo(() => mapFeedData(query.data), [query.data]);
  const total = query.data?.pages[0]?.total ?? 0;
  const hasMore = notifications.length < total;

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const result = await notificationsService.markAsRead(notificationId);

      if (!result.success) {
        throw new Error(result.error || 'Failed to mark notification as read');
      }

      return notificationId;
    },
    onMutate: async notificationId => {
      const nowIso = new Date().toISOString();
      const queryKey = notificationsFeedQueryKeyPrefix(userId);
      const previousEntries = queryClient.getQueriesData<InfiniteData<NotificationsFeedResponse>>({
        queryKey,
      });

      queryClient.setQueriesData<InfiniteData<NotificationsFeedResponse>>({ queryKey }, data =>
        markNotificationAsRead(data, notificationId, nowIso)
      );

      return { previousEntries };
    },
    onError: (_error, _notificationId, context) => {
      context?.previousEntries.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
    onSuccess: () => {
      decrementUnreadNotificationCount?.();
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const result = await notificationsService.markAllAsRead();

      if (!result.success) {
        throw new Error(result.error || 'Failed to mark all notifications as read');
      }

      return true;
    },
    onMutate: async () => {
      const nowIso = new Date().toISOString();
      const queryKey = notificationsFeedQueryKeyPrefix(userId);
      const previousEntries = queryClient.getQueriesData<InfiniteData<NotificationsFeedResponse>>({
        queryKey,
      });

      queryClient.setQueriesData<InfiniteData<NotificationsFeedResponse>>({ queryKey }, data =>
        markAllNotificationsAsRead(data, nowIso)
      );
      return { previousEntries };
    },
    onError: (_error, _variables, context) => {
      context?.previousEntries.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
    onSuccess: () => {
      clearUnreadNotificationCount?.();
    },
  });

  const refresh = useCallback(async (): Promise<void> => {
    await query.refetch();
  }, [query]);

  const loadMore = useCallback(async (): Promise<void> => {
    if (!hasMore || query.isFetchingNextPage) {
      return;
    }

    await query.fetchNextPage();
  }, [hasMore, query]);

  const markAsRead = useCallback(
    async (notificationId: string): Promise<boolean> => {
      try {
        await markAsReadMutation.mutateAsync(notificationId);
        return true;
      } catch {
        return false;
      }
    },
    [markAsReadMutation]
  );

  const markAllAsRead = useCallback(async (): Promise<boolean> => {
    try {
      await markAllAsReadMutation.mutateAsync();
      return true;
    } catch {
      return false;
    }
  }, [markAllAsReadMutation]);

  return {
    notifications,
    total,
    hasMore,
    isLoading: query.isLoading,
    isLoadingMore: query.isFetchingNextPage,
    error: query.error instanceof Error ? query.error.message : null,
    refresh,
    loadMore,
    markAsRead,
    markAllAsRead,
  };
}

export default useNotificationsFeed;
