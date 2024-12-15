import { apiClient } from '@/lib/api-client';
import { MenuResponse } from '@/types/menu';

export const menuService = {
  async getMenu(): Promise<MenuResponse> {
    const populateQuery = 'populate=links&populate[0]=megamenus&populate[1]=megamenus.menu_links&populate[2]=megamenus.menu_blog_post&populate[3]=megamenus.menu_blog_post.cover&populate[4]=megamenus.menu_links.image';
    const { data } = await apiClient.get<MenuResponse>(`/menu?${populateQuery}`);
    return data;
  },
}; 