import { useQuery } from '@tanstack/react-query';
import { communityService } from '@/services/community.service';

export const COMMUNITY_QUERY_KEY = ['community'] as const;

export function useCommunity() {
  return useQuery({
    queryKey: COMMUNITY_QUERY_KEY,
    queryFn: () => communityService.getCommunity(),
    staleTime: 1000 * 60 * 15, // 15 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
} 