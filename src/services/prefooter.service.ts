import { apiClient } from '@/lib/api-client';
import { PrefooterResponse } from '@/types/prefooter';

export const prefooterService = {
  async getPrefooter(): Promise<PrefooterResponse> {
    const populateQuery = 'populate=image';
    const { data } = await apiClient.get<PrefooterResponse>(`/pre-footer?${populateQuery}`);
    return data;
  },
}; 