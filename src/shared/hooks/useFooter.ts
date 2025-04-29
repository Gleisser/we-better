import { createQueryHook } from './utils/createQueryHook';
import { footerService } from '@/core/services/footer.services';
import { FooterResponse } from '@/types/footer';

export const FOOTER_QUERY_KEY = ['footer'] as const;

const {
  useQueryHook: useFooter,
  prefetchData: prefetchFooter,
  invalidateCache: invalidateFooterCache,
} = createQueryHook<FooterResponse>({
  queryKey: FOOTER_QUERY_KEY,
  queryFn: () => footerService.getFooter(),
});

export { useFooter, prefetchFooter, invalidateFooterCache }; 