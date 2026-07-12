# Dashboard Lab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local-only dashboard lab under `prototype-playground/dashboard-lab/` to compare bento-grid layouts and widget visual variants with stable fixtures, without touching the production dashboard runtime.

**Architecture:** The lab lives in its own Vite entrypoint under `prototype-playground/dashboard-lab/` and uses root tooling instead of changing the main app router. Layout variants and widget variants are composed through registries, and all widgets are fed by lab-owned fixtures rather than production hooks or providers.

**Tech Stack:** React 18, Vite 5, TypeScript 5, Vitest, Testing Library, CSS Modules

---

### Task 1: Scaffold the Isolated Lab Shell

**Files:**

- Create: `prototype-playground/dashboard-lab/index.html`
- Create: `prototype-playground/dashboard-lab/vite.config.ts`
- Create: `prototype-playground/dashboard-lab/tsconfig.json`
- Create: `prototype-playground/dashboard-lab/src/main.tsx`
- Create: `prototype-playground/dashboard-lab/src/App.tsx`
- Create: `prototype-playground/dashboard-lab/src/App.test.tsx`
- Create: `prototype-playground/dashboard-lab/src/styles/dashboardLab.css`
- Create: `prototype-playground/dashboard-lab/vitest.config.ts`

- [ ] **Step 1: Write the failing shell test**

```tsx
// prototype-playground/dashboard-lab/src/App.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('DashboardLab App', () => {
  it('renders the dashboard lab heading and local-only status', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /dashboard layout lab/i })).toBeInTheDocument();
    expect(screen.getByText(/local-only prototype/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npx vitest --config prototype-playground/dashboard-lab/vitest.config.ts run prototype-playground/dashboard-lab/src/App.test.tsx
```

Expected: FAIL with `Cannot find module './App'` or missing config/setup files.

- [ ] **Step 3: Write the minimal lab shell implementation**

```html
<!-- prototype-playground/dashboard-lab/index.html -->
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Dashboard Layout Lab</title>
    <script type="module" src="./src/main.tsx"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

```ts
// prototype-playground/dashboard-lab/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  root: path.resolve(__dirname),
  plugins: [react()],
  resolve: {
    alias: {
      '@dashboard-lab': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 4174,
    open: '/index.html',
  },
});
```

```json
// prototype-playground/dashboard-lab/tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "baseUrl": ".",
    "paths": {
      "@dashboard-lab/*": ["./src/*"]
    },
    "types": ["vite/client", "node", "vitest/globals"]
  },
  "include": ["src"]
}
```

```ts
// prototype-playground/dashboard-lab/vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  root: path.resolve(__dirname),
  plugins: [react()],
  resolve: {
    alias: {
      '@dashboard-lab': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
  },
});
```

```tsx
// prototype-playground/dashboard-lab/src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/dashboardLab.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

```tsx
// prototype-playground/dashboard-lab/src/App.tsx
const App = (): JSX.Element => {
  return (
    <main className="lab-shell">
      <header className="lab-header">
        <p className="lab-eyebrow">Local-only prototype</p>
        <h1>Dashboard Layout Lab</h1>
        <p className="lab-copy">
          Compare bento-grid variants and widget redesigns without touching the live dashboard.
        </p>
      </header>
    </main>
  );
};

export default App;
```

```css
/* prototype-playground/dashboard-lab/src/styles/dashboardLab.css */
:root {
  color-scheme: dark;
  font-family: 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif;
  background: #07111f;
  color: #f7f8fb;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  background:
    radial-gradient(circle at top, rgba(56, 189, 248, 0.14), transparent 32%),
    linear-gradient(180deg, #0b1120 0%, #07111f 100%);
}

#root {
  min-height: 100vh;
}

.lab-shell {
  max-width: 1440px;
  margin: 0 auto;
  padding: 40px 32px 64px;
}

.lab-header {
  margin-bottom: 32px;
}

.lab-eyebrow {
  margin: 0 0 8px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 12px;
  color: rgba(226, 232, 240, 0.72);
}

.lab-copy {
  max-width: 720px;
  color: rgba(226, 232, 240, 0.82);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
npx vitest --config prototype-playground/dashboard-lab/vitest.config.ts run prototype-playground/dashboard-lab/src/App.test.tsx
```

Expected: PASS

- [ ] **Step 5: Verify the shell renders in isolation**

Run:

```bash
npx vite --config prototype-playground/dashboard-lab/vite.config.ts --host 127.0.0.1
```

Expected: local Vite server starts on `http://127.0.0.1:4174/` with only the lab shell, no main-app routing.

---

### Task 2: Add the Scenario Model, Layout Registry, and Widget Registry

**Files:**

