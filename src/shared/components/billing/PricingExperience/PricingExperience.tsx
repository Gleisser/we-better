import { useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useCommonTranslation } from '@/shared/hooks/useTranslation';
import { cn } from '@/utils/classnames';
import {
  type BillingCycle,
  type BillingPlanCatalogItem,
  type BillingSummary,
  type PlanCode,
  getBillingAmountFromCents,
  getYearlySavingsPercent,
} from '@/core/services/billingService';

type PaidPlanCode = Exclude<PlanCode, 'free'>;

const PLAN_ORDER: PlanCode[] = ['free', 'premium', 'pro'];
const PLAN_FEATURE_KEYS: Record<PlanCode, string[]> = {
  free: [
    'settings.billing.pricing.features.free.one',
    'settings.billing.pricing.features.free.two',
    'settings.billing.pricing.features.free.three',
  ],
  premium: [
    'settings.billing.pricing.features.premium.one',
    'settings.billing.pricing.features.premium.two',
    'settings.billing.pricing.features.premium.three',
    'settings.billing.pricing.features.premium.four',
  ],
  pro: [
    'settings.billing.pricing.features.pro.one',
    'settings.billing.pricing.features.pro.two',
    'settings.billing.pricing.features.pro.three',
    'settings.billing.pricing.features.pro.four',
  ],
};

const PRICING_SHELL_STYLE = {
  background:
    'radial-gradient(circle at 20% 10%, rgba(245, 158, 11, 0.2), transparent 40%), radial-gradient(circle at 80% 0%, rgba(251, 191, 36, 0.14), transparent 35%), #05070f',
} as const;

const GRID_OVERLAY_STYLE = {
  backgroundImage:
    'linear-gradient(to right, rgba(148, 163, 184, 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.06) 1px, transparent 1px)',
  backgroundSize: '30px 30px',
} as const;

const VIGNETTE_STYLE = {
  background: 'radial-gradient(circle at center, transparent 42%, rgba(2, 6, 23, 0.88) 100%)',
} as const;

interface PricingExperienceProps {
  plans: BillingPlanCatalogItem[];
  billingInfo: BillingSummary | null;
  selectedCycle: BillingCycle;
  onCycleChange: (cycle: BillingCycle) => void;
  onCheckout: (plan: PaidPlanCode, cycle: BillingCycle) => void;
  onPortalManage: () => void;
  surface: 'modal' | 'page';
  isLoading?: boolean;
  isBusy?: boolean;
  error?: string | null;
}

const getPlanCtaClass = (code: PlanCode): string => {
  switch (code) {
    case 'free':
      return 'bg-gradient-to-r from-slate-500 to-slate-400 text-white';
    case 'premium':
      return 'bg-gradient-to-r from-amber-500 to-amber-300 text-gray-900';
    case 'pro':
      return 'bg-gradient-to-r from-emerald-500 to-lime-400 text-gray-900';
  }
};

const getSortValue = (code: PlanCode): number => PLAN_ORDER.indexOf(code);

