import { apiClient } from '@/core/services/api-client';
import { FeaturesResponse } from '@/utils/types/features-response';
import { handleServiceError } from '@/utils/helpers/service-utils';

const BFF_API_BASE_URL = import.meta.env.VITE_API_BACKEND_URL || 'http://localhost:3000';

export const featureService = {
  async getFeatures(): Promise<FeaturesResponse> {
    try {
      const populateQuery = 'populate=cards.link&&populate=brands.logo&&populate=brands.logo.img';
      const { data } = await apiClient.get<FeaturesResponse>(
        `${BFF_API_BASE_URL}/api/content/feature?${populateQuery}`
      );
      return data;
    } catch (error) {
      return handleServiceError(error, 'Feature');
    }
  },
};
