import { createMemoryRouter, Outlet, RouterProvider } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./PublicRouteShell', () => ({
  default: () => <Outlet />,
}));

vi.mock('./AuthRouteShell', () => ({
  default: () => <Outlet />,
}));

vi.mock('./AppRouteShell', () => ({
  default: () => <Outlet />,
}));

vi.mock('@/App', () => ({
  default: () => <div>Landing page</div>,
}));

vi.mock('@/features/auth/pages/AuthLayout', () => ({
  default: ({ children }: { children?: React.ReactNode }) => <>{children ?? <Outlet />}</>,
}));

vi.mock('@/features/auth/pages/Login', () => ({
  default: () => <div>Login page</div>,
}));

vi.mock('@/features/auth/pages/SignUp', () => ({
  default: () => <div>Sign up page</div>,
}));

vi.mock('@/features/auth/pages/ForgotPassword', () => ({
  default: () => <div>Forgot password page</div>,
}));

vi.mock('@/features/auth/pages/ResetPassword', () => ({
  default: () => <div>Reset password page</div>,
}));

vi.mock('@/features/auth/pages/EmailConfirmation', () => ({
  default: () => <div>Email confirmation page</div>,
}));

vi.mock('@/features/dashboard/Dashboard', () => ({
  default: () => <div>Dashboard page</div>,
}));

vi.mock('@/features/life-wheel/EnhancedLifeWheelPage', () => ({
  default: () => <div>Life wheel page</div>,
}));

vi.mock('@/features/dream-board/DreamBoardPage', () => ({
  default: () => <div>Dream board page</div>,
}));

vi.mock('@/features/missions/MissionsPage', () => ({
  default: () => <div>Missions page</div>,
}));

vi.mock('@/pages/Settings/Settings', () => ({
  default: () => <div>Settings page</div>,
}));

vi.mock('@/pages/Bookmarks/Bookmarks', () => ({
  default: () => <div>Bookmarks page</div>,
}));

vi.mock('@/pages/Notifications/Notifications', () => ({
  default: () => <div>Notifications page</div>,
}));

vi.mock('@/pages/Pricing/Pricing', () => ({
  default: () => <div>Pricing page</div>,
}));

vi.mock('@/pages/QuoteIconSpike', () => ({
  default: () => <div>Quote icon spike</div>,
}));

const deferredResponse = (
  body: string
): { promise: Promise<Response>; resolve: () => Response | undefined } => {
  let resolveResponse: ((value: Response) => void) | null = null;
  const promise = new Promise<Response>(resolve => {
    resolveResponse = resolve;
  });

  return {
    promise,
    resolve: () =>
      resolveResponse?.(
        new Response(body, {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        })
      ),
  };
};

describe('router namespace loading', () => {
  beforeEach(async () => {
    vi.resetModules();
  });

  it('shows the landing loader until landing namespaces resolve', async () => {
    const originalFetch = globalThis.fetch;
    const pendingLanding = deferredResponse('{}');

    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const rawUrl =
          typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

        if (String(rawUrl).includes('/locales/en/landing.json')) {
          return pendingLanding.promise;
        }

        return originalFetch(input, init);
      })
    );

    const [{ routes }, { default: i18n }] = await Promise.all([
      import('./index'),
      import('@/core/i18n'),
    ]);
    i18n.removeResourceBundle('en', 'landing');

    const router = createMemoryRouter(routes, {
      initialEntries: ['/'],
    });

    render(<RouterProvider router={router} />);

    expect(screen.getByText('Loading We Better...')).not.toBeNull();

    pendingLanding.resolve();

    expect(await screen.findByText('Landing page')).not.toBeNull();
  });

  it('loads the auth route after auth namespaces resolve', async () => {
    const originalFetch = globalThis.fetch;
    const pendingAuth = deferredResponse('{"login":{"title":"Welcome Back"}}');

    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const rawUrl =
          typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

        if (String(rawUrl).includes('/locales/en/auth.json')) {
          return pendingAuth.promise;
        }

        return originalFetch(input, init);
      })
    );

    const [{ routes }, { default: i18n }] = await Promise.all([
      import('./index'),
      import('@/core/i18n'),
    ]);
    i18n.removeResourceBundle('en', 'auth');

    const router = createMemoryRouter(routes, {
      initialEntries: ['/auth/login'],
    });

    render(<RouterProvider router={router} />);

    expect(screen.getByText('Loading authentication...')).not.toBeNull();

    pendingAuth.resolve();

    expect(await screen.findByText('Login page')).not.toBeNull();
  });

  it('loads the dashboard route after dashboard namespaces resolve', async () => {
    const originalFetch = globalThis.fetch;
    const pendingDashboard = deferredResponse('{"widgets":{"common":{"retry":"Try again"}}}');

    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const rawUrl =
          typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

        if (String(rawUrl).includes('/locales/en/dashboard.json')) {
          return pendingDashboard.promise;
        }

        return originalFetch(input, init);
      })
    );

    const [{ routes }, { default: i18n }] = await Promise.all([
      import('./index'),
      import('@/core/i18n'),
    ]);
    i18n.removeResourceBundle('en', 'dashboard');

    const router = createMemoryRouter(routes, {
      initialEntries: ['/app/dashboard'],
    });

    render(<RouterProvider router={router} />);

    expect(screen.getByText('Loading workspace...')).not.toBeNull();

    pendingDashboard.resolve();

    await waitFor(() => {
      expect(screen.getByText('Dashboard page')).not.toBeNull();
    });
  });
});
