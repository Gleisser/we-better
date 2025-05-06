import { expect, beforeAll } from 'vitest';
import matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);
// Mock Vite's import.meta.env
beforeAll(() => {
  const viteMock = {
    env: {
      VITE_API_URL: 'http://localhost:1337/api',
      VITE_API_TOKEN: 'mock-token',
      VITE_API_TIMEOUT: '30000',
      VITE_RATE_LIMIT_MAX_REQUESTS: '50',
      VITE_RATE_LIMIT_WINDOW: '60000',
      MODE: 'test',
      DEV: true,
      PROD: false,
      SSR: false,
    },
  };

  // Use proper type assertion
  type GlobalWithImport = typeof global & {
    import: { meta: typeof viteMock };
  };

  (global as GlobalWithImport).import = { meta: viteMock };
});
