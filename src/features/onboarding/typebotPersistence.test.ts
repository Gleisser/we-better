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

  it('rejects malformed focus areas and out-of-range regeneration counts', () => {
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
          regenerationCount: 9,
          usedRegeneration: true,
        },
        'onboarding-complete'
      )
    ).toBeNull();
  });
});
