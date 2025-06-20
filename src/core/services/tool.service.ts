import { apiClient } from '@/core/services/api-client';
import { ToolResponse } from '@/utils/types/tool';
import { handleServiceError } from '@/utils/helpers/service-utils';

export const toolService = {
  async getTools(): Promise<ToolResponse> {
    try {
      const populateQuery = 'populate=tabs.videoSrc.video';
      const { data } = await apiClient.get<ToolResponse>(`/tool?${populateQuery}`);
      return data;
    } catch (error) {
      return handleServiceError(error, 'Tool');
    }
  },
};
