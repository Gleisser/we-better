import {
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
  useMutation,
  useQuery,
} from '@tanstack/react-query';
import { queueUtils } from '../database/queueUtils';
import { RequestPriority, QueuedRequest } from '../database/db';
import { queryClient } from './queryClient';
import { QueueStatusMetrics, QueueHealthStatus } from '../database/queueMonitor';

/**
 * Options for queuedQuery hook
 */
export interface QueuedQueryOptions<TData = unknown, TError = unknown>
  extends Omit<UseQueryOptions<TData, TError, TData>, 'queryKey' | 'queryFn'> {
  endpoint: string;
  priority?: RequestPriority;
  customQueryKey?: unknown[];
  offline?: {
    enabled?: boolean;
    skipOfflineCache?: boolean;
    staleCacheTimeout?: number; // ms before requiring network refresh
  };
}

/**
 * Hook that combines React Query with the queue system for GET requests
 */
export function useQueuedQuery<TData = unknown, TError = unknown>({
  endpoint,
  priority = RequestPriority.MEDIUM,
  offline = { enabled: true },
  customQueryKey,
  ...options
}: QueuedQueryOptions<TData, TError>): UseQueryResult<TData, TError> {
  // Use the provided query key or create one based on the endpoint
  const queryKey = customQueryKey || ['queued', endpoint];

  return useQuery<TData, TError>({
    ...options,
    queryKey,
    queryFn: async () => {
      // If we're offline and offline mode is enabled, try to load from cache
      const isOnline = window.navigator.onLine;

      if (!isOnline && offline.enabled) {
        // Look up cached data
        const cachedData = await queryClient.getQueryData<TData>(queryKey);

        if (cachedData && !offline.skipOfflineCache) {
          return cachedData;
        }

        // Queue request for later
        await queueUtils.queueGet(endpoint, { priority });

        // Throw error to prevent invalid cache state
        throw new Error(`Offline - request queued for later: ${endpoint}`);
      }

      // Online flow - normal fetch
      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      return (await response.json()) as TData;
    },
  });
}

/**
 * Options for mutation operations
 */
export interface QueuedMutationOptions<TData = unknown, TVariables = unknown, TError = unknown>
  extends Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn'> {
  endpoint: string;
  method?: 'POST' | 'PUT' | 'DELETE';
  priority?: RequestPriority;
  offline?: {
    enabled?: boolean;
  };
  optimisticUpdate?: {
    queryKey: unknown[];
    updateFn: (oldData: unknown, variables: TVariables) => unknown;
  };
}

/**
 * Hook for mutation operations (POST, PUT, DELETE) with queue integration
 */
export function useQueuedMutation<TData = unknown, TVariables = unknown, TError = unknown>({
  endpoint,
  method = 'POST',
  priority = RequestPriority.MEDIUM,
  offline = { enabled: true },
  optimisticUpdate,
  ...options
}: QueuedMutationOptions<TData, TVariables, TError>): UseMutationResult<TData, TError, TVariables> {
  return useMutation<TData, TError, TVariables>({
    ...options,

    mutationFn: async variables => {
      // Handle optimistic updates
      if (optimisticUpdate) {
        queryClient.setQueryData(optimisticUpdate.queryKey, (oldData: unknown) => {
          return optimisticUpdate.updateFn(oldData, variables);
        });
      }

      // Check if we're online
      const isOnline = window.navigator.onLine;

      // If offline and offline mode enabled, queue for later
      if (!isOnline && offline.enabled) {
        // Add to the queue
        const requestId =
          method === 'POST'
            ? await queueUtils.queuePost(endpoint, variables as Record<string, unknown>, {
                priority,
              })
            : method === 'PUT'
              ? await queueUtils.queuePut(endpoint, variables as Record<string, unknown>, {
                  priority,
                })
              : await queueUtils.queueDelete(endpoint, { priority });

        return {
          success: true,
          queued: true,
          requestId,
          message: 'Request queued for processing when online',
        } as unknown as TData;
      }

      // Online flow - normal fetch
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: method !== 'DELETE' ? JSON.stringify(variables) : undefined,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      return (await response.json()) as TData;
    },
  });
}

/**
 * Hook to monitor queue status
 */
export function useQueueStatus(): UseQueryResult<QueueStatusMetrics, unknown> {
  return useQuery({
    queryKey: ['queueStatus'],
    queryFn: async () => {
      return queueUtils.getQueueStatus();
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  });
}

/**
 * Hook to monitor queue health status
 */
export function useQueueHealth(): UseQueryResult<QueueHealthStatus, unknown> {
  return useQuery({
    queryKey: ['queueHealth'],
    queryFn: async () => {
      return queueUtils.checkQueueHealth();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

/**
 * Manually invalidate queries
 */
export function invalidateQueuedQueries(endpoints: string[]): void {
  for (const endpoint of endpoints) {
    queryClient.invalidateQueries({ queryKey: ['queued', endpoint] });
  }
}

/**
 * Subscribe to queue events for a specific request ID
 */
export function useQueuedRequest(requestId: string): UseQueryResult<QueuedRequest | null, unknown> {
  return useQuery({
    queryKey: ['queuedRequest', requestId],
    queryFn: async () => {
      return queueUtils.getQueuedRequest(requestId);
    },
    enabled: !!requestId,
    refetchInterval: query => {
      const data = query.state.data as QueuedRequest | null;
      return data && (data.status === 'pending' || data.status === 'processing') ? 2000 : false;
    },
  });
}
