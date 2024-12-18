import { apiClient } from '@/lib/api-client';
import { ShowcaseResponse } from '@/types/showcase';

export const showcaseService = {
  async getShowcase(): Promise<ShowcaseResponse> {
    const populateQuery = 'populate=belts.images.img';
    const { data } = await apiClient.get<ShowcaseResponse>(`/showcase?${populateQuery}`);
    return data;
  },
}; 