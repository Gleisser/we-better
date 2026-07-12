# Structured Onboarding Flow Design

## Summary

We Better's current Typebot onboarding is too long, too dependent on open text input, and too fragile as a first-access experience. The current exported flow behaves more like a coaching session than a short activation flow.

This redesign keeps the emotional and narrative value of the Typebot entry, but narrows its job to structured decision-making. The Typebot will help the user choose a `focus area` and a `dream`, while the native We Better app will take over for rich personalization, review, and persistence.

The goal of V1 is activation-first onboarding with low friction, low input risk, and high perceived guidance.

## Product Goals

- Help a first-time user leave onboarding with one starter `dream`, one `goal`, and one `habit`
- Remove open-text dependency from the main happy path
- Reduce fatigue during first access
- Preserve a premium, guided feeling without making the onboarding long
- Keep the Typebot valuable, but stop using it as the final source of truth for saved content

## Non-Goals

- Supporting all life areas in V1
- Letting the user create arbitrary dream/goal/habit text during onboarding
- Teaching every We Better module inside the Typebot
- Making the Typebot responsible for final `goal` and `habit` generation or persistence

## V1 Scope

### Focus Areas

V1 supports only these focus areas:

- `Saúde`
- `Relacionamentos`
- `Finanças`

Each focus area will have:

- `5` curated starter dream cards
- a focus-specific personalization model in the native app
- derived `goal` and `habit` suggestions connected to the selected dream

### Onboarding Shape

The onboarding is split into two surfaces:

1. `Typebot`
   - short opening narrative
   - focus-area selection
   - dream selection
   - optional regeneration of more dream ideas

2. `We Better native flow`
   - focus-specific personalization
   - review screen
   - confirm or correct
   - persistence
   - post-save handoff to the product

## Recommended User Flow

### Phase 1: Typebot Entry

The Typebot keeps the ritual introduction and framing, then quickly moves into structured choices.

Flow:

1. Welcome message establishes that We Better will build a starter plan
2. User chooses one focus area: `Saúde`, `Relacionamentos`, or `Finanças`
3. Typebot shows `5` dream cards for that focus
4. User either:
   - selects a dream card, or
   - clicks `Ver outras ideias`

### Phase 2: Dream Regeneration

If the user chooses `Ver outras ideias`, the flow stays structured.

Flow:

1. User selects `1` or `2` universal micropreferences
2. LLM generates `3` new dream-card options
3. User either:
   - selects one of the new dream cards, or
   - regenerates again

Rules:

- each regeneration produces `3` new options
- user can regenerate up to `5` times
- after the limit is reached, the dream-selection flow restarts
- the LLM is used only to generate more selectable dream cards, not freeform saved records

### Phase 3: Native Personalization

After the user selects a dream, the Typebot hands off to the native We Better onboarding step.

The native app derives a connected starter trio:

- selected `dream`
- suggested `goal`
- suggested `habit`

The user then personalizes this trio through richer UI controls instead of chat input.

### Phase 4: Review and Save

The app shows a final review screen containing:

- `dream`
- `goal`
- `habit`

Available actions:

- `Confirmar`
- `Corrigir`

If the user clicks `Corrigir`, the flow returns to dream selection. The app recalculates the connected `goal` and `habit` from the new dream choice.

## Typebot Responsibilities

The Typebot is responsible for:

- short narrative framing
- focus-area selection
- dream-card presentation
- regeneration entrypoint
- micropreference capture
- generation of additional dream-card options
- handoff to the native app after dream selection

The Typebot is not responsible for:

- collecting open text as the primary onboarding path
- collecting final `goal` text
- collecting final `habit` text
- final review
- persistence of the created starter items

## Native We Better Responsibilities

The native We Better flow is responsible for:

- deriving connected `goal` and `habit` suggestions from the chosen dream
- rendering rich, focus-specific personalization controls
- giving the user a professional sense of calibration rather than form entry
- review and correction
- final persistence
- analytics for confirmation, correction, and drop-off

## Personalization Model

The personalization step is focus-specific. V1 will not force one universal control model across all focus areas.

