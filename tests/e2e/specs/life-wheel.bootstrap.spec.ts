import type { Request } from '@playwright/test';
import { test, expect } from '../utils/test-utils';

const AUTH_EMAIL = process.env.E2E_AUTH_EMAIL ?? '';
const AUTH_PASSWORD = process.env.E2E_AUTH_PASSWORD ?? '';

type LifeWheelRequest = {
  method: string;
  pathname: string;
  search: string;
};

const toLifeWheelRequest = (request: Request): LifeWheelRequest | null => {
  const url = new URL(request.url());

  if (!url.pathname.includes('/api/life-wheel')) {
    return null;
  }

  return {
    method: request.method(),
    pathname: url.pathname,
    search: url.search,
  };
};

const isOverviewRead = (request: LifeWheelRequest): boolean =>
  request.method === 'GET' && request.pathname.endsWith('/api/life-wheel/overview');

const isLegacyBootstrapRead = (request: LifeWheelRequest): boolean =>
  request.method === 'GET' && request.pathname.endsWith('/api/life-wheel');

const isLifeWheelWrite = (request: LifeWheelRequest): boolean =>
  (request.method === 'POST' || request.method === 'PATCH') &&
  request.pathname.includes('/api/life-wheel') &&
  !request.pathname.endsWith('/api/life-wheel/overview');

test.describe('Life Wheel bootstrap', () => {
  test.skip(!AUTH_EMAIL || !AUTH_PASSWORD, 'Set E2E_AUTH_EMAIL and E2E_AUTH_PASSWORD');

  test('loads from overview once and saves without legacy rereads', async ({ page }) => {
    test.slow();

    const lifeWheelRequests: LifeWheelRequest[] = [];

    page.on('request', request => {
      const lifeWheelRequest = toLifeWheelRequest(request);

      if (lifeWheelRequest) {
        lifeWheelRequests.push(lifeWheelRequest);
      }
    });

    await page.goto('/auth/login');
    await page.locator('#email').fill(AUTH_EMAIL);
    await page.locator('#password').fill(AUTH_PASSWORD);

    await Promise.all([
      page.waitForURL(/\/app(?:\/.*)?$/),
      page.getByRole('button', { name: 'Sign In', exact: true }).click(),
    ]);

    lifeWheelRequests.length = 0;

    await page.goto('/app/life-wheel');

    const saveButton = page.getByRole('button', {
      name: /(?:Save|Update) assessment/i,
    });

    await expect(page.getByRole('heading', { name: /Life Wheel Assessment/i })).toBeVisible();
    await expect(saveButton).toBeVisible();
    await expect
      .poll(() => lifeWheelRequests.filter(isOverviewRead).length, {
        message: 'Expected the Life Wheel route to bootstrap from the overview endpoint',
      })
      .toBeGreaterThan(0);

    await page.waitForTimeout(500);

    expect(lifeWheelRequests.filter(isOverviewRead)).toHaveLength(1);
    expect(lifeWheelRequests.filter(isLegacyBootstrapRead)).toHaveLength(0);

    lifeWheelRequests.length = 0;

    const saveResponsePromise = page.waitForResponse(response => {
      const url = new URL(response.url());
      return (
        response.ok() &&
        (response.request().method() === 'POST' || response.request().method() === 'PATCH') &&
        url.pathname.includes('/api/life-wheel') &&
        !url.pathname.endsWith('/api/life-wheel/overview')
      );
    });

    await saveButton.click();

    await saveResponsePromise;
    await expect(page.getByText('Saved successfully')).toBeVisible();
    await page.waitForTimeout(500);

    expect(lifeWheelRequests.some(isLifeWheelWrite)).toBe(true);
    expect(lifeWheelRequests.some(isOverviewRead)).toBe(false);
    expect(lifeWheelRequests.some(isLegacyBootstrapRead)).toBe(false);
  });
});
