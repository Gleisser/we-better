import { useQuery } from '@tanstack/react-query';
import { testimonyService } from '@/services/testimony.service';

export const TESTIMONY_QUERY_KEY = ['testimony'] as const;

export function useTestimony() {
  return useQuery({
    queryKey: TESTIMONY_QUERY_KEY,
    queryFn: () => testimonyService.getTestimony(),
    staleTime: 1000 * 60 * 15, // 15 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
} 