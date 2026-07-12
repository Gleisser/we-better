# Structured Onboarding Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current open-text Typebot onboarding with a short structured Typebot handoff plus native We Better personalization, review, and persistence for the three V1 focus areas: health, relationships, and finances.

**Architecture:** Keep `/app/onboarding` as the gated first-access route, but change `OnboardingPage` from “Typebot collects and saves everything” to “Typebot selects a structured seed, then the app derives, personalizes, reviews, and persists the starter trio.” Introduce a small onboarding domain model, a curated dream catalog, a structured Typebot payload parser, a native personalization/review flow, and a source-controlled Typebot V1 export artifact.

**Tech Stack:** React 18, TypeScript 5, Vite 5, Vitest, Testing Library, CSS Modules, Playwright, `@typebot.io/react`

---

## File Structure

### Existing files to modify

- `src/types/onboarding.ts` — expand onboarding domain types beyond auth-gating state
- `src/features/onboarding/OnboardingPage.tsx` — orchestrate Typebot handoff, native personalization, review, persistence, and correction
- `src/features/onboarding/OnboardingPage.test.tsx` — replace old text-persistence assertions with structured flow coverage
- `src/features/onboarding/typebotPersistence.ts` — parse the new structured completion payload instead of extracting free text
- `src/features/onboarding/index.ts` — export any new feature entry points
- `public/locales/en/onboarding.json` — add copy for focus selection, personalization, review, and fallback labels
- `public/locales/pt/onboarding.json` — Portuguese parity
- `tests/check-typebot.spec.ts` — turn the current debug spec into a structured-handoff verification spec

### New files to create

- `src/features/onboarding/structuredCatalog.ts` — V1 focus areas, dream cards, and micropreferences
- `src/features/onboarding/structuredCatalog.test.ts` — catalog invariants
- `src/features/onboarding/starterPlan.ts` — derive dream/goal/habit suggestions and apply focus-specific control changes
- `src/features/onboarding/starterPlan.test.ts` — derivation and recalculation coverage
- `src/features/onboarding/OnboardingPersonalization.tsx` — native personalization UI after Typebot handoff
- `src/features/onboarding/OnboardingPersonalization.module.css` — personalization layout and control styles
- `src/features/onboarding/OnboardingReview.tsx` — final confirm/correct screen
- `src/features/onboarding/OnboardingReview.module.css` — review styling
- `src/features/onboarding/persistStarterPlan.ts` — centralize dream/goal/habit persistence and focus-to-category mapping
- `src/features/onboarding/persistStarterPlan.test.ts` — persistence contract coverage
- `docs/typebot/structured-onboarding-v1.json` — source-controlled Typebot export for the new structured flow

### Boundaries

- `structuredCatalog.ts` owns static curation only.
- `starterPlan.ts` owns derivation logic only; it should not know about React, fetch, or Typebot internals.
- `typebotPersistence.ts` owns Typebot payload parsing only; it should not create records.
- `OnboardingPage.tsx` owns orchestration and transitions between `typebot -> personalization -> review`.
- `persistStarterPlan.ts` owns API writes and category mapping; it should be the only place that touches `createDreamBoard`, `createGoal`, and `createHabit` for onboarding.

---

### Task 1: Add the structured onboarding domain model and curated catalog

**Files:**

- Modify: `src/types/onboarding.ts`
- Create: `src/features/onboarding/structuredCatalog.ts`
- Create: `src/features/onboarding/structuredCatalog.test.ts`

- [ ] **Step 1: Write the failing catalog test**

Create `src/features/onboarding/structuredCatalog.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run:

```bash
npm test -- --run src/features/onboarding/structuredCatalog.test.ts
```

Expected: FAIL because `structuredCatalog.ts` does not exist yet.

- [ ] **Step 3: Add the types and the curated catalog**

Update `src/types/onboarding.ts`:

```ts
export interface OnboardingState {
  required: boolean;
  skippedAt?: string | null;
  completedAt?: string | null;
}

export type OnboardingFocusArea = 'health' | 'relationships' | 'finances';

export type OnboardingMicroPreference =
  | 'more-ambitious'
  | 'lighter'
  | 'faster'
  | 'more-transformative';

export interface OnboardingDreamOption {
  key: string;
  focusArea: OnboardingFocusArea;
  label: string;
  summary: string;
  source: 'curated' | 'generated';
}

export interface StructuredOnboardingSeed {
  focusArea: OnboardingFocusArea;
  selectedDreamKey: string;
  selectedDreamLabel: string;
  usedRegeneration: boolean;
  microPreferences: OnboardingMicroPreference[];
  regenerationCount: number;
}

