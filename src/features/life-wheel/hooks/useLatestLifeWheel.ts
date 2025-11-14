import { createQueryHook } from '@/shared/hooks/utils/createQueryHook';
import { getLatestLifeWheelData } from '@/features/life-wheel/api/lifeWheelApi';

export const LIFE_WHEEL_LATEST_QUERY_KEY = ['lifeWheel', 'latest'] as const;

type LatestLifeWheelResponse = Awaited<ReturnType<typeof getLatestLifeWheelData>>;

const {
  useQueryHook: useLatestLifeWheel,
  prefetchData: prefetchLatestLifeWheel,
  invalidateCache: invalidateLatestLifeWheel,
} = createQueryHook<LatestLifeWheelResponse>({
  queryKey: LIFE_WHEEL_LATEST_QUERY_KEY,
  queryFn: async () => {
    const response = await getLatestLifeWheelData();

    if (!response.success) {
      throw new Error(response.error ?? 'Failed to load life wheel data');
    }

    return response;
  },
  staleTime: 1000 * 60 * 5,
});

export { useLatestLifeWheel, prefetchLatestLifeWheel, invalidateLatestLifeWheel };
