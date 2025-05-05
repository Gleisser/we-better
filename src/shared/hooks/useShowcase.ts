import { createQueryHook } from '@/shared/hooks/utils/createQueryHook';
import { showcaseService } from '@/core/services/showcase.service';
import { ShowcaseResponse } from '@/utils/types/showcase';

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
