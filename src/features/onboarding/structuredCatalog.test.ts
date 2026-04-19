import { describe, expect, it } from 'vitest';
import {
  getDreamOptions,
  isOnboardingFocusArea,
  microPreferenceOptions,
} from './structuredCatalog';

describe('structuredCatalog', () => {
  it('exposes five curated dreams for each V1 focus area', () => {
    expect(getDreamOptions('health')).toHaveLength(5);
    expect(getDreamOptions('relationships')).toHaveLength(5);
    expect(getDreamOptions('finances')).toHaveLength(5);
  });

  it('uses unique dream keys inside each focus area', () => {
    const healthKeys = getDreamOptions('health').map(option => option.key);
    const relationshipKeys = getDreamOptions('relationships').map(option => option.key);
    const financeKeys = getDreamOptions('finances').map(option => option.key);

    expect(new Set(healthKeys).size).toBe(healthKeys.length);
    expect(new Set(relationshipKeys).size).toBe(relationshipKeys.length);
    expect(new Set(financeKeys).size).toBe(financeKeys.length);
  });

  it('exposes the expected V1 micropreferences and focus-area guard', () => {
    expect(microPreferenceOptions).toEqual([
      'more-ambitious',
      'lighter',
      'faster',
      'more-transformative',
    ]);
    expect(isOnboardingFocusArea('health')).toBe(true);
    expect(isOnboardingFocusArea('career')).toBe(false);
  });
});
