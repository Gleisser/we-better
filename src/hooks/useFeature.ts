import { useQuery } from '@tanstack/react-query';
import { featureService } from '@/services/feature.service';

export const FEATURE_QUERY_KEY = ['feature'] as const;

export function useFeature() {
  return useQuery({
    queryKey: FEATURE_QUERY_KEY,
    queryFn: () => featureService.getFeatures(),
    staleTime: 1000 * 60 * 15, // 15 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
} 