Principles:

- controls should feel meaningful for the chosen focus
- no free text on the main path
- the UI should feel like calibrating a plan, not filling a form
- the values should update the derived `goal` and `habit` preview in real time or near-real time

Example focus-specific control directions:

- `Saúde`: frequency, intensity, preferred time, starting pace
- `Relacionamentos`: frequency of contact, type of gesture, comfort level, social context
- `Finanças`: progress horizon, weekly effort, restriction tolerance, progress style

These are design directions, not final field-level implementation contracts.

## Dream Catalog Design

Each focus area starts with `5` curated dream cards in the main path.

The dream-selection pattern is:

- user sees `5` strong default options
- if none fit, user chooses `Ver outras ideias`
- user selects `1` or `2` universal micropreferences
- LLM returns `3` new dream options

Micropreferences are universal in V1 to keep the Typebot logic manageable and predictable.

Examples of acceptable micropreference families:

- `mais ambicioso`
- `mais leve`
- `mais rápido`
- `mais transformador`

The exact labels can be refined later, but the model should remain structured and universal in V1.

## Data Contract

The Typebot handoff payload should contain only structured seed data required by the native app.

Recommended payload shape:

- `focusArea`
- `selectedDreamKey`
- `selectedDreamLabel`
- `usedRegeneration`
- `microPreferences`
- `regenerationCount`

The payload should not contain:

- final `goal` text
- final `habit` text
- arbitrary user-authored dream statements

The native app becomes the final source of truth for what gets reviewed and persisted.

## Safety and Reliability

This redesign reduces product and security risk by shrinking the amount of arbitrary text that enters the onboarding flow.

Benefits:

- less prompt manipulation risk in the main path
- lower risk of invalid or low-quality persisted content
- less brittle mapping between Typebot variables and app records
- simpler analytics and debugging because the flow is mostly structured

Fallback expectations:

- if LLM regeneration fails, show a fallback curated set for the current focus
- if regeneration limit is reached, restart dream selection
- if Typebot handoff fails, the app should support a native recovery path
- if the user abandons mid-flow, save enough structured state to support resume later

## Education Strategy

The onboarding should remain activation-first, not education-first.

Recommended learning sequence:

1. Typebot creates momentum
2. Native flow personalizes the starter trio
3. Review and save
4. Short post-save handoff introduces where the created items live
5. Deeper teaching happens progressively inside each module

This keeps the first session focused on progress, while still helping the user understand the platform.

## Success Metrics

Primary metrics:

- onboarding completion rate
- dream selection rate
- dream regeneration usage rate
- average regenerations before selection
- review confirmation rate
- correction rate
- successful creation of starter `dream`, `goal`, and `habit`

Secondary metrics:

- drop-off by phase
- focus-area distribution
- percentage of users needing regeneration
- early retention after onboarding handoff

## Migration Direction from the Current Export

The current exported Typebot flow should be simplified aggressively.

Remove or replace:

- open-text dream collection
- open-text SMART-goal collection
- open-text habit collection
- obstacle and motivation text flows
- validation loops created to compensate for open text
- final persistence assumptions based on raw bot outputs

Keep or adapt:

- the short welcoming narrative
- focus-area selection
- final completion signal and app handoff pattern

Add:

- curated dream-card branches for the three V1 focus areas
- `Ver outras ideias`
- universal micropreference selection
- regeneration count and limit logic
- structured payload handoff to the native app

## Testing Expectations

Design validation should cover:

- a user can reach dream selection quickly
- a user can choose a starter dream without writing text
- regeneration returns structured new options
- regeneration is limited to `5`
- hitting the limit restarts dream selection
- native app receives the expected structured payload
- native app can derive and personalize `goal` and `habit`
- review can confirm or correct
- correction returns to dream selection and recalculates connected suggestions

## Recommendation

Proceed with a `hybrid onboarding` architecture:

- `Typebot` for ritual entry and dream selection
- `We Better native UI` for personalization, review, and persistence

This is the strongest V1 because it preserves the emotional value of the onboarding while moving the most important and interaction-rich parts into the product surface that can support them properly.
