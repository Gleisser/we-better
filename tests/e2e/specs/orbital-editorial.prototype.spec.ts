import type { Page } from '@playwright/test';
import { test, expect } from '../utils/test-utils';

const playgroundUrl = 'http://127.0.0.1:4321/';
const prototypeUrl = `${playgroundUrl}concepts/orbital-editorial.html`;

const gotoPrototype = async (page: Page): Promise<void> => {
  await page.goto(prototypeUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle').catch(() => {});
};

test.describe('Orbital editorial prototype', () => {
  test('is discoverable from the playground index', async ({ page }) => {
    await page.goto(playgroundUrl, { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('link', { name: /orbital editorial/i }).first()).toBeVisible();
  });

  test('renders the prototype shell and chapter anchors', async ({ page }) => {
    await gotoPrototype(page);
    await expect(page).toHaveTitle(/Orbital Editorial/i);
    await expect(page.locator('[data-orbital-stage="hero"]')).toBeVisible();
    await expect(page.locator('[data-chapter-id]')).toHaveCount(6);
    await expect(page.getByRole('link', { name: /enter the system/i })).toBeVisible();
  });
});
