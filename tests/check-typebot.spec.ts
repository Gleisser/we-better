import { expect, test } from '@playwright/test';

test('structured onboarding handoff opens native personalization', async ({ page }) => {
  await page.goto('http://localhost:5173/auth/login');
  await page.fill('input[type="email"]', 'gleisser@mailinator.com');
  await page.fill('input[type="password"]', 'Password2!');
  await page.click('button[type="submit"]');

  await page.waitForTimeout(2000);
  await page.goto('http://localhost:5173/app/onboarding');
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
