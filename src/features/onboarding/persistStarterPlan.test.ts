import { beforeEach, describe, expect, it, vi } from 'vitest';
import { persistStarterPlan } from './persistStarterPlan';

const createDreamBoardMock = vi.fn();
const createGoalMock = vi.fn();
const createHabitMock = vi.fn();

vi.mock('@/core/services/dreamBoardService', () => ({
  createDreamBoard: (...args: unknown[]) => createDreamBoardMock(...args),
}));

vi.mock('@/core/services/goalsService', () => ({
  createGoal: (...args: unknown[]) => createGoalMock(...args),
}));

vi.mock('@/core/services/habitsService', () => ({
  createHabit: (...args: unknown[]) => createHabitMock(...args),
}));

describe('persistStarterPlan', () => {
  beforeEach(() => {
    createDreamBoardMock.mockReset();
    createGoalMock.mockReset();
    createHabitMock.mockReset();
    createDreamBoardMock.mockResolvedValue({ id: 'dream-1' });
    createGoalMock.mockResolvedValue({ id: 'goal-1' });
    createHabitMock.mockResolvedValue({ id: 'habit-1' });
  });

  it('maps onboarding focus into dream, goal, and habit categories', async () => {
    await persistStarterPlan({
      focusArea: 'health',
      dream: { key: 'sleep-with-consistency', label: 'Dormir com mais consistência' },
      goal: { title: 'Transformar dormir bem em uma rotina 3x com ritmo leve.' },
      habit: { title: 'Fazer um ritual de cuidado no período da noite 3x/sem.' },
      controls: [],
    });

    expect(createDreamBoardMock).toHaveBeenCalledWith({
      title: 'Dormir com mais consistência',
      categories: ['health'],
      content: [],
    });
    expect(createGoalMock).toHaveBeenCalledWith(
      'Transformar dormir bem em uma rotina 3x com ritmo leve.',
      'fitness'
    );
    expect(createHabitMock).toHaveBeenCalledWith(
      'Fazer um ritual de cuidado no período da noite 3x/sem.',
      'health'
    );
  });
});
