import { useQuery } from '@tanstack/react-query';
import { AUTH_SCOPED_QUERY_META } from '@/core/config/react-query';
import { billingService, type BillingSummary } from '@/core/services/billingService';
import { useAuth } from '@/shared/hooks/useAuth';

const BILLING_SUMMARY_QUERY_KEY = (userId: string | null) =>
  ['billingSummary', userId ?? 'anonymous'] as const;

interface UseBillingSummaryResult {
  data: BillingSummary | null;
  error: string | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

export function useBillingSummary(): UseBillingSummaryResult {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const query = useQuery({
    queryKey: BILLING_SUMMARY_QUERY_KEY(userId),
    queryFn: async (): Promise<BillingSummary | null> => {
      const result = await billingService.getBillingSummary();
      if (result.error) {
        throw new Error(result.error);
      }

      return result.data;
    },
    enabled: Boolean(userId),
    meta: AUTH_SCOPED_QUERY_META,
  });

  return {
    data: query.data ?? null,
    error: query.error instanceof Error ? query.error.message : null,
    isLoading: query.isLoading,
    refetch: async () => {
      await query.refetch();
    },
  };
}

export default useBillingSummary;
