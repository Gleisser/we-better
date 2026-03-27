import type { Response } from '@playwright/test';
import { test, expect } from '../utils/test-utils';
import { HAS_AUTH_CREDENTIALS, signIn } from '../utils/auth';

type ObservedImageResponse = {
  bodyLength: number;
  ok: boolean;
  status: number;
  url: string;
};

test.describe('Dream Board media budget', () => {
  test.skip(!HAS_AUTH_CREDENTIALS, 'Set E2E_AUTH_EMAIL and E2E_AUTH_PASSWORD');

  test('keeps initial Dream Board image transfer within budget', async ({ page }) => {
    test.slow();

    await signIn(page);

    const imageResponseBodies: Array<Promise<ObservedImageResponse | null>> = [];
    const handleResponse = (response: Response): void => {
      const isPreviewResponse = response.url().includes('/api/dream-board/previews');
      const isImageResponse = response.request().resourceType() === 'image';

      if (!isPreviewResponse && !isImageResponse) {
        return;
      }

      imageResponseBodies.push(
        response
          .body()
          .then(buffer => ({
            url: response.url(),
            bodyLength: buffer.byteLength,
            ok: response.ok(),
            status: response.status(),
          }))
          .catch(() => null)
      );
    };

    page.on('response', handleResponse);

    await page.goto('/app/dream-board');
    await expect(page).toHaveURL(/\/app\/dream-board$/);
    await page.waitForFunction(() => {
      const imageSources = Array.from(document.querySelectorAll('article img')).map(
        image => (image as HTMLImageElement).currentSrc || image.getAttribute('src') || ''
      );

      return imageSources.some(source => source.includes('/api/dream-board/previews'));
    });
    await page.waitForTimeout(750);

    page.off('response', handleResponse);

    const mountedImageUrls = new Set(
      await page.evaluate(() =>
        Array.from(document.querySelectorAll('article img'))
          .map(image => image.currentSrc || image.getAttribute('src') || '')
          .filter(src => Boolean(src) && !src.startsWith('data:image'))
      )
    );

    const settledResponses = (await Promise.all(imageResponseBodies)).filter(
      (entry): entry is ObservedImageResponse => Boolean(entry)
    );
    const previewResponses = settledResponses.filter(response =>
      response.url.includes('/api/dream-board/previews')
    );
    const failedPreviewResponses = previewResponses.filter(response => !response.ok);
    const mountedImageResponses = settledResponses.filter(
      response => response.ok && mountedImageUrls.has(response.url)
    );
    const initialImageBytes = mountedImageResponses.reduce(
      (sum, response) => sum + response.bodyLength,
      0
    );
    const prioritizedImage = page.locator('article img[fetchpriority="high"]').first();
    const prioritizedImageSrc = await prioritizedImage.getAttribute('src');
    const prioritizedCurrentSrc = await prioritizedImage.evaluate(
      image => (image as HTMLImageElement).currentSrc
    );

    await expect(page.locator('article img[fetchpriority="high"]')).toHaveCount(1);
    expect(mountedImageUrls.size).toBeLessThanOrEqual(3);
    expect(previewResponses.length).toBeGreaterThan(0);
    expect(mountedImageResponses.length).toBeGreaterThan(0);
    expect(failedPreviewResponses).toEqual([]);
    expect(prioritizedImageSrc ?? '').toContain('/api/dream-board/previews');
    expect(prioritizedImageSrc ?? '').toContain('variant=card');
    expect(prioritizedCurrentSrc ?? '').toContain('/api/dream-board/previews');
    mountedImageResponses.forEach(response => {
      expect(response.url).toContain('/api/dream-board/previews');
    });
    expect(initialImageBytes).toBeLessThanOrEqual(300_000);
  });
});
