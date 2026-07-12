# Structured Onboarding Trio Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the structured onboarding handoff so Typebot selects `dream`, `goal`, and `habit`, while the native app handles fine-tuning, restart, review, and persistence.

**Architecture:** Update the onboarding domain model from a dream-only seed to a trio seed, teach the Typebot parser to accept selected goal and habit objects, reuse the native personalization layer as a fine-tuning surface, and add an explicit restart path that resets back to Typebot. Update the source-controlled Typebot JSON so the exported flow matches the new contract.

**Tech Stack:** React 18, TypeScript 5, Vite 5, Vitest, Testing Library, CSS Modules, Playwright, `@typebot.io/react`

---

## File Structure

### Existing files to modify

- `src/types/onboarding.ts`
- `src/features/onboarding/structuredCatalog.ts`
- `src/features/onboarding/typebotPersistence.ts`
- `src/features/onboarding/typebotPersistence.test.ts`
- `src/features/onboarding/starterPlan.ts`
- `src/features/onboarding/starterPlan.test.ts`
- `src/features/onboarding/OnboardingPage.tsx`
- `src/features/onboarding/OnboardingPage.test.tsx`
- `src/features/onboarding/OnboardingPersonalization.tsx`
- `src/features/onboarding/OnboardingReview.tsx`
- `public/locales/en/onboarding.json`
- `public/locales/pt/onboarding.json`
- `docs/typebot/structured-onboarding-v1.json`

### New behavior

- parse a selected trio instead of only a selected dream
- preserve structured, parser-friendly objects through the handoff
- add explicit restart from native onboarding back to Typebot
- keep fine-tuning inline after handoff

## Tasks

### Task 1: Expand onboarding trio types and parser

- Add failing tests for a completion payload carrying `selectedDream`, `selectedGoal`, and `selectedHabit`
- Verify the old parser fails against the new payload
- Update onboarding types to model selected trio objects
- Update `typebotPersistence.ts` to parse the trio payload and tolerate Typebot placeholders only where still needed
- Run focused parser tests and keep them green

### Task 2: Update starter plan derivation and native UI for trio fine-tuning

- Add failing tests for creating a starter plan from a preselected trio
- Verify the current derivation still overwrites goal/habit copy too aggressively
- Update `starterPlan.ts` so the incoming selected goal/habit seed becomes the baseline and inline controls only fine-tune it
- Add a restart action to the native flow and route it back to the Typebot start
- Update review/personalization components and tests

### Task 3: Update the Typebot export artifact and validate end-to-end

- Update `docs/typebot/structured-onboarding-v1.json` so the flow models dream -> goal -> habit selection and posts the trio payload
- Add or update a browser verification script to assert the native app appears only after trio selection
- Run focused Vitest coverage, build, and a browser verification pass
