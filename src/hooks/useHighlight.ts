import { createQueryHook } from './utils/createQueryHook';
import { highlightService } from '@/services/highlight.service';
import { HighlightResponse } from '@/types/highlight';

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