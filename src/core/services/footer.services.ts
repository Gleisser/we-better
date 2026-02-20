import { apiClient } from '@/core/services/api-client';
import { FooterResponse } from '@/utils/types/footer';
import { handleServiceError } from '@/utils/helpers/service-utils';

const BFF_API_BASE_URL = import.meta.env.VITE_API_BACKEND_URL || 'http://localhost:3000';

export const footerService = {
  async getFooter(): Promise<FooterResponse> {
    try {
      const populateQuery =
        'populate=footer_links&populate[0]=app_stores.images&populate[1]=social_medias.logos&populate[2]=logo&populate[3]=menu_lists.menu_links';
      const { data } = await apiClient.get<FooterResponse>(
        `${BFF_API_BASE_URL}/api/content/footer?${populateQuery}`
      );
      return data;
    } catch (error) {
      return handleServiceError(error, 'Footer');
    }
  },
};
