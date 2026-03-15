import { useQuery, QueryClient } from '@tanstack/react-query';
import { QueryKey } from '@tanstack/react-query';

interface QueryHookOptions<TData> {
  queryKey: QueryKey;
  queryFn: () => Promise<TData>;
  staleTime?: number;
  gcTime?: number;
}

interface UseQueryHookOptions {
  enabled?: boolean;
}

interface QueryHookResult<TData> {
  useQueryHook: (options?: UseQueryHookOptions) => ReturnType<typeof useQuery<TData>>;
  prefetchData: (queryClient: QueryClient) => Promise<void>;
  invalidateCache: (queryClient: QueryClient) => Promise<void>;
}

export function createQueryHook<TData>({
  queryKey,
  queryFn,
  staleTime = 1000 * 60 * 5, // 5 minutes
  gcTime = 1000 * 60 * 30, // 30 minutes
}: QueryHookOptions<TData>): QueryHookResult<TData> {
  // Create the main query hook
  function useQueryHook(options: UseQueryHookOptions = {}): ReturnType<typeof useQuery<TData>> {
    const { enabled = true } = options;

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
      enabled,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    });
  }

  // Create prefetch helper
  async function prefetchData(queryClient: QueryClient): Promise<void> {
    return queryClient.prefetchQuery({
      queryKey,
      queryFn,
      staleTime,
    });
  }

  // Create cache invalidation helper
  function invalidateCache(queryClient: QueryClient): Promise<void> {
    return queryClient.invalidateQueries({ queryKey });
  }

  return {
    useQueryHook,
    prefetchData,
    invalidateCache,
  };
}
