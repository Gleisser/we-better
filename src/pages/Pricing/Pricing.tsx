import PricingExperience from '@/shared/components/billing/PricingExperience/PricingExperience';
import { useBillingSummary } from '@/shared/hooks/useBillingSummary';
import { useBillingStripeActions } from '@/shared/hooks/useBillingStripeActions';
import { usePlanCatalog } from '@/shared/hooks/usePlanCatalog';
import styles from './Pricing.module.css';

const Pricing = (): JSX.Element => {
  const { plans: planCatalog, error: catalogError, isLoading: isCatalogLoading } = usePlanCatalog();
  const {
    data: billingInfo,
    error: billingError,
    isLoading: isBillingLoading,
  } = useBillingSummary();
  const {
    selectedCycle,
    setSelectedCycle,
    isActionLoading,
    actionError,
    openPortalSession,
    manageOrStartCheckout,
  } = useBillingStripeActions({
    billingInfo,
    checkoutErrorMessage: 'Failed to start checkout',
    openPortalErrorMessage: 'Failed to open billing portal',
  });

  return (
    <section className={styles.page}>
      <PricingExperience
        plans={planCatalog}
        billingInfo={billingInfo}
        selectedCycle={selectedCycle}
        onCycleChange={setSelectedCycle}
        onCheckout={(plan, cycle) => {
          void manageOrStartCheckout(plan, cycle);
        }}
        onPortalManage={() => {
          void openPortalSession('manage');
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
