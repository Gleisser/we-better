import { createQueryHook } from './utils/createQueryHook';
import { testimonyService } from '@/services/testimony.service';
import { TestimonyResponse } from '@/types/testimony';

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