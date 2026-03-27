import type { Page } from '@playwright/test';
import { expect } from './test-utils';

export const AUTH_EMAIL = process.env.E2E_AUTH_EMAIL ?? '';
export const AUTH_PASSWORD = process.env.E2E_AUTH_PASSWORD ?? '';
export const HAS_AUTH_CREDENTIALS = Boolean(AUTH_EMAIL && AUTH_PASSWORD);

export const signIn = async (page: Page): Promise<void> => {
  await page.goto('/auth/login');
  await page.locator('#email').fill(AUTH_EMAIL);
  await page.locator('#password').fill(AUTH_PASSWORD);

  await Promise.all([
    page.waitForURL(/\/app(?:\/.*)?$/),
    page.getByRole('button', { name: 'Sign In', exact: true }).click(),
  ]);

  await expect(page).toHaveURL(/\/app(?:\/.*)?$/);
};
