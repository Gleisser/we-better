import { useCallback, useEffect, useState } from 'react';
import PricingExperience from '@/shared/components/billing/PricingExperience/PricingExperience';
import {
  billingService,
  type BillingCycle,
  type BillingPlanCatalogItem,
  type PlanCode,
} from '@/core/services/billingService';
import { useBillingSummary } from '@/shared/hooks/useBillingSummary';
import styles from './Pricing.module.css';

type PaidPlanCode = Exclude<PlanCode, 'free'>;

const Pricing = (): JSX.Element => {
  const [planCatalog, setPlanCatalog] = useState<BillingPlanCatalogItem[]>([]);
  const [selectedCycle, setSelectedCycle] = useState<BillingCycle>('monthly');
  const [isCatalogLoading, setIsCatalogLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const {
    data: billingInfo,
    error: billingError,
    isLoading: isBillingLoading,
  } = useBillingSummary();

  const loadPlanCatalog = useCallback(async (): Promise<void> => {
    setIsCatalogLoading(true);
    setCatalogError(null);

    const catalogResult = await billingService.getPlanCatalog();
    if (catalogResult.error) {
      setCatalogError(catalogResult.error);
    }

    if (catalogResult.data) {
      setPlanCatalog(catalogResult.data);
    }

    setIsCatalogLoading(false);
  }, []);

  useEffect(() => {
    void loadPlanCatalog();
  }, [loadPlanCatalog]);

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
