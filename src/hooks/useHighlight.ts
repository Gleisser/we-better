import { useQuery } from '@tanstack/react-query';
import { highlightService } from '@/services/highlight.service';

export const HIGHLIGHT_QUERY_KEY = ['highlight'] as const;

export function useHighlight() {
  return useQuery({
    queryKey: HIGHLIGHT_QUERY_KEY,
    queryFn: () => highlightService.getHighlight(),
    staleTime: 1000 * 60 * 15, // 15 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
} 