import React, { StrictMode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useUserPreferences } from '../useUserPreferences';
import { useAuth } from '@/shared/hooks/useAuth';
import { preferencesService } from '@/core/services/preferencesService';

vi.mock('@/shared/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/core/services/preferencesService', () => ({
  preferencesService: {
    getUserPreferences: vi.fn(),
    patchUserPreferences: vi.fn(),
    clearCache: vi.fn(),
  },
}));

const mockedUseAuth = vi.mocked(useAuth);
const mockedPreferencesService = vi.mocked(preferencesService);

const authenticatedUser = {
  id: 'user-123',
  email: 'user@example.com',
};

const samplePreferences = {
  theme_mode: 'dark' as const,
  time_based_theme: false,
  language: 'en',
  font_size: 'medium' as const,
  reduced_motion: false,
  high_contrast: false,
};

const createWrapper = (): React.FC<{ children: React.ReactNode }> => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <StrictMode>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </StrictMode>
    );
  };
};

describe('useUserPreferences', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      checkAuth: vi.fn(),
      logout: vi.fn(),
    });
    mockedPreferencesService.getUserPreferences.mockResolvedValue({
      data: samplePreferences,
      error: null,
    });
    mockedPreferencesService.patchUserPreferences.mockResolvedValue({
      data: samplePreferences,
      error: null,
    });
  });

  it('does not load preferences when there is no authenticated user', async () => {
    const { result } = renderHook(() => useUserPreferences(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.preferences).toBeNull();
    expect(result.current.error).toBeNull();
    expect(mockedPreferencesService.getUserPreferences).not.toHaveBeenCalled();
    expect(mockedPreferencesService.clearCache).toHaveBeenCalled();
  });

  it('dedupes the initial preferences load across StrictMode remounts and multiple consumers', async () => {
    mockedUseAuth.mockReturnValue({
      user: authenticatedUser,
      isLoading: false,
      isAuthenticated: true,
      checkAuth: vi.fn(),
      logout: vi.fn(),
    });

    const { result } = renderHook(
      () => ({
        first: useUserPreferences(),
        second: useUserPreferences(),
      }),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => expect(result.current.first.preferences).toEqual(samplePreferences));
    expect(result.current.second.preferences).toEqual(samplePreferences);
    expect(mockedPreferencesService.getUserPreferences).toHaveBeenCalledTimes(1);
  });

  it('clears cached preferences again when the user logs out', async () => {
    let authState = {
      user: authenticatedUser,
      isLoading: false,
      isAuthenticated: true,
      checkAuth: vi.fn(),
      logout: vi.fn(),
    };

    mockedUseAuth.mockImplementation(() => authState);

    const { result, rerender } = renderHook(() => useUserPreferences(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.preferences).toEqual(samplePreferences));

    authState = {
      ...authState,
      user: null,
      isAuthenticated: false,
    };

    rerender();

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.preferences).toBeNull();
    expect(mockedPreferencesService.clearCache).toHaveBeenCalled();
  });
});
