import { apiClient } from '@/lib/api-client';
import { TestimonyResponse } from '@/types/testimony';

export const testimonyService = {
    async getTestimony(): Promise<TestimonyResponse> {
    const populateQuery = 'populate=testimonies.profilePic';
    const { data } = await apiClient.get<TestimonyResponse>(`/testimony?${populateQuery}`);
    return data;
  },
}; 