import { apiClient } from '@/core/services/api-client';
import { buildPublicContentPath } from '@/core/services/public-content.service';
import { HighlightResponse } from '@/utils/types/highlight';
import { handleServiceError } from '@/utils/helpers/service-utils';

export const highlightService = {
  async getHighlight(): Promise<HighlightResponse> {
    try {
      const populateQuery = 'populate=slides.image&&populate=slides.image.img';
      const { data } = await apiClient.get<HighlightResponse>(
        buildPublicContentPath('/highlight', populateQuery)
      );
      return data;
    } catch (error) {
      return handleServiceError(error, 'Highlight');
    }
  },
};