- Create: `prototype-playground/dashboard-lab/src/layouts/types.ts`
- Create: `prototype-playground/dashboard-lab/src/layouts/focusTop.layout.ts`
- Create: `prototype-playground/dashboard-lab/src/layouts/balancedSpread.layout.ts`
- Create: `prototype-playground/dashboard-lab/src/layouts/progressiveStack.layout.ts`
- Create: `prototype-playground/dashboard-lab/src/registry/layoutRegistry.ts`
- Create: `prototype-playground/dashboard-lab/src/registry/widgetRegistry.ts`
- Create: `prototype-playground/dashboard-lab/src/registry/registry.test.ts`

- [ ] **Step 1: Write the failing registry test**

```tsx
// prototype-playground/dashboard-lab/src/registry/registry.test.ts
import { describe, expect, it } from 'vitest';
import { layoutRegistry } from './layoutRegistry';
import { createDefaultWidgetVariantMap } from './widgetRegistry';

describe('dashboard lab registries', () => {
  it('exposes the three starter layout variants', () => {
    expect(layoutRegistry.map(layout => layout.id)).toEqual([
      'focus-top',
      'balanced-spread',
      'progressive-stack',
    ]);
  });

  it('defaults all widgets to the current variant', () => {
    expect(createDefaultWidgetVariantMap()).toEqual({
      quote: 'current',
      cards: 'current',
      lifeWheel: 'current',
      mood: 'current',
      dreamBoard: 'current',
      habits: 'current',
      goals: 'current',
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npx vitest --config prototype-playground/dashboard-lab/vitest.config.ts run prototype-playground/dashboard-lab/src/registry/registry.test.ts
```

Expected: FAIL with missing registry/type modules.

- [ ] **Step 3: Write the minimal registry implementation**

```ts
// prototype-playground/dashboard-lab/src/layouts/types.ts
export type WidgetId = 'quote' | 'cards' | 'lifeWheel' | 'mood' | 'dreamBoard' | 'habits' | 'goals';

export type LayoutVariantId = 'focus-top' | 'balanced-spread' | 'progressive-stack';
export type WidgetVariantId = 'current' | 'v2' | 'v3';

export interface LayoutPlacement {
  widgetId: WidgetId;
  desktop: string;
  tablet: string;
  mobile: string;
}

export interface LayoutVariant {
  id: LayoutVariantId;
  label: string;
  objective: string;
  placements: LayoutPlacement[];
}

export type WidgetVariantMap = Record<WidgetId, WidgetVariantId>;
```

```ts
// prototype-playground/dashboard-lab/src/layouts/focusTop.layout.ts
import type { LayoutVariant } from './types';

export const focusTopLayout: LayoutVariant = {
  id: 'focus-top',
  label: 'Focus Top',
  objective: 'Keep the most important widgets fully visible in the first fold.',
  placements: [
    { widgetId: 'quote', desktop: 'span-4', tablet: 'span-1', mobile: 'span-1' },
    { widgetId: 'cards', desktop: 'span-4', tablet: 'span-1', mobile: 'span-1' },
    { widgetId: 'lifeWheel', desktop: 'span-4', tablet: 'span-2', mobile: 'span-1' },
    { widgetId: 'mood', desktop: 'span-12', tablet: 'span-2', mobile: 'span-1' },
    { widgetId: 'dreamBoard', desktop: 'span-12', tablet: 'span-2', mobile: 'span-1' },
    { widgetId: 'habits', desktop: 'span-6', tablet: 'span-2', mobile: 'span-1' },
    { widgetId: 'goals', desktop: 'span-6', tablet: 'span-2', mobile: 'span-1' },
  ],
};
```

```ts
// prototype-playground/dashboard-lab/src/layouts/balancedSpread.layout.ts
import type { LayoutVariant } from './types';

export const balancedSpreadLayout: LayoutVariant = {
  id: 'balanced-spread',
  label: 'Balanced Spread',
  objective: 'Reduce top-heaviness and expose more dashboard breadth earlier.',
  placements: [
    { widgetId: 'quote', desktop: 'span-6', tablet: 'span-1', mobile: 'span-1' },
    { widgetId: 'cards', desktop: 'span-6', tablet: 'span-1', mobile: 'span-1' },
    { widgetId: 'lifeWheel', desktop: 'span-5', tablet: 'span-2', mobile: 'span-1' },
    { widgetId: 'mood', desktop: 'span-7', tablet: 'span-2', mobile: 'span-1' },
    { widgetId: 'dreamBoard', desktop: 'span-7', tablet: 'span-2', mobile: 'span-1' },
    { widgetId: 'habits', desktop: 'span-5', tablet: 'span-1', mobile: 'span-1' },
    { widgetId: 'goals', desktop: 'span-12', tablet: 'span-2', mobile: 'span-1' },
  ],
};
```

