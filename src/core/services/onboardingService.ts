import { createAppApiUrl } from '@/core/config/appApi';
import { supabase } from '@/core/services/supabaseClient';
import type { OnboardingState } from '@/types/onboarding';

const API_BASE_URL = createAppApiUrl('/onboarding');

interface OnboardingActionResponse {
  onboarding?: OnboardingState;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isOnboardingState = (value: unknown): value is OnboardingState => {
  if (!isRecord(value) || typeof value.required !== 'boolean') {
    return false;
  }

  const skippedAt = value.skippedAt;
  const completedAt = value.completedAt;

  return (
    (skippedAt === undefined || skippedAt === null || typeof skippedAt === 'string') &&
    (completedAt === undefined || completedAt === null || typeof completedAt === 'string')
  );
};

const extractOnboardingState = (payload: unknown): OnboardingState | null => {
  if (!isRecord(payload)) {
    return null;
  }

  if (isOnboardingState(payload.onboarding)) {
    return payload.onboarding;
  }

  return null;
};

const getAuthToken = async (): Promise<string | null> => {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  } catch (error) {
    console.error('Error getting auth token for onboarding:', error);
    return null;
  }
};

const postOnboardingAction = async (
  path: string
): Promise<{ data: OnboardingState | null; error: string | null }> => {
  try {
    const token = await getAuthToken();

    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });

    if (response.status === 204) {
      return {
        data: null,
        error: null,
      };
    }

    const payload = (await response.json().catch(() => null)) as OnboardingActionResponse | null;

    if (!response.ok) {
      const errorMessage =
        payload && isRecord(payload) && typeof payload.error === 'string'
          ? payload.error
          : `Request failed with status ${response.status}`;

      throw new Error(errorMessage);
    }

    return {
      data: extractOnboardingState(payload),
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to update onboarding',
    };
  }
};

export const onboardingService = {
  skip(): Promise<{ data: OnboardingState | null; error: string | null }> {
    return postOnboardingAction('skip');
  },

  complete(): Promise<{ data: OnboardingState | null; error: string | null }> {
    return postOnboardingAction('complete');
  },
};
