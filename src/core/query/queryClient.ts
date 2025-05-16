import { QueryClient } from '@tanstack/react-query';

/**
 * Default configuration values for React Query
 */
export const queryConfig = {
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000), // exponential backoff capped at 30s
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
    mutations: {
      retry: 2,
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 15000), // exponential backoff capped at 15s
    },
  },
};

/**
 * Create a configured QueryClient instance
 */
export const createQueryClient = (): QueryClient => {
  return new QueryClient(queryConfig);
};

/**
 * Default QueryClient instance for application-wide use
 */
export const queryClient = createQueryClient();