```ts
// prototype-playground/dashboard-lab/src/layouts/progressiveStack.layout.ts
import type { LayoutVariant } from './types';

export const progressiveStackLayout: LayoutVariant = {
  id: 'progressive-stack',
  label: 'Progressive Stack',
  objective: 'Guide the eye through a calmer, narrative vertical scan.',
  placements: [
    { widgetId: 'quote', desktop: 'span-12', tablet: 'span-2', mobile: 'span-1' },
    { widgetId: 'cards', desktop: 'span-7', tablet: 'span-2', mobile: 'span-1' },
    { widgetId: 'lifeWheel', desktop: 'span-5', tablet: 'span-2', mobile: 'span-1' },
    { widgetId: 'mood', desktop: 'span-12', tablet: 'span-2', mobile: 'span-1' },
    { widgetId: 'dreamBoard', desktop: 'span-12', tablet: 'span-2', mobile: 'span-1' },
    { widgetId: 'habits', desktop: 'span-6', tablet: 'span-2', mobile: 'span-1' },
    { widgetId: 'goals', desktop: 'span-6', tablet: 'span-2', mobile: 'span-1' },
  ],
};
```

```ts
// prototype-playground/dashboard-lab/src/registry/layoutRegistry.ts
import { balancedSpreadLayout } from '@dashboard-lab/layouts/balancedSpread.layout';
import { focusTopLayout } from '@dashboard-lab/layouts/focusTop.layout';
import { progressiveStackLayout } from '@dashboard-lab/layouts/progressiveStack.layout';

export const layoutRegistry = [focusTopLayout, balancedSpreadLayout, progressiveStackLayout];
```

```ts
// prototype-playground/dashboard-lab/src/registry/widgetRegistry.ts
import type { WidgetVariantMap } from '@dashboard-lab/layouts/types';

export const createDefaultWidgetVariantMap = (): WidgetVariantMap => ({
  quote: 'current',
  cards: 'current',
  lifeWheel: 'current',
  mood: 'current',
  dreamBoard: 'current',
  habits: 'current',
  goals: 'current',
});
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
npx vitest --config prototype-playground/dashboard-lab/vitest.config.ts run prototype-playground/dashboard-lab/src/registry/registry.test.ts
```

Expected: PASS

- [ ] **Step 5: Check the lab files stay isolated**

Run:

```bash
git status --short prototype-playground/dashboard-lab
```

Expected: only lab files appear; no production app files are required for this task.

---

### Task 3: Add Stable Fixtures and a Shared Widget Frame

**Files:**

- Create: `prototype-playground/dashboard-lab/src/fixtures/quote.ts`
- Create: `prototype-playground/dashboard-lab/src/fixtures/cards.ts`
- Create: `prototype-playground/dashboard-lab/src/fixtures/lifeWheel.ts`
- Create: `prototype-playground/dashboard-lab/src/fixtures/mood.ts`
- Create: `prototype-playground/dashboard-lab/src/fixtures/dreamBoard.ts`
- Create: `prototype-playground/dashboard-lab/src/fixtures/habits.ts`
- Create: `prototype-playground/dashboard-lab/src/fixtures/goals.ts`
- Create: `prototype-playground/dashboard-lab/src/widgets/shared/WidgetFrame.tsx`
- Create: `prototype-playground/dashboard-lab/src/widgets/shared/WidgetFrame.test.tsx`

- [ ] **Step 1: Write the failing shared-frame test**

```tsx
// prototype-playground/dashboard-lab/src/widgets/shared/WidgetFrame.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { WidgetFrame } from './WidgetFrame';

describe('WidgetFrame', () => {
  it('renders the widget label, title, and body content', () => {
    render(
      <WidgetFrame eyebrow="Current" title="Daily quote">
        <p>Fixture body</p>
      </WidgetFrame>
    );

    expect(screen.getByText('Current')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Daily quote' })).toBeInTheDocument();
    expect(screen.getByText('Fixture body')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npx vitest --config prototype-playground/dashboard-lab/vitest.config.ts run prototype-playground/dashboard-lab/src/widgets/shared/WidgetFrame.test.tsx
```

Expected: FAIL with missing `WidgetFrame`.

- [ ] **Step 3: Write fixtures and the shared presentational frame**

```ts
// prototype-playground/dashboard-lab/src/fixtures/quote.ts
export const quoteFixture = {
  title: 'Daily quote',
  quote: 'You do not rise to the level of your goals. You fall to the level of your systems.',
  author: 'James Clear',
};
```

