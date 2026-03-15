import React, { StrictMode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePlanCatalog } from '../usePlanCatalog';
import { useAuth } from '@/shared/hooks/useAuth';
import { billingService } from '@/core/services/billingService';

vi.mock('@/shared/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/core/services/billingService', () => ({
  billingService: {
    getPlanCatalog: vi.fn(),
  },
}));

const mockedUseAuth = vi.mocked(useAuth);
const mockedBillingService = vi.mocked(billingService);

const createWrapper = (): React.FC<{ children: React.ReactNode }> => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
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

describe('usePlanCatalog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseAuth.mockReturnValue({
      user: { id: 'user-123', email: 'user@example.com' },
      isLoading: false,
      isAuthenticated: true,
      checkAuth: vi.fn(),
      logout: vi.fn(),
    });
    mockedBillingService.getPlanCatalog.mockResolvedValue({
      data: [
        {
          code: 'premium',
          displayName: 'Premium',
          goalsLimit: 20,
          habitsLimit: 20,
          monthlyPriceCents: 1000,
          yearlyPriceCents: 9600,
          isActive: true,
          currency: 'USD',
        },
      ],
      error: null,
    });
  });

  it('dedupes the initial plan catalog load across StrictMode remounts and multiple consumers', async () => {
    const { result } = renderHook(
      () => ({
        first: usePlanCatalog(),
        second: usePlanCatalog(),
      }),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => expect(result.current.first.plans).toHaveLength(1));
    expect(result.current.second.plans).toHaveLength(1);
    expect(mockedBillingService.getPlanCatalog).toHaveBeenCalledTimes(1);
  });
});
