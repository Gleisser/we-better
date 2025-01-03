import { createQueryHook } from './utils/createQueryHook';
import { heroService } from '@/services/hero.service';
import { HeroResponse } from '@/types/hero';

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