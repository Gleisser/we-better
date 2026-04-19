import { describe, expect, it } from 'vitest';
import { applyStarterPlanControl, createStarterPlan } from './starterPlan';

describe('starterPlan', () => {
  it('derives a connected starter trio for a health dream', () => {
    const plan = createStarterPlan({
      focusArea: 'health',
      selectedDreamKey: 'sleep-with-consistency',
      selectedDreamLabel: 'Dormir com mais consistência',
      usedRegeneration: false,
      microPreferences: [],
      regenerationCount: 0,
    });

    expect(plan.goal.title).toContain('Dormir com mais consistência');
    expect(plan.habit.title).toContain('ritual');
    expect(plan.controls.map(control => control.id)).toEqual([
      'pace',
      'timeOfDay',
      'frequency',
    ]);
  });

  it('recomputes goal and habit copy when a control changes', () => {
    const plan = createStarterPlan({
      focusArea: 'finances',
      selectedDreamKey: 'build-an-emergency-fund',
      selectedDreamLabel: 'Montar minha reserva de emergência',
      usedRegeneration: true,
      microPreferences: ['lighter'],
      regenerationCount: 1,
    });

    const updated = applyStarterPlanControl(plan, 'weeklyCommitment', 'focused');

    expect(updated.goal.title).toContain('reserva');
    expect(updated.habit.title).toContain('15 minutos');
    expect(updated.controls.find(control => control.id === 'weeklyCommitment')?.value).toBe(
      'focused'
    );
  });
});
