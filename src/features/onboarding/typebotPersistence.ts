import type { SupportedLanguage } from '@/core/i18n';
import {
  type OnboardingMicroPreference,
  type OnboardingSelectedHabitOption,
  type OnboardingSelectedOption,
  type StructuredOnboardingSeed,
} from '@/types/onboarding';
import {
  getDreamOptions,
  isOnboardingFocusArea,
  microPreferenceOptions,
} from './structuredCatalog';

export interface ObservedTypebotSelections {
  dreamLabel?: string | null;
  focusAreaLabel?: string | null;
}

const toTrimmedString = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const mapFocusArea = (value: string): string => {
  const normalized = value.toLowerCase();
  if (normalized === 'saúde' || normalized === 'saude') return 'health';
  if (normalized === 'relacionamentos') return 'relationships';
  if (normalized === 'finanças' || normalized === 'financas') return 'finances';
  return value;
};

const isVariablePlaceholder = (value: string | null): boolean =>
  Boolean(value && /^var[_-]/i.test(value));

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isOnboardingMicroPreference = (value: unknown): value is OnboardingMicroPreference =>
  microPreferenceOptions.includes(value as OnboardingMicroPreference);

const isIgnorableMicroPreferenceValue = (value: unknown): boolean => {
  if (value === null || value === undefined) {
    return true;
  }

  if (Array.isArray(value) || typeof value === 'object') {
    return false;
  }

  const asString = toTrimmedString(value);
  return !asString || isVariablePlaceholder(asString);
};

