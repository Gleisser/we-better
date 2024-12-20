import { useQuery, QueryClient } from '@tanstack/react-query';
import { heroService } from '@/services/hero.service';
import { HeroResponse } from '@/types/hero';

export const HERO_QUERY_KEY = ['hero'] as const;

export function useHero() {
  return useQuery<HeroResponse>({
    queryKey: HERO_QUERY_KEY,
    queryFn: async () => {
      try {
        return await heroService.getHero();
      } catch (err) {
        console.error('Failed to fetch hero data:', err);
        throw err;
      }
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 1.5 ** attemptIndex, 10000),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

// Add prefetching function for initial load
export async function prefetchHero(queryClient: QueryClient) {
  return queryClient.prefetchQuery({
    queryKey: HERO_QUERY_KEY,
    queryFn: () => heroService.getHero(),
    staleTime: 1000 * 60 * 15,
  });
}

// Add cache invalidation helper
export function invalidateHeroCache(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: HERO_QUERY_KEY });
} 