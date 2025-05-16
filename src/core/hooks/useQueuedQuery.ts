import { useQuery, UseQueryResult, UseQueryOptions } from '@tanstack/react-query';
import { queueUtils } from '../database/queueUtils';
import { RequestPriority, RequestStatus } from '../database/db';

// Define additional properties for the extended QueuedRequest
interface ExtendedQueuedRequest {
  responseData?: string;
}

// Define types for queue status and health
export interface QueueStats {
  stats: Record<string, number>;
  processor: {
    activeRequests: number;
    maxConcurrent: number;
    isOnline: boolean;
    isRunning: boolean;
  };
}

export interface QueueHealth {
  isHealthy: boolean;
  issues: string[];
  pendingCount: number;
  failedCount: number;
  stuckCount: number;
  oldestPendingAge?: number;
}

type QueuedQueryOptions<TData, TError> = Omit<
  UseQueryOptions<TData, TError, TData, string[]>,
  'queryKey' | 'queryFn'
> & {
  endpoint: string;
  queryKey: string[];
  queue?: {
    priority?: RequestPriority;
    bypassQueue?: boolean;
    forceNetwork?: boolean;
    cacheDuration?: number; // Time in ms to cache results
  };
};

/**
 * Hook for performing queries with offline support
 *
 * This hook integrates React Query with the IndexedDB queue system.
 * It supports:
 * - Offline-first queries using cached data when offline
 * - Automatic queuing of GET requests when offline
 * - Configurable cache duration
 * - Forced network requests
 *
 * @param options Query options including endpoint and queryKey
 * @returns React Query result
 */
export function useQueuedQuery<TData = unknown, TError = unknown>(
  options: QueuedQueryOptions<TData, TError>
): UseQueryResult<TData, TError> {
  const { endpoint, queryKey, queue = {}, enabled = true, ...restOptions } = options;

  const isOnline = window.navigator.onLine;
  const {
    priority = RequestPriority.MEDIUM,
    bypassQueue = false,
    forceNetwork = false,
    cacheDuration = 1000 * 60 * 60, // 1 hour default
  } = queue;

  // Create a cache key for storing and retrieving cached data
  const cacheKey = `cache:${queryKey.join(':')}`;

  // Create a query function that integrates with the queue system
  const queryFn = async (): Promise<TData> => {
    // If we're online and not using the queue, fetch directly
    if (isOnline && (bypassQueue || forceNetwork)) {
      try {
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // Store in local cache for offline use
        localStorage.setItem(
          cacheKey,
          JSON.stringify({
            data,
            timestamp: Date.now(),
            expiresAt: Date.now() + cacheDuration,
          })
        );

        return data;
      } catch (error) {
        // If online request fails and we have cached data, use it
        const cachedData = localStorage.getItem(cacheKey);
        if (cachedData) {
          try {
            const parsed = JSON.parse(cachedData);
            if (parsed.expiresAt > Date.now()) {
              return parsed.data;
            }
          } catch {
            // Ignore parse errors
          }
        }
        throw error;
      }
    }

    // Check for valid cached data
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        if (parsed.expiresAt > Date.now() && !forceNetwork) {
          return parsed.data;
        }
      } catch {
        // Ignore parse errors, continue to queue
      }
    }

    // Queue the request if we're offline or specifically using queue
    const requestId = await queueUtils.queueGet(endpoint, { priority });

    // Return a promise that resolves when the queued request completes
    return new Promise((resolve, reject) => {
      const checkStatus = async (): Promise<void> => {
        const request = await queueUtils.getQueuedRequest(requestId);
        if (!request) {
          reject(new Error('Request not found in queue'));
          return;
        }

        if (request.status === RequestStatus.COMPLETED) {
          try {
            // Cast to extended type that might have responseData
            const extendedRequest = request as unknown as ExtendedQueuedRequest;
            const responseData = extendedRequest.responseData
              ? JSON.parse(extendedRequest.responseData)
              : null;

            // Store successful response in cache
            if (responseData) {
              localStorage.setItem(
                cacheKey,
                JSON.stringify({
                  data: responseData,
                  timestamp: Date.now(),
                  expiresAt: Date.now() + cacheDuration,
                })
              );
            }

            resolve(responseData as TData);
          } catch {
            // If we can't parse the response but have cached data, use it
            const cachedFallback = localStorage.getItem(cacheKey);
            if (cachedFallback) {
              try {
                const parsed = JSON.parse(cachedFallback);
                if (parsed.expiresAt > Date.now()) {
                  resolve(parsed.data as TData);
                  return;
                }
              } catch {
                // Ignore parse errors
              }
            }
            reject(new Error('Failed to parse response'));
          }
        } else if (request.status === RequestStatus.FAILED) {
          // If request failed but we have cached data, use it
          const cachedFallback = localStorage.getItem(cacheKey);
          if (cachedFallback) {
            try {
              const parsed = JSON.parse(cachedFallback);
              if (parsed.expiresAt > Date.now()) {
                resolve(parsed.data as TData);
                return;
              }
            } catch {
              // Ignore parse errors
            }
          }
          reject(new Error(request.errorMessage || 'Request failed'));
        } else {
          // Still pending or processing, check again later
          setTimeout(checkStatus, 500);
        }
      };

      // Start checking status
      checkStatus();
    });
  };

  // Use React Query with our queue-integrated function
  return useQuery({
    queryKey,
    queryFn,
    enabled: enabled,
    staleTime: cacheDuration / 2, // Set stale time to half the cache duration
    ...restOptions,
  });
}

/**
 * Hook to check the current status of the offline queue
 *
 * @returns Status and statistics about the offline request queue
 */
export function useQueueStatus(): UseQueryResult<QueueStats, Error> {
  const getStats = async (): Promise<QueueStats> => {
    return queueUtils.getQueueStats();
  };

  return useQuery({
    queryKey: ['queueStatus'],
    queryFn: getStats,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

/**
 * Hook to check the health of the offline queue
 *
 * @returns Health status of the queue system
 */
export function useQueueHealth(): UseQueryResult<QueueHealth, Error> {
  const checkHealth = async (): Promise<QueueHealth> => {
    return queueUtils.checkQueueHealth();
  };

  return useQuery({
    queryKey: ['queueHealth'],
    queryFn: checkHealth,
    refetchInterval: 60000, // Refetch every minute
  });
}
