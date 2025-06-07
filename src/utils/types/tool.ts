import { APIResponse } from '@/utils/types/common/meta';

export interface ToolVideoSrc {
  id: string;
  name: string;
  video: {
    url: string;
  }[];
}

export interface ToolTab {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  videoSrc: ToolVideoSrc;
}

export interface Tool {
  id: string;
  title: string;
  tabs: ToolTab[];
}

export type ToolResponse = APIResponse<Tool>;
