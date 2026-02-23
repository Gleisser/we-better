import { supabase } from './supabaseClient';

const API_BASE_URL = `${import.meta.env.VITE_API_BACKEND_URL || 'http://localhost:3000'}/api/billing`;

export type PlanCode = 'free' | 'premium' | 'pro';
export type BillingCycle = 'monthly' | 'yearly';
export type PortalFlow = 'manage' | 'payment_method_update' | 'history' | 'cancel';

export interface BillingSummary {
  currentPlan: PlanCode;
  currentPlanDisplayName: string;
  nextBillingDate: string | null;
  billingCycle: BillingCycle | null;
  amount: number;
  currency: string;
  subscriptionStatus: string;
  cancelAtPeriodEnd: boolean;
  paymentMethod: {
    type: 'card' | 'none';
    lastFour?: string;
    brand?: string;
  };
  usage: {
    goalsUsed: number;
    goalsLimit: number;
    habitsUsed: number;
    habitsLimit: number;
  };
}

export interface BillingPlanCatalogItem {
  code: PlanCode;
  displayName: string;
  goalsLimit: number;
  habitsLimit: number;
  monthlyPriceCents: number | null;
  yearlyPriceCents: number | null;
  isActive: boolean;
  currency: string;
}

interface PlanCatalogResponse {
  plans: BillingPlanCatalogItem[];
}

interface CheckoutSessionResponse {
  url: string;
  sessionId: string;
}

interface PortalSessionResponse {
  url: string;
}

export const getBillingAmountFromCents = (cents: number | null | undefined): number =>
  cents && cents > 0 ? cents / 100 : 0;

export const getYearlySavingsPercent = (
  monthlyPriceCents: number | null | undefined,
  yearlyPriceCents: number | null | undefined
): number | null => {
  if (!monthlyPriceCents || !yearlyPriceCents || monthlyPriceCents <= 0 || yearlyPriceCents <= 0) {
    return null;
  }

  const monthlyYearTotal = monthlyPriceCents * 12;
  if (monthlyYearTotal <= yearlyPriceCents) {
    return 0;
  }

  return Math.round((1 - yearlyPriceCents / monthlyYearTotal) * 100);
};

const getAuthToken = async (): Promise<string | null> => {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  } catch (error) {
    console.error('Error getting auth token for billing API:', error);
    return null;
  }
};

const apiRequest = async <T>(
  endpoint: string,
  method: 'GET' | 'POST' = 'GET',
  body?: Record<string, unknown>
): Promise<T> => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(endpoint, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;

  if (!response.ok) {
    const errorMessage =
      typeof payload.error === 'string'
        ? payload.error
        : `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return payload as T;
};

class BillingService {
  private static instance: BillingService;

  private constructor() {}

  public static getInstance(): BillingService {
    if (!BillingService.instance) {
      BillingService.instance = new BillingService();
    }

    return BillingService.instance;
  }

  async getBillingSummary(): Promise<{ data: BillingSummary | null; error: string | null }> {
    try {
      const data = await apiRequest<BillingSummary>(`${API_BASE_URL}/summary`);
      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch billing summary',
      };
    }
  }

  async getPlanCatalog(): Promise<{ data: BillingPlanCatalogItem[] | null; error: string | null }> {
    try {
      const data = await apiRequest<PlanCatalogResponse>(`${API_BASE_URL}/plan-catalog`);
      return { data: data.plans || [], error: null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch billing plan catalog',
      };
    }
  }

  async createCheckoutSession(
    planCode: PlanCode,
    billingCycle: BillingCycle,
    successUrl: string,
    cancelUrl: string
  ): Promise<{ data: CheckoutSessionResponse | null; error: string | null }> {
    try {
      const data = await apiRequest<CheckoutSessionResponse>(
        `${API_BASE_URL}/checkout-session`,
        'POST',
        {
          planCode,
          billingCycle,
          successUrl,
          cancelUrl,
        }
      );
      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to create checkout session',
      };
    }
  }

  async createPortalSession(
    flow: PortalFlow,
    returnUrl: string
  ): Promise<{ data: PortalSessionResponse | null; error: string | null }> {
    try {
      const data = await apiRequest<PortalSessionResponse>(
        `${API_BASE_URL}/portal-session`,
        'POST',
        {
          flow,
          returnUrl,
        }
      );
      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to create portal session',
      };
    }
  }
}

export const billingService = BillingService.getInstance();
