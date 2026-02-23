import { expect as vitestExpect, beforeAll } from 'vitest';
import matchers from '@testing-library/jest-dom/matchers';

const activeExpect =
  vitestExpect || ((globalThis as { expect?: typeof vitestExpect }).expect as typeof vitestExpect);
if (activeExpect && typeof activeExpect.extend === 'function') {
  try {
    activeExpect.extend(matchers);
  } catch {
    // Ignore matcher registration failures in environments where vitest expect plugins are unavailable.
  }
}
// Mock Vite's import.meta.env
beforeAll(() => {
  const viteMock = {
    env: {
      VITE_API_BACKEND_URL: 'http://localhost:3000',
      VITE_API_BASE_URL: 'http://localhost:3000/api',
      VITE_IMAGE_BASE_URL: 'http://localhost:1337',
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
