import type { OnboardingState } from '@/types/onboarding';

type OnboardingStatus = 'skipped' | 'completed';

export interface OnboardingIdentity {
  id: string;
  email?: string | null;
  createdAt?: string | null;
  lastSignInAt?: string | null;
}

interface PendingSignupRecord {
  email: string;
  createdAt: string;
}

interface PersistedOnboardingRecord {
  status: OnboardingStatus;
  updatedAt: string;
}

const PENDING_SIGNUP_KEY = 'we-better:onboarding:pending-signup';
const ONBOARDING_STATE_KEY_PREFIX = 'we-better:onboarding:state:';
const FRESH_ACCOUNT_WINDOW_MS = 1000 * 60 * 60 * 24;
const FIRST_ACCESS_SIGN_IN_DRIFT_MS = 1000 * 60 * 15;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const normalizeEmail = (value?: string | null): string => value?.trim().toLowerCase() ?? '';

const readJson = <T>(key: string): T | null => {
  try {
    const rawValue = window.localStorage.getItem(key);

    if (!rawValue) {
      return null;
    }

    return JSON.parse(rawValue) as T;
  } catch {
    return null;
  }
};

const writeJson = (key: string, value: unknown): void => {
  window.localStorage.setItem(key, JSON.stringify(value));
};

const getOnboardingStateKey = (userId: string): string => `${ONBOARDING_STATE_KEY_PREFIX}${userId}`;

const readPersistedOnboardingRecord = (userId: string): PersistedOnboardingRecord | null => {
  const value = readJson<unknown>(getOnboardingStateKey(userId));

  if (!isRecord(value) || typeof value.status !== 'string' || typeof value.updatedAt !== 'string') {
    return null;
  }

  if (value.status !== 'skipped' && value.status !== 'completed') {
    return null;
  }

  return {
    status: value.status,
    updatedAt: value.updatedAt,
  };
};

const readPendingSignupRecord = (): PendingSignupRecord | null => {
  const value = readJson<unknown>(PENDING_SIGNUP_KEY);

  if (!isRecord(value) || typeof value.email !== 'string' || typeof value.createdAt !== 'string') {
    return null;
  }

  return {
    email: normalizeEmail(value.email),
    createdAt: value.createdAt,
  };
};

const clearPendingSignupIfMatches = (email?: string | null): void => {
  const pendingRecord = readPendingSignupRecord();

  if (!pendingRecord) {
    return;
  }

  if (normalizeEmail(email) === pendingRecord.email) {
    window.localStorage.removeItem(PENDING_SIGNUP_KEY);
  }
};

const toRequiredState = (): OnboardingState => ({
  required: true,
  skippedAt: null,
  completedAt: null,
});

const toPersistedState = (record: PersistedOnboardingRecord): OnboardingState =>
  record.status === 'completed'
    ? {
        required: false,
        skippedAt: null,
        completedAt: record.updatedAt,
      }
    : {
        required: true,
        skippedAt: record.updatedAt,
        completedAt: null,
      };

const isLikelyFirstAccess = (identity: OnboardingIdentity): boolean => {
  if (!identity.createdAt) {
    return false;
  }

  const createdAt = Date.parse(identity.createdAt);

  if (Number.isNaN(createdAt)) {
    return false;
  }

  const accountAgeMs = Date.now() - createdAt;

  if (accountAgeMs < 0 || accountAgeMs > FRESH_ACCOUNT_WINDOW_MS) {
    return false;
  }

  if (!identity.lastSignInAt) {
    return true;
  }

  const lastSignInAt = Date.parse(identity.lastSignInAt);

  if (Number.isNaN(lastSignInAt)) {
    return false;
  }

  return Math.abs(lastSignInAt - createdAt) <= FIRST_ACCESS_SIGN_IN_DRIFT_MS;
};

export const markPendingOnboardingSignup = (email: string): void => {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    return;
  }

  writeJson(PENDING_SIGNUP_KEY, {
    email: normalizedEmail,
    createdAt: new Date().toISOString(),
  } satisfies PendingSignupRecord);
};

export const clearPendingOnboardingSignup = (): void => {
  window.localStorage.removeItem(PENDING_SIGNUP_KEY);
};

export const deriveOnboardingState = (
  identity: OnboardingIdentity,
  remoteOnboarding?: OnboardingState | null
): OnboardingState | null => {
  if (remoteOnboarding) {
    return remoteOnboarding;
  }

  const persistedRecord = readPersistedOnboardingRecord(identity.id);

  if (persistedRecord) {
    return toPersistedState(persistedRecord);
  }

  const normalizedEmail = normalizeEmail(identity.email);
  const pendingSignup = readPendingSignupRecord();

  if (pendingSignup && pendingSignup.email === normalizedEmail) {
    return toRequiredState();
  }

  if (isLikelyFirstAccess(identity)) {
    return toRequiredState();
  }

  return null;
};

export const markOnboardingSkippedLocally = (identity: OnboardingIdentity): OnboardingState => {
  const skippedAt = new Date().toISOString();

  writeJson(getOnboardingStateKey(identity.id), {
    status: 'skipped',
    updatedAt: skippedAt,
  } satisfies PersistedOnboardingRecord);
  clearPendingSignupIfMatches(identity.email);

  return {
    required: true,
    skippedAt,
    completedAt: null,
  };
};

export const markOnboardingCompletedLocally = (identity: OnboardingIdentity): OnboardingState => {
  const completedAt = new Date().toISOString();

  writeJson(getOnboardingStateKey(identity.id), {
    status: 'completed',
    updatedAt: completedAt,
  } satisfies PersistedOnboardingRecord);
  clearPendingSignupIfMatches(identity.email);

  return {
    required: false,
    skippedAt: null,
    completedAt,
  };
};
