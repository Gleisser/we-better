import { useCallback, useEffect, useState } from 'react';
import {
  billingService,
  type BillingCycle,
  type BillingSummary,
  type PlanCode,
  type PortalFlow,
} from '@/core/services/billingService';

type PaidPlanCode = Exclude<PlanCode, 'free'>;

interface UseBillingStripeActionsOptions {
  billingInfo: BillingSummary | null;
  checkoutErrorMessage: string;
  openPortalErrorMessage: string;
}

interface ManagePlanOptions {
  onFreePlan?: () => void;
}

interface UseBillingStripeActionsResult {
  selectedCycle: BillingCycle;
  setSelectedCycle: (cycle: BillingCycle) => void;
  isActionLoading: boolean;
  actionError: string | null;
  openPortalSession: (flow: PortalFlow) => Promise<boolean>;
  managePlan: (options?: ManagePlanOptions) => Promise<boolean>;
  startCheckout: (planCode: PaidPlanCode, cycle: BillingCycle) => Promise<boolean>;
  manageOrStartCheckout: (planCode: PaidPlanCode, cycle: BillingCycle) => Promise<boolean>;
}

const buildReturnUrl = (): string => window.location.href;

const buildCheckoutUrls = (): { successUrl: string; cancelUrl: string } => {
  const successUrl = new URL(window.location.href);
  successUrl.searchParams.set('billing', 'success');

  const cancelUrl = new URL(window.location.href);
  cancelUrl.searchParams.set('billing', 'cancel');

  return {
    successUrl: successUrl.toString(),
    cancelUrl: cancelUrl.toString(),
  };
};

export function useBillingStripeActions({
  billingInfo,
  checkoutErrorMessage,
  openPortalErrorMessage,
}: UseBillingStripeActionsOptions): UseBillingStripeActionsResult {
  const [selectedCycle, setSelectedCycle] = useState<BillingCycle>('monthly');
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (billingInfo?.billingCycle) {
      setSelectedCycle(billingInfo.billingCycle);
    }
  }, [billingInfo?.billingCycle]);

  const openPortalSession = useCallback(
    async (flow: PortalFlow): Promise<boolean> => {
      setIsActionLoading(true);
      setActionError(null);

      const { data, error } = await billingService.createPortalSession(flow, buildReturnUrl());
      if (error || !data?.url) {
        setActionError(error || openPortalErrorMessage);
        setIsActionLoading(false);
        return false;
      }

      window.location.assign(data.url);
      return true;
    },
    [openPortalErrorMessage]
  );

  const startCheckout = useCallback(
    async (planCode: PaidPlanCode, cycle: BillingCycle): Promise<boolean> => {
      setIsActionLoading(true);
      setActionError(null);

      const { successUrl, cancelUrl } = buildCheckoutUrls();
      const { data, error } = await billingService.createCheckoutSession(
        planCode,
        cycle,
        successUrl,
        cancelUrl
      );

      if (error || !data?.url) {
        setActionError(error || checkoutErrorMessage);
        setIsActionLoading(false);
        return false;
      }

      window.location.assign(data.url);
      return true;
    },
    [checkoutErrorMessage]
  );

  const managePlan = useCallback(
    async (options?: ManagePlanOptions): Promise<boolean> => {
      if (!billingInfo) {
        return false;
      }

      setActionError(null);

      if (billingInfo.currentPlan === 'free') {
        options?.onFreePlan?.();
        return true;
      }

      return openPortalSession('manage');
    },
    [billingInfo, openPortalSession]
  );

  const manageOrStartCheckout = useCallback(
    async (planCode: PaidPlanCode, cycle: BillingCycle): Promise<boolean> => {
      if (billingInfo && billingInfo.currentPlan !== 'free') {
        return openPortalSession('manage');
      }

      return startCheckout(planCode, cycle);
    },
    [billingInfo, openPortalSession, startCheckout]
  );

  return {
    selectedCycle,
    setSelectedCycle,
    isActionLoading,
    actionError,
    openPortalSession,
    managePlan,
    startCheckout,
    manageOrStartCheckout,
  };
}

export default useBillingStripeActions;
