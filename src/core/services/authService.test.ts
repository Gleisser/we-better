import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockSignInWithOAuth = vi.fn();
const mockExchangeCodeForSession = vi.fn();
const mockSignUp = vi.fn();
const mockResend = vi.fn();

vi.mock('./supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithOAuth: (...args: unknown[]) => mockSignInWithOAuth(...args),
      exchangeCodeForSession: (...args: unknown[]) => mockExchangeCodeForSession(...args),
      signUp: (...args: unknown[]) => mockSignUp(...args),
      resend: (...args: unknown[]) => mockResend(...args),
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

describe('authService email confirmation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('exchanges a callback code and only succeeds with a session and user', async () => {
    mockExchangeCodeForSession.mockResolvedValue({
      data: {
        session: { access_token: 'access-token' },
        user: { id: 'user-id', email: 'member@example.com' },
      },
      error: null,
    });
    const { authService } = await import('./authService');

    const response = await authService.confirmEmail('confirmation-code');

    expect(mockExchangeCodeForSession).toHaveBeenCalledWith('confirmation-code');
    expect(response).toMatchObject({
      user: { id: 'user-id' },
      session: { access_token: 'access-token' },
      error: null,
    });
  });

  it('does not report success when Supabase rejects a reused or invalid code', async () => {
    mockExchangeCodeForSession.mockResolvedValue({
      data: { session: null, user: null },
      error: { message: 'Code verifier expired' },
    });
    const { authService } = await import('./authService');

    const response = await authService.confirmEmail('expired-code');

    expect(response.user).toBeNull();
    expect(response.error?.message).toBe('Code verifier expired');
  });

  it('uses the same callback URL for signup and confirmation-email resends', async () => {
    mockSignUp.mockResolvedValue({ data: { user: null, session: null }, error: null });
    mockResend.mockResolvedValue({ error: null });
    const { authService } = await import('./authService');

    await authService.signUp('member@example.com', 'password', 'Member');
    await authService.resendConfirmation('member@example.com');

    expect(mockSignUp.mock.calls[0][0].options.emailRedirectTo).toMatch(/\/auth\/confirm$/);
    expect(mockResend).toHaveBeenCalledWith({
      type: 'signup',
      email: 'member@example.com',
      options: {
        emailRedirectTo: expect.stringMatching(/\/auth\/confirm$/),
      },
    });
  });
});
