import { createQueryHook } from './utils/createQueryHook';
import { prefooterService } from '@/core/services/prefooter.service';
import { PrefooterResponse } from '@/types/prefooter';

export const PREFOOTER_QUERY_KEY = ['prefooter'] as const;

const {
  useQueryHook: usePrefooter,
  prefetchData: prefetchPrefooter,
  invalidateCache: invalidatePrefooterCache,
} = createQueryHook<PrefooterResponse>({
  queryKey: PREFOOTER_QUERY_KEY,
  queryFn: () => prefooterService.getPrefooter(),
});

export { usePrefooter, prefetchPrefooter, invalidatePrefooterCache }; 