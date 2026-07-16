import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetSession = vi.fn();
const mockGetUser = vi.fn();
const mockSignInWithPassword = vi.fn();

vi.mock('./supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: (...args: unknown[]) => mockGetSession(...args),
      getUser: (...args: unknown[]) => mockGetUser(...args),
      signInWithPassword: (...args: unknown[]) => mockSignInWithPassword(...args),
    },
  },
}));

describe('accountDataService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({ data: { session: { access_token: 'access-token' } } });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('exports data with the authenticated user token', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{"data":{}}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const { accountDataService } = await import('./accountDataService');

    const result = await accountDataService.exportJson();

    expect(result).toBeInstanceOf(Blob);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/account\/export$/),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer access-token' }),
      })
    );
  });

  it('requires a password identity before deleting an OAuth-only account', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { email: 'person@example.com', identities: [{ provider: 'google' }] } },
      error: null,
    });
    const { accountDataService } = await import('./accountDataService');

    await expect(accountDataService.reauthenticateAndDelete('secret')).rejects.toThrow(
      'OAUTH_REAUTHENTICATION_REQUIRED'
    );
    expect(mockSignInWithPassword).not.toHaveBeenCalled();
  });

  it('reauthenticates before issuing the confirmed deletion request', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { email: 'person@example.com', identities: [{ provider: 'email' }] } },
      error: null,
    });
    mockSignInWithPassword.mockResolvedValue({ error: null });
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const { accountDataService } = await import('./accountDataService');

    await accountDataService.reauthenticateAndDelete('secret');

    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'person@example.com',
      password: 'secret',
    });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/account\/delete$/),
      expect.objectContaining({ method: 'DELETE', body: '{"confirmation":"DELETE"}' })
    );
  });
});
