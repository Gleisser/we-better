import { apiClient } from '@/lib/api-client';
import { ToolResponse } from '@/types/tool';

export const toolService = {
  async getTools(): Promise<ToolResponse> {
    const populateQuery = 'populate=tabs.videoSrc.video';
    const { data } = await apiClient.get<ToolResponse>(`/tool?${populateQuery}`);
    return data;
  },
}; 