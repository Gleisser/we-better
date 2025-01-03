import { apiClient } from '@/lib/api-client';
import { CommunityResponse } from '@/types/community';
import { handleServiceError } from '@/utils/service-utils';
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