```ts
// prototype-playground/dashboard-lab/src/fixtures/cards.ts
export const cardsFixture = {
  title: 'Affirmation deck',
  current: 'I can move through uncertainty with clarity and steadiness.',
  upcoming: ['I choose progress over perfection.', 'My effort compounds quietly every day.'],
};
```

```ts
// prototype-playground/dashboard-lab/src/fixtures/lifeWheel.ts
export const lifeWheelFixture = {
  title: 'Life wheel',
  segments: [
    { label: 'Health', value: 7 },
    { label: 'Relationships', value: 8 },
    { label: 'Career', value: 6 },
    { label: 'Purpose', value: 7 },
    { label: 'Finances', value: 5 },
    { label: 'Joy', value: 6 },
  ],
};
```

```ts
// prototype-playground/dashboard-lab/src/fixtures/mood.ts
export const moodFixture = { title: 'Mood', summary: 'Calm, focused, slightly stretched' };
```

```ts
// prototype-playground/dashboard-lab/src/fixtures/dreamBoard.ts
export const dreamBoardFixture = {
  title: 'Dream board',
  milestones: ['Portugal retreat', 'Creative studio', 'Debt-free runway'],
};
```

```ts
// prototype-playground/dashboard-lab/src/fixtures/habits.ts
export const habitsFixture = { title: 'Habits', streak: 14, completionRate: 82 };
```

```ts
// prototype-playground/dashboard-lab/src/fixtures/goals.ts
export const goalsFixture = {
  title: 'Goals',
  active: 3,
  nextMilestone: 'Publish spring narrative',
};
```

```tsx
// prototype-playground/dashboard-lab/src/widgets/shared/WidgetFrame.tsx
import type { PropsWithChildren } from 'react';

interface WidgetFrameProps extends PropsWithChildren {
  eyebrow: string;
  title: string;
}

export const WidgetFrame = ({ eyebrow, title, children }: WidgetFrameProps): JSX.Element => {
  return (
    <section className="widget-frame">
      <div className="widget-frame__header">
        <p className="widget-frame__eyebrow">{eyebrow}</p>
        <h2 className="widget-frame__title">{title}</h2>
      </div>
      <div className="widget-frame__body">{children}</div>
    </section>
  );
};
```

Append to `prototype-playground/dashboard-lab/src/styles/dashboardLab.css`:

```css
.widget-frame {
  height: 100%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 32px;
  padding: 24px;
  background:
    linear-gradient(180deg, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.78)),
    radial-gradient(circle at top left, rgba(56, 189, 248, 0.16), transparent 35%);
  backdrop-filter: blur(18px);
}

.widget-frame__header {
  margin-bottom: 16px;
}

.widget-frame__eyebrow {
  margin: 0 0 8px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: rgba(191, 219, 254, 0.8);
}

.widget-frame__title {
  margin: 0;
  font-size: 20px;
}

.widget-frame__body {
  color: rgba(226, 232, 240, 0.92);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
npx vitest --config prototype-playground/dashboard-lab/vitest.config.ts run prototype-playground/dashboard-lab/src/widgets/shared/WidgetFrame.test.tsx
```

Expected: PASS

- [ ] **Step 5: Verify fixture ownership stays inside the lab**

Run:

```bash
find prototype-playground/dashboard-lab/src/fixtures -maxdepth 1 -type f | sort
```

Expected: one fixture file per widget, all owned by the lab.

---

### Task 4: Render the Dashboard Composer with Current Widget Variants

**Files:**

- Create: `prototype-playground/dashboard-lab/src/widgets/quote/QuoteWidgetCurrentLab.tsx`
- Create: `prototype-playground/dashboard-lab/src/widgets/cards/CardsWidgetCurrentLab.tsx`
- Create: `prototype-playground/dashboard-lab/src/widgets/lifeWheel/LifeWheelWidgetCurrentLab.tsx`
- Create: `prototype-playground/dashboard-lab/src/widgets/mood/MoodWidgetCurrentLab.tsx`
- Create: `prototype-playground/dashboard-lab/src/widgets/dreamBoard/DreamBoardWidgetCurrentLab.tsx`
- Create: `prototype-playground/dashboard-lab/src/widgets/habits/HabitsWidgetCurrentLab.tsx`
- Create: `prototype-playground/dashboard-lab/src/widgets/goals/GoalsWidgetCurrentLab.tsx`
- Create: `prototype-playground/dashboard-lab/src/screens/DashboardLabScreen.tsx`
- Modify: `prototype-playground/dashboard-lab/src/App.tsx`
- Create: `prototype-playground/dashboard-lab/src/screens/DashboardLabScreen.test.tsx`

- [ ] **Step 1: Write the failing screen test**

