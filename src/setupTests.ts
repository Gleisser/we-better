import fs from 'node:fs';
import path from 'node:path';
import { expect as vitestExpect } from 'vitest';
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
const viteMock = {
  env: {
    VITE_API_BACKEND_URL: 'http://localhost:3000',
    VITE_API_BASE_URL: 'http://localhost:3000/api',
    VITE_IMAGE_BASE_URL: 'http://localhost:1337',
    VITE_API_TIMEOUT: '30000',
    VITE_RATE_LIMIT_MAX_REQUESTS: '50',
    VITE_RATE_LIMIT_WINDOW: '60000',
    VITE_SUPABASE_URL: 'https://example.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'test-anon-key',
    MODE: 'test',
    DEV: true,
    PROD: false,
    SSR: false,
  },
};

type GlobalWithImport = typeof global & {
  import: { meta: typeof viteMock };
};

(global as GlobalWithImport).import = { meta: viteMock };

const originalFetch = globalThis.fetch?.bind(globalThis);
const projectRoot = path.resolve(__dirname, '..');

globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const rawUrl = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  const url = new URL(rawUrl, 'http://localhost');

  if (url.pathname.startsWith('/locales/')) {
    const relativePath = url.pathname.replace(/^\//, '');
    const filePath = path.join(projectRoot, 'public', relativePath);
    if (!fs.existsSync(filePath)) {
      return new Response('{}', {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(fs.readFileSync(filePath, 'utf8'), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (originalFetch) {
    return originalFetch(input, init);
  }

  throw new Error(`Unhandled fetch request in tests: ${url.toString()}`);
};
