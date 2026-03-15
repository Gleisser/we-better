import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Settings from '../Settings';
import { billingService } from '@/core/services/billingService';
import { sessionsService } from '@/core/services/sessionsService';
import { useBillingSummary } from '@/shared/hooks/useBillingSummary';

vi.mock('@/shared/hooks/useTranslation', () => ({
  useSettingsTranslation: () => ({
    t: (key: string): string => key,
    currentLanguage: 'en',
  }),
}));

vi.mock('@/shared/components/user/ProfileSettings', () => ({
  default: () => <div data-testid="profile-settings" />,
}));

vi.mock('@/shared/components/theme/ThemeSelector', () => ({
  default: () => <div data-testid="theme-selector" />,
}));

vi.mock('@/shared/components/i18n/LanguageSelector', () => ({
  default: () => <div data-testid="language-selector" />,
}));

vi.mock('../components/NotificationPreferencesSection', () => ({
  default: () => <div data-testid="notification-preferences" />,
}));

vi.mock('@/shared/components/common/Toggle', () => ({
  default: () => <div data-testid="toggle" />,
}));

vi.mock('@/shared/components/billing/PricingModal/PricingModal', () => ({
  default: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="pricing-modal">pricing-modal-open</div> : null,
}));

vi.mock('@/shared/hooks/useBillingSummary', () => ({
  useBillingSummary: vi.fn(),
}));

vi.mock('@/core/services/billingService', () => ({
  billingService: {
    getBillingSummary: vi.fn(),
    getPlanCatalog: vi.fn(),
    createPortalSession: vi.fn(),
    createCheckoutSession: vi.fn(),
  },
}));

vi.mock('@/core/services/sessionsService', () => ({
  sessionsService: {
    getSessionsOverview: vi.fn(),
    getHistory: vi.fn(),
    logoutOtherSessions: vi.fn(),
  },
}));

const mockedBillingService = billingService as unknown as {
  getBillingSummary: ReturnType<typeof vi.fn>;
  getPlanCatalog: ReturnType<typeof vi.fn>;
  createPortalSession: ReturnType<typeof vi.fn>;
  createCheckoutSession: ReturnType<typeof vi.fn>;
};

const mockedSessionsService = sessionsService as unknown as {
  getSessionsOverview: ReturnType<typeof vi.fn>;
  getHistory: ReturnType<typeof vi.fn>;
  logoutOtherSessions: ReturnType<typeof vi.fn>;
};
const mockedUseBillingSummary = vi.mocked(useBillingSummary);

const makeBillingSummary = (
  plan: 'free' | 'premium' | 'pro'
): {
  currentPlan: 'free' | 'premium' | 'pro';
  currentPlanDisplayName: string;
  nextBillingDate: string | null;
  billingCycle: 'monthly' | null;
  amount: number;
  currency: string;
  subscriptionStatus: 'free' | 'active';
  cancelAtPeriodEnd: boolean;
  paymentMethod: { type: 'none' };
  usage: {
    goalsUsed: number;
    goalsLimit: number;
    habitsUsed: number;
    habitsLimit: number;
  };
} => ({
  currentPlan: plan,
  currentPlanDisplayName: plan,
  nextBillingDate: null,
  billingCycle: plan === 'free' ? null : 'monthly',
  amount: plan === 'free' ? 0 : 10,
  currency: 'USD',
  subscriptionStatus: plan === 'free' ? 'free' : 'active',
  cancelAtPeriodEnd: false,
  paymentMethod: { type: 'none' as const },
  usage: {
    goalsUsed: 1,
    goalsLimit: 5,
    habitsUsed: 1,
    habitsLimit: 5,
  },
});

const planCatalog = [
  {
    code: 'free',
    displayName: 'Free',
    goalsLimit: 5,
    habitsLimit: 5,
    monthlyPriceCents: 0,
    yearlyPriceCents: 0,
    isActive: true,
    currency: 'USD',
  },
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
  {
    code: 'pro',
    displayName: 'Pro',
    goalsLimit: 100,
    habitsLimit: 100,
    monthlyPriceCents: 2500,
    yearlyPriceCents: 24000,
    isActive: true,
    currency: 'USD',
  },
];

describe('Settings billing flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedSessionsService.getSessionsOverview.mockResolvedValue({
      data: {
        summary: {
          totalSessions: 1,
          activeSessions: 1,
          currentSessionId: 'abc',
          lastLogin: null,
          suspiciousSessions: 0,
          trustedDevices: 1,
        },
        recentSessions: [],
      },
      error: null,
    });
    mockedSessionsService.getHistory.mockResolvedValue({ data: { sessions: [] }, error: null });
    mockedSessionsService.logoutOtherSessions.mockResolvedValue({
      data: { success: true },
      error: null,
    });

    mockedBillingService.getPlanCatalog.mockResolvedValue({ data: planCatalog, error: null });
    mockedBillingService.createCheckoutSession.mockResolvedValue({ data: null, error: null });
    mockedBillingService.createPortalSession.mockResolvedValue({
      data: null,
      error: 'Portal blocked in test',
    });
    mockedUseBillingSummary.mockReturnValue({
      data: makeBillingSummary('free'),
      error: null,
      isLoading: false,
      refetch: vi.fn(),
    });
  });

  it('opens pricing modal for free users when clicking Manage Plan', async () => {
    mockedUseBillingSummary.mockReturnValue({
      data: makeBillingSummary('free'),
      error: null,
      isLoading: false,
      refetch: vi.fn(),
    });

    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>
    );

    const manageButton = await screen.findByRole('button', {
      name: 'settings.billing.managePlan',
    });
    fireEvent.click(manageButton);

    expect(await screen.findByTestId('pricing-modal')).not.toBeNull();
    expect(mockedBillingService.createPortalSession).not.toHaveBeenCalled();
  });

  it('uses portal flow for paid users when clicking Manage Plan', async () => {
    mockedUseBillingSummary.mockReturnValue({
      data: makeBillingSummary('premium'),
      error: null,
      isLoading: false,
      refetch: vi.fn(),
    });

    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>
    );

    const manageButton = await screen.findByRole('button', {
      name: 'settings.billing.managePlan',
    });
    fireEvent.click(manageButton);

    await waitFor(() => {
      expect(mockedBillingService.createPortalSession).toHaveBeenCalledWith(
        'manage',
        expect.any(String)
      );
    });

    expect(screen.queryByTestId('pricing-modal')).toBeNull();
  });
});
