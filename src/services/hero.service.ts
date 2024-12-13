import { apiClient } from '@/lib/api-client';
import { HeroResponse } from '@/types/hero';

export const heroService = {
  async getHero(): Promise<HeroResponse> {
    const { data } = await apiClient.get<HeroResponse>('/hero', {
      params: {
        populate: '*',
      },
    });
    return data;
  },
}; 