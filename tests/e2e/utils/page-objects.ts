import { Page } from '@playwright/test';
import { TEST_DATA } from '../fixtures/test-data';

export class HomePage {
  constructor(private page: Page) {}

  async goto(maxRetries = 3) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      if (attempt > 0) {
        // Add a delay between retries
        await this.page.waitForTimeout(2000); // 2 second delay
      }
      await this.page.goto('/');
      
      try {
        // Check for upgrade required message
        const upgradeMessage = await this.page.getByText('Upgrade Required').isVisible();
        if (upgradeMessage) {
          console.log(`Attempt ${attempt + 1}: Detected "Upgrade Required", refreshing...`);
          // Clear browser cache and reload
          await this.page.context().clearCookies();
          await this.page.reload();
          continue;
        }

        // Wait for root element to be visible
        await this.page.locator('#root').waitFor({ state: 'visible', timeout: 5000 });
        return; // Success, exit the retry loop
      } catch (error) {
        if (attempt === maxRetries - 1) {
          throw new Error(`Failed to load page after ${maxRetries} attempts: ${error.message}`);
        }
        console.log(`Attempt ${attempt + 1} failed, retrying...`);
        await this.page.waitForTimeout(1000); // Wait a bit before retrying
      }
    }
  }

  async getMainNav() {
    return this.page.getByRole('navigation', { name: 'Main menu' });
  }

  async getMobileMenuButton() {
    return this.page.getByRole('button', { name: 'Toggle menu' });
  }

  async openMobileMenu() {
    const menuButton = await this.getMobileMenuButton();
    await menuButton.click();
  }

  async getLogo() {
    return this.page.getByRole('link', { name: TEST_DATA.header.logo.text });
  }
}