import type { ReactNode } from 'react';
import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AppRouteShell from './AppRouteShell';

const { registerServiceWorkerAfterFirstPaintMock, useAuthMock } = vi.hoisted(() => ({
  registerServiceWorkerAfterFirstPaintMock: vi.fn(),
  useAuthMock: vi.fn(),
}));

vi.mock('@tanstack/react-query', () => ({
  QueryClientProvider: ({ children }: { children: ReactNode }) => children,
}));

vi.mock('@/core/config/react-query', () => ({
  queryClient: {},
}));

vi.mock('@/core/services/pushSubscriptionService', () => ({
  registerServiceWorkerAfterFirstPaint: registerServiceWorkerAfterFirstPaintMock,
}));

vi.mock('@/shared/hooks/useAuth', () => ({
  useAuth: () => useAuthMock(),
}));

vi.mock('@/shared/contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: ReactNode }) => children,
}));

vi.mock('@/shared/contexts/ThemeContext', () => ({
  ThemeProvider: ({ children }: { children: ReactNode }) => children,
}));

vi.mock('@/shared/contexts/BottomSheetContext', () => ({
  BottomSheetProvider: ({ children }: { children: ReactNode }) => children,
}));

vi.mock('@/features/auth/ProtectedRoute', () => ({
  ProtectedRoute: ({ children }: { children: ReactNode }) => children,
}));

vi.mock('@/shared/components/layout/WeBetterApp', () => ({
  default: () => <div>app</div>,
}));

vi.mock('@/shared/components/debug/ReactQueryDevtoolsLoader', () => ({
  default: () => null,
}));

describe('AppRouteShell', () => {
  beforeEach(() => {
    useAuthMock.mockReset();
    registerServiceWorkerAfterFirstPaintMock.mockReset();
  });

  it('does not register the notifications service worker while auth is still loading', () => {
    useAuthMock.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    });

    render(<AppRouteShell />);

    expect(registerServiceWorkerAfterFirstPaintMock).not.toHaveBeenCalled();
  });

  it('does not register the notifications service worker for unauthenticated users', () => {
    useAuthMock.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });

    render(<AppRouteShell />);

    expect(registerServiceWorkerAfterFirstPaintMock).not.toHaveBeenCalled();
  });

  it('registers the notifications service worker only after auth is confirmed', async () => {
    useAuthMock.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });

    render(<AppRouteShell />);

    await waitFor(() => {
      expect(registerServiceWorkerAfterFirstPaintMock).toHaveBeenCalledTimes(1);
    });
  });
});
