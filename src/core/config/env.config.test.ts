import { afterEach, describe, expect, it, vi } from 'vitest';

describe('ENV_CONFIG', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('defaults to the same-origin app api path when no backend origin is configured', async () => {
    const { ENV_CONFIG } = await import('./env.config');

    expect(ENV_CONFIG.API.URL).toBe('/api');
  });

  it('uses the configured backend origin for generic api client requests', async () => {
    vi.stubEnv('VITE_API_BACKEND_URL', 'https://api.webetter.ai/');
    vi.resetModules();

    const { ENV_CONFIG } = await import('./env.config');

    expect(ENV_CONFIG.API.URL).toBe('https://api.webetter.ai/api');
  });
});
