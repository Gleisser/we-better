import { useQuery } from '@tanstack/react-query';
import { AUTH_SCOPED_QUERY_META } from '@/core/config/react-query';
import { billingService, type BillingPlanCatalogItem } from '@/core/services/billingService';
import { useAuth } from '@/shared/hooks/useAuth';

export const billingPlanCatalogQueryKey = (userId: string | null) =>
  ['billingPlanCatalog', userId ?? 'anonymous'] as const;

interface UsePlanCatalogResult {
  plans: BillingPlanCatalogItem[];
  error: string | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

export function usePlanCatalog(): UsePlanCatalogResult {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const query = useQuery({
    queryKey: billingPlanCatalogQueryKey(userId),
    queryFn: async (): Promise<BillingPlanCatalogItem[]> => {
      const result = await billingService.getPlanCatalog();
      if (result.error) {
        throw new Error(result.error);
      }

      return result.data ?? [];
    },
    enabled: Boolean(userId),
    meta: AUTH_SCOPED_QUERY_META,
  });

  return {
    plans: query.data ?? [],
    error: query.error instanceof Error ? query.error.message : null,
    isLoading: query.isLoading,
    refetch: async () => {
      await query.refetch();
    },
  };
}

export default usePlanCatalog;
