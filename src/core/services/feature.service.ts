import { apiClient } from '@/core/services/api-client';
import { buildPublicContentPath } from '@/core/services/public-content.service';
import { FeaturesResponse } from '@/utils/types/features-response';
import { handleServiceError } from '@/utils/helpers/service-utils';

export const featureService = {
  async getFeatures(): Promise<FeaturesResponse> {
    try {
      const populateQuery = 'populate=cards.link&&populate=brands.logo&&populate=brands.logo.img';
      const { data } = await apiClient.get<FeaturesResponse>(
        buildPublicContentPath('/feature', populateQuery)
      );
      return data;
    } catch (error) {
      return handleServiceError(error, 'Feature');
    }
  },
};
