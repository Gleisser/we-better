import { useQuery } from '@tanstack/react-query';
import { AUTH_SCOPED_QUERY_META } from '@/core/config/react-query';
import {
  getLifeWheelOverview,
  type LifeWheelOverviewResponse,
} from '@/features/life-wheel/api/lifeWheelApi';
import { useAuth } from '@/shared/hooks/useAuth';

const DEFAULT_LIMIT = 10;
const DEFAULT_OFFSET = 0;

export const lifeWheelOverviewQueryKey = (
  userId: string | null,
  limit = DEFAULT_LIMIT,
  offset = DEFAULT_OFFSET
) => ['lifeWheelOverview', userId ?? 'anonymous', limit, offset] as const;

interface UseLifeWheelOverviewOptions {
  limit?: number;
  offset?: number;
  enabled?: boolean;
}

interface UseLifeWheelOverviewResult {
  overview: LifeWheelOverviewResponse | null;
  error: string | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

export function useLifeWheelOverview(
  options: UseLifeWheelOverviewOptions = {}
): UseLifeWheelOverviewResult {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const limit = options.limit ?? DEFAULT_LIMIT;
  const offset = options.offset ?? DEFAULT_OFFSET;

  const query = useQuery({
    queryKey: lifeWheelOverviewQueryKey(userId, limit, offset),
    queryFn: async () => {
      const response = await getLifeWheelOverview(limit, offset);
      if (!response.success) {
        throw new Error(response.error ?? 'Failed to fetch life wheel overview');
      }

      return response;
    },
    enabled: Boolean(userId) && (options.enabled ?? true),
    meta: AUTH_SCOPED_QUERY_META,
  });

  return {
    overview: query.data ?? null,
    error: query.error instanceof Error ? query.error.message : null,
    isLoading: query.isLoading,
    refetch: async () => {
      await query.refetch();
    },
  };
}
