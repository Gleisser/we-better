import { createQueryHook } from '@/shared/hooks/utils/createQueryHook';
import { testimonyService } from '@/core/services/testimony.service';
import { TestimonyResponse } from '@/utils/types/testimony';

export const TESTIMONY_QUERY_KEY = ['testimony'] as const;

const {
  useQueryHook: useTestimony,
  prefetchData: prefetchTestimony,
  invalidateCache: invalidateTestimonyCache,
} = createQueryHook<TestimonyResponse>({
  queryKey: TESTIMONY_QUERY_KEY,
  queryFn: () => testimonyService.getTestimony(),
});

export { useTestimony, prefetchTestimony, invalidateTestimonyCache };
