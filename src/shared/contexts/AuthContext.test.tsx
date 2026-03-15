import { useContext } from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthContext, AuthProvider } from './AuthContext';

const mockGetSession = vi.fn();
const mockGetUser = vi.fn();
const mockOnAuthStateChange = vi.fn();
const mockTrackCurrentSession = vi.fn();
const mockGetUnreadCount = vi.fn();
const mockGetBootstrap = vi.fn();
const mockClearAuthScopedQueries = vi.fn();

vi.mock('@/core/services/authService', () => ({
  authService: {
    signOut: vi.fn(),
  },
}));

vi.mock('@/core/services/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: (...args: unknown[]) => mockGetSession(...args),
      getUser: (...args: unknown[]) => mockGetUser(...args),
      onAuthStateChange: (...args: unknown[]) => mockOnAuthStateChange(...args),
    },
  },
}));

vi.mock('@/core/services/appShellService', () => ({
  appShellService: {
    getBootstrap: (...args: unknown[]) => mockGetBootstrap(...args),
  },
}));

vi.mock('@/core/services/sessionsService', () => ({
  sessionsService: {
    trackCurrentSession: (...args: unknown[]) => mockTrackCurrentSession(...args),
  },
}));

vi.mock('@/core/services/notificationsService', () => ({
  notificationsService: {
    getUnreadCount: (...args: unknown[]) => mockGetUnreadCount(...args),
  },
}));

vi.mock('@/core/config/react-query', () => ({
  clearAuthScopedQueries: () => mockClearAuthScopedQueries(),
}));

const AuthConsumer = (): JSX.Element => {
  const context = useContext(AuthContext);

  return (
    <div>
      <div data-testid="auth-loading">{String(context.isLoading)}</div>
      <div data-testid="auth-user">{context.user?.display_name ?? 'anonymous'}</div>
      <div data-testid="auth-unread">{String(context.unreadNotificationCount ?? 0)}</div>
    </div>
  );
};

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    Object.defineProperty(window, 'requestAnimationFrame', {
      writable: true,
      value: vi.fn((callback: FrameRequestCallback) => window.setTimeout(() => callback(16), 0)),
    });

    Object.defineProperty(window, 'cancelAnimationFrame', {
      writable: true,
      value: vi.fn((handle: number) => window.clearTimeout(handle)),
    });

    mockTrackCurrentSession.mockResolvedValue({ data: null, error: null });
    mockGetUnreadCount.mockResolvedValue({ data: { unread: 4 }, error: null });
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    mockGetBootstrap.mockResolvedValue({
      data: {
        profile: { full_name: 'Profile Name', avatar_url: 'avatar.png' },
        unreadNotificationCount: 4,
      },
      error: null,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('hydrates the authenticated user once per session bootstrap and tracks the session once', async () => {
    const subscription = { unsubscribe: vi.fn() };
    let authStateCallback: ((event: string, session: unknown) => void | Promise<void>) | undefined;

    const session = {
      access_token: 'token-123',
      user: {
        id: 'user-123',
        email: 'user@example.com',
        user_metadata: {
          display_name: 'Session User',
        },
      },
    };

    mockGetSession.mockResolvedValue({
      data: { session },
      error: null,
    });
    mockOnAuthStateChange.mockImplementation(callback => {
      authStateCallback = callback;
      return { data: { subscription } };
    });
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('auth-user').textContent).toBe('Session User'));
    expect(screen.getByTestId('auth-unread').textContent).toBe('4');
    expect(mockGetSession).toHaveBeenCalled();
    expect(mockGetBootstrap).toHaveBeenCalledTimes(1);
    expect(mockGetUnreadCount).not.toHaveBeenCalled();

    await act(async () => {
      await authStateCallback?.('SIGNED_IN', session);
    });

    expect(mockGetBootstrap).toHaveBeenCalledTimes(1);
    expect(mockGetUnreadCount).not.toHaveBeenCalled();

    await waitFor(() => expect(mockTrackCurrentSession).toHaveBeenCalledTimes(1), {
      timeout: 2500,
    });
  }, 7000);

  it('hydrates the user when a sign-in event arrives after an unauthenticated bootstrap', async () => {
    const subscription = { unsubscribe: vi.fn() };
    let authStateCallback: ((event: string, session: unknown) => void | Promise<void>) | undefined;

    const session = {
      access_token: 'token-signed-in',
      user: {
        id: 'user-456',
        email: 'signed-in@example.com',
        user_metadata: {
          display_name: 'Signed In User',
        },
      },
    };

    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    mockOnAuthStateChange.mockImplementation(callback => {
      authStateCallback = callback;
      return { data: { subscription } };
    });
    mockGetBootstrap.mockResolvedValue({
      data: {
        profile: { full_name: 'Signed In Profile', avatar_url: 'avatar.png' },
        unreadNotificationCount: 4,
      },
      error: null,
    });

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await act(async () => {
      await authStateCallback?.('INITIAL_SESSION', null);
    });

    await waitFor(() => expect(screen.getByTestId('auth-loading').textContent).toBe('false'), {
      timeout: 2500,
    });
    expect(screen.getByTestId('auth-user').textContent).toBe('anonymous');

    await act(async () => {
      await authStateCallback?.('SIGNED_IN', session);
    });

    await waitFor(() => expect(screen.getByTestId('auth-user').textContent).toBe('Signed In User'));
    expect(mockGetBootstrap).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('auth-unread').textContent).toBe('4');
  }, 7000);
});
