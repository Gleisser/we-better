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

interface CheckoutSessionResponse {
  url: string;
  sessionId: string;
}

interface PortalSessionResponse {
  url: string;
}

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
