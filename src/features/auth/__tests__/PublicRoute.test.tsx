import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PublicRoute } from '../PublicRoute';
import { useAuth } from '@/shared/hooks/useAuth';

vi.mock('@/shared/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);

describe('PublicRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the auth transition screen while bootstrap is unresolved', () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      isAuthResolved: false,
      isLoggingOut: false,
      checkAuth: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/auth/login']}>
        <Routes>
          <Route
            path="/auth/login"
            element={
              <PublicRoute>
                <div>Login page</div>
              </PublicRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Syncing your session')).not.toBeNull();
  });

  it('redirects authenticated users away from public auth pages', () => {
    mockedUseAuth.mockReturnValue({
      user: { id: 'user-123', email: 'user@example.com' },
      isLoading: false,
      isAuthenticated: true,
      isAuthResolved: true,
      isLoggingOut: false,
      checkAuth: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/auth/login']}>
        <Routes>
          <Route
            path="/auth/login"
            element={
              <PublicRoute>
                <div>Login page</div>
              </PublicRoute>
            }
          />
          <Route path="/app" element={<div>App page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('App page')).not.toBeNull();
  });

  it('renders the public auth page for anonymous users once auth is resolved', () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      isAuthResolved: true,
      isLoggingOut: false,
      checkAuth: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/auth/login']}>
        <Routes>
          <Route
            path="/auth/login"
            element={
              <PublicRoute>
                <div>Login page</div>
              </PublicRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login page')).not.toBeNull();
  });
});
