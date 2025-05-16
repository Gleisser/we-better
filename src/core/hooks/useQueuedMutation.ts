import { useMutation, UseMutationResult, UseMutationOptions } from '@tanstack/react-query';
import { queueUtils } from '../database/queueUtils';
import { RequestPriority, RequestStatus } from '../database/db';

// Define additional properties that might be present in a QueuedRequest response
interface ExtendedQueuedRequest {
  responseData?: string;
}

type QueuedMutationOptions<TData, TError, TVariables, TContext> = UseMutationOptions<
  TData,
  TError,
  TVariables,
  TContext
> & {
  endpoint: string;
  method: 'POST' | 'PUT' | 'DELETE';
  queue?: {
    priority?: RequestPriority;
    groupId?: string;
    tags?: string[];
    bypassQueue?: boolean; // To optionally skip queueing
  };
};

/**
 * Hook for performing mutations that are automatically queued for offline support
 *
 * This hook integrates React Query mutations with the IndexedDB queue system.
 * When offline, requests are automatically stored in the queue and processed when online.
 * When online, requests are executed immediately and only queued if they fail.
 *
 * @param options Mutation options including endpoint and method
 * @returns React Query mutation result
 */
export function useQueuedMutation<
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown,
>(
  options: QueuedMutationOptions<TData, TError, TVariables, TContext>
): UseMutationResult<TData, TError, TVariables, TContext> {
  const {
    endpoint,
    method,
    queue = {},
    mutationFn,
    onMutate,
    onError,
    onSuccess,
    onSettled,
    ...restOptions
  } = options;

  const isOnline = window.navigator.onLine;
  const { bypassQueue = false, priority = RequestPriority.MEDIUM, groupId, tags } = queue;

  // Create a mutationFn that integrates with the queue
  const queuedMutationFn = async (variables: TVariables): Promise<TData> => {
    // If we have a custom mutationFn, use that instead of building our own
    if (mutationFn) {
      if (isOnline && bypassQueue) {
        // If online and bypassing queue, call directly
        return await mutationFn(variables);
      } else {
        // Otherwise queue it
        const body = variables as Record<string, unknown>;
        const requestId = await queueMutation(method, endpoint, body, { priority, groupId, tags });

        // Return a promise that resolves when the queued request completes
        return new Promise((resolve, reject) => {
          const checkStatus = async (): Promise<void> => {
            const request = await queueUtils.getQueuedRequest(requestId);
            if (!request) {
              reject(new Error('Request not found in queue'));
              return;
            }

            if (request.status === RequestStatus.COMPLETED) {
              // Try to parse response data if available
              try {
                // Cast to extended type that might have responseData
                const extendedRequest = request as unknown as ExtendedQueuedRequest;
                const responseData = extendedRequest.responseData
                  ? JSON.parse(extendedRequest.responseData)
                  : { success: true };
                resolve(responseData as TData);
              } catch {
                // If parsing fails, return generic success response
                resolve({ success: true } as unknown as TData);
              }
            } else if (request.status === RequestStatus.FAILED) {
              reject(new Error(request.errorMessage || 'Request failed'));
            } else {
              // Still pending or processing, check again later
              setTimeout(checkStatus, 500);
            }
          };

          // Start checking status
          checkStatus();
        });
      }
    }

    // Default implementation if no custom mutationFn provided
    if (isOnline && bypassQueue) {
      // Direct API call when online and not using queue
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: variables ? JSON.stringify(variables) : undefined,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } else {
      // Queue the mutation
      const body = variables as Record<string, unknown>;
      const requestId = await queueMutation(method, endpoint, body, { priority, groupId, tags });

      // Return a promise that resolves when the queued request completes
      return new Promise((resolve, reject) => {
        const checkStatus = async (): Promise<void> => {
          const request = await queueUtils.getQueuedRequest(requestId);
          if (!request) {
            reject(new Error('Request not found in queue'));
            return;
          }

          if (request.status === RequestStatus.COMPLETED) {
            // Try to parse response data if available
            try {
              // Cast to extended type that might have responseData
              const extendedRequest = request as unknown as ExtendedQueuedRequest;
              const responseData = extendedRequest.responseData
                ? JSON.parse(extendedRequest.responseData)
                : { success: true };
              resolve(responseData as TData);
            } catch {
              // If parsing fails, return generic success response
              resolve({ success: true } as unknown as TData);
            }
          } else if (request.status === RequestStatus.FAILED) {
            reject(new Error(request.errorMessage || 'Request failed'));
          } else {
            // Still pending or processing, check again later
            setTimeout(checkStatus, 500);
          }
        };

        // Start checking status
        checkStatus();
      });
    }
  };

  // Helper to queue the appropriate mutation type
  const queueMutation = async (
    method: 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    body?: Record<string, unknown>,
    options?: { priority?: RequestPriority; groupId?: string; tags?: string[] }
  ): Promise<string> => {
    switch (method) {
      case 'POST':
        return queueUtils.queuePost(endpoint, body || {}, options);
      case 'PUT':
        return queueUtils.queuePut(endpoint, body || {}, options);
      case 'DELETE':
        return queueUtils.queueDelete(endpoint, options);
      default:
        throw new Error(`Unsupported method for queue: ${method}`);
    }
  };

  // Use React Query's useMutation with our queue-integrated function
  return useMutation({
    mutationFn: queuedMutationFn,
    onMutate,
    onError,
    onSuccess,
    onSettled,
    ...restOptions,
  });
}
