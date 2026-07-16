import { test, expect } from './e2e/utils/test-utils';
import { HAS_AUTH_CREDENTIALS, signIn } from './e2e/utils/auth';

test.describe('Structured Typebot onboarding handoff', () => {
  test.skip(!HAS_AUTH_CREDENTIALS, 'Set E2E_AUTH_EMAIL and E2E_AUTH_PASSWORD');

  test('opens native personalization after the Typebot completion message', async ({ page }) => {
    await signIn(page);
    await page.goto('/app/onboarding');
    await page.getByTestId('onboarding-page').waitFor();

    await page.evaluate(() => {
      window.postMessage(
        {
          from: 'typebot-custom',
          signal: 'onboarding-complete',
          focusArea: 'health',
          selectedDreamKey: 'sleep-with-consistency',
          selectedDreamLabel: 'Dormir com mais consistência',
          microPreferences: ['lighter'],
          regenerationCount: 1,
          usedRegeneration: true,
        },
        '*'
      );
    });

    await expect(page.getByTestId('onboarding-personalization')).toBeVisible();
    await expect(page.getByTestId('starter-dream-preview')).toContainText(
      'Dormir com mais consistência'
    );
  });
});
