import type { SupportedLanguage } from '@/core/i18n';

export interface OnboardingState {
  required: boolean;
  skippedAt?: string | null;
  completedAt?: string | null;
}

export type OnboardingFocusArea = 'health' | 'relationships' | 'finances';

export type OnboardingMicroPreference =
  | 'more-ambitious'
  | 'lighter'
  | 'faster'
  | 'more-transformative';

export interface OnboardingDreamOption {
  key: string;
  focusArea: OnboardingFocusArea;
  label: string;
  summary: string;
  source: 'curated' | 'generated';
}

export interface StructuredOnboardingSeed {
  focusArea: OnboardingFocusArea;
  selectedDreamKey: string;
  selectedDreamLabel: string;
  usedRegeneration: boolean;
  microPreferences: OnboardingMicroPreference[];
  regenerationCount: number;
}

export interface OnboardingControlOption {
  value: string;
  label: string;
}

export interface OnboardingControl {
  id: string;
  label: string;
  kind: 'slider' | 'chips';
  value: string;
  options: OnboardingControlOption[];
}

export interface OnboardingStarterPlan {
  locale: SupportedLanguage;
  focusArea: OnboardingFocusArea;
  dream: {
    key: string;
    label: string;
  };
  goal: {
    title: string;
  };
  habit: {
    title: string;
  };
  controls: OnboardingControl[];
}

export const requiresOnboarding = (onboarding?: OnboardingState | null): boolean =>
  Boolean(onboarding?.required && !onboarding.skippedAt && !onboarding.completedAt);
