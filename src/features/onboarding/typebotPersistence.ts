import {
  type OnboardingMicroPreference,
  type StructuredOnboardingSeed,
} from '@/types/onboarding';
import { isOnboardingFocusArea, microPreferenceOptions } from './structuredCatalog';

const toTrimmedString = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isOnboardingMicroPreference = (value: unknown): value is OnboardingMicroPreference =>
  microPreferenceOptions.includes(value as OnboardingMicroPreference);

const normalizeMicroPreferences = (value: unknown): OnboardingMicroPreference[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isOnboardingMicroPreference).slice(0, 2);
};

const normalizeRegenerationCount = (value: unknown): number | null => {
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    return null;
  }

  if (value < 0 || value > 5) {
    return null;
  }

  return value;
};

const normalizeUsedRegeneration = (value: unknown): boolean | null => {
  if (typeof value !== 'boolean') {
    return null;
  }

  return value;
};

export const extractStructuredOnboardingSeed = (
  value: unknown,
  expectedSignal: string
): StructuredOnboardingSeed | null => {
  if (!isRecord(value)) {
    return null;
  }

  const signal = toTrimmedString(value.signal);
  if (!signal || signal.toLowerCase() !== expectedSignal.trim().toLowerCase()) {
    return null;
  }

  const focusArea = toTrimmedString(value.focusArea);
  const selectedDreamKey = toTrimmedString(value.selectedDreamKey);
  const selectedDreamLabel = toTrimmedString(value.selectedDreamLabel);
  const regenerationCount = normalizeRegenerationCount(value.regenerationCount);
  const usedRegeneration = normalizeUsedRegeneration(value.usedRegeneration);

  if (
    !focusArea ||
    !isOnboardingFocusArea(focusArea) ||
    !selectedDreamKey ||
    !selectedDreamLabel ||
    regenerationCount === null ||
    usedRegeneration === null
  ) {
    return null;
  }

  return {
    focusArea,
    selectedDreamKey,
    selectedDreamLabel,
    microPreferences: normalizeMicroPreferences(value.microPreferences),
    regenerationCount,
    usedRegeneration,
  };
};