export const requiresOnboarding = (onboarding?: OnboardingState | null): boolean =>
  Boolean(onboarding?.required && !onboarding.skippedAt && !onboarding.completedAt);
```

Create `src/features/onboarding/structuredCatalog.ts`:

```ts
import type {
  OnboardingDreamOption,
  OnboardingFocusArea,
  OnboardingMicroPreference,
} from '@/types/onboarding';

export const microPreferenceOptions: OnboardingMicroPreference[] = [
  'more-ambitious',
  'lighter',
  'faster',
  'more-transformative',
];

export const isOnboardingFocusArea = (value: unknown): value is OnboardingFocusArea =>
  value === 'health' || value === 'relationships' || value === 'finances';

const dreamCatalogByFocus: Record<OnboardingFocusArea, OnboardingDreamOption[]> = {
  health: [
    {
      key: 'sleep-with-consistency',
      focusArea: 'health',
      label: 'Dormir com mais consistência',
      summary: 'Criar uma rotina de descanso que deixe seus dias mais leves.',
      source: 'curated',
    },
    {
      key: 'build-weekly-movement',
      focusArea: 'health',
      label: 'Voltar a me movimentar toda semana',
      summary: 'Retomar movimento com um ritmo possível de sustentar.',
      source: 'curated',
    },
    {
      key: 'eat-with-more-intention',
      focusArea: 'health',
      label: 'Comer com mais intenção',
      summary: 'Trocar improviso por escolhas mais conscientes.',
      source: 'curated',
    },
    {
      key: 'reduce-daily-stress',
      focusArea: 'health',
      label: 'Reduzir o estresse do dia a dia',
      summary: 'Trazer mais calma e previsibilidade para a rotina.',
      source: 'curated',
    },
    {
      key: 'feel-stronger-in-my-body',
      focusArea: 'health',
      label: 'Me sentir mais forte no meu corpo',
      summary: 'Ganhar energia, disposição e percepção de progresso.',
      source: 'curated',
    },
  ],
  relationships: [
    {
      key: 'be-more-present-with-family',
      focusArea: 'relationships',
      label: 'Estar mais presente com minha família',
      summary: 'Transformar intenção em presença real e recorrente.',
      source: 'curated',
    },
    {
      key: 'strengthen-my-relationship',
      focusArea: 'relationships',
      label: 'Fortalecer meu relacionamento',
      summary: 'Criar pequenos rituais de conexão no dia a dia.',
      source: 'curated',
    },
    {
      key: 'reconnect-with-friends',
      focusArea: 'relationships',
      label: 'Me reconectar com amigos importantes',
      summary: 'Retomar vínculos que fazem bem para sua vida.',
      source: 'curated',
    },
    {
      key: 'communicate-with-more-clarity',
      focusArea: 'relationships',
      label: 'Me comunicar com mais clareza',
      summary: 'Ganhar coragem e leveza nas conversas importantes.',
      source: 'curated',
    },
    {
      key: 'create-more-quality-moments',
      focusArea: 'relationships',
      label: 'Criar mais momentos de qualidade',
      summary: 'Trocar convivência automática por conexão intencional.',
      source: 'curated',
    },
  ],
  finances: [
    {
      key: 'build-an-emergency-fund',
      focusArea: 'finances',
      label: 'Montar minha reserva de emergência',
      summary: 'Ter mais segurança para lidar com imprevistos.',
      source: 'curated',
    },
    {
      key: 'gain-control-of-my-spending',
      focusArea: 'finances',
      label: 'Ter mais controle sobre meus gastos',
      summary: 'Saber para onde o dinheiro está indo e agir melhor.',
      source: 'curated',
    },
    {
      key: 'save-for-an-important-goal',
      focusArea: 'finances',
      label: 'Juntar dinheiro para um objetivo importante',
      summary: 'Criar constância para um plano financeiro real.',
      source: 'curated',
    },
    {
      key: 'organize-my-financial-routine',
      focusArea: 'finances',
      label: 'Organizar minha rotina financeira',
      summary: 'Substituir caos por pequenos hábitos de clareza.',
      source: 'curated',
    },
    {
      key: 'feel-more-peace-about-money',
      focusArea: 'finances',
      label: 'Sentir mais paz em relação ao dinheiro',
      summary: 'Reduzir ansiedade financeira com passos sustentáveis.',
      source: 'curated',
    },
  ],
};

export const getDreamOptions = (focusArea: OnboardingFocusArea): OnboardingDreamOption[] =>
  dreamCatalogByFocus[focusArea];
