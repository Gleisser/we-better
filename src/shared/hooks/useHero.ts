import { useQuery } from '@tanstack/react-query';
import { heroService } from '@/core/services/hero.service';
import { HeroResponse } from '@/utils/types/hero';

interface UseHeroOptions {
  enabled?: boolean;
}

interface UseHeroResult {
  data: HeroResponse | null;
  error: Error | null;
  isFetching: boolean;
  refetch: () => Promise<void>;
}

export function useHero(options: UseHeroOptions = {}): UseHeroResult {
  const { enabled = true } = options;
  const query = useQuery({
    queryKey: ['hero'],
    queryFn: () => heroService.getHero(),
    enabled,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  return {
    data: query.data ?? null,
    error: query.error instanceof Error ? query.error : null,
    isFetching: query.isFetching,
    refetch: async () => {
      await query.refetch();
    },
  };
}

export default useHero;
