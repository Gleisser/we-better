import { apiClient } from '@/core/services/api-client';
import { buildPublicContentPath } from '@/core/services/public-content.service';
import { PrefooterResponse } from '@/utils/types/prefooter';
import { handleServiceError } from '@/utils/helpers/service-utils';

export const prefooterService = {
  async getPrefooter(): Promise<PrefooterResponse> {
    try {
      const populateQuery = 'populate=image';
      const { data } = await apiClient.get<PrefooterResponse>(
        buildPublicContentPath('/preFooter', populateQuery)
      );
      return data;
    } catch (error) {
      return handleServiceError(error, 'Prefooter');
    }
  },
};
