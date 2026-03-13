import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;
const serverHost = '127.0.0.1';
const defaultServerPort = isCI ? 4173 : 5173;
const serverPort = Number(process.env.PLAYWRIGHT_SERVER_PORT ?? defaultServerPort);
const baseURL = `http://${serverHost}:${serverPort}`;
const webServerCommand = isCI
  ? `npm run build && npm run preview -- --host ${serverHost} --port ${serverPort}`
  : `npm run dev -- --host ${serverHost} --port ${serverPort}`;

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests/e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: isCI,
  /* Retry on CI only */
  retries: isCI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: isCI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL,
    navigationTimeout: isCI ? 15000 : 10000,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    video: 'on-first-retry',
    screenshot: 'only-on-failure',

    /* Add some browser context options */
    contextOptions: {
      reducedMotion: 'reduce',
      forcedColors: 'none',
    },
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'Desktop Chrome',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
        viewport: { width: 375, height: 667 },
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: webServerCommand,
    url: baseURL,
    reuseExistingServer: !isCI,
    timeout: 120000,
    stdout: 'pipe',
    stderr: 'pipe',
    ignoreHTTPSErrors: true,
    env: {
      VITE_DISABLE_HMR: 'true',
      NODE_ENV: 'test',
    },
  },

  timeout: isCI ? 45000 : 30000,
  expect: {
    timeout: 10000,
  },
});
