import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import PricingExperience from '../PricingExperience';
import type {
  BillingCycle,
  BillingPlanCatalogItem,
  BillingSummary,
} from '@/core/services/billingService';

vi.mock('framer-motion', () => {
  const motionProxy = new Proxy(
    {},
    {
      get:
        (_, tag: string) =>
        ({ children, ...props }: React.HTMLAttributes<HTMLElement>) =>
          React.createElement(tag, props, children),
    }
  );

  return {
    motion: motionProxy,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    useReducedMotion: () => false,
  };
});

vi.mock('@/shared/hooks/useTranslation', () => ({
  useCommonTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>): string => {
      const map: Record<string, string> = {
        'settings.billing.plans.free': 'Free Plan',
        'settings.billing.plans.premium': 'Premium Plan',
        'settings.billing.plans.pro': 'Pro Plan',
        'settings.billing.freePlanPrice': 'Free',
        'settings.billing.pricing.title': 'Simple, Transparent Pricing',
        'settings.billing.pricing.subtitle': 'Choose your plan',
        'settings.billing.pricing.selectCycle': 'Select billing cycle',
        'settings.billing.pricing.monthly': 'Monthly',
        'settings.billing.pricing.yearly': 'Yearly',
        'settings.billing.pricing.mostPopular': 'Most Popular',
        'settings.billing.pricing.perMonth': '/month',
        'settings.billing.pricing.perYear': '/year',
        'settings.billing.pricing.loadingPlans': 'Loading plans...',
        'settings.billing.pricing.currentPlan': 'Current plan',
        'settings.billing.pricing.manageInPortal': 'Manage in billing portal',
        'settings.billing.pricing.features.free.one': 'Feature A',
        'settings.billing.pricing.features.free.two': 'Feature B',
        'settings.billing.pricing.features.free.three': 'Feature C',
        'settings.billing.pricing.features.premium.one': 'Feature P1',
        'settings.billing.pricing.features.premium.two': 'Feature P2',
        'settings.billing.pricing.features.premium.three': 'Feature P3',
        'settings.billing.pricing.features.premium.four': 'Feature P4',
        'settings.billing.pricing.features.pro.one': 'Feature R1',
        'settings.billing.pricing.features.pro.two': 'Feature R2',
        'settings.billing.pricing.features.pro.three': 'Feature R3',
        'settings.billing.pricing.features.pro.four': 'Feature R4',
      };

      if (key === 'settings.billing.pricing.savePercent') {
        return `Save ${options?.percent}%`;
      }

      if (key === 'settings.billing.pricing.upgradeTo') {
        return `Upgrade to ${options?.plan}`;
      }

      if (key === 'settings.billing.pricing.limits.goals') {
        return `${options?.count} goals`;
      }

      if (key === 'settings.billing.pricing.limits.habits') {
        return `${options?.count} habits`;
      }

      return map[key] || key;
    },
  }),
}));

const plans: BillingPlanCatalogItem[] = [
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

const makeBillingSummary = (currentPlan: BillingSummary['currentPlan']): BillingSummary => ({
  currentPlan,
  currentPlanDisplayName: currentPlan,
  nextBillingDate: null,
  billingCycle: 'monthly',
  amount: 0,
  currency: 'USD',
  subscriptionStatus: currentPlan === 'free' ? 'free' : 'active',
  cancelAtPeriodEnd: false,
  paymentMethod: { type: 'none' },
  usage: {
    goalsUsed: 0,
    goalsLimit: 10,
    habitsUsed: 0,
    habitsLimit: 10,
  },
});

const renderWithState = (
  billingInfo: BillingSummary | null
): { onCheckout: ReturnType<typeof vi.fn>; onPortalManage: ReturnType<typeof vi.fn> } => {
  const onCheckout = vi.fn();
  const onPortalManage = vi.fn();

  const Harness = (): JSX.Element => {
    const [cycle, setCycle] = useState<BillingCycle>('monthly');
    return (
      <PricingExperience
        plans={plans}
        billingInfo={billingInfo}
        selectedCycle={cycle}
        onCycleChange={setCycle}
        onCheckout={onCheckout}
        onPortalManage={onPortalManage}
        surface="page"
      />
    );
  };

  render(<Harness />);
  return { onCheckout, onPortalManage };
};

describe('PricingExperience', () => {
  it('updates prices and savings when toggling monthly/yearly', () => {
    const onCycleChange = vi.fn();
    const billingInfo = makeBillingSummary('free');
    const onCheckout = vi.fn();
    const onPortalManage = vi.fn();

    const { rerender } = render(
      <PricingExperience
        plans={plans}
        billingInfo={billingInfo}
        selectedCycle="monthly"
        onCycleChange={onCycleChange}
        onCheckout={onCheckout}
        onPortalManage={onPortalManage}
        surface="page"
      />
    );

    const premiumHeading = screen.getByRole('heading', { name: 'Premium Plan' });
    const premiumCard = premiumHeading.closest('article');
    expect(premiumCard).not.toBeNull();

    expect(within(premiumCard as HTMLElement).queryByText('$10')).not.toBeNull();
    expect(screen.getAllByText('Save 20%').length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: 'Yearly' }));
    expect(onCycleChange).toHaveBeenCalledWith('yearly');

    rerender(
      <PricingExperience
        plans={plans}
        billingInfo={billingInfo}
        selectedCycle="yearly"
        onCycleChange={onCycleChange}
        onCheckout={onCheckout}
        onPortalManage={onPortalManage}
        surface="page"
      />
    );

    const updatedPremiumHeading = screen.getByRole('heading', { name: 'Premium Plan' });
    const updatedPremiumCard = updatedPremiumHeading.closest('article');
    expect(updatedPremiumCard).not.toBeNull();
    expect((updatedPremiumCard as HTMLElement).textContent).toContain('96');
  });

  it('dispatches checkout for free users when selecting a paid plan', () => {
    const { onCheckout, onPortalManage } = renderWithState(makeBillingSummary('free'));

    fireEvent.click(screen.getByRole('button', { name: 'Upgrade to Premium Plan' }));

    expect(onCheckout).toHaveBeenCalledWith('premium', 'monthly');
    expect(onPortalManage).not.toHaveBeenCalled();
  });

  it('shows current plan CTA disabled for the active plan', () => {
    renderWithState(makeBillingSummary('premium'));

    const currentPlanButton = screen.getByRole('button', { name: 'Current plan' });
    expect((currentPlanButton as HTMLButtonElement).disabled).toBe(true);
  });
});
