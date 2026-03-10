import { describe, expect, it } from 'vitest';
import { normalizeCategoryName, resolveCategoryKey } from '../categoryUtils';

describe('RadialLifeChartWidget category normalization', () => {
  it('normalizes Portuguese category labels to the existing translation keys', () => {
    expect(normalizeCategoryName('Saúde')).toBe('saude');
    expect(resolveCategoryKey('Carreira')).toBe('career');
    expect(resolveCategoryKey('Saúde')).toBe('health');
    expect(resolveCategoryKey('Finanças')).toBe('finances');
    expect(resolveCategoryKey('Crescimento Pessoal')).toBe('personalGrowth');
    expect(resolveCategoryKey('Recreação')).toBe('recreation');
    expect(resolveCategoryKey('Comunidade')).toBe('community');
  });
});
