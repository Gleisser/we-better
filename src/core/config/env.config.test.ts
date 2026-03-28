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

  it('keeps browser runtime api requests same-origin even when a backend origin is configured', async () => {
    vi.stubEnv('VITE_API_BACKEND_URL', 'https://api.webetter.ai/');
    vi.resetModules();

    const { ENV_CONFIG } = await import('./env.config');

    expect(ENV_CONFIG.API.URL).toBe('/api');
  });
});
