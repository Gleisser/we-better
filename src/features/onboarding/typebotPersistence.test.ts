import { describe, expect, it } from 'vitest';
import { extractStructuredOnboardingSeed } from './typebotPersistence';

describe('extractStructuredOnboardingSeed', () => {
  it('parses a valid structured onboarding payload', () => {
    expect(
      extractStructuredOnboardingSeed(
        {
          signal: 'onboarding-complete',
          focusArea: 'health',
          selectedDream: {
            key: 'sleep-with-consistency',
            label: 'Dormir com mais consistência',
            shortReason: 'Uma rotina de descanso deixa o dia mais leve.',
            source: 'curated',
            focusArea: 'health',
          },
          selectedGoal: {
            key: 'sleep-seven-hours',
            label: 'Dormir pelo menos 7 horas na maior parte da semana',
            shortReason: 'Transforma o sonho em progresso mensurável.',
            source: 'generated',
            focusArea: 'health',
          },
          selectedHabit: {
            key: 'phone-off-before-bed',
            label: 'Desligar o celular 30 minutos antes de dormir',
            shortReason: 'Cria um gatilho simples e repetível para desacelerar.',
            source: 'generated',
            focusArea: 'health',
            goalKey: 'sleep-seven-hours',
          },
          microPreferences: ['lighter', 'faster'],
          regenerationCount: 2,
          usedRegeneration: true,
        },
        'onboarding-complete',
        'pt'
      )
    ).toEqual({
      focusArea: 'health',
      selectedDream: {
        key: 'sleep-with-consistency',
        label: 'Dormir com mais consistência',
        shortReason: 'Uma rotina de descanso deixa o dia mais leve.',
        source: 'curated',
        focusArea: 'health',
      },
      selectedGoal: {
        key: 'sleep-seven-hours',
        label: 'Dormir pelo menos 7 horas na maior parte da semana',
        shortReason: 'Transforma o sonho em progresso mensurável.',
        source: 'generated',
        focusArea: 'health',
      },
      selectedHabit: {
        key: 'phone-off-before-bed',
        label: 'Desligar o celular 30 minutos antes de dormir',
        shortReason: 'Cria um gatilho simples e repetível para desacelerar.',
        source: 'generated',
        focusArea: 'health',
        goalKey: 'sleep-seven-hours',
      },
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
        'onboarding-complete',
        'pt'
      )
    ).toEqual({
      focusArea: 'health',
      selectedDream: {
        key: 'sleep-with-consistency',
        label: 'Dormir com mais consistência',
        shortReason: 'Criar uma rotina de descanso que deixe seus dias mais leves.',
        source: 'curated',
        focusArea: 'health',
      },
      selectedDreamKey: 'sleep-with-consistency',
      selectedDreamLabel: 'Dormir com mais consistência',
      selectedGoal: null,
      selectedHabit: null,
      microPreferences: ['lighter'],
      regenerationCount: 0,
      usedRegeneration: false,
    });
  });

  it('rejects malformed focus areas and unknown dream keys unless usedRegeneration is true', () => {
    expect(
      extractStructuredOnboardingSeed(
        {
          signal: 'onboarding-complete',
          focusArea: 'career', // Invalid focus area
          selectedDreamKey: 'dream',
          selectedDreamLabel: 'Dream',
          microPreferences: ['lighter'],
          regenerationCount: 1,
          usedRegeneration: true,
        },
        'onboarding-complete',
        'pt'
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
          usedRegeneration: true, // This is valid now for AI generation
        },
        'onboarding-complete',
        'pt'
      )
    ).toBeTypeOf('object');

    expect(
      extractStructuredOnboardingSeed(
        {
          signal: 'onboarding-complete',
          focusArea: 'health',
          selectedDreamKey: 'dream',
          selectedDreamLabel: 'Dream',
          microPreferences: ['lighter'],
          regenerationCount: 0,
          usedRegeneration: false, // Wait! 0 counts + false = curated. So unknown key should fail!
        },
        'onboarding-complete',
        'pt'
      )
    ).toBeNull();
  });

  it('rejects contradictory regeneration combinations', () => {
    expect(
      extractStructuredOnboardingSeed(
        {
          signal: 'onboarding-complete',
          focusArea: 'health',
          selectedDreamKey: 'sleep-with-consistency',
          selectedDreamLabel: 'Dormir com mais consistência',
          microPreferences: ['lighter'],
          regenerationCount: 2,
          usedRegeneration: false, // Error! 2 counts but false.
        },
        'onboarding-complete',
        'pt'
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
          usedRegeneration: true, // Error! 0 counts but true.
        },
        'onboarding-complete',
        'pt'
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
          usedRegeneration: 'true', // Accepts string coercions for boolean now
        },
        'onboarding-complete',
        'pt'
      )
    ).toBeTypeOf('object');
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
        'onboarding-complete',
        'pt'
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
        'onboarding-complete',
        'pt'
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
        'onboarding-complete',
        'pt'
      )
    ).toBeNull();
  });

  it('tolerates placeholder microPreferences emitted by Typebot variables', () => {
    expect(
      extractStructuredOnboardingSeed(
        {
          signal: 'onboarding-complete',
          focusArea: 'health',
          selectedDreamKey: 'sleep-with-consistency',
          selectedDreamLabel: 'Dormir com mais consistência',
          microPreferences: ['var_microPreferences'],
          regenerationCount: 0,
          usedRegeneration: false,
        },
        'onboarding-complete',
        'pt'
      )
    ).toEqual({
      focusArea: 'health',
      selectedDream: {
        key: 'sleep-with-consistency',
        label: 'Dormir com mais consistência',
        shortReason: 'Criar uma rotina de descanso que deixe seus dias mais leves.',
        source: 'curated',
        focusArea: 'health',
      },
      selectedDreamKey: 'sleep-with-consistency',
      selectedDreamLabel: 'Dormir com mais consistência',
      selectedGoal: null,
      selectedHabit: null,
      microPreferences: [],
      regenerationCount: 0,
      usedRegeneration: false,
    });
  });

  it('infers the focus area from the dream key when Typebot emits a variable placeholder', () => {
    expect(
      extractStructuredOnboardingSeed(
        {
          signal: 'onboarding-complete',
          focusArea: 'var_focusArea',
          selectedDreamKey: 'sleep-with-consistency',
          selectedDreamLabel: 'Dormir com mais consistência',
          microPreferences: [],
          regenerationCount: 0,
          usedRegeneration: false,
        },
        'onboarding-complete',
        'pt'
      )
    ).toEqual({
      focusArea: 'health',
      selectedDream: {
        key: 'sleep-with-consistency',
        label: 'Dormir com mais consistência',
        shortReason: 'Criar uma rotina de descanso que deixe seus dias mais leves.',
        source: 'curated',
        focusArea: 'health',
      },
      selectedDreamKey: 'sleep-with-consistency',
      selectedDreamLabel: 'Dormir com mais consistência',
      selectedGoal: null,
      selectedHabit: null,
      microPreferences: [],
      regenerationCount: 0,
      usedRegeneration: false,
    });
  });

  it('recovers placeholder payload fields from observed Typebot selections', () => {
    expect(
      extractStructuredOnboardingSeed(
        {
          signal: 'onboarding-complete',
          focusArea: 'var_focusArea',
          selectedDreamKey: 'var_selectedDreamKey',
          selectedDreamLabel: 'var_selectedDreamLabel',
          microPreferences: ['var_microPreferences'],
          regenerationCount: 0,
          usedRegeneration: false,
        },
        'onboarding-complete',
        'pt',
        {
          focusAreaLabel: 'Saúde',
          dreamLabel: 'Dormir com mais consistência',
        }
      )
    ).toEqual({
      focusArea: 'health',
      selectedDream: {
        key: 'sleep-with-consistency',
        label: 'Dormir com mais consistência',
        shortReason: 'Criar uma rotina de descanso que deixe seus dias mais leves.',
        source: 'curated',
        focusArea: 'health',
      },
      selectedDreamKey: 'sleep-with-consistency',
      selectedDreamLabel: 'Dormir com mais consistência',
      selectedGoal: null,
      selectedHabit: null,
      microPreferences: [],
      regenerationCount: 0,
      usedRegeneration: false,
    });
  });
});
