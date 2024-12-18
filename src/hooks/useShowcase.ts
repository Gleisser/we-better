import { useQuery } from '@tanstack/react-query';
import { showcaseService } from '@/services/showcase.service';

export const SHOWCASE_QUERY_KEY = ['showcase'] as const;

export function useShowcase() {
  return useQuery({
    queryKey: SHOWCASE_QUERY_KEY,
    queryFn: () => showcaseService.getShowcase(),
    staleTime: 1000 * 60 * 15, // 15 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
} 