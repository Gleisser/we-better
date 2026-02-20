import { apiClient } from '@/core/services/api-client';
import { TestimonyResponse } from '@/utils/types/testimony';
import { handleServiceError } from '@/utils/helpers/service-utils';

const BFF_API_BASE_URL = import.meta.env.VITE_API_BACKEND_URL || 'http://localhost:3000';

export const testimonyService = {
  async getTestimony(): Promise<TestimonyResponse> {
    try {
      const populateQuery = 'populate=testimonies.profilePic';
      const { data } = await apiClient.get<TestimonyResponse>(
        `${BFF_API_BASE_URL}/api/content/testimony?${populateQuery}`
      );
      return data;
    } catch (error) {
      return handleServiceError(error, 'Testimony');
    }
  },
};
