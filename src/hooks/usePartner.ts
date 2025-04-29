import { createQueryHook } from './utils/createQueryHook';
import { partnerService } from '@/core/services/partner.service';
import { PartnerResponse } from '@/types/partner';

export const PARTNER_QUERY_KEY = ['partner'] as const;

const {
  useQueryHook: usePartner,
  prefetchData: prefetchPartner,
  invalidateCache: invalidatePartnerCache,
} = createQueryHook<PartnerResponse>({
  queryKey: PARTNER_QUERY_KEY,
  queryFn: () => partnerService.getPartners(),
});

export { usePartner, prefetchPartner, invalidatePartnerCache }; 