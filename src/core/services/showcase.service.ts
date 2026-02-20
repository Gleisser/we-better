import { apiClient } from '@/core/services/api-client';
import { ShowcaseResponse } from '@/utils/types/showcase';
import { handleServiceError } from '@/utils/helpers/service-utils';

const BFF_API_BASE_URL = import.meta.env.VITE_API_BACKEND_URL || 'http://localhost:3000';

export const showcaseService = {
  async getShowcase(): Promise<ShowcaseResponse> {
    try {
      const populateQuery = 'populate=belts.images.img';
      const { data } = await apiClient.get<ShowcaseResponse>(
        `${BFF_API_BASE_URL}/api/content/showcase?${populateQuery}`
      );
      return data;
    } catch (error) {
      return handleServiceError(error, 'Showcase');
    }
  },
};
