import { createQueryHook } from '@/shared/hooks/utils/createQueryHook';
import { toolService } from '@/core/services/tool.service';
import { ToolResponse } from '@/utils/types/tool';

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
