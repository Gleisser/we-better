import { createQueryHook } from './utils/createQueryHook';
import { featureService } from '@/core/services/feature.service';
import { FeaturesResponse } from '@/types/features-response';

export const FEATURE_QUERY_KEY = ['feature'] as const;

const {
  useQueryHook: useFeature,
  prefetchData: prefetchFeature,
  invalidateCache: invalidateFeatureCache,
} = createQueryHook<FeaturesResponse>({
  queryKey: FEATURE_QUERY_KEY,
  queryFn: () => featureService.getFeatures(),
});

export { useFeature, prefetchFeature, invalidateFeatureCache }; 