```

- [ ] **Step 4: Re-run the catalog test until it passes**

Run:

```bash
npm test -- --run src/features/onboarding/structuredCatalog.test.ts
```

Expected: PASS with `3 passed`.

- [ ] **Step 5: Commit the domain model and curated catalog**

```bash
git add src/types/onboarding.ts src/features/onboarding/structuredCatalog.ts src/features/onboarding/structuredCatalog.test.ts
git commit -m "feat: add structured onboarding catalog"
```

---

### Task 2: Replace the legacy free-text Typebot parser with a structured seed parser

**Files:**

- Modify: `src/features/onboarding/typebotPersistence.ts`
- Create: `src/features/onboarding/typebotPersistence.test.ts`

- [ ] **Step 1: Write the failing structured-payload parser test**

Create `src/features/onboarding/typebotPersistence.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the parser test to verify it fails**

Run:

```bash
npm test -- --run src/features/onboarding/typebotPersistence.test.ts
```

Expected: FAIL because `extractStructuredOnboardingSeed` does not exist yet.

- [ ] **Step 3: Replace the old extraction logic with a structured parser**

Update `src/features/onboarding/typebotPersistence.ts`:

```ts
import { type OnboardingMicroPreference, type StructuredOnboardingSeed } from '@/types/onboarding';
import { isOnboardingFocusArea, microPreferenceOptions } from './structuredCatalog';

const toTrimmedString = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isOnboardingMicroPreference = (value: unknown): value is OnboardingMicroPreference =>
  microPreferenceOptions.includes(value as OnboardingMicroPreference);

const normalizeMicroPreferences = (value: unknown): OnboardingMicroPreference[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isOnboardingMicroPreference).slice(0, 2);
};

const normalizeRegenerationCount = (value: unknown): number | null => {
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    return null;
  }

  if (value < 0 || value > 5) {
    return null;
  }

  return value;
};

export const extractStructuredOnboardingSeed = (
  value: unknown,
  expectedSignal: string
): StructuredOnboardingSeed | null => {
  if (!isRecord(value)) {
    return null;
  }

  const signal = toTrimmedString(value.signal);
  if (!signal || signal.toLowerCase() !== expectedSignal.trim().toLowerCase()) {
    return null;
  }

  const focusArea = toTrimmedString(value.focusArea);
  const selectedDreamKey = toTrimmedString(value.selectedDreamKey);
  const selectedDreamLabel = toTrimmedString(value.selectedDreamLabel);
  const regenerationCount = normalizeRegenerationCount(value.regenerationCount);
  const usedRegeneration = Boolean(value.usedRegeneration);

  if (
    !focusArea ||
    !isOnboardingFocusArea(focusArea) ||
    !selectedDreamKey ||
    !selectedDreamLabel ||
    regenerationCount === null
  ) {
    return null;
  }

  return {
    focusArea,
    selectedDreamKey,
    selectedDreamLabel,
    microPreferences: normalizeMicroPreferences(value.microPreferences),
    regenerationCount,
    usedRegeneration,
  };
};
```

Delete the old free-text persistence helpers from this file after the new parser lands:

```ts
// Remove:
// - appendTrackedAnswers
// - extractTypebotGuestMessages
// - resolveOnboardingPersistenceValues
// - deriveOnboardingValuesFromAnswers
// - deriveOnboardingValuesFromGuestMessages
```

- [ ] **Step 4: Re-run the parser test until it passes**

Run:

```bash
npm test -- --run src/features/onboarding/typebotPersistence.test.ts
```

Expected: PASS with `2 passed`.

- [ ] **Step 5: Commit the structured Typebot parser**

```bash
git add src/features/onboarding/typebotPersistence.ts src/features/onboarding/typebotPersistence.test.ts
git commit -m "feat: parse structured onboarding payloads"
```

---

### Task 3: Add starter-plan derivation and focus-specific control logic

**Files:**

- Create: `src/features/onboarding/starterPlan.ts`
- Create: `src/features/onboarding/starterPlan.test.ts`
- Modify: `src/types/onboarding.ts`

- [ ] **Step 1: Write the failing starter-plan tests**

Create `src/features/onboarding/starterPlan.test.ts`:

```ts
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
    expect(plan.controls.map(control => control.id)).toEqual(['pace', 'timeOfDay', 'frequency']);
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
```

- [ ] **Step 2: Run the starter-plan test to verify it fails**

Run:

```bash
npm test -- --run src/features/onboarding/starterPlan.test.ts
```

Expected: FAIL because `starterPlan.ts` does not exist yet.

- [ ] **Step 3: Implement the starter-plan model and derivation functions**

Extend `src/types/onboarding.ts` with the native-plan types:

