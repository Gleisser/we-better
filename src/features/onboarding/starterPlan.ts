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
  const controlMap = Object.fromEntries(controls.map(control => [control.id, control.value]));

  switch (focusArea) {
    case 'health':
      return `Transformar "${dreamLabel}" em uma rotina ${controlMap.frequency} com ritmo ${controlMap.pace}.`;
    case 'relationships':
      return `Criar um ritmo ${controlMap.connectionRhythm} de conexão para "${dreamLabel}".`;
    case 'finances':
      return `Avançar em "${dreamLabel}" com compromisso ${controlMap.weeklyCommitment} e plano ${controlMap.planningStyle}.`;
  }
};

const buildHabitTitle = (focusArea: OnboardingFocusArea, controls: OnboardingControl[]): string => {
  const controlMap = Object.fromEntries(controls.map(control => [control.id, control.value]));

  switch (focusArea) {
    case 'health':
      return `Fazer um ritual de cuidado no período da ${controlMap.timeOfDay} ${controlMap.frequency}.`;
    case 'relationships':
      return `Reservar um gesto de ${controlMap.gestureType} em um ritmo ${controlMap.connectionRhythm}.`;
    case 'finances':
      return controlMap.weeklyCommitment === 'focused'
        ? 'Separar 15 minutos por semana para revisar gastos e próximos passos.'
        : 'Separar 10 minutos por semana para revisar gastos e próximos passos.';
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
