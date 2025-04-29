import { createQueryHook } from './utils/createQueryHook';
import { menuService } from '@/core/services/menu.service';
import { MenuResponse } from '@/types/menu';

export const MENU_QUERY_KEY = ['menu'] as const;

const {
  useQueryHook: useMenu,
  prefetchData: prefetchMenu,
  invalidateCache: invalidateMenuCache,
} = createQueryHook<MenuResponse>({
  queryKey: MENU_QUERY_KEY,
  queryFn: () => menuService.getMenu(),
});

export { useMenu, prefetchMenu, invalidateMenuCache }; 