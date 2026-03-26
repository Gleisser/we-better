import type { Request } from '@playwright/test';
import { test, expect } from '../utils/test-utils';

const AUTH_EMAIL = process.env.E2E_AUTH_EMAIL ?? '';
const AUTH_PASSWORD = process.env.E2E_AUTH_PASSWORD ?? '';

type DreamBoardRequest = {
  method: string;
  pathname: string;
  search: string;
};

const toDreamBoardRequest = (request: Request): DreamBoardRequest | null => {
  const url = new URL(request.url());

  if (!url.pathname.includes('/api/dream-')) {
    return null;
  }

  return {
    method: request.method(),
    pathname: url.pathname,
    search: url.search,
  };
};

const isOverviewRead = (request: DreamBoardRequest): boolean =>
  request.method === 'GET' && request.pathname.endsWith('/api/dream-board/overview');

const isLegacyBoardRead = (request: DreamBoardRequest): boolean =>
  request.method === 'GET' && request.pathname.endsWith('/api/dream-board');

const isProgressRead = (request: DreamBoardRequest): boolean =>
  request.method === 'GET' && request.pathname.endsWith('/api/dream-progress');

const isMilestoneRead = (request: DreamBoardRequest): boolean =>
  request.method === 'GET' && request.pathname.endsWith('/api/dream-milestones');

const isWeatherRead = (request: DreamBoardRequest): boolean =>
  request.method === 'GET' && request.pathname.endsWith('/api/dream-weather');

const isChallengeRead = (request: DreamBoardRequest): boolean =>
  request.method === 'GET' && request.pathname.endsWith('/api/dream-challenges');

const isChallengeProgressRead = (request: DreamBoardRequest): boolean =>
  request.method === 'GET' && request.pathname.endsWith('/api/dream-challenges/progress');

test.describe('Dream Board bootstrap', () => {
  test.skip(!AUTH_EMAIL || !AUTH_PASSWORD, 'Set E2E_AUTH_EMAIL and E2E_AUTH_PASSWORD');

  test('loads from overview without fragmented first-render reads', async ({ page }) => {
    test.slow();

    const dreamBoardRequests: DreamBoardRequest[] = [];

    page.on('request', request => {
      const dreamBoardRequest = toDreamBoardRequest(request);

      if (dreamBoardRequest) {
        dreamBoardRequests.push(dreamBoardRequest);
      }
    });

    await page.goto('/auth/login');
    await page.locator('#email').fill(AUTH_EMAIL);
    await page.locator('#password').fill(AUTH_PASSWORD);

    await Promise.all([
      page.waitForURL(/\/app(?:\/.*)?$/),
      page.getByRole('button', { name: 'Sign In', exact: true }).click(),
    ]);

    dreamBoardRequests.length = 0;

    await page.goto('/app/dream-board');

    await expect(page).toHaveURL(/\/app\/dream-board$/);
    await expect
      .poll(() => dreamBoardRequests.filter(isOverviewRead).length, {
        message: 'Expected Dream Board to bootstrap from the overview endpoint',
      })
      .toBeGreaterThan(0);

    await page.waitForTimeout(500);

    expect(dreamBoardRequests.filter(isOverviewRead)).toHaveLength(1);
    expect(dreamBoardRequests.filter(isLegacyBoardRead)).toHaveLength(0);
    expect(dreamBoardRequests.filter(isProgressRead)).toHaveLength(0);
    expect(dreamBoardRequests.filter(isMilestoneRead)).toHaveLength(0);
    expect(dreamBoardRequests.filter(isWeatherRead)).toHaveLength(0);
    expect(dreamBoardRequests.filter(isChallengeRead)).toHaveLength(0);
    expect(dreamBoardRequests.filter(isChallengeProgressRead)).toHaveLength(0);
  });
});
