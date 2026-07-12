# Onboarding Ritual Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign `/app/onboarding` into a cinematic two-phase We Better ritual with GSAP-driven transition, premium Typebot stage, reduced-motion fallback, and resilient loading/error behavior.

**Architecture:** Keep the existing auth gating, skip/completion actions, and Typebot integration intact, but split the onboarding page into presentation units (`hero`, `stage`, `motion`) with explicit view-state transitions. Use `@gsap/react` with one scoped root timeline for intro-to-chat choreography, and keep all business logic inside `OnboardingPage`.

**Tech Stack:** React 18, TypeScript 5, Vite 5, Vitest, Testing Library, CSS Modules, GSAP, `@gsap/react`, `@typebot.io/react`

---

## File Structure

### Existing files to modify

- `package.json` — add `@gsap/react`
- `package-lock.json` — lockfile update for `@gsap/react`
- `public/locales/pt/onboarding.json` — new intro/stage/loading/fallback copy
- `public/locales/en/onboarding.json` — English parity
- `src/features/onboarding/OnboardingPage.tsx` — keep orchestration, auth actions, and Typebot wiring
- `src/features/onboarding/OnboardingPage.test.tsx` — expand route-level behavior coverage
- `src/features/onboarding/OnboardingPage.module.css` — keep only page-level layout tokens if still useful
- `src/features/onboarding/analytics.ts` — add intro/stage/fallback telemetry events

### New files to create

- `public/assets/images/onboarding/we-better-ritual-hero.webp` — committed copy of the supplied hero image
- `src/features/onboarding/onboardingPresentation.ts` — presentation state types and timing constants
- `src/features/onboarding/OnboardingHero.tsx` — full-screen intro shell
- `src/features/onboarding/OnboardingHero.module.css` — intro styling
- `src/features/onboarding/OnboardingStage.tsx` — premium Typebot stage shell
- `src/features/onboarding/OnboardingStage.module.css` — stage styling and loading/fallback visuals
- `src/features/onboarding/useOnboardingMotion.ts` — GSAP timeline and reduced-motion branching
- `src/features/onboarding/useOnboardingMotion.test.tsx` — reduced-motion and phase callback coverage

### Boundaries

- `OnboardingPage` owns auth actions, analytics dispatch, retry/skip/completion handling, and embed props.
- `OnboardingHero` is dumb UI: logo, copy, skip action, image backdrop.
- `OnboardingStage` is dumb UI: premium container, loading state, embed slot, fallback/retry.
- `useOnboardingMotion` owns only animation orchestration and phase advancement.

---

### Task 1: Add the GSAP React dependency and presentation model

**Files:**

- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `src/features/onboarding/onboardingPresentation.ts`
- Modify: `src/features/onboarding/OnboardingPage.test.tsx`

- [ ] **Step 1: Write the failing presentation-state test**

Add this test block near the top of `src/features/onboarding/OnboardingPage.test.tsx`:

```tsx
it('starts in the intro presentation state before the chat stage takes over', () => {
  render(
    <MemoryRouter>
      <OnboardingPage />
    </MemoryRouter>
  );

  expect(screen.getByTestId('onboarding-page')).toHaveAttribute('data-phase', 'intro');
  expect(screen.getByTestId('onboarding-hero')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the targeted test to verify it fails**

Run:

```bash
npm test -- --run src/features/onboarding/OnboardingPage.test.tsx
```

Expected: FAIL because `data-testid="onboarding-page"`, `data-phase`, and `onboarding-hero` do not exist yet.

- [ ] **Step 3: Add the dependency and presentation constants**

Update `package.json` dependencies:

```json
"@gsap/react": "^2.1.2",
"gsap": "^3.12.7"
```

Create `src/features/onboarding/onboardingPresentation.ts`:

```ts
export type OnboardingPhase =
  | 'intro'
  | 'transitioning'
  | 'loading'
  | 'chat'
  | 'error'
  | 'reduced-motion-chat';

export const INTRO_DURATION_MS = 3600;
export const MOBILE_INTRO_DURATION_MS = 3200;
export const PHASE_ATTRIBUTE = 'data-phase';
```

Minimal `OnboardingPage.tsx` change for this task:

```tsx
const [phase, setPhase] = useState<OnboardingPhase>('intro');

