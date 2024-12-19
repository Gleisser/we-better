import { useQuery } from '@tanstack/react-query';
import { prefooterService } from '@/services/prefooter.service';

export const PREFOOTER_QUERY_KEY = ['prefooter'] as const;

export function usePrefooter() {
  return useQuery({
    queryKey: PREFOOTER_QUERY_KEY,
    queryFn: () => prefooterService.getPrefooter(),
    staleTime: 1000 * 60 * 15, // 15 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
} 