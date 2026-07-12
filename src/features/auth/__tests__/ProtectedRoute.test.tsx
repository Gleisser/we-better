import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProtectedRoute } from '../ProtectedRoute';
import { useAuth } from '@/shared/hooks/useAuth';

vi.mock('@/shared/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);

describe('ProtectedRoute', () => {
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
      <MemoryRouter initialEntries={['/app/dashboard']}>
        <Routes>
          <Route
            path="/app/dashboard"
            element={
              <ProtectedRoute>
                <div>Protected content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Syncing your session')).not.toBeNull();
  });

  it('does not call checkAuth on mount and redirects anonymous users to login', () => {
    const checkAuth = vi.fn();

    mockedUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      isAuthResolved: true,
      isLoggingOut: false,
      checkAuth,
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/app/dashboard']}>
        <Routes>
          <Route
            path="/app/dashboard"
            element={
              <ProtectedRoute>
                <div>Protected content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/auth/login" element={<div>Login page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(checkAuth).not.toHaveBeenCalled();
    expect(screen.getByText('Login page')).not.toBeNull();
  });

  it('renders protected content once auth is resolved and the user is present', () => {
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
      <MemoryRouter initialEntries={['/app/dashboard']}>
        <Routes>
          <Route
            path="/app/dashboard"
            element={
              <ProtectedRoute>
                <div>Protected content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Protected content')).not.toBeNull();
  });

  it('redirects first-access users to onboarding before dashboard access', () => {
    mockedUseAuth.mockReturnValue({
      user: { id: 'user-123', email: 'user@example.com' },
      onboarding: {
        required: true,
        skippedAt: null,
        completedAt: null,
      },
      isLoading: false,
      isAuthenticated: true,
      isAuthResolved: true,
      isLoggingOut: false,
      checkAuth: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/app/dashboard']}>
        <Routes>
          <Route
            path="/app/dashboard"
            element={
              <ProtectedRoute>
                <div>Protected content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/app/onboarding" element={<div>Onboarding page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Onboarding page')).not.toBeNull();
  });

  it('allows users to stay on onboarding while onboarding is required', () => {
    mockedUseAuth.mockReturnValue({
      user: { id: 'user-123', email: 'user@example.com' },
      onboarding: {
        required: true,
        skippedAt: null,
        completedAt: null,
      },
      isLoading: false,
      isAuthenticated: true,
      isAuthResolved: true,
      isLoggingOut: false,
      checkAuth: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/app/onboarding']}>
        <Routes>
          <Route
            path="/app/onboarding"
            element={
              <ProtectedRoute>
                <div>Onboarding page</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Onboarding page')).not.toBeNull();
  });

  it('lets skipped users continue into the protected app', () => {
    mockedUseAuth.mockReturnValue({
      user: { id: 'user-123', email: 'user@example.com' },
      onboarding: {
        required: true,
        skippedAt: '2026-04-16T00:00:00.000Z',
        completedAt: null,
      },
      isLoading: false,
      isAuthenticated: true,
      isAuthResolved: true,
      isLoggingOut: false,
      checkAuth: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/app/dashboard']}>
        <Routes>
          <Route
            path="/app/dashboard"
            element={
              <ProtectedRoute>
                <div>Protected content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Protected content')).not.toBeNull();
  });
});
