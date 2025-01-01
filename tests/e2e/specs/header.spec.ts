import { test, expect } from '../utils/test-utils';
import { HomePage } from '../utils/page-objects';
import { TEST_DATA } from '../fixtures/test-data';

test.describe('Header', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto(5);
  });

  test('should display logo with correct text and link', async () => {
    const logo = await homePage.getLogo();
    
    // Verify logo is visible
    await expect(logo).toBeVisible();
    
    // Verify logo text
    await expect(logo).toHaveText(TEST_DATA.header.logo.text);
    
    // Verify logo href
    await expect(logo).toHaveAttribute('href', TEST_DATA.header.logo.href);
  });
}); 