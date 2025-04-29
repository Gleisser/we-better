import { apiClient } from '@/lib/api-client';
import { PrefooterResponse } from '@/types/prefooter';
import { handleServiceError } from '@/utils/helpers/service-utils';

export const prefooterService = {
  async getPrefooter(): Promise<PrefooterResponse> {
    try {
      const populateQuery = 'populate=image';
      const { data } = await apiClient.get<PrefooterResponse>(`/pre-footer?${populateQuery}`);
      return data;
    } catch (error) {
      return handleServiceError(error, 'Prefooter');
    }
  },
}; 