import { useCallback, useEffect, useState } from 'react';
import { heroService } from '@/core/services/hero.service';
import { HeroResponse } from '@/utils/types/hero';

interface UseHeroResult {
  data: HeroResponse | null;
  error: Error | null;
  isFetching: boolean;
  refetch: () => Promise<void>;
}

export function useHero(): UseHeroResult {
  const [data, setData] = useState<HeroResponse | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isFetching, setIsFetching] = useState(true);

  const fetchHero = useCallback(async () => {
    setIsFetching(true);
    setError(null);

    try {
      const response = await heroService.getHero();
      setData(response);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError : new Error('Failed to load hero data'));
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    void fetchHero();
  }, [fetchHero]);

  return {
    data,
    error,
    isFetching,
    refetch: fetchHero,
  };
}

export default useHero;
