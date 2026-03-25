import { useMemo, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AUTH_SCOPED_QUERY_META } from '@/core/config/react-query';
import dashboardOverviewService from '@/core/services/dashboardOverviewService';
import {
  DashboardOverviewContext,
  type DashboardOverviewContextValue,
} from './DashboardOverviewContext';
import { useAuth } from '@/shared/hooks/useAuth';

const dashboardOverviewQueryKey = (userId: string | null) =>
  ['dashboardOverview', userId ?? 'anonymous'] as const;

export const DashboardOverviewProvider = ({ children }: { children: ReactNode }): JSX.Element => {
  const { user, isLoading: authLoading } = useAuth();
  const userId = user?.id ?? null;

  const overviewQuery = useQuery({
    queryKey: dashboardOverviewQueryKey(userId),
    queryFn: async () => {
      const result = await dashboardOverviewService.getOverview();

      if (result.error || !result.data) {
        throw new Error(result.error ?? 'Failed to load dashboard overview');
      }

      return result.data;
    },
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    meta: AUTH_SCOPED_QUERY_META,
  });

  const value = useMemo<DashboardOverviewContextValue>(
    () => ({
      data: overviewQuery.data ?? null,
      isLoading:
        (!userId && authLoading) ||
        (Boolean(userId) && overviewQuery.isLoading && !overviewQuery.data),
      error: overviewQuery.error instanceof Error ? overviewQuery.error : null,
    }),
    [authLoading, overviewQuery.data, overviewQuery.error, overviewQuery.isLoading, userId]
  );

  return (
    <DashboardOverviewContext.Provider value={value}>{children}</DashboardOverviewContext.Provider>
  );
};
