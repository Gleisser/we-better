import { apiClient } from '@/core/services/api-client';
import { PrefooterResponse } from '@/utils/types/prefooter';
import { handleServiceError } from '@/utils/helpers/service-utils';

const BFF_API_BASE_URL = import.meta.env.VITE_API_BACKEND_URL || 'http://localhost:3000';

export const prefooterService = {
  async getPrefooter(): Promise<PrefooterResponse> {
    try {
      const populateQuery = 'populate=image';
      const { data } = await apiClient.get<PrefooterResponse>(
        `${BFF_API_BASE_URL}/api/content/preFooter?${populateQuery}`
      );
      return data;
    } catch (error) {
      return handleServiceError(error, 'Prefooter');
    }
  },
};