```tsx
// prototype-playground/dashboard-lab/src/screens/DashboardLabScreen.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DashboardLabScreen } from './DashboardLabScreen';

describe('DashboardLabScreen', () => {
  it('renders all seven current widgets in the default scenario', () => {
    render(<DashboardLabScreen />);

    expect(screen.getByRole('heading', { name: /daily quote/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /affirmation deck/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /life wheel/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /mood/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /dream board/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /habits/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /goals/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npx vitest --config prototype-playground/dashboard-lab/vitest.config.ts run prototype-playground/dashboard-lab/src/screens/DashboardLabScreen.test.tsx
```

Expected: FAIL with missing `DashboardLabScreen`.

- [ ] **Step 3: Implement current lab widget variants and the screen**

```tsx
// prototype-playground/dashboard-lab/src/widgets/quote/QuoteWidgetCurrentLab.tsx
import { quoteFixture } from '@dashboard-lab/fixtures/quote';
import { WidgetFrame } from '@dashboard-lab/widgets/shared/WidgetFrame';

export const QuoteWidgetCurrentLab = (): JSX.Element => (
  <WidgetFrame eyebrow="Current" title={quoteFixture.title}>
    <blockquote className="lab-quote">“{quoteFixture.quote}”</blockquote>
    <p className="lab-meta">{quoteFixture.author}</p>
  </WidgetFrame>
);
```

```tsx
// prototype-playground/dashboard-lab/src/widgets/cards/CardsWidgetCurrentLab.tsx
import { cardsFixture } from '@dashboard-lab/fixtures/cards';
import { WidgetFrame } from '@dashboard-lab/widgets/shared/WidgetFrame';

export const CardsWidgetCurrentLab = (): JSX.Element => (
  <WidgetFrame eyebrow="Current" title={cardsFixture.title}>
    <p className="lab-callout">{cardsFixture.current}</p>
    <ul className="lab-list">
      {cardsFixture.upcoming.map(item => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  </WidgetFrame>
);
```

```tsx
// prototype-playground/dashboard-lab/src/widgets/lifeWheel/LifeWheelWidgetCurrentLab.tsx
import { lifeWheelFixture } from '@dashboard-lab/fixtures/lifeWheel';
import { WidgetFrame } from '@dashboard-lab/widgets/shared/WidgetFrame';

export const LifeWheelWidgetCurrentLab = (): JSX.Element => (
  <WidgetFrame eyebrow="Current" title={lifeWheelFixture.title}>
    <ul className="lab-segment-list">
      {lifeWheelFixture.segments.map(segment => (
        <li key={segment.label}>
          <span>{segment.label}</span>
          <strong>{segment.value}/10</strong>
        </li>
      ))}
    </ul>
  </WidgetFrame>
);
```

Create equivalent minimal current widgets for `mood`, `dreamBoard`, `habits`, and `goals` using their fixtures and `WidgetFrame`.

```tsx
// prototype-playground/dashboard-lab/src/screens/DashboardLabScreen.tsx
import { QuoteWidgetCurrentLab } from '@dashboard-lab/widgets/quote/QuoteWidgetCurrentLab';
import { CardsWidgetCurrentLab } from '@dashboard-lab/widgets/cards/CardsWidgetCurrentLab';
import { LifeWheelWidgetCurrentLab } from '@dashboard-lab/widgets/lifeWheel/LifeWheelWidgetCurrentLab';
import { MoodWidgetCurrentLab } from '@dashboard-lab/widgets/mood/MoodWidgetCurrentLab';
import { DreamBoardWidgetCurrentLab } from '@dashboard-lab/widgets/dreamBoard/DreamBoardWidgetCurrentLab';
import { HabitsWidgetCurrentLab } from '@dashboard-lab/widgets/habits/HabitsWidgetCurrentLab';
import { GoalsWidgetCurrentLab } from '@dashboard-lab/widgets/goals/GoalsWidgetCurrentLab';

export const DashboardLabScreen = (): JSX.Element => {
  return (
    <div className="lab-grid">
      <QuoteWidgetCurrentLab />
      <CardsWidgetCurrentLab />
      <LifeWheelWidgetCurrentLab />
      <MoodWidgetCurrentLab />
      <DreamBoardWidgetCurrentLab />
      <HabitsWidgetCurrentLab />
      <GoalsWidgetCurrentLab />
    </div>
  );
};
```

```tsx
// prototype-playground/dashboard-lab/src/App.tsx
import { DashboardLabScreen } from './screens/DashboardLabScreen';

const App = (): JSX.Element => {
  return (
    <main className="lab-shell">
      <header className="lab-header">
        <p className="lab-eyebrow">Local-only prototype</p>
        <h1>Dashboard Layout Lab</h1>
        <p className="lab-copy">
          Compare bento-grid variants and widget redesigns without touching the live dashboard.
        </p>
      </header>
      <DashboardLabScreen />
    </main>
  );
};

export default App;
```

