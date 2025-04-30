import { apiClient } from '@/core/services/api-client';
import { HeroResponse } from '@/utils/types/hero';
import { handleServiceError } from '@/utils/helpers/service-utils';

export const heroService = {
  async getHero(): Promise<HeroResponse> {
    try {
      const populateQuery = 'populate=*';
      const { data } = await apiClient.get<HeroResponse>(`/hero?${populateQuery}`);
      return data;
    } catch (error) {
      return handleServiceError(error, 'Hero');
    }
  },
};
