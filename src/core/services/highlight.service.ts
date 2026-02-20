import { apiClient } from '@/core/services/api-client';
import { HighlightResponse } from '@/utils/types/highlight';
import { handleServiceError } from '@/utils/helpers/service-utils';

const BFF_API_BASE_URL = import.meta.env.VITE_API_BACKEND_URL || 'http://localhost:3000';

export const highlightService = {
  async getHighlight(): Promise<HighlightResponse> {
    try {
      const populateQuery = 'populate=slides.image&&populate=slides.image.img';
      const { data } = await apiClient.get<HighlightResponse>(
        `${BFF_API_BASE_URL}/api/content/highlight?${populateQuery}`
      );
      return data;
    } catch (error) {
      return handleServiceError(error, 'Highlight');
    }
  },
};