Append to `prototype-playground/dashboard-lab/src/styles/dashboardLab.css`:

```css
.lab-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 16px;
}

.lab-grid > *:nth-child(1),
.lab-grid > *:nth-child(2),
.lab-grid > *:nth-child(3) {
  grid-column: span 4;
}

.lab-grid > *:nth-child(4),
.lab-grid > *:nth-child(5) {
  grid-column: span 12;
}

.lab-grid > *:nth-child(6),
.lab-grid > *:nth-child(7) {
  grid-column: span 6;
}

.lab-quote,
.lab-callout {
  font-size: 1.125rem;
  line-height: 1.6;
}

.lab-meta,
.lab-list,
.lab-segment-list {
  margin: 16px 0 0;
}

.lab-list,
.lab-segment-list {
  padding-left: 18px;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
npx vitest --config prototype-playground/dashboard-lab/vitest.config.ts run prototype-playground/dashboard-lab/src/screens/DashboardLabScreen.test.tsx
```

Expected: PASS

- [ ] **Step 5: Verify the lab now renders all current widgets**

Run:

```bash
npx vite --config prototype-playground/dashboard-lab/vite.config.ts --host 127.0.0.1
```

Expected: the screen shows seven fixture-driven widgets and still has no dependency on the main app router.

---

### Task 5: Add Layout Switching, Widget Variant Switching, and the First V2 Widgets

**Files:**

- Modify: `prototype-playground/dashboard-lab/src/screens/DashboardLabScreen.tsx`
- Create: `prototype-playground/dashboard-lab/src/widgets/cards/CardsWidgetV2Lab.tsx`
- Create: `prototype-playground/dashboard-lab/src/widgets/lifeWheel/LifeWheelWidgetV2Lab.tsx`
- Create: `prototype-playground/dashboard-lab/src/screens/EvaluationChecklist.tsx`
- Create: `prototype-playground/dashboard-lab/src/screens/ControlsPanel.tsx`
- Create: `prototype-playground/dashboard-lab/src/screens/variantSwitching.test.tsx`

- [ ] **Step 1: Write the failing variant-switching test**

```tsx
// prototype-playground/dashboard-lab/src/screens/variantSwitching.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { DashboardLabScreen } from './DashboardLabScreen';

describe('DashboardLabScreen controls', () => {
  it('switches the cards widget to V2 and shows the evaluation checklist', async () => {
    const user = userEvent.setup();

    render(<DashboardLabScreen />);

    await user.selectOptions(screen.getByLabelText(/cards variant/i), 'v2');

    expect(screen.getByText(/v2 concept/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /evaluation checklist/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npx vitest --config prototype-playground/dashboard-lab/vitest.config.ts run prototype-playground/dashboard-lab/src/screens/variantSwitching.test.tsx
```

Expected: FAIL because there are no controls or V2 widgets yet.

- [ ] **Step 3: Implement controls, the checklist, and V2 widgets**

```tsx
// prototype-playground/dashboard-lab/src/widgets/cards/CardsWidgetV2Lab.tsx
import { cardsFixture } from '@dashboard-lab/fixtures/cards';
import { WidgetFrame } from '@dashboard-lab/widgets/shared/WidgetFrame';

export const CardsWidgetV2Lab = (): JSX.Element => (
  <WidgetFrame eyebrow="V2 concept" title={cardsFixture.title}>
    <div className="lab-stack">
      <p className="lab-callout">{cardsFixture.current}</p>
      <div className="lab-pill-row">
        {cardsFixture.upcoming.map(item => (
          <span key={item} className="lab-pill">
            {item}
          </span>
        ))}
      </div>
    </div>
  </WidgetFrame>
);
```

```tsx
// prototype-playground/dashboard-lab/src/widgets/lifeWheel/LifeWheelWidgetV2Lab.tsx
import { lifeWheelFixture } from '@dashboard-lab/fixtures/lifeWheel';
import { WidgetFrame } from '@dashboard-lab/widgets/shared/WidgetFrame';

export const LifeWheelWidgetV2Lab = (): JSX.Element => (
  <WidgetFrame eyebrow="V2 concept" title={lifeWheelFixture.title}>
    <div className="lab-bars">
      {lifeWheelFixture.segments.map(segment => (
        <div key={segment.label} className="lab-bars__row">
          <span>{segment.label}</span>
          <div className="lab-bars__track">
            <div className="lab-bars__fill" style={{ width: `${segment.value * 10}%` }} />
          </div>
        </div>
      ))}
    </div>
  </WidgetFrame>
);
```

