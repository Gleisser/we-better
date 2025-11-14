import { QueryClient, useQuery, UseQueryResult } from '@tanstack/react-query';
import { affirmationService, type Affirmation } from '@/core/services/affirmationService';
import type { AffirmationCategory } from '@/core/services/affirmationsService';

export type NonPersonalAffirmationCategory = Exclude<AffirmationCategory, 'personal'>;

export const affirmationPoolQueryKey = (category: NonPersonalAffirmationCategory) =>
  ['affirmations', 'pool', category] as const;

async function fetchAffirmationPool(
  category: NonPersonalAffirmationCategory
): Promise<Affirmation[]> {
  const response = await affirmationService.getAffirmationsByCategory(category, {
    sort: 'publishedAt:desc',
    pagination: {
      page: 1,
      pageSize: 15,
    },
  });

  return affirmationService.mapAffirmationResponse(response);
}

export const useCategoryAffirmationPool = (
  category: NonPersonalAffirmationCategory | null
): UseQueryResult<Affirmation[], Error> => {
  return useQuery({
    queryKey: category ? affirmationPoolQueryKey(category) : ['affirmations', 'pool', 'disabled'],
    queryFn: async () => {
      if (!category) {
        return [] as Affirmation[];
      }

      return fetchAffirmationPool(category);
    },
    enabled: Boolean(category),
    staleTime: Infinity,
  });
};

export const prefetchCategoryAffirmationPool = async (
  queryClient: QueryClient,
  category: NonPersonalAffirmationCategory
): Promise<void> => {
  await queryClient.prefetchQuery({
    queryKey: affirmationPoolQueryKey(category),
    queryFn: () => fetchAffirmationPool(category),
    staleTime: Infinity,
  });
};

export const invalidateCategoryAffirmationPool = (
  queryClient: QueryClient,
  category?: NonPersonalAffirmationCategory
): void => {
  if (category) {
    queryClient.invalidateQueries({ queryKey: affirmationPoolQueryKey(category) });
    return;
  }

  queryClient.invalidateQueries({ queryKey: ['affirmations', 'pool'] });
};
