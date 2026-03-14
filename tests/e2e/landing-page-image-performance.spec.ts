import { expect, test } from '@playwright/test';

test('landing page keeps image loading under the public-route budget', async ({ page }) => {
  await page.route('**/api/**', route => route.abort());

  await page.goto('/');
  await page.waitForTimeout(1600);

  const preloadCount = await page.locator('head link[rel="preload"][as="image"]').count();
  expect(preloadCount).toBe(1);

  const imageResources = await page.evaluate(() =>
    performance
      .getEntriesByType('resource')
      .map(entry => entry as PerformanceResourceTiming)
      .filter(entry => entry.initiatorType === 'img' || entry.initiatorType === 'image')
      .map(entry => ({
        name: entry.name,
        transferSize: entry.transferSize || entry.encodedBodySize || 0,
      }))
  );

  const imageUrls = imageResources.map(resource => resource.name);
  const totalImageBytes = imageResources.reduce((sum, resource) => sum + resource.transferSize, 0);

  expect(imageUrls.some(url => url.includes('.gif'))).toBeFalsy();
  expect(totalImageBytes).toBeLessThan(3_000_000);
  expect(
    imageUrls.some(url =>
      ['/community/', '/testimonies/', '/prefooter/', '/partners/'].some(segment =>
        url.includes(segment)
      )
    )
  ).toBeFalsy();
});
