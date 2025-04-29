import { apiClient } from '@/lib/api-client';
import { ShowcaseResponse } from '@/types/showcase';
import { handleServiceError } from '@/utils/helpers/service-utils';
export const showcaseService = {
  async getShowcase(): Promise<ShowcaseResponse> {
    try {
      const populateQuery = 'populate=belts.images.img';
      const { data } = await apiClient.get<ShowcaseResponse>(`/showcase?${populateQuery}`);
      return data;
    } catch (error) {
      return handleServiceError(error, 'Showcase');
    }
  },
}; 