return (
  <div className={styles.page} data-testid="onboarding-page" data-phase={phase}>
    <section data-testid="onboarding-hero" className={styles.introPanel}>
      ...
    </section>
  </div>
);
```

- [ ] **Step 4: Re-run the targeted test until it passes**

Run:

```bash
npm test -- --run src/features/onboarding/OnboardingPage.test.tsx
```

Expected: PASS for the new presentation-state assertion, while existing onboarding tests remain green.

- [ ] **Step 5: Commit the dependency and state-model scaffolding**

```bash
git add package.json package-lock.json src/features/onboarding/onboardingPresentation.ts src/features/onboarding/OnboardingPage.tsx src/features/onboarding/OnboardingPage.test.tsx
git commit -m "feat: add onboarding presentation state scaffolding"
```

---

### Task 2: Split the page into hero and stage shells with updated copy

**Files:**

- Create: `src/features/onboarding/OnboardingHero.tsx`
- Create: `src/features/onboarding/OnboardingHero.module.css`
- Create: `src/features/onboarding/OnboardingStage.tsx`
- Create: `src/features/onboarding/OnboardingStage.module.css`
- Modify: `src/features/onboarding/OnboardingPage.tsx`
- Modify: `src/features/onboarding/OnboardingPage.module.css`
- Modify: `public/locales/pt/onboarding.json`
- Modify: `public/locales/en/onboarding.json`
- Modify: `src/features/onboarding/OnboardingPage.test.tsx`

- [ ] **Step 1: Write failing tests for the premium shell states**

Add these tests to `src/features/onboarding/OnboardingPage.test.tsx`:

```tsx
it('renders the premium stage shell with a loading state before the embed becomes primary', () => {
  render(
    <MemoryRouter>
      <OnboardingPage />
    </MemoryRouter>
  );

  expect(screen.getByTestId('onboarding-stage')).toBeInTheDocument();
  expect(screen.getByTestId('onboarding-stage-loading')).toBeInTheDocument();
});

