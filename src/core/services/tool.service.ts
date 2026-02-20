import { apiClient } from '@/core/services/api-client';
import { ToolResponse } from '@/utils/types/tool';
import { handleServiceError } from '@/utils/helpers/service-utils';

const BFF_API_BASE_URL = import.meta.env.VITE_API_BACKEND_URL || 'http://localhost:3000';

export const toolService = {
  async getTools(): Promise<ToolResponse> {
    try {
      const populateQuery = 'populate=tabs.videoSrc.video';
      const { data } = await apiClient.get<ToolResponse>(
        `${BFF_API_BASE_URL}/api/content/tool?${populateQuery}`
      );
      return data;
    } catch (error) {
      return handleServiceError(error, 'Tool');
    }
  },
};
