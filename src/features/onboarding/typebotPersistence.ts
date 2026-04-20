import type { SupportedLanguage } from '@/core/i18n';
import {
  type OnboardingMicroPreference,
  type StructuredOnboardingSeed,
} from '@/types/onboarding';
import { getDreamOptions, isOnboardingFocusArea, microPreferenceOptions } from './structuredCatalog';

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

const normalizeMicroPreferences = (value: unknown): OnboardingMicroPreference[] | null => {
  if (!Array.isArray(value)) {
    return [];
  }

  if (value.length > 2) {
    return null;
  }

  const normalized = value.map(entry =>
    isOnboardingMicroPreference(entry) ? entry : null
  );

  if (normalized.some(entry => entry === null)) {
    return null;
  }

  if (new Set(normalized).size !== normalized.length) {
    return null;
  }

  return normalized;
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

const isConsistentRegenerationState = (
  regenerationCount: number,
  usedRegeneration: boolean
): boolean =>
  (usedRegeneration && regenerationCount > 0) || (!usedRegeneration && regenerationCount === 0);

const resolveCatalogDream = (
  focusArea: Parameters<typeof getDreamOptions>[0],
  selectedDreamKey: string
) => {
  const dream = getDreamOptions(focusArea).find(option => option.key === selectedDreamKey);

  return dream ?? null;
};

const englishDreamLabelByKey: Record<string, string> = {
  'sleep-with-consistency': 'Sleep more consistently',
  'build-weekly-movement': 'Get back to moving every week',
  'eat-with-more-intention': 'Eat with more intention',
  'reduce-daily-stress': 'Reduce daily stress',
  'feel-stronger-in-my-body': 'Feel stronger in my body',
  'be-more-present-with-family': 'Be more present with my family',
  'strengthen-my-relationship': 'Strengthen my relationship',
  'reconnect-with-friends': 'Reconnect with important friends',
  'communicate-with-more-clarity': 'Communicate with more clarity',
  'create-more-quality-moments': 'Create more quality moments',
  'build-an-emergency-fund': 'Build my emergency fund',
  'gain-control-of-my-spending': 'Gain more control over my spending',
  'save-for-an-important-goal': 'Save for an important goal',
  'organize-my-financial-routine': 'Organize my financial routine',
  'feel-more-peace-about-money': 'Feel more peace around money',
};

const resolveDreamLabel = (
  preferredLabel: unknown,
  selectedDream: NonNullable<ReturnType<typeof resolveCatalogDream>>,
  locale: SupportedLanguage
): string => {
  const payloadLabel = toTrimmedString(preferredLabel);
  if (payloadLabel) {
    return payloadLabel;
  }

  if (locale === 'en') {
    return englishDreamLabelByKey[selectedDream.key] ?? selectedDream.label;
  }

  return selectedDream.label;
};

export const extractStructuredOnboardingSeed = (
  value: unknown,
  expectedSignal: string,
  locale: SupportedLanguage
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
  const regenerationCount = normalizeRegenerationCount(value.regenerationCount);
  const usedRegeneration = normalizeUsedRegeneration(value.usedRegeneration);
  const microPreferences = normalizeMicroPreferences(value.microPreferences);

  if (
    !focusArea ||
    !isOnboardingFocusArea(focusArea) ||
    !selectedDreamKey ||
    regenerationCount === null ||
    usedRegeneration === null ||
    microPreferences === null
  ) {
    return null;
  }

  const selectedDream = resolveCatalogDream(focusArea, selectedDreamKey);
  if (!selectedDream || !isConsistentRegenerationState(regenerationCount, usedRegeneration)) {
    return null;
  }

  return {
    focusArea,
    selectedDreamKey,
    selectedDreamLabel: resolveDreamLabel(value.selectedDreamLabel, selectedDream, locale),
    microPreferences,
    regenerationCount,
    usedRegeneration,
  };
};
