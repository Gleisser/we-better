import { apiClient } from '@/lib/api-client';
import { FeaturesResponse } from '@/types/features-response';

export const featureService = {
  async getFeatures(): Promise<FeaturesResponse> {
    const populateQuery = 'populate=cards.link&&populate=brands.logo&&populate=brands.logo.img';
    const { data } = await apiClient.get<FeaturesResponse>(`/feature?${populateQuery}`);
    return data;
  },
}; 