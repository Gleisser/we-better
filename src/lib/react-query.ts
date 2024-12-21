import { QueryClient } from '@tanstack/react-query';

// Define a type for our API errors
interface ApiError {
  message: string;
  status?: number;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes - data considered fresh
      gcTime: 1000 * 60 * 30, // 30 minutes - keep in cache
      refetchOnWindowFocus: false,
      refetchOnMount: true, // Check for updates when component mounts
      retry: (failureCount, error: ApiError) => {
        // Always retry rate limit errors
        if (error?.message === 'Rate limit exceeded') {
          return true;
        }
        // Otherwise retry up to 2 times
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => {
        // For rate limit errors, wait longer
        if (attemptIndex > 0) {
          return Math.min(1000 * (1.5 ** attemptIndex), 30000);
        }
        return 1000;
      },
    },
  },
}); 