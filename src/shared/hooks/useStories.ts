import { useQuery, UseQueryResult } from '@tanstack/react-query';
import * as storiesService from '@/core/services/storiesService';
import { useAuth } from './useAuth'; // Assuming auth might be needed in future or for consistency

export const STORIES_QUERY_KEY = 'stories';

export interface UseStoriesOptions {
  initialData?: storiesService.StoriesResponse | null;
  // Add other options like 'select' or 'enabled' if needed outside of auth
}

export const useStories = (options?: UseStoriesOptions): UseQueryResult<storiesService.StoriesResponse | null, Error> => {
  const { isAuthenticated } = useAuth(); // Using isAuthenticated for the enabled flag

  return useQuery<storiesService.StoriesResponse | null, Error, storiesService.StoriesResponse | null>(
    [STORIES_QUERY_KEY],
    storiesService.fetchStories,
    {
      enabled: isAuthenticated, // Assuming stories might be user-specific or behind auth
                               // If stories are public, this could be set to true or removed if always enabled
      staleTime: 5 * 60 * 1000, // 5 minutes
      initialData: options?.initialData,
      // Keep previous data while fetching new data (optional, good for UX)
      // keepPreviousData: true, 
    }
  );
};
