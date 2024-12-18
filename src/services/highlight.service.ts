import { apiClient } from '@/lib/api-client';
import { HighlightResponse } from '@/types/highlight';

export const highlightService = {
  async getHighlight(): Promise<HighlightResponse> {
    const populateQuery = 'populate=slides.image&&populate=slides.image.img';
    const { data } = await apiClient.get<HighlightResponse>(`/highlight?${populateQuery}`);
    return data;
  },
}; 