```ts
export interface OnboardingControlOption {
  value: string;
  label: string;
}

export interface OnboardingControl {
  id: string;
  label: string;
  kind: 'slider' | 'chips';
  value: string;
  options: OnboardingControlOption[];
}

export interface OnboardingStarterPlan {
  focusArea: OnboardingFocusArea;
  dream: {
    key: string;
    label: string;
  };
  goal: {
    title: string;
  };
  habit: {
    title: string;
  };
  controls: OnboardingControl[];
}
```

Create `src/features/onboarding/starterPlan.ts`:

```ts
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
```

- [ ] **Step 4: Re-run the starter-plan test until it passes**

Run:

```bash
npm test -- --run src/features/onboarding/starterPlan.test.ts
```

Expected: PASS with `2 passed`.

- [ ] **Step 5: Commit the starter-plan derivation layer**

```bash
git add src/types/onboarding.ts src/features/onboarding/starterPlan.ts src/features/onboarding/starterPlan.test.ts
git commit -m "feat: derive native onboarding starter plans"
```

---

### Task 4: Build the native personalization step and hand off from Typebot into the app

**Files:**

- Create: `src/features/onboarding/OnboardingPersonalization.tsx`
- Create: `src/features/onboarding/OnboardingPersonalization.module.css`
- Modify: `src/features/onboarding/OnboardingPage.tsx`
- Modify: `src/features/onboarding/OnboardingPage.test.tsx`
- Modify: `public/locales/en/onboarding.json`
- Modify: `public/locales/pt/onboarding.json`

- [ ] **Step 1: Write the failing page-flow tests for personalization**

Add these tests to `src/features/onboarding/OnboardingPage.test.tsx`:

```tsx
it('switches from the Typebot embed to native personalization when a structured payload arrives', async () => {
  render(
    <MemoryRouter>
      <OnboardingPage />
    </MemoryRouter>
  );

  const callback = standardPropsRef.current?.onScriptExecutionSuccess as
    | ((value: unknown) => void | Promise<void>)
    | undefined;

  await act(async () => {
    await callback?.({
      signal: 'onboarding-complete',
      focusArea: 'health',
      selectedDreamKey: 'sleep-with-consistency',
      selectedDreamLabel: 'Dormir com mais consistência',
      microPreferences: ['lighter'],
      regenerationCount: 1,
      usedRegeneration: true,
    });
  });

  expect(screen.getByTestId('onboarding-personalization')).toBeInTheDocument();
  expect(screen.getByTestId('starter-dream-preview')).toHaveTextContent(
    'Dormir com mais consistência'
  );
  expect(screen.queryByTestId('typebot-standard')).toBeNull();
});

it('updates the preview when a personalization control changes', async () => {
  render(
    <MemoryRouter>
      <OnboardingPage />
    </MemoryRouter>
  );

  const callback = standardPropsRef.current?.onScriptExecutionSuccess as
    | ((value: unknown) => void | Promise<void>)
    | undefined;

  await act(async () => {
    await callback?.({
      signal: 'onboarding-complete',
      focusArea: 'finances',
      selectedDreamKey: 'build-an-emergency-fund',
      selectedDreamLabel: 'Montar minha reserva de emergência',
      microPreferences: [],
      regenerationCount: 0,
      usedRegeneration: false,
    });
  });

  fireEvent.click(screen.getByRole('button', { name: 'Focado' }));

  expect(screen.getByTestId('starter-habit-preview')).toHaveTextContent('15 minutos');
});
```

- [ ] **Step 2: Run the onboarding page tests to verify the new assertions fail**

Run:

```bash
npm test -- --run src/features/onboarding/OnboardingPage.test.tsx
```

Expected: FAIL because `OnboardingPage` still saves immediately and does not render native personalization.

- [ ] **Step 3: Build the personalization UI and update `OnboardingPage` orchestration**

Create `src/features/onboarding/OnboardingPersonalization.tsx`:

