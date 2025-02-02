import { createQueryHook } from './utils/createQueryHook';
import { showcaseService } from '@/services/showcase.service';
import { ShowcaseResponse } from '@/types/showcase';

export const SHOWCASE_QUERY_KEY = ['showcase'] as const;

const {
  useQueryHook: useShowcase,
  prefetchData: prefetchShowcase,
  invalidateCache: invalidateShowcaseCache,
} = createQueryHook<ShowcaseResponse>({
  queryKey: SHOWCASE_QUERY_KEY,
  queryFn: () => showcaseService.getShowcase(),
});

export { useShowcase, prefetchShowcase, invalidateShowcaseCache }; 