import type { SupportedLanguage } from '@/core/i18n';
import type {
  OnboardingControl,
  OnboardingFocusArea,
  OnboardingStarterPlan,
  StructuredOnboardingSeed,
} from '@/types/onboarding';

type PlanLocale = Extract<SupportedLanguage, 'en' | 'pt'>;

type LocalizedPlanCopy = {
  controls: Record<
    OnboardingFocusArea,
    OnboardingControl[]
  >;
  fallbackGoalTitleByFocus: Record<OnboardingFocusArea, string>;
  fallbackHabitTitleByFocus: Record<OnboardingFocusArea, string>;
};

const normalizePlanLocale = (locale: SupportedLanguage): PlanLocale =>
  locale === 'pt' ? 'pt' : 'en';

const localizedPlanCopy: Record<PlanLocale, LocalizedPlanCopy> = {
  en: {
    controls: {
      health: [
        {
          id: 'pace',
          label: 'Starting pace',
          kind: 'slider',
          value: 'gentle',
          options: [
            { value: 'gentle', label: 'Gentle' },
            { value: 'steady', label: 'Steady' },
            { value: 'strong', label: 'Strong' },
          ],
        },
        {
          id: 'timeOfDay',
          label: 'Preferred time',
          kind: 'chips',
          value: 'evening',
          options: [
            { value: 'morning', label: 'Morning' },
            { value: 'afternoon', label: 'Afternoon' },
            { value: 'evening', label: 'Evening' },
          ],
        },
        {
          id: 'frequency',
          label: 'Frequency',
          kind: 'slider',
          value: '3x',
          options: [
            { value: '2x', label: '2x/week' },
            { value: '3x', label: '3x/week' },
            { value: '5x', label: '5x/week' },
          ],
        },
      ],
      relationships: [
        {
          id: 'connectionRhythm',
          label: 'Connection rhythm',
          kind: 'slider',
          value: 'weekly',
          options: [
            { value: 'light', label: 'Light' },
            { value: 'weekly', label: 'Weekly' },
            { value: 'frequent', label: 'Frequent' },
          ],
        },
        {
          id: 'gestureType',
          label: 'Gesture type',
          kind: 'chips',
          value: 'message',
          options: [
            { value: 'message', label: 'Message' },
            { value: 'call', label: 'Call' },
            { value: 'presence', label: 'In person' },
          ],
        },
      ],
      finances: [
        {
          id: 'weeklyCommitment',
          label: 'Weekly commitment',
          kind: 'slider',
          value: 'steady',
          options: [
            { value: 'light', label: 'Light' },
            { value: 'steady', label: 'Steady' },
            { value: 'focused', label: 'Focused' },
          ],
        },
        {
          id: 'planningStyle',
          label: 'Planning style',
          kind: 'chips',
          value: 'simple',
          options: [
            { value: 'simple', label: 'Simple' },
            { value: 'tracked', label: 'Tracked' },
            { value: 'disciplined', label: 'Disciplined' },
          ],
        },
      ],
    },
    fallbackGoalTitleByFocus: {
      health: 'Create a steadier self-care rhythm.',
      relationships: 'Create a more intentional rhythm of connection.',
      finances: 'Create a steadier financial routine.',
    },
    fallbackHabitTitleByFocus: {
      health: 'Practice a small self-care ritual consistently.',
      relationships: 'Set aside one simple gesture of connection.',
      finances: 'Set aside a few minutes each week to review spending and next steps.',
    },
  },
  pt: {
    controls: {
      health: [
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
      ],
      relationships: [
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
      ],
      finances: [
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
      ],
    },
    fallbackGoalTitleByFocus: {
      health: 'Criar uma rotina de cuidado mais estável.',
      relationships: 'Criar um ritmo de conexão mais intencional.',
      finances: 'Criar uma rotina financeira mais estável.',
    },
    fallbackHabitTitleByFocus: {
      health: 'Fazer um pequeno ritual de cuidado de forma consistente.',
      relationships: 'Reservar um gesto simples de conexão.',
      finances: 'Separar alguns minutos por semana para revisar gastos e próximos passos.',
    },
  },
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

const buildControls = (
  focusArea: OnboardingFocusArea,
  locale: PlanLocale
): OnboardingControl[] =>
  localizedPlanCopy[locale].controls[focusArea].map(control => ({
    ...control,
    options: control.options.map(option => ({ ...option })),
  }));

const buildGoalTitle = (
  focusArea: OnboardingFocusArea,
  dreamLabel: string,
  controls: OnboardingControl[],
  locale: PlanLocale
): string => {
  const copy = localizedPlanCopy[locale];

  switch (focusArea) {
    case 'health': {
      const pace = getValidControlValue(getControl(controls, 'pace'));
      const frequency = getValidControlValue(getControl(controls, 'frequency'));

      if (!pace || !frequency) {
        return copy.fallbackGoalTitleByFocus.health;
      }

      return locale === 'pt'
        ? `Transformar "${dreamLabel}" em uma rotina ${frequency} com ritmo ${pace}.`
        : `Turn "${dreamLabel}" into a ${frequency} rhythm with a ${pace} pace.`;
    }
    case 'relationships': {
      const connectionRhythm = getValidControlValue(getControl(controls, 'connectionRhythm'));

      if (!connectionRhythm) {
        return copy.fallbackGoalTitleByFocus.relationships;
      }

      return locale === 'pt'
        ? `Criar um ritmo ${connectionRhythm} de conexão para "${dreamLabel}".`
        : `Create a ${connectionRhythm} rhythm of connection around "${dreamLabel}".`;
    }
    case 'finances': {
      const weeklyCommitment = getValidControlValue(getControl(controls, 'weeklyCommitment'));
      const planningStyle = getValidControlValue(getControl(controls, 'planningStyle'));

      if (!weeklyCommitment || !planningStyle) {
        return copy.fallbackGoalTitleByFocus.finances;
      }

      return locale === 'pt'
        ? `Avançar em "${dreamLabel}" com compromisso ${weeklyCommitment} e plano ${planningStyle}.`
        : `Move "${dreamLabel}" forward with a ${weeklyCommitment} commitment and a ${planningStyle} plan.`;
    }
  }
};

const buildHabitTitle = (
  focusArea: OnboardingFocusArea,
  controls: OnboardingControl[],
  locale: PlanLocale
): string => {
  const copy = localizedPlanCopy[locale];

  switch (focusArea) {
    case 'health': {
      const timeOfDay = getValidControlValue(getControl(controls, 'timeOfDay'));
      const frequency = getValidControlValue(getControl(controls, 'frequency'));

      if (!timeOfDay || !frequency) {
        return copy.fallbackHabitTitleByFocus.health;
      }

      return locale === 'pt'
        ? `Fazer um ritual de cuidado no período da ${timeOfDay} ${frequency}.`
        : `Practice a self-care ritual in the ${timeOfDay} ${frequency}.`;
    }
    case 'relationships': {
      const gestureType = getValidControlValue(getControl(controls, 'gestureType'));
      const connectionRhythm = getValidControlValue(getControl(controls, 'connectionRhythm'));

      if (!gestureType || !connectionRhythm) {
        return copy.fallbackHabitTitleByFocus.relationships;
      }

      return locale === 'pt'
        ? `Reservar um gesto de ${gestureType} em um ritmo ${connectionRhythm}.`
        : `Set aside a ${gestureType} gesture on a ${connectionRhythm} rhythm.`;
    }
    case 'finances': {
      const weeklyCommitment = getValidControlValue(getControl(controls, 'weeklyCommitment'));

      if (!weeklyCommitment) {
        return copy.fallbackHabitTitleByFocus.finances;
      }

      if (locale === 'pt') {
        return weeklyCommitment === 'focused'
          ? 'Separar 15 minutos por semana para revisar gastos e próximos passos.'
          : 'Separar 10 minutos por semana para revisar gastos e próximos passos.';
      }

      return weeklyCommitment === 'focused'
        ? 'Set aside 15 minutes each week to review spending and next steps.'
        : 'Set aside 10 minutes each week to review spending and next steps.';
    }
  }
};

export const createStarterPlan = (
  seed: StructuredOnboardingSeed,
  locale: SupportedLanguage
): OnboardingStarterPlan => {
  const planLocale = normalizePlanLocale(locale);
  const controls = buildControls(seed.focusArea, planLocale);

  return {
    locale: planLocale,
    focusArea: seed.focusArea,
    dream: {
      key: seed.selectedDreamKey,
      label: seed.selectedDreamLabel,
    },
    goal: {
      title: buildGoalTitle(seed.focusArea, seed.selectedDreamLabel, controls, planLocale),
    },
    habit: {
      title: buildHabitTitle(seed.focusArea, controls, planLocale),
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

  if (
    !targetControl ||
    !isDeclaredControlValue(targetControl, nextValue) ||
    targetControl.value === nextValue
  ) {
    return plan;
  }

  const controls = plan.controls.map(control =>
    control.id === controlId ? { ...control, value: nextValue } : control
  );

  return {
    ...plan,
    controls,
    goal: {
      title: buildGoalTitle(plan.focusArea, plan.dream.label, controls, normalizePlanLocale(plan.locale)),
    },
    habit: {
      title: buildHabitTitle(plan.focusArea, controls, normalizePlanLocale(plan.locale)),
    },
  };
};