export const PricingExperience = ({
  plans,
  billingInfo,
  selectedCycle,
  onCycleChange,
  onCheckout,
  onPortalManage,
  surface,
  isLoading = false,
  isBusy = false,
  error = null,
}: PricingExperienceProps): JSX.Element => {
  const { t } = useCommonTranslation();
  const prefersReducedMotion = useReducedMotion();

  const sortedPlans = useMemo(
    () =>
      [...plans]
        .filter(plan => plan.isActive)
        .sort((a, b) => getSortValue(a.code) - getSortValue(b.code)),
    [plans]
  );

  const paidPlans = useMemo(() => sortedPlans.filter(plan => plan.code !== 'free'), [sortedPlans]);

  const maxSavings = useMemo(() => {
    const savings = paidPlans
      .map(plan => getYearlySavingsPercent(plan.monthlyPriceCents, plan.yearlyPriceCents))
      .filter((value): value is number => value !== null);

    if (savings.length === 0) return null;
    return Math.max(...savings);
  }, [paidPlans]);

  const currentPlanCode = billingInfo?.currentPlan || 'free';
  const isFreeUser = currentPlanCode === 'free';
  const surfaceClass = surface === 'page' ? 'min-h-full' : 'w-full';

  const formatPrice = (amount: number, currency: string): string => {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  };

  const getPlanName = (code: PlanCode, fallback: string): string => {
    switch (code) {
      case 'free':
        return (t('settings.billing.plans.free') as string) || fallback;
      case 'premium':
        return (t('settings.billing.plans.premium') as string) || fallback;
      case 'pro':
        return (t('settings.billing.plans.pro') as string) || fallback;
      default:
        return fallback;
    }
  };

  const getPlanPrice = (plan: BillingPlanCatalogItem): string => {
    if (plan.code === 'free') {
      return t('settings.billing.freePlanPrice') as string;
    }

    const cents = selectedCycle === 'monthly' ? plan.monthlyPriceCents : plan.yearlyPriceCents;
    const amount = getBillingAmountFromCents(cents);
    return formatPrice(amount, plan.currency);
  };

  const getPriceSuffix = (plan: BillingPlanCatalogItem): string => {
    if (plan.code === 'free') return '';

    if (selectedCycle === 'monthly') {
      return t('settings.billing.pricing.perMonth') as string;
    }

    return t('settings.billing.pricing.perYear') as string;
  };

  const getCtaLabel = (plan: BillingPlanCatalogItem): string => {
    const planName = getPlanName(plan.code, plan.displayName);

    if (plan.code === currentPlanCode) {
      return t('settings.billing.pricing.currentPlan') as string;
    }

    if (!isFreeUser) {
      return t('settings.billing.pricing.manageInPortal') as string;
    }

    if (plan.code === 'free') {
      return t('settings.billing.pricing.currentPlan') as string;
    }

    return t('settings.billing.pricing.upgradeTo', { plan: planName }) as string;
  };

  const isCtaDisabled = (plan: BillingPlanCatalogItem): boolean => {
    if (isBusy) return true;
    return plan.code === currentPlanCode || (isFreeUser && plan.code === 'free');
  };

  const handlePlanAction = (plan: BillingPlanCatalogItem): void => {
    if (plan.code === currentPlanCode) return;

    if (isFreeUser && plan.code !== 'free') {
      onCheckout(plan.code, selectedCycle);
      return;
    }

    onPortalManage();
  };

  return (
    <div
      className={cn(
        'relative isolate overflow-hidden rounded-[24px] border border-amber-400/35 text-slate-50',
        surfaceClass
      )}
      style={PRICING_SHELL_STYLE}
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <motion.div
          className="absolute -left-20 -top-40 h-[360px] w-[360px] rounded-full bg-amber-500/50 opacity-50 blur-[48px]"
          animate={prefersReducedMotion ? {} : { x: [0, 24, -16, 0], y: [0, -16, 20, 0] }}
          transition={
            prefersReducedMotion
              ? undefined
              : { duration: 16, ease: 'easeInOut', repeat: Number.POSITIVE_INFINITY }
          }
        />
        <motion.div
          className="absolute -bottom-[140px] -right-[110px] h-[320px] w-[320px] rounded-full bg-amber-300/40 opacity-50 blur-[48px]"
          animate={prefersReducedMotion ? {} : { x: [0, -18, 22, 0], y: [0, 24, -10, 0] }}
          transition={
            prefersReducedMotion
              ? undefined
              : { duration: 19, ease: 'easeInOut', repeat: Number.POSITIVE_INFINITY }
          }
        />
        <div className="absolute inset-0" style={GRID_OVERLAY_STYLE} />
        <div className="absolute inset-0" style={VIGNETTE_STYLE} />
      </div>

      <div className="relative z-[1] p-[18px] md:p-7">
        <header className="mb-[22px]">
          <h2 className="mb-2 font-plus-jakarta text-[1.6rem] leading-[1.1] md:text-[2rem]">
            {t('settings.billing.pricing.title') as string}
          </h2>
          <p className="m-0 text-[0.98rem] text-slate-300">
            {t('settings.billing.pricing.subtitle') as string}
          </p>
        </header>

        <div className="mb-[22px] flex flex-col items-start gap-3 md:flex-row md:items-center md:justify-between">
          <div
            className="inline-flex items-center rounded-full border border-slate-400/25 bg-slate-900/70 p-1"
            role="group"
            aria-label={t('settings.billing.pricing.selectCycle') as string}
          >
            <button
              type="button"
              className={cn(
                'rounded-full px-[14px] py-2 text-[0.86rem] font-semibold transition-all duration-200',
                selectedCycle === 'monthly'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-300 text-gray-900 shadow-[0_0_20px_rgba(245,158,11,0.5)]'
                  : 'bg-transparent text-slate-300 hover:text-slate-50'
              )}
              onClick={() => onCycleChange('monthly')}
              disabled={isBusy}
            >
              {t('settings.billing.pricing.monthly') as string}
            </button>
            <button
              type="button"
              className={cn(
                'rounded-full px-[14px] py-2 text-[0.86rem] font-semibold transition-all duration-200',
                selectedCycle === 'yearly'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-300 text-gray-900 shadow-[0_0_20px_rgba(245,158,11,0.5)]'
                  : 'bg-transparent text-slate-300 hover:text-slate-50'
              )}
              onClick={() => onCycleChange('yearly')}
              disabled={isBusy}
            >
              {t('settings.billing.pricing.yearly') as string}
            </button>
          </div>

          {maxSavings !== null && maxSavings > 0 && (
            <span className="rounded-full border border-amber-300/45 bg-amber-900/50 px-[10px] py-[6px] text-[0.8rem] font-bold text-amber-100">
              {t('settings.billing.pricing.savePercent', { percent: maxSavings }) as string}
            </span>
          )}
        </div>

        {error && <p className="mb-4 text-[0.92rem] text-rose-300">{error}</p>}

        {(isLoading || sortedPlans.length === 0) && !error && (
          <p className="m-0 text-slate-300">
            {t('settings.billing.pricing.loadingPlans') as string}
          </p>
        )}

        {!isLoading && sortedPlans.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence initial={false}>
              {sortedPlans.map((plan, index) => {
                const isFeatured = plan.code === 'premium';
                const planName = getPlanName(plan.code, plan.displayName);
                const savings = getYearlySavingsPercent(
                  plan.monthlyPriceCents,
                  plan.yearlyPriceCents
                );

                return (
                  <motion.article
                    key={plan.code}
                    className={cn(
                      'flex min-h-full flex-col gap-[14px] rounded-[20px] border border-slate-400/22 bg-gradient-to-b from-slate-900/88 to-slate-950/92 p-[18px] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]',
                      isFeatured &&
                        'border-amber-300/65 shadow-[0_0_0_1px_rgba(245,158,11,0.35),0_0_32px_rgba(245,158,11,0.2)] xl:-translate-y-2'
                    )}
                    initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: prefersReducedMotion ? 0 : index * 0.06 }}
                  >
                    <div className="flex min-h-[20px] items-center justify-between gap-2">
                      {isFeatured && (
                        <span className="rounded-full bg-gradient-to-r from-amber-500 to-amber-300 px-2 py-[5px] text-[0.7rem] font-bold uppercase tracking-[0.08em] text-slate-900">
                          {t('settings.billing.pricing.mostPopular') as string}
                        </span>
                      )}
                      {selectedCycle === 'yearly' && savings !== null && savings > 0 && (
                        <span className="rounded-full border border-amber-300/55 bg-amber-900/40 px-2 py-[5px] text-[0.7rem] font-bold uppercase tracking-[0.08em] text-amber-100">
                          {
                            t('settings.billing.pricing.savePercent', {
                              percent: savings,
                            }) as string
                          }
                        </span>
                      )}
                    </div>

                    <h3 className="m-0 font-plus-jakarta text-[1.35rem]">{planName}</h3>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[2rem] font-bold leading-none">
                        {getPlanPrice(plan)}
                      </span>
                      {getPriceSuffix(plan) && (
                        <span className="text-[0.88rem] text-slate-300">
                          {getPriceSuffix(plan)}
                        </span>
                      )}
                    </div>

                    <ul className="m-0 flex flex-1 list-none flex-col gap-2 p-0">
                      {PLAN_FEATURE_KEYS[plan.code].map(featureKey => (
                        <li
                          key={featureKey}
                          className="flex items-start gap-2 text-[0.92rem] text-slate-200"
                        >
                          <span
                            className="shrink-0 leading-[1.2] text-amber-300"
                            aria-hidden="true"
                          >
                            ✓
                          </span>
                          <span>{t(featureKey) as string}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center rounded-full border border-slate-400/30 bg-slate-900/50 px-2 py-[5px] text-[0.76rem] text-slate-300">
                        {
                          t('settings.billing.pricing.limits.goals', {
                            count: plan.goalsLimit,
                          }) as string
                        }
                      </span>
                      <span className="inline-flex items-center rounded-full border border-slate-400/30 bg-slate-900/50 px-2 py-[5px] text-[0.76rem] text-slate-300">
                        {
                          t('settings.billing.pricing.limits.habits', {
                            count: plan.habitsLimit,
                          }) as string
                        }
                      </span>
                    </div>

                    <button
                      type="button"
                      className={cn(
                        'w-full rounded-xl px-[14px] py-[11px] text-[0.92rem] font-bold transition-[transform,box-shadow,opacity] duration-200 hover:-translate-y-px hover:shadow-[0_8px_20px_rgba(245,158,11,0.45)] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none disabled:hover:translate-y-0',
                        getPlanCtaClass(plan.code)
                      )}
                      onClick={() => handlePlanAction(plan)}
                      disabled={isCtaDisabled(plan)}
                    >
                      {getCtaLabel(plan)}
                    </button>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default PricingExperience;
