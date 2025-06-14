import { apiClient } from '@/core/services/api-client';
import { CommunityResponse } from '@/utils/types/community';
import { handleServiceError } from '@/utils/helpers/service-utils';
export const communityService = {
  async getCommunity(): Promise<CommunityResponse> {
    try {
      const { data } = await apiClient.get<CommunityResponse>(`/community`);
      return data;
    } catch (error) {
      return handleServiceError(error, 'Community');
    }
  },
};
