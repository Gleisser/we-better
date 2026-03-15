import { useEffect, useState } from 'react';
import PricingExperience from '@/shared/components/billing/PricingExperience/PricingExperience';
import { billingService, type BillingCycle, type PlanCode } from '@/core/services/billingService';
import { useBillingSummary } from '@/shared/hooks/useBillingSummary';
import { usePlanCatalog } from '@/shared/hooks/usePlanCatalog';
import styles from './Pricing.module.css';

type PaidPlanCode = Exclude<PlanCode, 'free'>;

const Pricing = (): JSX.Element => {
  const [selectedCycle, setSelectedCycle] = useState<BillingCycle>('monthly');
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const { plans: planCatalog, error: catalogError, isLoading: isCatalogLoading } = usePlanCatalog();
  const {
    data: billingInfo,
    error: billingError,
    isLoading: isBillingLoading,
  } = useBillingSummary();

  useEffect(() => {
    if (billingInfo?.billingCycle) {
      setSelectedCycle(billingInfo.billingCycle);
    }
  }, [billingInfo?.billingCycle]);

  const buildReturnUrl = (): string => {
    return window.location.href;
  };

  const openPortalSession = async (): Promise<void> => {
    setIsActionLoading(true);
    setActionError(null);

    const { data, error: portalError } = await billingService.createPortalSession(
      'manage',
      buildReturnUrl()
    );

    if (portalError || !data?.url) {
      setActionError(portalError || 'Failed to open billing portal');
      setIsActionLoading(false);
      return;
    }

    window.location.assign(data.url);
  };

  const handleCheckout = async (planCode: PaidPlanCode, cycle: BillingCycle): Promise<void> => {
    if (billingInfo && billingInfo.currentPlan !== 'free') {
      await openPortalSession();
      return;
    }

    setIsActionLoading(true);
    setActionError(null);

    const successUrl = new URL(window.location.href);
    successUrl.searchParams.set('billing', 'success');
    const cancelUrl = new URL(window.location.href);
    cancelUrl.searchParams.set('billing', 'cancel');

    const { data, error: checkoutError } = await billingService.createCheckoutSession(
      planCode,
      cycle,
      successUrl.toString(),
      cancelUrl.toString()
    );

    if (checkoutError || !data?.url) {
      setActionError(checkoutError || 'Failed to start checkout');
      setIsActionLoading(false);
      return;
    }

    window.location.assign(data.url);
  };

  return (
    <section className={styles.page}>
      <PricingExperience
        plans={planCatalog}
        billingInfo={billingInfo}
        selectedCycle={selectedCycle}
        onCycleChange={setSelectedCycle}
        onCheckout={(plan, cycle) => {
          void handleCheckout(plan, cycle);
        }}
        onPortalManage={() => {
          void openPortalSession();
        }}
        surface="page"
        isLoading={isCatalogLoading || isBillingLoading}
        isBusy={isActionLoading}
        error={actionError || catalogError || billingError}
      />
    </section>
  );
};

export default Pricing;