```tsx
import type { OnboardingStarterPlan } from '@/types/onboarding';
import styles from './OnboardingPersonalization.module.css';

type OnboardingPersonalizationProps = {
  plan: OnboardingStarterPlan;
  onControlChange: (controlId: string, nextValue: string) => void;
  onContinue: () => void;
};

const getSliderIndex = (value: string, values: string[]): number => values.indexOf(value);

export const OnboardingPersonalization = ({
  plan,
  onControlChange,
  onContinue,
}: OnboardingPersonalizationProps) => (
  <section className={styles.panel} data-testid="onboarding-personalization">
    <div className={styles.previewGrid}>
      <article data-testid="starter-dream-preview" className={styles.card}>
        <span className={styles.label}>Dream</span>
        <strong>{plan.dream.label}</strong>
      </article>
      <article data-testid="starter-goal-preview" className={styles.card}>
        <span className={styles.label}>Goal</span>
        <strong>{plan.goal.title}</strong>
      </article>
      <article data-testid="starter-habit-preview" className={styles.card}>
        <span className={styles.label}>Habit</span>
        <strong>{plan.habit.title}</strong>
      </article>
    </div>

    {plan.controls.map(control =>
      control.kind === 'slider' ? (
        <label key={control.id} className={styles.control}>
          <span>{control.label}</span>
          <input
            type="range"
            min={0}
            max={control.options.length - 1}
            value={getSliderIndex(
              control.value,
              control.options.map(option => option.value)
            )}
            onChange={event => {
              const nextOption = control.options[Number(event.currentTarget.value)];
              if (nextOption) {
                onControlChange(control.id, nextOption.value);
              }
            }}
          />
        </label>
      ) : (
        <div key={control.id} className={styles.control}>
          <span>{control.label}</span>
          <div className={styles.chips}>
            {control.options.map(option => (
              <button
                key={option.value}
                type="button"
                className={option.value === control.value ? styles.chipActive : styles.chip}
                onClick={() => onControlChange(control.id, option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )
    )}

    <button type="button" className={styles.primaryButton} onClick={onContinue}>
      Continue
    </button>
  </section>
);
```

Minimal `src/features/onboarding/OnboardingPersonalization.module.css`:

```css
.panel {
  display: grid;
  gap: 24px;
}

.previewGrid {
  display: grid;
  gap: 16px;
}

.card {
  padding: 20px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.92);
}

.label {
  display: block;
  margin-bottom: 8px;
  font-size: 12px;
  text-transform: uppercase;
}

.control {
  display: grid;
  gap: 12px;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.chip,
.chipActive,
.primaryButton {
  border-radius: 999px;
}

.chipActive {
  background: #6f53c1;
  color: #fff;
}
```

Update `src/features/onboarding/OnboardingPage.tsx` with the new state machine:

```tsx
import { createStarterPlan, applyStarterPlanControl } from './starterPlan';
import { extractStructuredOnboardingSeed } from './typebotPersistence';
import { OnboardingPersonalization } from './OnboardingPersonalization';

type NativeStep = 'typebot' | 'personalization' | 'review';

const [nativeStep, setNativeStep] = useState<NativeStep>('typebot');
const [starterPlan, setStarterPlan] = useState<OnboardingStarterPlan | null>(null);

const handleStructuredCompletion = useCallback(
  (payload: unknown) => {
    const seed = extractStructuredOnboardingSeed(payload, typebotCompletionSignal);
    if (!seed) {
      return false;
    }

    setStarterPlan(createStarterPlan(seed));
    setNativeStep('personalization');
    setErrorMessage(null);
    return true;
  },
  [typebotCompletionSignal]
);

const handleScriptExecutionSuccess = useCallback(
  async (rawValue: unknown) => {
    const handled = handleStructuredCompletion(rawValue);
    if (handled) {
      return;
    }
  },
  [handleStructuredCompletion]
);

const handleControlChange = useCallback((controlId: string, nextValue: string) => {
  setStarterPlan(current =>
    current ? applyStarterPlanControl(current, controlId, nextValue) : current
  );
}, []);
```

Render the native step instead of the embed once the seed is parsed:

```tsx
<OnboardingStage
  phase={phase}
  showFallback={!isEmbedConfigured}
  ...
  embed={
    nativeStep === 'typebot' ? (
      <Standard
        key={embedAttempt}
        typebot={typebotOnboardingId}
        apiHost={typebotApiHost}
        prefilledVariables={prefilledVariables}
        onScriptExecutionSuccess={(value: unknown) => {
          void handleScriptExecutionSuccess(value);
        }}
        style={{ width: '100%', height: '600px' }}
      />
    ) : starterPlan ? (
      <OnboardingPersonalization
        plan={starterPlan}
        onControlChange={handleControlChange}
        onContinue={() => setNativeStep('review')}
      />
    ) : null
  }
/>
```

Update both locale files with the new action and section keys:

```json
{
  "actions": {
    "skip": "Pular por agora",
    "retry": "Tentar novamente",
    "continue": "Continuar",
    "confirm": "Confirmar",
    "correct": "Corrigir"
  },
  "native": {
    "dream": "Dream",
    "goal": "Goal",
    "habit": "Habit"
  }
}
```

- [ ] **Step 4: Re-run the onboarding page tests until the personalization flow passes**

