import { useQuery } from '@tanstack/react-query';
import { menuService } from '@/services/menu.service';

export const MENU_QUERY_KEY = ['menu'] as const;

export function useMenu() {
  return useQuery({
    queryKey: MENU_QUERY_KEY,
    queryFn: () => menuService.getMenu(),
    staleTime: 1000 * 60 * 15, // 15 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
} 