import { createContext, useContext } from 'react';
import type { DashboardOverviewResponse } from '@/core/services/dashboardOverviewService';

export interface DashboardOverviewContextValue {
  data: DashboardOverviewResponse | null;
  isLoading: boolean;
  error: Error | null;
}

export const DashboardOverviewContext = createContext<DashboardOverviewContextValue | null>(null);

export const useDashboardOverview = (): DashboardOverviewContextValue | null =>
  useContext(DashboardOverviewContext);
