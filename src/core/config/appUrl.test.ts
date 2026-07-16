import { afterEach, describe, expect, it, vi } from 'vitest';

describe('app URL configuration', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('uses the environment-specific public origin', async () => {
    vi.stubEnv('VITE_APP_URL', 'https://staging.we-better.example/');
    const { APP_ORIGIN, createAppUrl } = await import('./appUrl');

    expect(APP_ORIGIN).toBe('https://staging.we-better.example');
    expect(createAppUrl('/auth/reset-password')).toBe(
      'https://staging.we-better.example/auth/reset-password'
    );
  });

  it('falls back to the current public deployment for invalid configuration', async () => {
    vi.stubEnv('VITE_APP_URL', 'javascript:alert(1)');
    const { APP_ORIGIN } = await import('./appUrl');

    expect(APP_ORIGIN).toBe('https://we-better.vercel.app');
  });
});
