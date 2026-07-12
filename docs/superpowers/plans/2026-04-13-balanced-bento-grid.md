# Balanced Bento Grid Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Figma-inspired, responsive `balanced-habits-right` scene layout to `prototype-playground/dashboard-lab` with a central `Life Wheel` and real cutout cards.

**Architecture:** Keep the existing span-based lab layouts intact and add a second scene-based layout path. The new path uses a dedicated scene renderer, explicit wheel/slot geometry, and CSS masking on card surfaces to create real cutouts around the circular center, with a simplified mobile stack fallback.

**Tech Stack:** React 18, TypeScript 5, Vite 5, Vitest, Testing Library, CSS

---

### Task 1: Extend layout types and registry for scene layouts

**Files:**

- Modify: `prototype-playground/dashboard-lab/src/layouts/types.ts`
- Create: `prototype-playground/dashboard-lab/src/layouts/balancedHabitsRight.layout.ts`
- Modify: `prototype-playground/dashboard-lab/src/registry/layoutRegistry.ts`
- Modify: `prototype-playground/dashboard-lab/src/registry/registry.test.ts`

- [ ] Add failing tests for the new scene layout registry entry and type guard behavior.
- [ ] Verify the new tests fail because `balanced-habits-right` does not exist yet.
- [ ] Add scene layout types and the new `balanced-habits-right` variant.
- [ ] Update the registry to expose the new variant alongside legacy layouts.
- [ ] Re-run the targeted tests until green.

### Task 2: Add a scene renderer and route the screen through it

**Files:**

- Create: `prototype-playground/dashboard-lab/src/components/BentoSceneRenderer.tsx`
- Modify: `prototype-playground/dashboard-lab/src/screens/DashboardLabScreen.tsx`
- Modify: `prototype-playground/dashboard-lab/src/screens/DashboardLabScreen.test.tsx`

- [ ] Add failing tests proving the screen renders the scene layout when selected.
- [ ] Verify the tests fail before implementation.
- [ ] Implement the renderer and the screen branching between legacy and scene layouts.
- [ ] Ensure the selected scene renders all seven widgets with stable scene slot markers.
- [ ] Re-run the targeted screen tests until green.

### Task 3: Implement cutout shells and responsive scene styling

**Files:**

- Modify: `prototype-playground/dashboard-lab/src/styles/dashboardLab.css`
- Modify: `prototype-playground/dashboard-lab/src/screens/variantSwitching.test.tsx`

- [ ] Add failing tests that assert the scene exposes the wheel and cutout slot classes in the selected layout.
- [ ] Verify the tests fail before CSS/markup changes.
- [ ] Implement the scene shell styling, wheel geometry, cutout surface/content separation, and mobile simplification.
- [ ] Ensure `Habits` is the strongest secondary block in scene metadata and output markup.
- [ ] Re-run the targeted interaction tests until green.

### Task 4: Verify the lab end-to-end

**Files:**

- Modify if needed: `prototype-playground/dashboard-lab/src/screens/DashboardLabScreen.tsx`
- Modify if needed: `prototype-playground/dashboard-lab/src/styles/dashboardLab.css`

- [ ] Run the focused lab Vitest suite.
- [ ] Run the lab Vite dev server and visually verify the `balanced-habits-right` option against the Figma reference.
- [ ] Check mobile simplification in the existing viewport control.
- [ ] Fix any regressions found in verification and re-run tests.
