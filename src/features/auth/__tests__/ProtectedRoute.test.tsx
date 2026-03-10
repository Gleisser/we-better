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

  it('does not call checkAuth on mount and redirects anonymous users to login', () => {
    const checkAuth = vi.fn();

    mockedUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
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
});