it('shows retry and skip actions when the embed is unavailable', () => {
  vi.stubEnv('VITE_TYPEBOT_ONBOARDING_ID', '');

  render(
    <MemoryRouter>
      <OnboardingPage />
    </MemoryRouter>
  );

  expect(screen.getByRole('button', { name: 'onboarding.actions.retry' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'onboarding.actions.skip' })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the onboarding test file to verify the new assertions fail**

Run:

```bash
npm test -- --run src/features/onboarding/OnboardingPage.test.tsx
```

Expected: FAIL because the stage shell, loading placeholder, and retry action are not rendered yet.

- [ ] **Step 3: Create the dumb presentation components and update locales**

Create `src/features/onboarding/OnboardingHero.tsx`:

```tsx
type OnboardingHeroProps = {
  title: string;
  body: string;
  skipLabel: string;
  onSkip: () => void;
  isSubmitting: boolean;
};

export const OnboardingHero = ({
  title,
  body,
  skipLabel,
  onSkip,
  isSubmitting,
}: OnboardingHeroProps) => (
  <section data-testid="onboarding-hero" className={styles.hero}>
    <img
      className={styles.heroImage}
      src="/assets/images/onboarding/we-better-ritual-hero.webp"
      alt=""
    />
    <div className={styles.overlay} />
    <div className={styles.chrome}>
      <span className={styles.logo}>We Better</span>
      <button type="button" onClick={onSkip} disabled={isSubmitting} className={styles.skipButton}>
        {skipLabel}
      </button>
    </div>
    <div className={styles.copy}>
      <h1>{title}</h1>
      <p>{body}</p>
    </div>
  </section>
);
```

Create `src/features/onboarding/OnboardingStage.tsx`:

```tsx
type OnboardingStageProps = {
  phase: OnboardingPhase;
  showFallback: boolean;
  retryLabel: string;
  skipLabel: string;
  onRetry: () => void;
  onSkip: () => void;
  embed: React.ReactNode;
};

export const OnboardingStage = ({
  phase,
  showFallback,
  retryLabel,
  skipLabel,
  onRetry,
  onSkip,
  embed,
}: OnboardingStageProps) => (
  <section data-testid="onboarding-stage" className={styles.stage} data-phase={phase}>
    <div className={styles.container}>
      {showFallback ? (
        <div className={styles.fallback}>
          <button type="button" onClick={onRetry}>
            {retryLabel}
          </button>
          <button type="button" onClick={onSkip}>
            {skipLabel}
          </button>
        </div>
      ) : (
        <>
          {phase !== 'chat' && phase !== 'reduced-motion-chat' ? (
            <div data-testid="onboarding-stage-loading" className={styles.loadingShell} />
          ) : null}
          {embed}
        </>
      )}
    </div>
  </section>
);
```

Update locales with these keys:

```json
"actions": {
  "skip": "Pular por agora",
  "retry": "Tentar novamente"
},
"hero": {
  "title": "Clareza para o que você quer viver",
  "body": "Agora vamos transformar visão em direção com uma jornada guiada para o seu primeiro sonho, meta e hábito."
}
```

Wire both components into `OnboardingPage.tsx` and keep the page file responsible for auth callbacks and embed props only.

- [ ] **Step 4: Re-run the onboarding tests until the shell behavior passes**

Run:

```bash
npm test -- --run src/features/onboarding/OnboardingPage.test.tsx
```

Expected: PASS with hero shell, stage shell, loading placeholder, and retry fallback assertions all green.

- [ ] **Step 5: Commit the shell split and copy update**

```bash
git add public/locales/pt/onboarding.json public/locales/en/onboarding.json src/features/onboarding/OnboardingHero.tsx src/features/onboarding/OnboardingHero.module.css src/features/onboarding/OnboardingStage.tsx src/features/onboarding/OnboardingStage.module.css src/features/onboarding/OnboardingPage.tsx src/features/onboarding/OnboardingPage.module.css src/features/onboarding/OnboardingPage.test.tsx
git commit -m "feat: split onboarding into hero and stage shells"
```

---

### Task 3: Add GSAP motion orchestration and reduced-motion fallback

**Files:**

- Create: `src/features/onboarding/useOnboardingMotion.ts`
- Create: `src/features/onboarding/useOnboardingMotion.test.tsx`
- Modify: `src/features/onboarding/OnboardingPage.tsx`
- Modify: `src/features/onboarding/OnboardingHero.tsx`
- Modify: `src/features/onboarding/OnboardingStage.tsx`

- [ ] **Step 1: Write the failing reduced-motion and phase-advance tests**

Create `src/features/onboarding/useOnboardingMotion.test.tsx` with:

```tsx
it('jumps directly to reduced-motion-chat when prefers-reduced-motion is enabled', () => {
  const onPhaseChange = vi.fn();
  window.matchMedia = vi
    .fn()
    .mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }) as never;

  render(<MotionHarness onPhaseChange={onPhaseChange} />);

  expect(onPhaseChange).toHaveBeenCalledWith('reduced-motion-chat');
});

it('advances intro to transitioning and chat when reduced motion is not enabled', async () => {
  const onPhaseChange = vi.fn();
  window.matchMedia = vi
    .fn()
    .mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }) as never;

  render(<MotionHarness onPhaseChange={onPhaseChange} />);

  await waitFor(() => expect(onPhaseChange).toHaveBeenCalledWith('transitioning'));
  await waitFor(() => expect(onPhaseChange).toHaveBeenCalledWith('chat'));
});
```

- [ ] **Step 2: Run the motion test file to verify it fails**

Run:

```bash
npm test -- --run src/features/onboarding/useOnboardingMotion.test.tsx
```

Expected: FAIL because the hook and harness do not exist.

- [ ] **Step 3: Implement the motion hook using `useGSAP`**

Create `src/features/onboarding/useOnboardingMotion.ts`:

```ts
import { RefObject } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { INTRO_DURATION_MS, OnboardingPhase } from './onboardingPresentation';

gsap.registerPlugin(useGSAP);

export const useOnboardingMotion = (
  rootRef: RefObject<HTMLElement>,
  onPhaseChange: (phase: OnboardingPhase) => void
) => {
  useGSAP(
    (_, contextSafe) => {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (reducedMotion) {
        onPhaseChange('reduced-motion-chat');
        return;
      }

      const safePhaseChange = contextSafe(onPhaseChange);
      const timeline = gsap.timeline({ defaults: { ease: 'power2.out' } });

      timeline
        .call(() => safePhaseChange('intro'))
        .to('[data-hero-copy]', { autoAlpha: 1, y: 0, duration: 0.8 }, 0)
        .call(() => safePhaseChange('transitioning'), [], INTRO_DURATION_MS / 1000 - 1.2)
        .to('[data-hero-scene]', { filter: 'blur(10px)', scale: 1.04, duration: 1.1 }, '<')
        .to('[data-stage-shell]', { autoAlpha: 1, y: 0, duration: 0.9 }, '<0.2')
        .call(() => safePhaseChange('chat'));

      return () => timeline.kill();
    },
    { scope: rootRef }
  );
};
```

Wire it into `OnboardingPage.tsx` with a single `rootRef`, and add scoped attributes to hero/stage:

```tsx
const rootRef = useRef<HTMLDivElement>(null);
useOnboardingMotion(rootRef, setPhase);

return (
  <div ref={rootRef} data-testid="onboarding-page" data-phase={phase} className={styles.page}>
    ...
  </div>
);
```

- [ ] **Step 4: Re-run motion and page tests until phase behavior passes**

Run:

```bash
npm test -- --run src/features/onboarding/useOnboardingMotion.test.tsx src/features/onboarding/OnboardingPage.test.tsx
```

Expected: PASS with reduced-motion and intro-to-chat sequencing covered.

- [ ] **Step 5: Commit the GSAP orchestration**

```bash
git add src/features/onboarding/useOnboardingMotion.ts src/features/onboarding/useOnboardingMotion.test.tsx src/features/onboarding/OnboardingPage.tsx src/features/onboarding/OnboardingHero.tsx src/features/onboarding/OnboardingStage.tsx
git commit -m "feat: add gsap onboarding motion flow"
```

---

### Task 4: Polish the premium visuals, image asset, analytics, and retry path

**Files:**

- Create: `public/assets/images/onboarding/we-better-ritual-hero.webp`
- Modify: `src/features/onboarding/OnboardingHero.module.css`
- Modify: `src/features/onboarding/OnboardingStage.module.css`
- Modify: `src/features/onboarding/OnboardingPage.module.css`
- Modify: `src/features/onboarding/OnboardingPage.tsx`
- Modify: `src/features/onboarding/analytics.ts`
- Modify: `src/features/onboarding/OnboardingPage.test.tsx`

- [ ] **Step 1: Write the failing analytics and retry tests**

Append these tests to `src/features/onboarding/OnboardingPage.test.tsx`:

```tsx
it('dispatches intro, stage, and fallback analytics events', async () => {
  const events: string[] = [];
  window.addEventListener('we-better:onboarding-analytics', ((event: CustomEvent) => {
    events.push(event.detail.eventName);
  }) as EventListener);

  vi.stubEnv('VITE_TYPEBOT_ONBOARDING_ID', '');

  render(
    <MemoryRouter>
      <OnboardingPage />
    </MemoryRouter>
  );

  await waitFor(() => expect(events).toContain('onboarding_intro_shown'));
  await waitFor(() => expect(events).toContain('onboarding_fallback_shown'));
});

it('retries the embed stage without leaving the onboarding route', async () => {
  const user = userEvent.setup();
  vi.stubEnv('VITE_TYPEBOT_ONBOARDING_ID', '');

  render(
    <MemoryRouter>
      <OnboardingPage />
    </MemoryRouter>
  );

  await user.click(screen.getByRole('button', { name: 'onboarding.actions.retry' }));

  expect(screen.getByTestId('onboarding-stage')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the onboarding tests to confirm analytics/retry fail first**

Run:

```bash
npm test -- --run src/features/onboarding/OnboardingPage.test.tsx
```

Expected: FAIL because the new analytics events and retry action do not exist yet.

- [ ] **Step 3: Add the asset, premium styling, and analytics events**

Copy the approved image into the repo:

```bash
mkdir -p public/assets/images/onboarding
cp "/Users/gleisser/Downloads/tinywow_Gemini_Generated_Image_y04r33y04r33y04r_89232549.webp" public/assets/images/onboarding/we-better-ritual-hero.webp
```

Extend `src/features/onboarding/analytics.ts`:

```ts
export type OnboardingAnalyticsEvent =
  | 'onboarding_shown'
  | 'onboarding_intro_shown'
  | 'onboarding_stage_shown'
  | 'onboarding_fallback_shown'
  | 'onboarding_skipped'
  | 'onboarding_completed'
  | 'onboarding_completion_redirect';
```

Add stage retry state in `OnboardingPage.tsx`:

```tsx
const [embedAttempt, setEmbedAttempt] = useState(0);

const handleRetry = useCallback(() => {
  setEmbedAttempt(current => current + 1);
  setErrorMessage(null);
}, []);
```

Key the embed shell with `embedAttempt`, and dispatch analytics on intro/stage/fallback transitions.

Use CSS modules to implement:

- full-screen image scene
- warm overlay + dark vignette
- central hybrid container
- stage aura
- mobile crop and condensed spacing

- [ ] **Step 4: Re-run focused tests and the build**

Run:

```bash
npm test -- --run src/features/onboarding/OnboardingPage.test.tsx src/features/onboarding/useOnboardingMotion.test.tsx
npm run build
```

Expected: PASS for tests and a successful production build.

- [ ] **Step 5: Commit the visual polish and analytics work**

```bash
git add public/assets/images/onboarding/we-better-ritual-hero.webp src/features/onboarding/OnboardingHero.module.css src/features/onboarding/OnboardingStage.module.css src/features/onboarding/OnboardingPage.module.css src/features/onboarding/OnboardingPage.tsx src/features/onboarding/analytics.ts src/features/onboarding/OnboardingPage.test.tsx
git commit -m "feat: polish onboarding ritual visuals and analytics"
```

---

### Task 5: Run full verification for route behavior, accessibility, and the browser flow

**Files:**

- Modify if needed: `src/features/onboarding/OnboardingPage.tsx`
- Modify if needed: `src/features/onboarding/OnboardingHero.module.css`
- Modify if needed: `src/features/onboarding/OnboardingStage.module.css`

- [ ] **Step 1: Run the targeted unit and route suite**

Run:

```bash
npm test -- --run \
  src/features/onboarding/OnboardingPage.test.tsx \
  src/features/onboarding/useOnboardingMotion.test.tsx \
  src/features/auth/__tests__/ProtectedRoute.test.tsx \
  src/core/router/index.test.tsx \
  src/shared/contexts/AuthContext.test.tsx
```

Expected: PASS with no regressions in onboarding gating or page behavior.

- [ ] **Step 2: Run lint on the changed onboarding files**

Run:

```bash
npx eslint \
  src/features/onboarding/OnboardingPage.tsx \
  src/features/onboarding/OnboardingHero.tsx \
  src/features/onboarding/OnboardingStage.tsx \
  src/features/onboarding/useOnboardingMotion.ts \
  src/features/onboarding/analytics.ts
```

Expected: PASS with zero lint errors.

- [ ] **Step 3: Run the app and verify the onboarding manually in the browser**

Run:

```bash
npm run dev
```

Then verify manually or with Playwright:

- new user still lands on `/app/onboarding`
- intro shows full-screen image with logo and skip
- transition completes in roughly `3 to 4s`
- Typebot stage becomes central
- reduced-motion mode skips the cinematic sequence
- fallback stays usable if the Typebot ID is removed

- [ ] **Step 4: Fix any regressions found in verification and re-run the exact failing command**

Use the smallest possible fix. Example:

```bash
npm test -- --run src/features/onboarding/OnboardingPage.test.tsx
```

Expected: PASS again before moving on.

- [ ] **Step 5: Commit the final verified onboarding redesign**

```bash
git add src/features/onboarding public/locales/pt/onboarding.json public/locales/en/onboarding.json public/assets/images/onboarding/we-better-ritual-hero.webp package.json package-lock.json
git commit -m "feat: redesign onboarding as cinematic ritual"
```

---

## Self-Review

### Spec coverage

- Intro ritual, image-first opening, premium stage, and Typebot-first-message behavior are covered in Tasks 2-4.
- GSAP with `@gsap/react`, reduced motion, and scoped timeline orchestration are covered in Task 3.
- Skip, retry, fallback, analytics, and verification are covered in Tasks 2, 4, and 5.
- Existing onboarding routing and auth behavior are verified in Task 5 rather than redesigned.

### Placeholder scan

- No `TBD`, `TODO`, or “implement later” placeholders remain.
- Every code-changing task includes concrete file paths, code snippets, and commands.

### Type consistency

- The plan uses one consistent phase model: `intro`, `transitioning`, `loading`, `chat`, `error`, `reduced-motion-chat`.
- `OnboardingHero`, `OnboardingStage`, and `useOnboardingMotion` are referenced consistently across tasks.
