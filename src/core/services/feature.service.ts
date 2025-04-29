import { apiClient } from '@/core/services/api-client';
import { FeaturesResponse } from '@/types/features-response';
import { handleServiceError } from '@/utils/helpers/service-utils';

export const featureService = {
  async getFeatures(): Promise<FeaturesResponse> {
    try {
      const populateQuery = 'populate=cards.link&&populate=brands.logo&&populate=brands.logo.img';
      const { data } = await apiClient.get<FeaturesResponse>(`/feature?${populateQuery}`);
      return data;
    } catch (error) {
      return handleServiceError(error, 'Feature');
    }
  },
}; 