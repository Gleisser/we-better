import { useQuery } from '@tanstack/react-query';
import { toolService } from '@/services/tool.service';

export const TOOL_QUERY_KEY = ['tool'] as const;

export function useTool() {
  return useQuery({
    queryKey: TOOL_QUERY_KEY,
    queryFn: () => toolService.getTools(),
    staleTime: 1000 * 60 * 15, // 15 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
} 