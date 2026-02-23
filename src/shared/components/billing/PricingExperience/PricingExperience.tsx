import { useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useCommonTranslation } from '@/shared/hooks/useTranslation';
import {
  type BillingCycle,
  type BillingPlanCatalogItem,
  type BillingSummary,
  type PlanCode,
  getBillingAmountFromCents,
  getYearlySavingsPercent,
} from '@/core/services/billingService';
import styles from './PricingExperience.module.css';

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

const getPlanCodeClass = (code: PlanCode): string => {
  switch (code) {
    case 'premium':
      return styles.premium;
    case 'pro':
      return styles.pro;
    default:
      return styles.free;
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
  const surfaceClass = surface === 'page' ? styles.pageSurface : styles.modalSurface;

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
    <div className={`${styles.pricingShell} ${surfaceClass}`}>
      <div className={styles.auroraBackdrop} aria-hidden="true">
        <motion.div
          className={styles.auroraBlobOne}
          animate={prefersReducedMotion ? {} : { x: [0, 24, -16, 0], y: [0, -16, 20, 0] }}
          transition={
            prefersReducedMotion
              ? undefined
              : { duration: 16, ease: 'easeInOut', repeat: Number.POSITIVE_INFINITY }
          }
        />
        <motion.div
          className={styles.auroraBlobTwo}
          animate={prefersReducedMotion ? {} : { x: [0, -18, 22, 0], y: [0, 24, -10, 0] }}
          transition={
            prefersReducedMotion
              ? undefined
              : { duration: 19, ease: 'easeInOut', repeat: Number.POSITIVE_INFINITY }
          }
        />
        <div className={styles.gridOverlay} />
        <div className={styles.vignette} />
      </div>

      <div className={styles.inner}>
        <header className={styles.header}>
          <h2 className={styles.title}>{t('settings.billing.pricing.title') as string}</h2>
          <p className={styles.subtitle}>{t('settings.billing.pricing.subtitle') as string}</p>
        </header>

        <div className={styles.billingCycleRow}>
          <div
            className={styles.billingToggle}
            role="group"
            aria-label={t('settings.billing.pricing.selectCycle') as string}
          >
            <button
              type="button"
              className={`${styles.billingToggleButton} ${
                selectedCycle === 'monthly' ? styles.billingToggleButtonActive : ''
              }`}
              onClick={() => onCycleChange('monthly')}
              disabled={isBusy}
            >
              {t('settings.billing.pricing.monthly') as string}
            </button>
            <button
              type="button"
              className={`${styles.billingToggleButton} ${
                selectedCycle === 'yearly' ? styles.billingToggleButtonActive : ''
              }`}
              onClick={() => onCycleChange('yearly')}
              disabled={isBusy}
            >
              {t('settings.billing.pricing.yearly') as string}
            </button>
          </div>

          {maxSavings !== null && maxSavings > 0 && (
            <span className={styles.savingsBadge}>
              {t('settings.billing.pricing.savePercent', { percent: maxSavings }) as string}
            </span>
          )}
        </div>

        {error && <p className={styles.errorText}>{error}</p>}

        {(isLoading || sortedPlans.length === 0) && !error && (
          <p className={styles.statusText}>
            {t('settings.billing.pricing.loadingPlans') as string}
          </p>
        )}

        {!isLoading && sortedPlans.length > 0 && (
          <div className={styles.planGrid}>
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
                    className={`${styles.planCard} ${getPlanCodeClass(plan.code)} ${
                      isFeatured ? styles.featuredPlan : ''
                    }`}
                    initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: prefersReducedMotion ? 0 : index * 0.06 }}
                  >
                    <div className={styles.planTop}>
                      {isFeatured && (
                        <span className={styles.popularTag}>
                          {t('settings.billing.pricing.mostPopular') as string}
                        </span>
                      )}
                      {selectedCycle === 'yearly' && savings !== null && savings > 0 && (
                        <span className={styles.planSavingsTag}>
                          {
                            t('settings.billing.pricing.savePercent', {
                              percent: savings,
                            }) as string
                          }
                        </span>
                      )}
                    </div>

                    <h3 className={styles.planTitle}>{planName}</h3>
                    <div className={styles.priceRow}>
                      <span className={styles.price}>{getPlanPrice(plan)}</span>
                      {getPriceSuffix(plan) && (
                        <span className={styles.priceSuffix}>{getPriceSuffix(plan)}</span>
                      )}
                    </div>

                    <ul className={styles.featuresList}>
                      {PLAN_FEATURE_KEYS[plan.code].map(featureKey => (
                        <li key={featureKey} className={styles.featureItem}>
                          <span className={styles.featureDot} aria-hidden="true">
                            ✓
                          </span>
                          <span>{t(featureKey) as string}</span>
                        </li>
                      ))}
                    </ul>

                    <div className={styles.limitsRow}>
                      <span className={styles.limitPill}>
                        {
                          t('settings.billing.pricing.limits.goals', {
                            count: plan.goalsLimit,
                          }) as string
                        }
                      </span>
                      <span className={styles.limitPill}>
                        {
                          t('settings.billing.pricing.limits.habits', {
                            count: plan.habitsLimit,
                          }) as string
                        }
                      </span>
                    </div>

                    <button
                      type="button"
                      className={styles.planCta}
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