Run:

```bash
npm test -- --run src/features/onboarding/OnboardingPage.test.tsx
```

Expected: PASS for the two new personalization tests, with old text-persistence tests now removed or rewritten in the next task.

- [ ] **Step 5: Commit the native personalization handoff**

```bash
git add src/features/onboarding/OnboardingPersonalization.tsx src/features/onboarding/OnboardingPersonalization.module.css src/features/onboarding/OnboardingPage.tsx src/features/onboarding/OnboardingPage.test.tsx public/locales/en/onboarding.json public/locales/pt/onboarding.json
git commit -m "feat: hand off structured onboarding into native personalization"
```

---

### Task 5: Add the review screen, persistence helper, and correction path

**Files:**

- Create: `src/features/onboarding/OnboardingReview.tsx`
- Create: `src/features/onboarding/OnboardingReview.module.css`
- Create: `src/features/onboarding/persistStarterPlan.ts`
- Create: `src/features/onboarding/persistStarterPlan.test.ts`
- Modify: `src/features/onboarding/OnboardingPage.tsx`
- Modify: `src/features/onboarding/OnboardingPage.test.tsx`

- [ ] **Step 1: Write the failing review and persistence tests**

Create `src/features/onboarding/persistStarterPlan.test.ts`:

```ts
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
```

Add these tests to `src/features/onboarding/OnboardingPage.test.tsx`:

```tsx
it('moves from personalization to review and persists the starter trio after confirmation', async () => {
  const completeOnboarding = vi.fn().mockResolvedValue(true);

  useAuthMock.mockReturnValue({
    user: {
      id: 'user-123',
      email: 'user@example.com',
      display_name: 'Test User',
    },
    skipOnboarding: vi.fn().mockResolvedValue(true),
    completeOnboarding,
  });

  const user = userEvent.setup();

  render(
    <MemoryRouter>
      <OnboardingPage />
    </MemoryRouter>
  );

  const callback = standardPropsRef.current?.onScriptExecutionSuccess as
    | ((value: unknown) => void | Promise<void>)
    | undefined;

  await act(async () => {
    await callback?.({
      signal: 'onboarding-complete',
      focusArea: 'health',
      selectedDreamKey: 'sleep-with-consistency',
      selectedDreamLabel: 'Dormir com mais consistência',
      microPreferences: [],
      regenerationCount: 0,
      usedRegeneration: false,
    });
  });

  await user.click(screen.getByRole('button', { name: 'Continue' }));
  await user.click(screen.getByRole('button', { name: 'Confirmar' }));

  await waitFor(() => {
    expect(createDreamBoardMock).toHaveBeenCalledTimes(1);
    expect(createGoalMock).toHaveBeenCalledTimes(1);
    expect(createHabitMock).toHaveBeenCalledTimes(1);
    expect(completeOnboarding).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith('/app/dashboard', { replace: true });
  });
});

it('returns to the Typebot step when the user chooses to correct the plan', async () => {
  const user = userEvent.setup();

  render(
    <MemoryRouter>
      <OnboardingPage />
    </MemoryRouter>
  );

  const callback = standardPropsRef.current?.onScriptExecutionSuccess as
    | ((value: unknown) => void | Promise<void>)
    | undefined;

  await act(async () => {
    await callback?.({
      signal: 'onboarding-complete',
      focusArea: 'relationships',
      selectedDreamKey: 'be-more-present-with-family',
      selectedDreamLabel: 'Estar mais presente com minha família',
      microPreferences: [],
      regenerationCount: 0,
      usedRegeneration: false,
    });
  });

  await user.click(screen.getByRole('button', { name: 'Continue' }));
  await user.click(screen.getByRole('button', { name: 'Corrigir' }));

  expect(screen.getByTestId('typebot-standard')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the persistence and page tests to verify they fail**

Run:

```bash
npm test -- --run src/features/onboarding/persistStarterPlan.test.ts src/features/onboarding/OnboardingPage.test.tsx
```

Expected: FAIL because the review screen and persistence helper do not exist yet.

- [ ] **Step 3: Add the review component, persistence helper, and correction path**

Create `src/features/onboarding/OnboardingReview.tsx`:

```tsx
import type { OnboardingStarterPlan } from '@/types/onboarding';
import styles from './OnboardingReview.module.css';

type OnboardingReviewProps = {
  plan: OnboardingStarterPlan;
  onConfirm: () => void;
  onCorrect: () => void;
  isSubmitting: boolean;
};

