import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockSignInWithOAuth = vi.fn();

vi.mock('./supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithOAuth: (...args: unknown[]) => mockSignInWithOAuth(...args),
    },
  },
}));

describe('authService.signInWithGoogle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns a friendly message when Google auth is disabled', async () => {
    vi.stubEnv('VITE_AUTH_GOOGLE_ENABLED', 'false');
    const { authService } = await import('./authService');

    const response = await authService.signInWithGoogle();

    expect(mockSignInWithOAuth).not.toHaveBeenCalled();
    expect(response.error?.message).toBe(
      'Google sign-in is currently unavailable. Please use email and password.'
    );
  });

  it('sanitizes unsupported provider errors', async () => {
    vi.stubEnv('VITE_AUTH_GOOGLE_ENABLED', 'true');
    mockSignInWithOAuth.mockResolvedValue({
      error: { message: 'validation_failed: Unsupported provider' },
    });
    const { authService } = await import('./authService');

    const response = await authService.signInWithGoogle();

    expect(mockSignInWithOAuth).toHaveBeenCalledTimes(1);
    expect(response.error?.message).toBe(
      'Google sign-in is currently unavailable. Please use email and password.'
    );
    expect(response.error?.message).not.toMatch(/unsupported provider/i);
  });
});
