import { createQueryHook } from '@/shared/hooks/utils/createQueryHook';
import { prefooterService } from '@/core/services/prefooter.service';
import { PrefooterResponse } from '@/utils/types/prefooter';

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
