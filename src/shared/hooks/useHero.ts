import { createQueryHook } from '@/shared/hooks/utils/createQueryHook';
import { heroService } from '@/core/services/hero.service';
import { HeroResponse } from '@/utils/types/hero';

export const HERO_QUERY_KEY = ['hero'] as const;

const {
  useQueryHook: useHero,
  prefetchData: prefetchHero,
  invalidateCache: invalidateHeroCache,
} = createQueryHook<HeroResponse>({
  queryKey: HERO_QUERY_KEY,
  queryFn: () => heroService.getHero(),
});

export { useHero, prefetchHero, invalidateHeroCache };
