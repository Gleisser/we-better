# Structured Onboarding Trio Expansion Design

## Summary

The first structured onboarding cut made the Typebot responsible for selecting only the `dream`, while the native We Better app derived a starter `goal` and `habit`. That reduced open-text risk, but it still made the downstream plan feel too predetermined.

This expansion moves structured choice of `goal` and `habit` into the Typebot as well, while keeping the native app responsible for fine-tuning, review, restart, and persistence.

## Updated System Boundary

### Typebot responsibilities

- select `focus area`
- select `dream`
- suggest `5 goals` based on the selected dream
- select `goal`
- suggest `5 habits` based on the selected goal
- select `habit`
- support `Ver outras ideias` for `dream`, `goal`, and `habit`
- hand off the selected trio to the app as structured objects

### Native app responsibilities

- receive a structured starter trio seed
- render inline fine-tuning controls for `dream`, `goal`, and `habit`
- support a clear `restart` action that returns the user to the beginning of the Typebot flow
- show final review
- persist the confirmed trio

## Suggestion Strategy

The flow remains hybrid:

- use curated options first where available
- use the current LLM only to generate additional structured options when the user asks for more ideas

Generation context is chained:

- `goal` suggestions are based on `focusArea + selectedDream + dream micropreferences`
- `habit` suggestions are based on `focusArea + selectedDream + selectedGoal + relevant micropreferences`

The LLM must return structured options, not freeform saved text.

## Handoff Contract

The Typebot completion payload should now include:

- `focusArea`
- `selectedDream`
- `selectedGoal`
- `selectedHabit`

Each selected object should be shaped like a catalog entry, with fields designed for deterministic parsing:

- `key`
- `label`
- `shortReason`
- `source`
- `focusArea`

For `habit`, include:

- `goalKey`

The final payload does not need regeneration history.

## Native UX

The native step becomes a calibration layer, not a selection layer.

- lightweight adjustments stay inline in the app
- structural changes do not try to jump the user back into the middle of the bot
- instead, a single explicit `restart onboarding` action resets the flow and sends the user back to the beginning of the Typebot experience

## Success Criteria

- selected `goal` and `habit` no longer feel pre-authored by the app
- Typebot still avoids open-text-heavy onboarding
- native fine-tuning remains fast and low-friction
- payload parsing stays deterministic and resilient
