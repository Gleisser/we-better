import type {
  OnboardingControl,
  OnboardingFocusArea,
  OnboardingStarterPlan,
  StructuredOnboardingSeed,
} from '@/types/onboarding';

const buildHealthControls = (): OnboardingControl[] => [
  {
    id: 'pace',
    label: 'Starting pace',
    kind: 'slider',
    value: 'gentle',
    options: [
      { value: 'gentle', label: 'Leve' },
      { value: 'steady', label: 'Constante' },
      { value: 'strong', label: 'Forte' },
    ],
  },
  {
    id: 'timeOfDay',
    label: 'Preferred time',
    kind: 'chips',
    value: 'evening',
    options: [
      { value: 'morning', label: 'Manhã' },
      { value: 'afternoon', label: 'Tarde' },
      { value: 'evening', label: 'Noite' },
    ],
  },
  {
    id: 'frequency',
    label: 'Frequency',
    kind: 'slider',
    value: '3x',
    options: [
      { value: '2x', label: '2x/sem' },
      { value: '3x', label: '3x/sem' },
      { value: '5x', label: '5x/sem' },
    ],
  },
];

const buildRelationshipControls = (): OnboardingControl[] => [
  {
    id: 'connectionRhythm',
    label: 'Connection rhythm',
    kind: 'slider',
    value: 'weekly',
    options: [
      { value: 'light', label: 'Leve' },
      { value: 'weekly', label: 'Semanal' },
      { value: 'frequent', label: 'Frequente' },
    ],
  },
  {
    id: 'gestureType',
    label: 'Gesture type',
    kind: 'chips',
    value: 'message',
    options: [
      { value: 'message', label: 'Mensagem' },
      { value: 'call', label: 'Ligação' },
      { value: 'presence', label: 'Presença' },
    ],
  },
];

const buildFinanceControls = (): OnboardingControl[] => [
  {
    id: 'weeklyCommitment',
    label: 'Weekly commitment',
    kind: 'slider',
    value: 'steady',
    options: [
      { value: 'light', label: 'Leve' },
      { value: 'steady', label: 'Constante' },
      { value: 'focused', label: 'Focado' },
    ],
  },
  {
    id: 'planningStyle',
    label: 'Planning style',
    kind: 'chips',
    value: 'simple',
    options: [
      { value: 'simple', label: 'Simples' },
      { value: 'tracked', label: 'Acompanhado' },
      { value: 'disciplined', label: 'Disciplinado' },
    ],
  },
];

const fallbackGoalTitleByFocus: Record<OnboardingFocusArea, string> = {
  health: 'Criar uma rotina de cuidado mais estável.',
  relationships: 'Criar um ritmo de conexão mais intencional.',
  finances: 'Criar uma rotina financeira mais estável.',
};

const fallbackHabitTitleByFocus: Record<OnboardingFocusArea, string> = {
  health: 'Fazer um pequeno ritual de cuidado de forma consistente.',
  relationships: 'Reservar um gesto simples de conexão.',
  finances: 'Separar alguns minutos por semana para revisar gastos e próximos passos.',
};

const getControl = (
  controls: OnboardingControl[],
  controlId: string
): OnboardingControl | null => controls.find(control => control.id === controlId) ?? null;

const isDeclaredControlValue = (control: OnboardingControl, nextValue: string): boolean =>
  control.options.some(option => option.value === nextValue);

const getValidControlValue = (control: OnboardingControl | null): string | null => {
  if (!control) {
    return null;
  }

  return control.options.some(option => option.value === control.value) ? control.value : null;
};

const buildControls = (focusArea: OnboardingFocusArea): OnboardingControl[] => {
  switch (focusArea) {
    case 'health':
      return buildHealthControls();
    case 'relationships':
      return buildRelationshipControls();
    case 'finances':
      return buildFinanceControls();
  }
};

