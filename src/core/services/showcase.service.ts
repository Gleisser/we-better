import { apiClient } from '@/core/services/api-client';
import { buildPublicContentPath } from '@/core/services/public-content.service';
import { ShowcaseResponse } from '@/utils/types/showcase';
import { handleServiceError } from '@/utils/helpers/service-utils';

export const showcaseService = {
  async getShowcase(): Promise<ShowcaseResponse> {
    try {
      const populateQuery = 'populate=belts.images.img';
      const { data } = await apiClient.get<ShowcaseResponse>(
        buildPublicContentPath('/showcase', populateQuery)
      );
      return data;
    } catch (error) {
      return handleServiceError(error, 'Showcase');
    }
  },
};
