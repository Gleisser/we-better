import { createQueryHook } from '@/shared/hooks/utils/createQueryHook';
import { quoteService, type Quote } from '@/core/services/quoteService';

export const QUOTE_POOL_QUERY_KEY = ['quotes', 'pool'] as const;

const {
  useQueryHook: useQuotePool,
  prefetchData: prefetchQuotePool,
  invalidateCache: invalidateQuotePool,
} = createQueryHook<Quote[]>({
  queryKey: QUOTE_POOL_QUERY_KEY,
  queryFn: async () => {
    const response = await quoteService.getQuotes({
      sort: 'publishedAt:desc',
      pagination: {
        page: 1,
        pageSize: 15,
      },
    });

    return quoteService.mapQuoteResponse(response);
  },
  staleTime: Infinity,
});

export { useQuotePool, prefetchQuotePool, invalidateQuotePool };