export const OnboardingReview = ({
  plan,
  onConfirm,
  onCorrect,
  isSubmitting,
}: OnboardingReviewProps) => (
  <section className={styles.panel} data-testid="onboarding-review">
    <article className={styles.card}>
      <span>Dream</span>
      <strong>{plan.dream.label}</strong>
    </article>
    <article className={styles.card}>
      <span>Goal</span>
      <strong>{plan.goal.title}</strong>
    </article>
    <article className={styles.card}>
      <span>Habit</span>
      <strong>{plan.habit.title}</strong>
    </article>

    <div className={styles.actions}>
      <button type="button" onClick={onCorrect} disabled={isSubmitting}>
        Corrigir
      </button>
      <button type="button" onClick={onConfirm} disabled={isSubmitting}>
        Confirmar
      </button>
    </div>
  </section>
);
```

Create `src/features/onboarding/persistStarterPlan.ts`:

```ts
import type { GoalCategory } from '@/core/services/goalsService';
import { createDreamBoard } from '@/core/services/dreamBoardService';
import { createGoal } from '@/core/services/goalsService';
import { createHabit } from '@/core/services/habitsService';
import type { OnboardingFocusArea, OnboardingStarterPlan } from '@/types/onboarding';

const GOAL_CATEGORY_BY_FOCUS: Record<OnboardingFocusArea, GoalCategory> = {
  health: 'fitness',
  relationships: 'personal',
  finances: 'personal',
};

const HABIT_CATEGORY_BY_FOCUS: Record<OnboardingFocusArea, string> = {
  health: 'health',
  relationships: 'relationships',
  finances: 'finances',
};

export const persistStarterPlan = async (plan: OnboardingStarterPlan): Promise<void> => {
  await Promise.all([
    createDreamBoard({
      title: plan.dream.label,
      categories: [plan.focusArea],
      content: [],
    }),
    createGoal(plan.goal.title, GOAL_CATEGORY_BY_FOCUS[plan.focusArea]),
    createHabit(plan.habit.title, HABIT_CATEGORY_BY_FOCUS[plan.focusArea]),
  ]);
};
```

Update `src/features/onboarding/OnboardingPage.tsx`:

```tsx
import { OnboardingReview } from './OnboardingReview';
import { persistStarterPlan } from './persistStarterPlan';

const handleConfirmStarterPlan = useCallback(async () => {
  if (!starterPlan || isSubmitting) {
    return;
  }

  setIsSubmitting(true);
  setErrorMessage(null);

  try {
    await persistStarterPlan(starterPlan);
    await handleComplete();
  } catch (error) {
    setErrorMessage(
      error instanceof Error ? error.message : t('onboarding.status.completionFailed')
    );
    setIsSubmitting(false);
  }
}, [handleComplete, isSubmitting, starterPlan, t]);

