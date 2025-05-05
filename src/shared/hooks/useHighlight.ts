import { createQueryHook } from '@/shared/hooks/utils/createQueryHook';
import { highlightService } from '@/core/services/highlight.service';
import { HighlightResponse } from '@/utils/types/highlight';

export const HIGHLIGHT_QUERY_KEY = ['highlight'] as const;

const {
  useQueryHook: useHighlight,
  prefetchData: prefetchHighlight,
  invalidateCache: invalidateHighlightCache,
} = createQueryHook<HighlightResponse>({
  queryKey: HIGHLIGHT_QUERY_KEY,
  queryFn: () => highlightService.getHighlight(),
});

export { useHighlight, prefetchHighlight, invalidateHighlightCache };
