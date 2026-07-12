import { describe, expect, it } from 'vitest';
import { applyStarterPlanControl, createStarterPlan } from './starterPlan';

describe('starterPlan', () => {
  it('derives a connected starter trio for a health dream', () => {
    const plan = createStarterPlan(
      {
        focusArea: 'health',
        selectedDream: {
          key: 'sleep-with-consistency',
          label: 'Dormir com mais consistência',
          shortReason: 'Rotina de descanso mais estável.',
          source: 'curated',
          focusArea: 'health',
        },
        selectedGoal: {
          key: 'sleep-seven-hours',
          label: 'Dormir pelo menos 7 horas na maior parte da semana',
          shortReason: 'Leva o sonho para um marco concreto.',
          source: 'generated',
          focusArea: 'health',
        },
        selectedHabit: {
          key: 'phone-off-before-bed',
          label: 'Desligar o celular 30 minutos antes de dormir',
          shortReason: 'Pequena ação repetível para desacelerar.',
          source: 'generated',
          focusArea: 'health',
          goalKey: 'sleep-seven-hours',
        },
        usedRegeneration: false,
        microPreferences: [],
        regenerationCount: 0,
      },
      'pt'
    );

    expect(plan.goal.title).toBe('Dormir pelo menos 7 horas na maior parte da semana');
    expect(plan.habit.title).toBe('Desligar o celular 30 minutos antes de dormir');
    expect(plan.controls.map(control => control.id)).toEqual(['pace', 'timeOfDay', 'frequency']);
  });

  it('derives connected relationship copy for a relationships dream', () => {
    const plan = createStarterPlan(
      {
        focusArea: 'relationships',
        selectedDream: {
          key: 'strengthen-my-relationship',
          label: 'Fortalecer meu relacionamento',
          shortReason: 'Mais conexão no dia a dia.',
          source: 'curated',
          focusArea: 'relationships',
        },
        selectedGoal: {
          key: 'weekly-connection-moment',
          label: 'Ter um momento de conexão intencional toda semana',
          shortReason: 'Cria um ritmo claro de proximidade.',
          source: 'generated',
          focusArea: 'relationships',
        },
        selectedHabit: {
          key: 'send-checkin-message',
          label: 'Enviar uma mensagem de check-in em um dia fixo da semana',
          shortReason: 'Reduz a fricção para manter constância.',
          source: 'generated',
          focusArea: 'relationships',
          goalKey: 'weekly-connection-moment',
        },
        usedRegeneration: false,
        microPreferences: [],
        regenerationCount: 0,
      },
      'pt'
    );

    expect(plan.goal.title).toBe('Ter um momento de conexão intencional toda semana');
    expect(plan.habit.title).toBe('Enviar uma mensagem de check-in em um dia fixo da semana');
    expect(plan.controls.map(control => control.id)).toEqual(['connectionRhythm', 'gestureType']);
  });

  it('recomputes goal and habit copy when a control changes', () => {
    const plan = createStarterPlan(
      {
        focusArea: 'finances',
        selectedDream: {
          key: 'build-an-emergency-fund',
          label: 'Montar minha reserva de emergência',
          shortReason: 'Mais segurança para imprevistos.',
          source: 'curated',
          focusArea: 'finances',
        },
        selectedGoal: {
          key: 'save-first-thousand',
          label: 'Guardar os primeiros mil reais da reserva',
          shortReason: 'Uma meta inicial clara e alcançável.',
          source: 'generated',
          focusArea: 'finances',
        },
        selectedHabit: {
          key: 'weekly-money-checkin',
          label: 'Fazer uma revisão rápida do dinheiro uma vez por semana',
          shortReason: 'Cria visibilidade e constância.',
          source: 'generated',
          focusArea: 'finances',
          goalKey: 'save-first-thousand',
        },
        usedRegeneration: true,
        microPreferences: ['lighter'],
        regenerationCount: 1,
      },
      'pt'
    );

    const updated = applyStarterPlanControl(plan, 'weeklyCommitment', 'focused');

    expect(updated.goal.title).toContain('Guardar os primeiros mil reais');
    expect(updated.habit.title).toContain('15 minutos');
    expect(updated.controls.find(control => control.id === 'weeklyCommitment')?.value).toBe(
      'focused'
    );
  });

  it('returns the original plan unchanged for invalid control updates', () => {
    const plan = createStarterPlan(
      {
        focusArea: 'health',
        selectedDream: {
          key: 'sleep-with-consistency',
          label: 'Dormir com mais consistência',
          shortReason: 'Rotina de descanso mais estável.',
          source: 'curated',
          focusArea: 'health',
        },
        selectedGoal: {
          key: 'sleep-seven-hours',
          label: 'Dormir pelo menos 7 horas na maior parte da semana',
          shortReason: 'Leva o sonho para um marco concreto.',
          source: 'generated',
          focusArea: 'health',
        },
        selectedHabit: {
          key: 'phone-off-before-bed',
          label: 'Desligar o celular 30 minutos antes de dormir',
          shortReason: 'Pequena ação repetível para desacelerar.',
          source: 'generated',
          focusArea: 'health',
          goalKey: 'sleep-seven-hours',
        },
        usedRegeneration: false,
        microPreferences: [],
        regenerationCount: 0,
      },
      'pt'
    );

    expect(applyStarterPlanControl(plan, 'missing-control', 'focused')).toBe(plan);
    expect(applyStarterPlanControl(plan, 'pace', 'invalid')).toBe(plan);
  });
});
