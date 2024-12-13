import { useQuery } from '@tanstack/react-query';
import { heroService } from '@/services/hero.service';

export const HERO_QUERY_KEY = ['hero'] as const;

export function useHero() {
  return useQuery({
    queryKey: HERO_QUERY_KEY,
    queryFn: () => heroService.getHero(),
    staleTime: 1000 * 60 * 15, // 15 minutes
    cacheTime: 1000 * 60 * 15, // 15 minutes cache
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
} 