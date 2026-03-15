import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Sidebar from './Sidebar';
import { useBillingSummary } from '@/shared/hooks/useBillingSummary';

vi.mock('@/shared/hooks/useBillingSummary', () => ({
  useBillingSummary: vi.fn(),
}));

vi.mock('@/shared/hooks/useAuth', () => ({
  useAuth: () => ({
    logout: vi.fn(),
  }),
}));

vi.mock('@/shared/hooks/useTranslation', () => ({
  useCommonTranslation: () => ({
    t: (key: string): string =>
      (
        ({
          'navigation.pricing': 'Pricing',
          'navigation.pricingCta': 'Premium',
          'navigation.pricingCtaTop': 'Save up to 20%',
          'navigation.pricingCtaBottom': 'on yearly billing',
          'navigation.dashboard': 'Dashboard',
          'navigation.lifeWheel': 'Life Wheel',
          'navigation.dreamBoard': 'Dream Board',
          'navigation.missions': 'Missions',
        }) satisfies Record<string, string>
      )[key] ?? key,
  }),
}));

vi.mock('@/shared/components/common/LottieLightIcon', () => ({
  LottieLightIcon: ({ fallback }: { fallback: ReactNode }) => <>{fallback}</>,
}));

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the pricing entry without loading billing summary in the shell', async () => {
    render(
      <MemoryRouter initialEntries={['/app/dashboard']}>
        <Sidebar />
      </MemoryRouter>
    );

    expect(await screen.findByRole('link', { name: 'Pricing' })).not.toBeNull();
    expect(screen.getByText('Premium')).not.toBeNull();
    expect(vi.mocked(useBillingSummary)).not.toHaveBeenCalled();
  });
});
