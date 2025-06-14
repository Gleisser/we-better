import { apiClient } from '@/core/services/api-client';
import { TestimonyResponse } from '@/utils/types/testimony';
import { handleServiceError } from '@/utils/helpers/service-utils';

export const testimonyService = {
  async getTestimony(): Promise<TestimonyResponse> {
    try {
      const populateQuery = 'populate=testimonies.profilePic';
      const { data } = await apiClient.get<TestimonyResponse>(`/testimony?${populateQuery}`);
      return data;
    } catch (error) {
      return handleServiceError(error, 'Testimony');
    }
  },
};
