import { Locator, Page } from '@playwright/test';
import { TEST_DATA } from '../fixtures/test-data';

const NAVIGATION_TIMEOUT_MS = 15000;
const ROOT_VISIBLE_TIMEOUT_MS = 10000;
const RETRY_DELAY_MS = 500;

export class HomePage {
  constructor(private page: Page) {}

  async goto(maxRetries = 2): Promise<void> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        await this.page.goto('/', {
          waitUntil: 'domcontentloaded',
          timeout: NAVIGATION_TIMEOUT_MS,
        });

        const upgradeMessage = await this.page
          .getByText('Upgrade Required')
          .isVisible()
          .catch(() => false);

        if (upgradeMessage) {
          throw new Error('Detected "Upgrade Required" page');
        }

        await this.page.locator('#root').waitFor({
          state: 'visible',
          timeout: ROOT_VISIBLE_TIMEOUT_MS,
        });
        return;
      } catch (error: unknown) {
        if (this.page.isClosed()) {
          throw error;
        }

        if (attempt === maxRetries - 1) {
          const message = error instanceof Error ? error.message : String(error);
          throw new Error(`Failed to load page after ${maxRetries} attempts: ${message}`);
        }

        console.info(`Attempt ${attempt + 1} failed, retrying...`);
        await this.page.context().clearCookies();

        if (!this.page.isClosed()) {
          await this.page.waitForTimeout(RETRY_DELAY_MS);
        }
      }
    }
  }

  async getMainNav(): Promise<Locator> {
    return this.page.getByRole('navigation', { name: 'Main menu' });
  }

  async getMobileMenuButton(): Promise<Locator> {
    return this.page.getByRole('button', { name: 'Toggle menu' });
  }

  async openMobileMenu(): Promise<void> {
    const menuButton = await this.getMobileMenuButton();
    await menuButton.click();
  }

  async getLogo(): Promise<Locator> {
    return this.page.getByRole('link', { name: TEST_DATA.header.logo.ariaLabel });
  }
}
