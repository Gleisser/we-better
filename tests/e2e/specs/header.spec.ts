import { test, expect } from '../utils/test-utils';
import { HomePage } from '../utils/page-objects';
import { TEST_DATA } from '../fixtures/test-data';

test.describe('Header', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('should display logo with correct text and link', async () => {
    const logo = await homePage.getLogo();

    await expect(logo).toBeVisible();
    await expect(logo).toHaveAccessibleName(TEST_DATA.header.logo.ariaLabel);
    await expect(logo).toHaveAttribute('href', TEST_DATA.header.logo.href);
  });
});
