import { useCallback, useEffect, useState } from 'react';
import PricingExperience from '@/shared/components/billing/PricingExperience/PricingExperience';
import {
  billingService,
  type BillingCycle,
  type BillingPlanCatalogItem,
  type BillingSummary,
  type PlanCode,
} from '@/core/services/billingService';
import styles from './Pricing.module.css';

type PaidPlanCode = Exclude<PlanCode, 'free'>;

const Pricing = (): JSX.Element => {
  const [billingInfo, setBillingInfo] = useState<BillingSummary | null>(null);
  const [planCatalog, setPlanCatalog] = useState<BillingPlanCatalogItem[]>([]);
  const [selectedCycle, setSelectedCycle] = useState<BillingCycle>('monthly');
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPricingData = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    const [summaryResult, catalogResult] = await Promise.all([
      billingService.getBillingSummary(),
      billingService.getPlanCatalog(),
    ]);

    if (summaryResult.error) {
      setError(summaryResult.error);
    }

    if (catalogResult.error) {
      setError(prev => prev || catalogResult.error);
    }

    if (summaryResult.data) {
      setBillingInfo(summaryResult.data);
      if (summaryResult.data.billingCycle) {
        setSelectedCycle(summaryResult.data.billingCycle);
      }
    }

    if (catalogResult.data) {
      setPlanCatalog(catalogResult.data);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    void loadPricingData();
  }, [loadPricingData]);

  const buildReturnUrl = (): string => {
    return window.location.href;
  };

  const openPortalSession = async (): Promise<void> => {
    setIsActionLoading(true);
    setError(null);

    const { data, error: portalError } = await billingService.createPortalSession(
      'manage',
      buildReturnUrl()
    );

    if (portalError || !data?.url) {
      setError(portalError || 'Failed to open billing portal');
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
    setError(null);

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
      setError(checkoutError || 'Failed to start checkout');
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
        isLoading={isLoading}
        isBusy={isActionLoading}
        error={error}
      />
    </section>
  );
};

export default Pricing;