const normalizeMicroPreferences = (value: unknown): OnboardingMicroPreference[] | null => {
  if (isIgnorableMicroPreferenceValue(value)) {
    return [];
  }

  if (!Array.isArray(value)) {
    return [];
  }

  if (value.length > 2) {
    return null;
  }

  const meaningfulEntries = value.filter(entry => !isIgnorableMicroPreferenceValue(entry));

  if (meaningfulEntries.length === 0) {
    return [];
  }

  const normalized = meaningfulEntries.map(entry =>
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
  let num = value;
  if (typeof value === 'string') {
    num = Number(value);
  }

  if (typeof num !== 'number' || !Number.isInteger(num)) {
    return null;
  }

  if (num < 0 || num > 5) {
    return null;
  }

  return num;
};

const normalizeUsedRegeneration = (value: unknown): boolean | null => {
  if (typeof value === 'boolean') {
    return value;
  }
  if (value === 'true') return true;
  if (value === 'false') return false;

  return null;
};

const isConsistentRegenerationState = (
  regenerationCount: number,
  usedRegeneration: boolean
): boolean =>
  (usedRegeneration && regenerationCount > 0) || (!usedRegeneration && regenerationCount === 0);

const resolveCatalogDream = (
  focusArea: Parameters<typeof getDreamOptions>[0],
  selectedDreamKey: string,
  selectedDreamLabel?: string
): ReturnType<typeof getDreamOptions>[number] | null => {
  const options = getDreamOptions(focusArea);
  // Match by key, or try to match by exact label if Typebot sends label as key
  const dream = options.find(
    option =>
      option.key === selectedDreamKey ||
      option.label === selectedDreamKey ||
      option.label === selectedDreamLabel
  );

  return dream ?? null;
};

const inferCatalogDream = (
  selectedDreamKey: string,
  selectedDreamLabel?: string
): ReturnType<typeof getDreamOptions>[number] | null => {
  const focusAreas = ['health', 'relationships', 'finances'] as const;

  for (const focusArea of focusAreas) {
    const dream = resolveCatalogDream(focusArea, selectedDreamKey, selectedDreamLabel);
    if (dream) {
      return dream;
    }
  }

  return null;
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
  // Only accept custom labels if this is a generated dream or if the locale is not handled locally.
  if (selectedDream.source === 'generated' && payloadLabel) {
    return payloadLabel;
  }

  if (locale === 'en') {
    return englishDreamLabelByKey[selectedDream.key] ?? selectedDream.label;
  }

  return selectedDream.label;
};

const normalizeSource = (value: unknown): 'curated' | 'generated' | null =>
  value === 'curated' || value === 'generated' ? value : null;

const buildStructuredOption = (
  value: unknown,
  fallbackFocusArea: string | null,
  allowGoalKey: boolean
): OnboardingSelectedOption | OnboardingSelectedHabitOption | null => {
  if (!isRecord(value)) {
    return null;
  }

  const key = toTrimmedString(value.key);
  const label = toTrimmedString(value.label);
  const shortReason = toTrimmedString(value.shortReason);
  const source = normalizeSource(value.source);
  const optionFocusAreaRaw = toTrimmedString(value.focusArea);
  const optionFocusArea = mapFocusArea(optionFocusAreaRaw ?? fallbackFocusArea ?? '');

  if (!key || isVariablePlaceholder(key) || !label || isVariablePlaceholder(label)) {
    return null;
  }

  if (
    !shortReason ||
    isVariablePlaceholder(shortReason) ||
    !source ||
    !isOnboardingFocusArea(optionFocusArea)
  ) {
    return null;
  }

  if (!allowGoalKey) {
    return {
      key,
      label,
      shortReason,
      source,
      focusArea: optionFocusArea,
    };
  }

  const goalKey = toTrimmedString(value.goalKey);

  return {
    key,
    label,
    shortReason,
    source,
    focusArea: optionFocusArea,
    goalKey: goalKey && !isVariablePlaceholder(goalKey) ? goalKey : undefined,
  };
};

const buildLegacyDreamSelection = (
  rawFocusArea: string | null,
  rawSelectedDreamKeyCandidate: string | null,
  rawDreamLabelCandidate: string | null,
  locale: SupportedLanguage,
  usedRegeneration: boolean,
  observedSelections?: ObservedTypebotSelections
): OnboardingSelectedOption | null => {
  const selectedDreamKey =
    rawSelectedDreamKeyCandidate && !isVariablePlaceholder(rawSelectedDreamKeyCandidate)
      ? rawSelectedDreamKeyCandidate
      : null;
  const rawDreamLabel =
    rawDreamLabelCandidate && !isVariablePlaceholder(rawDreamLabelCandidate)
      ? rawDreamLabelCandidate
      : toTrimmedString(observedSelections?.dreamLabel);
  const normalizedFocusArea =
    rawFocusArea && !isVariablePlaceholder(rawFocusArea) ? mapFocusArea(rawFocusArea) : null;
  const dreamLookupKey = selectedDreamKey ?? rawDreamLabel;

  if (!dreamLookupKey) {
    console.error('[Onboarding] Validation failed: missing selectedDreamKey', {
      selectedDreamKey: rawSelectedDreamKeyCandidate,
      selectedDreamLabel: rawDreamLabelCandidate,
      observedDreamLabel: observedSelections?.dreamLabel ?? null,
    });
    return null;
  }

  let selectedDream =
    normalizedFocusArea && isOnboardingFocusArea(normalizedFocusArea)
      ? resolveCatalogDream(normalizedFocusArea, dreamLookupKey, rawDreamLabel || undefined)
      : null;

  if (!selectedDream) {
    selectedDream = inferCatalogDream(dreamLookupKey, rawDreamLabel || undefined);
  }

  if (!selectedDream && usedRegeneration) {
    const generatedFocusArea =
      normalizedFocusArea && isOnboardingFocusArea(normalizedFocusArea)
        ? normalizedFocusArea
        : null;

    if (!generatedFocusArea) {
      console.error('[Onboarding] Validation failed: unsupported focusArea', {
        focusArea: normalizedFocusArea ?? rawFocusArea,
      });
      return null;
    }

    return {
      key: selectedDreamKey ?? rawDreamLabel ?? dreamLookupKey,
      focusArea: generatedFocusArea,
      label: rawDreamLabel || dreamLookupKey,
      shortReason: 'Plano personalizado alinhado às suas preferências.',
      source: 'generated',
    };
  }

  if (!selectedDream) {
    if (!normalizedFocusArea) {
      console.error('[Onboarding] Validation failed: invalid focusArea', {
        focusArea: rawFocusArea,
      });
      return null;
    }

    if (!isOnboardingFocusArea(normalizedFocusArea)) {
      console.error('[Onboarding] Validation failed: unsupported focusArea', {
        focusArea: normalizedFocusArea,
      });
      return null;
    }

    console.error('[Onboarding] Validation failed: selectedDream unresolved');
    return null;
  }

  return {
    key: selectedDream.key,
    focusArea: selectedDream.focusArea,
    label: resolveDreamLabel(rawDreamLabel, selectedDream, locale),
    shortReason: selectedDream.summary,
    source: selectedDream.source,
  };
};

export const extractStructuredOnboardingSeed = (
  value: unknown,
  expectedSignal: string,
  locale: SupportedLanguage,
  observedSelections?: ObservedTypebotSelections
): StructuredOnboardingSeed | null => {
  if (!isRecord(value)) {
    return null;
  }

  const signal = toTrimmedString(value.signal);
  if (!signal || signal.toLowerCase() !== expectedSignal.trim().toLowerCase()) {
    return null;
  }

  const rawFocusAreaCandidate = toTrimmedString(value.focusArea);
  const rawFocusArea =
    rawFocusAreaCandidate && !isVariablePlaceholder(rawFocusAreaCandidate)
      ? rawFocusAreaCandidate
      : toTrimmedString(observedSelections?.focusAreaLabel);
  const regenerationCount = normalizeRegenerationCount(value.regenerationCount);
  const usedRegeneration = normalizeUsedRegeneration(value.usedRegeneration);
  const microPreferences = normalizeMicroPreferences(value.microPreferences);
  if (regenerationCount === null) {
    console.error('[Onboarding] Validation failed: invalid regenerationCount', {
      rc: value.regenerationCount,
    });
    return null;
  }
  if (usedRegeneration === null) {
    console.error('[Onboarding] Validation failed: invalid usedRegeneration', {
      ur: value.usedRegeneration,
    });
    return null;
  }
  if (microPreferences === null) {
    console.error('[Onboarding] Validation failed: invalid microPreferences', {
      mp: value.microPreferences,
    });
    return null;
  }

  if (!isConsistentRegenerationState(regenerationCount, usedRegeneration)) {
    console.error('[Onboarding] Validation failed: inconsistent regeneration state', {
      regenerationCount,
      usedRegeneration,
    });
    return null;
  }

  const selectedDream =
    buildStructuredOption(value.selectedDream, rawFocusArea, false) ??
    buildLegacyDreamSelection(
      rawFocusArea,
      toTrimmedString(value.selectedDreamKey),
      toTrimmedString(value.selectedDreamLabel),
      locale,
      usedRegeneration,
      observedSelections
    );

  if (!selectedDream) {
    return null;
  }

  const selectedGoal = buildStructuredOption(
    value.selectedGoal,
    selectedDream.focusArea,
    false
  ) as OnboardingSelectedOption | null;

  const selectedHabit = buildStructuredOption(
    value.selectedHabit,
    selectedDream.focusArea,
    true
  ) as OnboardingSelectedHabitOption | null;

  return {
    focusArea: selectedDream.focusArea,
    selectedDream,
    selectedGoal,
    selectedHabit,
    selectedDreamKey: selectedDream.key,
    selectedDreamLabel: selectedDream.label,
    microPreferences,
    regenerationCount,
    usedRegeneration,
  };
};
