import { useQuery, QueryClient } from '@tanstack/react-query';
import { QueryKey } from '@tanstack/react-query';

interface QueryHookOptions<TData> {
  queryKey: QueryKey;
  queryFn: () => Promise<TData>;
  staleTime?: number;
  gcTime?: number;
}

export function createQueryHook<TData>({ 
  queryKey, 
  queryFn,
  staleTime = 1000 * 60 * 5, // 5 minutes
  gcTime = 1000 * 60 * 30, // 30 minutes
}: QueryHookOptions<TData>) {
  // Create the main query hook
  function useQueryHook() {
    return useQuery<TData>({
      queryKey,
      queryFn: async () => {
        try {
          return await queryFn();
        } catch (err) {
          console.error(`Failed to fetch ${queryKey[0]} data:`, err);
          throw err;
        }
      },
      staleTime,
      gcTime,
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 1.5 ** attemptIndex, 10000),
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    });
  }

  // Create prefetch helper
  async function prefetchData(queryClient: QueryClient) {
    return queryClient.prefetchQuery({
      queryKey,
      queryFn,
      staleTime,
    });
  }

  // Create cache invalidation helper
  function invalidateCache(queryClient: QueryClient) {
    return queryClient.invalidateQueries({ queryKey });
  }

  return {
    useQueryHook,
    prefetchData,
    invalidateCache,
  };
} 