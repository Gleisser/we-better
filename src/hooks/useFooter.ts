import { useQuery } from '@tanstack/react-query';
import { footerService } from '@/services/footer.services';

export const FOOTER_QUERY_KEY = ['footer'] as const;

export function useFooter() {
  return useQuery({
    queryKey: FOOTER_QUERY_KEY,
    queryFn: () => footerService.getFooter(),
    staleTime: 1000 * 60 * 15, // 15 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
} 