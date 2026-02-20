import { apiClient } from '@/core/services/api-client';
import { CommunityResponse } from '@/utils/types/community';
import { handleServiceError } from '@/utils/helpers/service-utils';

const BFF_API_BASE_URL = import.meta.env.VITE_API_BACKEND_URL || 'http://localhost:3000';

export const communityService = {
  async getCommunity(): Promise<CommunityResponse> {
    try {
      const { data } = await apiClient.get<CommunityResponse>(
        `${BFF_API_BASE_URL}/api/content/community`
      );
      return data;
    } catch (error) {
      return handleServiceError(error, 'Community');
    }
  },
};
