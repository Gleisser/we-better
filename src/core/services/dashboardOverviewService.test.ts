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
});
