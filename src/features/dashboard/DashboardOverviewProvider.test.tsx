import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import dashboardOverviewService from '@/core/services/dashboardOverviewService';
import { useAuth } from '@/shared/hooks/useAuth';
import { DashboardOverviewProvider } from './DashboardOverviewProvider';
import { useDashboardOverview } from './DashboardOverviewContext';

vi.mock('@/shared/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/core/services/dashboardOverviewService', () => ({
  __esModule: true,
  default: {
    getOverview: vi.fn(),
  },
}));

const mockedUseAuth = vi.mocked(useAuth);
const mockedDashboardOverviewService = vi.mocked(dashboardOverviewService);

const createWrapper = (): React.FC<{ children: ReactNode }> => {
  const queryClient = new QueryClient();

  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
};

const OverviewProbe = (): JSX.Element => {
  const dashboardOverview = useDashboardOverview();

  return (
    <div data-testid="overview-mode">
      {dashboardOverview === null
        ? 'fallback'
        : dashboardOverview.isLoading
          ? 'loading'
          : dashboardOverview.isInspirationDegraded
            ? 'managed-degraded'
            : 'managed'}
    </div>
  );
};

describe('DashboardOverviewProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseAuth.mockReturnValue({
      user: { id: 'user-123', email: 'user@example.com' },
      isLoading: false,
      isAuthenticated: true,
      checkAuth: vi.fn(),
      logout: vi.fn(),
    });
  });

  it('falls back to leaf queries when the overview bootstrap fails without cached data', async () => {
    mockedDashboardOverviewService.getOverview.mockResolvedValue({
      data: null,
      error: 'Request failed with status 504',
    });

    render(
      <DashboardOverviewProvider>
        <OverviewProbe />
      </DashboardOverviewProvider>,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByTestId('overview-mode').textContent).toBe('fallback');
    });
  });

  it('keeps the managed overview context when the bootstrap succeeds', async () => {
    mockedDashboardOverviewService.getOverview.mockResolvedValue({
      data: {
        inspiration: {
          quotes: [],
          affirmations: [],
          hasAffirmedToday: false,
          status: 'ready',
        },
        lifeWheel: {},
        mood: {
          entries: [],
          weeklyPulse: {
            window: { start_date: '2026-04-01', end_date: '2026-04-07', days: 7 },
            coverage: { logged_days: 0, missing_days: 7 },
            current_week: {
              average_score: null,
              average_mood_id: null,
              days: [],
            },
            comparison: {
              previous_average_score: null,
              delta_score: null,
              direction: 'insufficient_data',
            },
          },
          monthlyPulse: {
            window: { start_date: '2026-03-11', end_date: '2026-04-07', days: 28 },
            coverage: { logged_days: 0, missing_days: 28 },
            current_week: {
              average_score: null,
              average_mood_id: null,
              days: [],
            },
            comparison: {
              previous_average_score: null,
              delta_score: null,
              direction: 'insufficient_data',
            },
          },
        },
      },
      error: null,
    });

    render(
      <DashboardOverviewProvider>
        <OverviewProbe />
      </DashboardOverviewProvider>,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByTestId('overview-mode').textContent).toBe('managed');
    });
  });

  it('keeps the managed overview context when inspiration is degraded', async () => {
    mockedDashboardOverviewService.getOverview.mockResolvedValue({
      data: {
        inspiration: {
          quotes: [],
          affirmations: [],
          hasAffirmedToday: false,
          status: 'degraded',
        },
        lifeWheel: {},
        mood: {
          entries: [],
          weeklyPulse: {
            window: { start_date: '2026-04-01', end_date: '2026-04-07', days: 7 },
            coverage: { logged_days: 0, missing_days: 7 },
            current_week: {
              average_score: null,
              average_mood_id: null,
              days: [],
            },
            comparison: {
              previous_average_score: null,
              delta_score: null,
              direction: 'insufficient_data',
            },
          },
          monthlyPulse: {
            window: { start_date: '2026-03-11', end_date: '2026-04-07', days: 28 },
            coverage: { logged_days: 0, missing_days: 28 },
            current_week: {
              average_score: null,
              average_mood_id: null,
              days: [],
            },
            comparison: {
              previous_average_score: null,
              delta_score: null,
              direction: 'insufficient_data',
            },
          },
        },
      },
      error: null,
    });

    render(
      <DashboardOverviewProvider>
        <OverviewProbe />
      </DashboardOverviewProvider>,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByTestId('overview-mode').textContent).toBe('managed-degraded');
    });
  });
});
