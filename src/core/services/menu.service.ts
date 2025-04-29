import { apiClient } from '@/lib/api-client';
import { MenuResponse } from '@/types/menu';
import { handleServiceError } from '@/utils/helpers/service-utils';
export const menuService = {
  async getMenu(): Promise<MenuResponse> {
    try {
      const populateQuery = 'populate=links&populate[0]=megamenus&populate[1]=megamenus.menu_links&populate[2]=megamenus.menu_blog_post&populate[3]=megamenus.menu_blog_post.cover&populate[4]=megamenus.menu_links.image';
      const { data } = await apiClient.get<MenuResponse>(`/menu?${populateQuery}`);
      return data;
    } catch (error) {
      return handleServiceError(error, 'Menu');
    }
  },
}; 