```tsx
// prototype-playground/dashboard-lab/src/screens/EvaluationChecklist.tsx
const checklistItems = [
  'How many widgets are fully visible above the fold?',
  'Which widget gets attention first?',
  'Does any widget feel compressed or oversized?',
  'Does the layout signal there is valuable content below the fold?',
  'Does the dashboard feel top-heavy or balanced?',
];

export const EvaluationChecklist = (): JSX.Element => (
  <aside className="lab-panel">
    <h2>Evaluation checklist</h2>
    <ol>
      {checklistItems.map(item => (
        <li key={item}>{item}</li>
      ))}
    </ol>
  </aside>
);
```

```tsx
// prototype-playground/dashboard-lab/src/screens/ControlsPanel.tsx
import type { LayoutVariantId, WidgetVariantId } from '@dashboard-lab/layouts/types';

interface ControlsPanelProps {
  activeLayout: LayoutVariantId;
  onLayoutChange: (value: LayoutVariantId) => void;
  cardsVariant: WidgetVariantId;
  onCardsVariantChange: (value: WidgetVariantId) => void;
  lifeWheelVariant: WidgetVariantId;
  onLifeWheelVariantChange: (value: WidgetVariantId) => void;
}

export const ControlsPanel = ({
  activeLayout,
  onLayoutChange,
  cardsVariant,
  onCardsVariantChange,
  lifeWheelVariant,
  onLifeWheelVariantChange,
}: ControlsPanelProps): JSX.Element => (
  <section className="lab-panel">
    <h2>Scenario controls</h2>
    <label>
      Layout
      <select
        value={activeLayout}
        onChange={event => onLayoutChange(event.target.value as LayoutVariantId)}
      >
        <option value="focus-top">Focus Top</option>
        <option value="balanced-spread">Balanced Spread</option>
        <option value="progressive-stack">Progressive Stack</option>
      </select>
    </label>
    <label>
      Cards variant
      <select
        value={cardsVariant}
        onChange={event => onCardsVariantChange(event.target.value as WidgetVariantId)}
        aria-label="Cards variant"
      >
        <option value="current">Current</option>
        <option value="v2">V2</option>
      </select>
    </label>
    <label>
      Life wheel variant
      <select
        value={lifeWheelVariant}
        onChange={event => onLifeWheelVariantChange(event.target.value as WidgetVariantId)}
        aria-label="Life wheel variant"
      >
        <option value="current">Current</option>
        <option value="v2">V2</option>
      </select>
    </label>
  </section>
);
```

Update `DashboardLabScreen.tsx` to:

- store `activeLayout`, `cardsVariant`, and `lifeWheelVariant` in local state
- render `ControlsPanel`
- render `EvaluationChecklist`
- switch `CardsWidgetCurrentLab` vs `CardsWidgetV2Lab`
- switch `LifeWheelWidgetCurrentLab` vs `LifeWheelWidgetV2Lab`
- apply `data-layout={activeLayout}` to the grid so CSS can target layout variants

Append CSS to `prototype-playground/dashboard-lab/src/styles/dashboardLab.css`:

```css
.lab-workbench {
  display: grid;
  grid-template-columns: minmax(260px, 320px) minmax(0, 1fr);
  gap: 20px;
}

.lab-sidebar {
  display: grid;
  gap: 16px;
  align-self: start;
  position: sticky;
  top: 24px;
}

.lab-panel {
  padding: 20px;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(15, 23, 42, 0.72);
}

.lab-panel select {
  display: block;
  width: 100%;
  margin-top: 6px;
  margin-bottom: 14px;
}

.lab-grid[data-layout='balanced-spread'] > *:nth-child(1),
.lab-grid[data-layout='balanced-spread'] > *:nth-child(2) {
  grid-column: span 6;
}

.lab-grid[data-layout='progressive-stack'] > *:nth-child(1),
.lab-grid[data-layout='progressive-stack'] > *:nth-child(4),
.lab-grid[data-layout='progressive-stack'] > *:nth-child(5) {
  grid-column: span 12;
}

.lab-pill-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.lab-pill {
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(56, 189, 248, 0.14);
}

.lab-bars {
  display: grid;
  gap: 12px;
}

.lab-bars__row {
  display: grid;
  grid-template-columns: 96px 1fr;
  gap: 12px;
  align-items: center;
}

.lab-bars__track {
  height: 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

.lab-bars__fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #38bdf8, #818cf8);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
npx vitest --config prototype-playground/dashboard-lab/vitest.config.ts run prototype-playground/dashboard-lab/src/screens/variantSwitching.test.tsx
```

Expected: PASS

- [ ] **Step 5: Verify manual comparison works in the browser**

Run:

