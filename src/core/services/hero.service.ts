import { apiClient } from '@/core/services/api-client';
import { HeroResponse } from '@/utils/types/hero';
import { handleServiceError } from '@/utils/helpers/service-utils';

const BFF_API_BASE_URL = import.meta.env.VITE_API_BACKEND_URL || 'http://localhost:3000';

export const heroService = {
  async getHero(): Promise<HeroResponse> {
    try {
      const populateQuery = 'populate=*';
      const { data } = await apiClient.get<HeroResponse>(
        `${BFF_API_BASE_URL}/api/content/hero?${populateQuery}`
      );
      return data;
    } catch (error) {
      return handleServiceError(error, 'Hero');
    }
  },
};
