import { apiClient } from '@/lib/api-client';
import { CommunityResponse } from '@/types/community';

export const communityService = {
  async getCommunity(): Promise<CommunityResponse> {
    const { data } = await apiClient.get<CommunityResponse>(`/community`);
    return data;
  },
}; 