const buildGoalTitle = (
  focusArea: OnboardingFocusArea,
  dreamLabel: string,
  controls: OnboardingControl[]
): string => {
  switch (focusArea) {
    case 'health': {
      const pace = getValidControlValue(getControl(controls, 'pace'));
      const frequency = getValidControlValue(getControl(controls, 'frequency'));

      if (!pace || !frequency) {
        return fallbackGoalTitleByFocus.health;
      }

      return `Transformar "${dreamLabel}" em uma rotina ${frequency} com ritmo ${pace}.`;
    }
    case 'relationships': {
      const connectionRhythm = getValidControlValue(getControl(controls, 'connectionRhythm'));

      if (!connectionRhythm) {
        return fallbackGoalTitleByFocus.relationships;
      }

      return `Criar um ritmo ${connectionRhythm} de conexão para "${dreamLabel}".`;
    }
    case 'finances': {
      const weeklyCommitment = getValidControlValue(getControl(controls, 'weeklyCommitment'));
      const planningStyle = getValidControlValue(getControl(controls, 'planningStyle'));

      if (!weeklyCommitment || !planningStyle) {
        return fallbackGoalTitleByFocus.finances;
      }

      return `Avançar em "${dreamLabel}" com compromisso ${weeklyCommitment} e plano ${planningStyle}.`;
    }
  }
};

const buildHabitTitle = (focusArea: OnboardingFocusArea, controls: OnboardingControl[]): string => {
  switch (focusArea) {
    case 'health': {
      const timeOfDay = getValidControlValue(getControl(controls, 'timeOfDay'));
      const frequency = getValidControlValue(getControl(controls, 'frequency'));

      if (!timeOfDay || !frequency) {
        return fallbackHabitTitleByFocus.health;
      }

      return `Fazer um ritual de cuidado no período da ${timeOfDay} ${frequency}.`;
    }
    case 'relationships': {
      const gestureType = getValidControlValue(getControl(controls, 'gestureType'));
      const connectionRhythm = getValidControlValue(getControl(controls, 'connectionRhythm'));

      if (!gestureType || !connectionRhythm) {
        return fallbackHabitTitleByFocus.relationships;
      }

      return `Reservar um gesto de ${gestureType} em um ritmo ${connectionRhythm}.`;
    }
    case 'finances': {
      const weeklyCommitment = getValidControlValue(getControl(controls, 'weeklyCommitment'));

      if (!weeklyCommitment) {
        return fallbackHabitTitleByFocus.finances;
      }

      return weeklyCommitment === 'focused'
        ? 'Separar 15 minutos por semana para revisar gastos e próximos passos.'
        : 'Separar 10 minutos por semana para revisar gastos e próximos passos.';
    }
  }
};

export const createStarterPlan = (seed: StructuredOnboardingSeed): OnboardingStarterPlan => {
  const controls = buildControls(seed.focusArea);

  return {
    focusArea: seed.focusArea,
    dream: {
      key: seed.selectedDreamKey,
      label: seed.selectedDreamLabel,
    },
    goal: {
      title: buildGoalTitle(seed.focusArea, seed.selectedDreamLabel, controls),
    },
    habit: {
      title: buildHabitTitle(seed.focusArea, controls),
    },
    controls,
  };
};

export const applyStarterPlanControl = (
  plan: OnboardingStarterPlan,
  controlId: string,
  nextValue: string
): OnboardingStarterPlan => {
  const targetControl = getControl(plan.controls, controlId);

  if (!targetControl || !isDeclaredControlValue(targetControl, nextValue) || targetControl.value === nextValue) {
    return plan;
  }

  const controls = plan.controls.map(control =>
    control.id === controlId ? { ...control, value: nextValue } : control
  );

  return {
    ...plan,
    controls,
    goal: {
      title: buildGoalTitle(plan.focusArea, plan.dream.label, controls),
    },
    habit: {
      title: buildHabitTitle(plan.focusArea, controls),
    },
  };
};
