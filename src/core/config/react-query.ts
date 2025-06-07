import { QueryClient } from '@tanstack/react-query';
import { isRateLimitError, shouldRetry, getRetryDelay } from '@/utils/helpers/error-handling';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      retry: (failureCount, error) => {
        // Always retry rate limit errors
        if (isRateLimitError(error)) {
          return true;
        }
        // Retry other errors based on shouldRetry utility
        return shouldRetry(error) && failureCount < 3;
      },
      retryDelay: (attemptIndex, error) => getRetryDelay(error, attemptIndex),
    },
    mutations: {
      retry: (failureCount, error) => {
        // Don't retry mutations unless it's a rate limit error
        return isRateLimitError(error) && failureCount < 3;
      },
      retryDelay: (attemptIndex, error) => getRetryDelay(error, attemptIndex),
    },
  },
}); 