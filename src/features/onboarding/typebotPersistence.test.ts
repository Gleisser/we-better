import { describe, expect, it } from 'vitest';
import { extractStructuredOnboardingSeed } from './typebotPersistence';

describe('extractStructuredOnboardingSeed', () => {
  it('parses a valid structured onboarding payload', () => {
    expect(
      extractStructuredOnboardingSeed(
        {
          signal: 'onboarding-complete',
          focusArea: 'health',
          selectedDreamKey: 'sleep-with-consistency',
          selectedDreamLabel: 'Dormir com mais consistência',
          microPreferences: ['lighter', 'faster'],
          regenerationCount: 2,
          usedRegeneration: true,
        },
        'onboarding-complete'
      )
    ).toEqual({
      focusArea: 'health',
      selectedDreamKey: 'sleep-with-consistency',
      selectedDreamLabel: 'Dormir com mais consistência',
      microPreferences: ['lighter', 'faster'],
      regenerationCount: 2,
      usedRegeneration: true,
    });
  });

  it('normalizes the dream label from the curated catalog', () => {
    expect(
      extractStructuredOnboardingSeed(
        {
          signal: 'onboarding-complete',
          focusArea: 'health',
          selectedDreamKey: 'sleep-with-consistency',
          selectedDreamLabel: 'Wrong label',
          microPreferences: ['lighter'],
          regenerationCount: 0,
          usedRegeneration: false,
        },
        'onboarding-complete'
      )
    ).toEqual({
      focusArea: 'health',
      selectedDreamKey: 'sleep-with-consistency',
      selectedDreamLabel: 'Dormir com mais consistência',
      microPreferences: ['lighter'],
      regenerationCount: 0,
      usedRegeneration: false,
    });
  });

  it('rejects malformed focus areas and unknown dream keys', () => {
    expect(
      extractStructuredOnboardingSeed(
        {
          signal: 'onboarding-complete',
          focusArea: 'career',
          selectedDreamKey: 'dream',
          selectedDreamLabel: 'Dream',
          microPreferences: ['lighter'],
          regenerationCount: 1,
          usedRegeneration: true,
        },
        'onboarding-complete'
      )
    ).toBeNull();

    expect(
      extractStructuredOnboardingSeed(
        {
          signal: 'onboarding-complete',
          focusArea: 'health',
          selectedDreamKey: 'dream',
          selectedDreamLabel: 'Dream',
          microPreferences: ['lighter'],
          regenerationCount: 1,
          usedRegeneration: true,
        },
        'onboarding-complete'
      )
    ).toBeNull();
  });

  it('rejects contradictory regeneration combinations and non-boolean usedRegeneration values', () => {
    expect(
      extractStructuredOnboardingSeed(
        {
          signal: 'onboarding-complete',
          focusArea: 'health',
          selectedDreamKey: 'sleep-with-consistency',
          selectedDreamLabel: 'Dormir com mais consistência',
          microPreferences: ['lighter'],
          regenerationCount: 2,
          usedRegeneration: false,
        },
        'onboarding-complete'
      )
    ).toBeNull();

    expect(
      extractStructuredOnboardingSeed(
        {
          signal: 'onboarding-complete',
          focusArea: 'health',
          selectedDreamKey: 'sleep-with-consistency',
          selectedDreamLabel: 'Dormir com mais consistência',
          microPreferences: ['lighter'],
          regenerationCount: 0,
          usedRegeneration: true,
        },
        'onboarding-complete'
      )
    ).toBeNull();

    expect(
      extractStructuredOnboardingSeed(
        {
          signal: 'onboarding-complete',
          focusArea: 'health',
          selectedDreamKey: 'sleep-with-consistency',
          selectedDreamLabel: 'Dormir com mais consistência',
          microPreferences: ['lighter'],
          regenerationCount: 2,
          usedRegeneration: 'true',
        },
        'onboarding-complete'
      )
    ).toBeNull();
  });

  it('rejects malformed microPreferences arrays', () => {
    expect(
      extractStructuredOnboardingSeed(
        {
          signal: 'onboarding-complete',
          focusArea: 'health',
          selectedDreamKey: 'sleep-with-consistency',
          selectedDreamLabel: 'Dormir com mais consistência',
          microPreferences: ['lighter', 'unknown'],
          regenerationCount: 1,
          usedRegeneration: true,
        },
        'onboarding-complete'
      )
    ).toBeNull();

    expect(
      extractStructuredOnboardingSeed(
        {
          signal: 'onboarding-complete',
          focusArea: 'health',
          selectedDreamKey: 'sleep-with-consistency',
          selectedDreamLabel: 'Dormir com mais consistência',
          microPreferences: ['lighter', 'lighter'],
          regenerationCount: 1,
          usedRegeneration: true,
        },
        'onboarding-complete'
      )
    ).toBeNull();

    expect(
      extractStructuredOnboardingSeed(
        {
          signal: 'onboarding-complete',
          focusArea: 'health',
          selectedDreamKey: 'sleep-with-consistency',
          selectedDreamLabel: 'Dormir com mais consistência',
          microPreferences: ['lighter', 'faster', 'more-ambitious'],
          regenerationCount: 1,
          usedRegeneration: true,
        },
        'onboarding-complete'
      )
    ).toBeNull();
  });
});
