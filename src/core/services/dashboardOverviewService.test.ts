import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { dashboardOverviewService } from './dashboardOverviewService';

const mockGetSession = vi.fn();

vi.mock('./supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: (...args: unknown[]) => mockGetSession(...args),
    },
  },
}));

describe('dashboardOverviewService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({
      data: {
        session: {
          access_token: 'token-123',
        },
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('rejects malformed successful responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({}),
      })
    );

    await expect(dashboardOverviewService.getOverview()).resolves.toEqual({
      data: null,
      error: 'Malformed dashboard overview response',
    });
  });

  it('accepts degraded inspiration responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
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
        }),
      })
    );

    await expect(dashboardOverviewService.getOverview()).resolves.toEqual({
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
  });
});
