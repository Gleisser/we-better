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

export const requiresOnboarding = (onboarding?: OnboardingState | null): boolean =>
  Boolean(onboarding?.required && !onboarding.skippedAt && !onboarding.completedAt);
