import { createQueryHook } from './utils/createQueryHook';
import { communityService } from '@/core/services/community.service';
import { CommunityResponse } from '@/utils/types/community';

export const COMMUNITY_QUERY_KEY = ['community'] as const;

const {
  useQueryHook: useCommunity,
  prefetchData: prefetchCommunity,
  invalidateCache: invalidateCommunityCache,
} = createQueryHook<CommunityResponse>({
  queryKey: COMMUNITY_QUERY_KEY,
  queryFn: () => communityService.getCommunity(),
});

export { useCommunity, prefetchCommunity, invalidateCommunityCache };
