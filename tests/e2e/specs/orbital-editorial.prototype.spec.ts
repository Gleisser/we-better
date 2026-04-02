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

const readBounds = async (page: Page, selector: string): Promise<DOMRectJSON> => {
  return page.locator(selector).evaluate((element): DOMRectJSON => {
    const rect = element.getBoundingClientRect();
    return {
      left: rect.left,
      right: rect.right,
      top: rect.top,
      bottom: rect.bottom,
      width: rect.width,
      height: rect.height,
    };
  });
};

type DOMRectJSON = {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
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
    await expect(
      page.locator('[data-orbital-stage="hero"] [data-hero-cta="primary"]')
    ).toBeVisible();
  });

  test('keeps the orbital hero centered and readable on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1024 });
    await gotoPrototype(page);

    const selectors = [
      '[data-hero-copy-beat="north"]',
      '[data-hero-copy-beat="east"]',
      '[data-hero-copy-beat="south"]',
      '[data-orbit-core]',
      '[data-impact-ring]',
      '[data-orbit-node="mood"]',
      '[data-orbit-node="habits"]',
      '[data-orbit-node="balance"]',
      '[data-orbit-node="dream"]',
      '[data-hero-cta="primary"]',
    ];

    for (const selector of selectors) {
      await expect(page.locator(selector)).toBeVisible();
      const box = await readBounds(page, selector);
      expect(box.left).toBeGreaterThanOrEqual(-8);
      expect(box.right).toBeLessThanOrEqual(1448);
    }
  });

  test('shows the four proof chapters with one primary surface each', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1024 });
    await gotoPrototype(page);

    const proofSelectors = [
      '[data-proof="life-wheel"] img',
      '[data-proof="dashboard"] img',
      '[data-proof="habits"] video',
      '[data-proof="dream-board"] video',
    ];

    for (const selector of proofSelectors) {
      await page.locator(selector).scrollIntoViewIfNeeded();
      await expect(page.locator(selector)).toBeVisible();
    }

    await expect(page.locator('[data-proof-primary]')).toHaveCount(4);
    await expect(
      page.locator('[data-chapter-id="recommit"] [data-hero-cta="closing"]')
    ).toBeVisible();
  });

  test('updates active chapter state and keeps the orbit in-bounds on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoPrototype(page);

    await page.locator('[data-chapter-id="momentum"]').scrollIntoViewIfNeeded();

    await expect
      .poll(async () => page.locator('body').getAttribute('data-active-chapter'))
      .toBe('momentum');

    const orbit = await readBounds(page, '[data-orbit-core]');
    expect(orbit.left).toBeGreaterThanOrEqual(-8);
    expect(orbit.right).toBeLessThanOrEqual(398);
  });
});
