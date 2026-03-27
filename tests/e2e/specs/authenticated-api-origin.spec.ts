import type { Request } from '@playwright/test';
import { test, expect } from '../utils/test-utils';
import { HAS_AUTH_CREDENTIALS, signIn } from '../utils/auth';

const AUTHENTICATED_ROUTES = [
  '/app/dashboard',
  '/app/life-wheel',
  '/app/dream-board',
  '/app/settings',
  '/app/notifications',
  '/app/pricing',
] as const;

type ApiRequest = {
  method: string;
  origin: string;
  pathname: string;
  url: string;
};

const toApiRequest = (request: Request): ApiRequest | null => {
  const url = new URL(request.url());

  if (!url.pathname.startsWith('/api/')) {
    return null;
  }

  return {
    method: request.method(),
    origin: url.origin,
    pathname: url.pathname,
    url: request.url(),
  };
};

const escapeForRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

test.describe('Authenticated API origin', () => {
  test.skip(!HAS_AUTH_CREDENTIALS, 'Set E2E_AUTH_EMAIL and E2E_AUTH_PASSWORD');

  test('keeps /api traffic same-origin across authenticated routes', async ({ page, baseURL }) => {
    test.slow();

    const appOrigin = new URL(baseURL ?? 'http://127.0.0.1').origin;

    await signIn(page);

    for (const route of AUTHENTICATED_ROUTES) {
      const requests: ApiRequest[] = [];
      const handleRequest = (request: Request): void => {
        const apiRequest = toApiRequest(request);
        if (apiRequest) {
          requests.push(apiRequest);
        }
      };

      page.on('request', handleRequest);

      await page.goto(route);
      await expect(page).toHaveURL(new RegExp(`${escapeForRegex(route)}$`));
      await expect
        .poll(() => requests.length, {
          message: `Expected ${route} to issue at least one /api request`,
        })
        .toBeGreaterThan(0);
      await page.waitForTimeout(600);

      page.off('request', handleRequest);

      const crossOriginRequests = requests.filter(request => request.origin !== appOrigin);
      expect(crossOriginRequests, `Expected only same-origin /api requests on ${route}`).toEqual(
        []
      );
    }
  });
});
