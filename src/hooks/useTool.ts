import { createQueryHook } from './utils/createQueryHook';
import { toolService } from '@/services/tool.service';
import { ToolResponse } from '@/types/tool';

export const TOOL_QUERY_KEY = ['tool'] as const;

const {
  useQueryHook: useTool,
  prefetchData: prefetchTool,
  invalidateCache: invalidateToolCache,
} = createQueryHook<ToolResponse>({
  queryKey: TOOL_QUERY_KEY,
  queryFn: () => toolService.getTools(),
});

export { useTool, prefetchTool, invalidateToolCache }; 