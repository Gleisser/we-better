import path from 'path';
import type { Page } from '@playwright/test';
import { fileURLToPath, pathToFileURL } from 'url';

import { test, expect } from '../utils/test-utils';

const specDir = path.dirname(fileURLToPath(import.meta.url));
const prototypePlaygroundDir = path.resolve(specDir, '../../../../prototype-playground');
const playgroundUrl = pathToFileURL(path.join(prototypePlaygroundDir, 'index.html')).href;
const prototypeUrl = pathToFileURL(
  path.join(prototypePlaygroundDir, 'concepts/orbital-editorial.html')
).href;

const gotoPrototype = async (page: Page): Promise<void> => {
  await page.goto(prototypeUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle').catch(() => {});
};

test.describe('Orbital editorial prototype', () => {
  test('is discoverable from the playground index', async ({ page }) => {
    await page.goto(playgroundUrl, { waitUntil: 'domcontentloaded' });
    const orbitalCard = page.locator('.concept-card--orbital');

    await expect(orbitalCard).toBeVisible();
    await expect(orbitalCard.getByRole('heading', { name: /orbital editorial/i })).toBeVisible();
    await expect(
      orbitalCard.getByRole('link', { name: /open orbital editorial prototype/i })
    ).toHaveAttribute('href', './concepts/orbital-editorial.html');
  });

  test('renders the prototype shell and chapter anchors', async ({ page }) => {
    await gotoPrototype(page);
    await expect(page).toHaveTitle(/Orbital Editorial/i);
    await expect(page.locator('[data-orbital-stage="hero"]')).toBeVisible();
    await expect(page.locator('[data-chapter-id]')).toHaveCount(6);
    await expect(page.getByRole('link', { name: /enter the system/i })).toBeVisible();
  });
});
