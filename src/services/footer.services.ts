import { apiClient } from '@/lib/api-client';
import { FooterResponse } from '@/types/footer';

export const footerService = {
  async getFooter(): Promise<FooterResponse> {
    const populateQuery = 'populate=footer_links&populate[0]=app_stores.images&populate[1]=social_medias.logos&populate[2]=logo&populate[3]=menu_lists.menu_links';
    const { data } = await apiClient.get<FooterResponse>(`/footer?${populateQuery}`);
    return data;
  },
}; 