const handleCorrectStarterPlan = useCallback(() => {
  setStarterPlan(null);
  setNativeStep('typebot');
  setEmbedAttempt(current => current + 1);
}, []);
```

Render the review screen:

```tsx
embed={
  nativeStep === 'typebot' ? (
    <Standard ... />
  ) : nativeStep === 'personalization' && starterPlan ? (
    <OnboardingPersonalization
      plan={starterPlan}
      onControlChange={handleControlChange}
      onContinue={() => setNativeStep('review')}
    />
  ) : nativeStep === 'review' && starterPlan ? (
    <OnboardingReview
      plan={starterPlan}
      onConfirm={() => {
        void handleConfirmStarterPlan();
      }}
      onCorrect={handleCorrectStarterPlan}
      isSubmitting={isSubmitting}
    />
  ) : null
}
```

- [ ] **Step 4: Re-run the persistence and review tests until they pass**

Run:

```bash
npm test -- --run src/features/onboarding/persistStarterPlan.test.ts src/features/onboarding/OnboardingPage.test.tsx
```

Expected: PASS for the new review and persistence coverage.

- [ ] **Step 5: Commit the review and persistence flow**

```bash
git add src/features/onboarding/OnboardingReview.tsx src/features/onboarding/OnboardingReview.module.css src/features/onboarding/persistStarterPlan.ts src/features/onboarding/persistStarterPlan.test.ts src/features/onboarding/OnboardingPage.tsx src/features/onboarding/OnboardingPage.test.tsx
git commit -m "feat: review and persist structured onboarding plans"
```

---

### Task 6: Add the source-controlled Typebot V1 export and browser verification

**Files:**

- Create: `docs/typebot/structured-onboarding-v1.json`
- Modify: `tests/check-typebot.spec.ts`

- [ ] **Step 1: Replace the debug Playwright spec with a real structured-handoff spec**

Update `tests/check-typebot.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test('structured onboarding handoff opens native personalization', async ({ page }) => {
  await page.goto('http://localhost:5173/auth/login');
  await page.fill('input[type="email"]', 'gleisser@mailinator.com');
  await page.fill('input[type="password"]', 'Password2!');
  await page.click('button[type="submit"]');

  await page.waitForTimeout(2000);
  await page.goto('http://localhost:5173/app/onboarding');
  await page.getByTestId('onboarding-page').waitFor();

  await page.evaluate(() => {
    window.postMessage(
      {
        from: 'typebot-custom',
        signal: 'onboarding-complete',
        focusArea: 'health',
        selectedDreamKey: 'sleep-with-consistency',
        selectedDreamLabel: 'Dormir com mais consistência',
        microPreferences: ['lighter'],
        regenerationCount: 1,
        usedRegeneration: true,
      },
      '*'
    );
  });

  await expect(page.getByTestId('onboarding-personalization')).toBeVisible();
  await expect(page.getByTestId('starter-dream-preview')).toContainText(
    'Dormir com mais consistência'
  );
});
```

- [ ] **Step 2: Run the Playwright spec to verify it fails before the final wiring is complete**

Run:

```bash
npx playwright test tests/check-typebot.spec.ts --project=chromium
```

Expected: FAIL before Tasks 4 and 5 land; PASS once the native handoff is wired.

- [ ] **Step 3: Add the new Typebot export artifact to the repository**

Create `docs/typebot/structured-onboarding-v1.json`:

```json
{
  "name": "We Better - Structured Onboarding V1",
  "version": "6",
  "metadata": {
    "description": "Short structured onboarding for first access",
    "focusAreas": ["health", "relationships", "finances"],
    "regenerationLimit": 5
  },
  "variables": [
    { "id": "focusArea", "name": "focusArea" },
    { "id": "selectedDreamKey", "name": "selectedDreamKey" },
    { "id": "selectedDreamLabel", "name": "selectedDreamLabel" },
    { "id": "microPreferences", "name": "microPreferences" },
    { "id": "regenerationCount", "name": "regenerationCount" },
    { "id": "usedRegeneration", "name": "usedRegeneration" }
  ],
  "groups": [
    {
      "title": "Welcome",
      "blocks": [
        {
          "id": "welcome-text",
          "type": "text",
          "content": {
            "richText": [
              {
                "type": "p",
                "children": [{ "text": "Vamos criar seu ponto de partida no We Better." }]
              }
            ]
          }
        }
      ]
    },
    {
      "title": "Focus Area",
      "blocks": [
        {
          "id": "focus-choice",
          "type": "choice input",
          "options": {
            "variableId": "focusArea",
            "items": [
              { "content": "Saúde" },
              { "content": "Relacionamentos" },
              { "content": "Finanças" }
            ]
          }
        }
      ]
    },
    {
      "title": "Completion",
      "blocks": [
        {
          "id": "handoff-script",
          "type": "code",
          "options": {
            "content": "window.parent.postMessage({ from: 'typebot-custom', signal: 'onboarding-complete', focusArea: {{focusArea}}, selectedDreamKey: {{selectedDreamKey}}, selectedDreamLabel: {{selectedDreamLabel}}, microPreferences: {{microPreferences}}, regenerationCount: {{regenerationCount}}, usedRegeneration: {{usedRegeneration}} }, '*');"
          }
        }
      ]
    }
  ]
}
```

- [ ] **Step 4: Validate the export JSON and the browser handoff**

Run:

```bash
jq empty docs/typebot/structured-onboarding-v1.json
npx playwright test tests/check-typebot.spec.ts --project=chromium
```

Expected:

- `jq` exits `0`
- Playwright PASS with `1 passed`

- [ ] **Step 5: Commit the Typebot artifact and browser verification**

```bash
git add docs/typebot/structured-onboarding-v1.json tests/check-typebot.spec.ts
git commit -m "test: verify structured onboarding typebot handoff"
```

---

## Final Verification

- [ ] Run the focused onboarding unit tests:

```bash
npm test -- --run src/features/onboarding/structuredCatalog.test.ts src/features/onboarding/typebotPersistence.test.ts src/features/onboarding/starterPlan.test.ts src/features/onboarding/persistStarterPlan.test.ts src/features/onboarding/OnboardingPage.test.tsx
```

Expected: PASS for all targeted onboarding tests.

- [ ] Run the browser verification:

```bash
npx playwright test tests/check-typebot.spec.ts --project=chromium
```

Expected: PASS for the structured-handoff scenario.

- [ ] Run the production build:

```bash
npm run build
```

Expected: successful Vite production build.
