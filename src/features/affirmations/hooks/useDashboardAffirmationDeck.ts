import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { affirmationService, type Affirmation } from '@/core/services/affirmationService';

const DASHBOARD_AFFIRMATION_CATEGORIES = [
  'personal',
  'beauty',
  'blessing',
  'gratitude',
  'happiness',
  'health',
  'love',
  'money',
  'sleep',
  'spiritual',
] as const;

export const dashboardAffirmationDeckQueryKey = ['affirmations', 'dashboardDeck'] as const;

const loadDashboardAffirmationDeck = async (): Promise<Affirmation[]> => {
  const response = await affirmationService.getAffirmationsForCategories(
    [...DASHBOARD_AFFIRMATION_CATEGORIES],
    {
      sort: 'publishedAt:desc',
      pagination: {
        page: 1,
        pageSize: 5,
      },
      populate: ['categories'],
    }
  );

  return affirmationService.mapAffirmationResponse(response);
};

export const useDashboardAffirmationDeck = (): UseQueryResult<Affirmation[], Error> =>
  useQuery({
    queryKey: dashboardAffirmationDeckQueryKey,
    queryFn: loadDashboardAffirmationDeck,
    staleTime: Infinity,
  });