```bash
npx vite --config prototype-playground/dashboard-lab/vite.config.ts --host 127.0.0.1
```

Expected: you can switch layouts and toggle `Cards`/`LifeWheel` between `current` and `v2` while the rest of the lab remains fixture-driven.

---

### Task 6: Add Viewport Presets and a Lightweight Fold-Visibility Summary

**Files:**

- Modify: `prototype-playground/dashboard-lab/src/screens/ControlsPanel.tsx`
- Modify: `prototype-playground/dashboard-lab/src/screens/DashboardLabScreen.tsx`
- Create: `prototype-playground/dashboard-lab/src/screens/FoldSummary.tsx`
- Create: `prototype-playground/dashboard-lab/src/screens/foldSummary.test.tsx`

- [ ] **Step 1: Write the failing fold-summary test**

```tsx
// prototype-playground/dashboard-lab/src/screens/foldSummary.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FoldSummary } from './FoldSummary';

describe('FoldSummary', () => {
  it('renders the current viewport label and visible widget count', () => {
    render(<FoldSummary viewportLabel="Desktop standard" visibleCount={4} partialCount={1} />);

    expect(screen.getByText(/desktop standard/i)).toBeInTheDocument();
    expect(screen.getByText(/4 fully visible/i)).toBeInTheDocument();
    expect(screen.getByText(/1 partial/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npx vitest --config prototype-playground/dashboard-lab/vitest.config.ts run prototype-playground/dashboard-lab/src/screens/foldSummary.test.tsx
```

Expected: FAIL with missing `FoldSummary`.

- [ ] **Step 3: Implement viewport presets and fold summary**

```tsx
// prototype-playground/dashboard-lab/src/screens/FoldSummary.tsx
interface FoldSummaryProps {
  viewportLabel: string;
  visibleCount: number;
  partialCount: number;
}

export const FoldSummary = ({
  viewportLabel,
  visibleCount,
  partialCount,
}: FoldSummaryProps): JSX.Element => (
  <section className="lab-panel">
    <h2>Fold summary</h2>
    <p>{viewportLabel}</p>
    <p>{visibleCount} fully visible</p>
    <p>{partialCount} partial</p>
  </section>
);
```

Update `ControlsPanel.tsx` with a `Viewport` select:

```tsx
<label>
  Viewport
  <select
    value={viewport}
    onChange={event => onViewportChange(event.target.value as ViewportPresetId)}
  >
    <option value="desktop-compact">Desktop compact</option>
    <option value="desktop-standard">Desktop standard</option>
    <option value="tablet">Tablet</option>
  </select>
</label>
```

Update `DashboardLabScreen.tsx` to:

- add viewport state
- apply `data-viewport={viewport}`
- compute an initial fold summary from the selected preset with a simple lookup table:

```ts
const viewportSummary = {
  'desktop-compact': { label: 'Desktop compact', visibleCount: 3, partialCount: 1 },
  'desktop-standard': { label: 'Desktop standard', visibleCount: 4, partialCount: 1 },
  tablet: { label: 'Tablet', visibleCount: 2, partialCount: 1 },
} as const;
```

- render `<FoldSummary />` in the sidebar

Append CSS:

```css
.lab-grid[data-viewport='tablet'] {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.lab-grid[data-viewport='tablet'] > * {
  grid-column: span 2 !important;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
npx vitest --config prototype-playground/dashboard-lab/vitest.config.ts run prototype-playground/dashboard-lab/src/screens/foldSummary.test.tsx
```

Expected: PASS

- [ ] **Step 5: Verify the final lab workflow**

Run:

```bash
npx vitest --config prototype-playground/dashboard-lab/vitest.config.ts run
```

Expected: all dashboard-lab tests pass.

Then run:

```bash
npx vite --config prototype-playground/dashboard-lab/vite.config.ts --host 127.0.0.1
```

Expected: the local-only dashboard lab supports layout switching, widget variant switching, viewport presets, and the evaluation sidebar without touching production routes.

---

## Self-Review Checklist

- Spec coverage: the plan covers the isolated lab shell, registries, fixtures, current widgets, V2 widgets, layouts, checklist, and viewport comparison flow.
- Placeholder scan: no `TODO`, `TBD`, or vague “implement later” instructions remain.
- Type consistency: `WidgetId`, `LayoutVariantId`, and `WidgetVariantId` are defined once and reused consistently across tasks.

## Notes for Execution

- Keep all implementation inside `prototype-playground/dashboard-lab/`.
- Do not modify `src/features/dashboard/` or `src/shared/components/layout/DashboardGrid/` during this plan.
- Do not wire the lab into the main router.
- Do not introduce production data hooks, auth providers, or query clients into the lab.
