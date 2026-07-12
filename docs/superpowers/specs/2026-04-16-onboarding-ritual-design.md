# Onboarding Ritual Redesign Spec

**Date:** 2026-04-16  
**Area:** `src/features/onboarding`  
**Status:** Draft for review

## Goal

Redesign the existing first-access onboarding route into a premium, cinematic experience that feels unmistakably We Better without weakening clarity, accessibility, or onboarding completion.

The current route already handles:

- first-access gating
- skip/completion state
- Typebot embedding
- error fallback

This redesign changes the presentation layer and animation orchestration around that existing integration. It does not change onboarding business rules, backend contracts, or dream/goal/habit persistence scope.

## Product Direction

The onboarding should feel like a guided opening ritual:

- `vision board premium` visual tone
- full-screen emotional opening using the supplied image
- short `coach premium` copy, not meditative or mystical copy
- automatic transition after `3 to 4 seconds`
- Typebot enters already active, with the first message visible
- brand present through a discreet We Better logo
- `Pular por agora` remains visible as a clear secondary action

The image is used as an emotional portal, not as a persistent poster behind the chat. Once the ritual finishes, the page should become more product-like and legible while retaining atmospheric continuity from the opening scene.

## Non-Goals

- No change to onboarding routing logic or auth guard policy
- No change to Typebot flow content
- No scroll-based storytelling or Lenis integration
- No attempt to persist dreams, goals, or habits from the redesign work
- No app-wide shell redesign outside `/app/onboarding`
- No generic, purple gradiente UI design

## Experience Overview

### Phase 1: Intro

The user lands on a full-screen opening scene:

- supplied image fills the viewport
- warm overlay and atmospheric dark vignette improve contrast
- discreet We Better logo sits top-left
- `Pular por agora` sits top-right as a secondary button
- a short headline and subheadline appear centered

This phase establishes emotional intent quickly. It should feel premium and aspirational, but not vague.

### Phase 2: Transition

After roughly `3 to 4 seconds`, the hero dissolves into a cleaner stage:

- hero image softens with blur and slight scale change
- lighting aura remains in the background
- the center of the screen prepares for the chat container
- copy fades out cleanly and does not compete with the embed

The transition must feel continuous, not like a route change or modal opening.

### Phase 3: Guided Chat

The Typebot stage becomes the primary focus:

- a central premium container appears with a light surface and dark aura
- the Typebot embed is already active
- the first message is visible immediately
- the page remains visually elevated, but the chat becomes the unambiguous focal point

## Visual System

### Background Treatment

The opening uses the provided image as the dominant visual. The image should be treated with:

- a soft warm overlay to align with the We Better emotional tone
- a subtle dark edge vignette to keep text readable
- slight blur carryover during the transition to avoid a hard visual cut

If the image fails to load, the page falls back to a premium atmospheric background built from gradients and glow derived from the same palette.

### Typebot Container

The chat stage uses a `hybrid` container style:

- clear or ivory-leaning base for readability
- soft cool border or highlight so it still feels premium
- deep, diffuse shadow to create depth
- large but controlled radius
- background aura behind the container so it remains integrated into the scene

This avoids the two bad extremes:

- pure dark glass, which looks impressive but harms readability
- plain light card, which feels generic and detached from the opening

### Typography and Brand Presence

Typography should support a premium coaching tone:

- concise headline
- supportive subheadline
- no long paragraphs in the intro
- discreet We Better logo rather than loud brand framing

The visual hierarchy should be:

1. opening atmosphere
2. headline
3. transition
4. Typebot container
5. secondary skip action

## Component Architecture

The redesign should keep animation and UI composition separated.

### `OnboardingPage`

Responsibilities:

- lifecycle and phase state
- skip/completion actions
- error and loading state
- analytics
- rendering the hero and stage shells

### `OnboardingHero`

Responsibilities:

- full-screen image scene
- logo
- intro copy
- skip action placement
- reduced-motion compatible intro state

### `OnboardingStage`

Responsibilities:

- final premium stage layout
- Typebot container shell
- loading placeholder while Typebot becomes visible
- fallback UI if Typebot is unavailable

### `OnboardingMotionController`

Responsibilities:

- encapsulate GSAP timeline setup
- coordinate hero exit and stage entry
- expose phase changes without coupling animation logic to embed logic

This can be implemented as a hook instead of a component if that fits the existing codebase better, but the motion logic should still live behind one clear boundary.

## State Model

Use explicit, testable presentation states:

- `intro`
- `transitioning`
- `chat`
- `loading`
- `error`
- `reduced-motion-chat`

These states exist to make the experience testable and robust. The GSAP timeline should animate between them, not replace them.

## Animation Strategy

Use `gsap` with `@gsap/react`. Do not use Lenis for this route.

### Why GSAP

This experience needs precise sequencing:

- hero entrance stabilization
- timed dissolve
- controlled stage reveal
- consistent coordination across desktop and mobile

GSAP fits because the experience is timeline-driven rather than scroll-driven.

### Why Not Lenis

This onboarding does not depend on scroll interaction. Adding smooth-scroll infrastructure would introduce weight and complexity without improving the core experience.

### GSAP Implementation Rules

Follow the installed GSAP React guidance from `~/.agents/skills/gsap-react` and `gsap-timeline`:

- use `@gsap/react`
- register `useGSAP`
- use a single root ref as `scope`
- avoid unscoped selectors
- keep all GSAP execution inside client lifecycle
- rely on `useGSAP` cleanup
- wrap delayed callbacks with `contextSafe` if needed

### Timeline Shape

Use one master timeline with labels:

- `intro`
- `transition`
- `chat`

Recommended sequence:

- `0s to ~0.8s`: image and opening atmosphere settle in
- `~0.8s to ~2.4s`: copy and logo hold with calm presence
- `~2.4s to ~3.6s`: hero dissolves, copy exits, background softens
- `~3.2s to ~4s`: chat container enters and becomes primary

Desktop and mobile should share the same choreography, but with smaller values and slightly shorter timings on mobile.

## Responsive Behavior

### Desktop

- opening image fills the full viewport
- logo top-left
- skip top-right
- intro copy centered with generous breathing room
- final Typebot stage centered at roughly `720px to 860px` max width

### Mobile

- same visual concept, but with less ceremony
- tighter copy
- faster-feeling transition
- chat container uses most of the available width
- spacing prevents the chat from feeling cramped or pushed too low

The user should never feel forced to wait for a cinematic moment on a small screen.

## Typebot Integration Behavior

The route should continue to use the existing Typebot integration, but with stronger stage management around it.

Rules:

- the page begins intro and Typebot preparation in parallel
- the timeline does not wait indefinitely for Typebot to be fully ready
- the stage can appear with a premium loading state if the embed is still initializing
- if the embed is ready, the user should see the first message immediately on stage reveal

The redesign should not depend on undocumented Typebot APIs. If readiness events are limited, the loading handoff should still feel smooth using UI state controlled by the page.

## Error Handling and Fallbacks

### Image Failure

If the supplied image cannot be loaded:

- keep the intro structure
- swap to an atmospheric gradient background
- preserve contrast and premium tone

### Typebot Failure

If the embed is unavailable:

- keep the premium stage visible
- show concise fallback copy
- expose `Tentar novamente`
- expose `Pular por agora`

The route must remain usable even if Typebot fails.

### Slow Typebot Load

If Typebot is slow:

- still complete the intro transition
- show an elegant loading shell inside the premium container
- avoid layout jumps

## Accessibility

### Reduced Motion

If `prefers-reduced-motion` is enabled:

- shorten the intro dramatically or skip directly to a soft fade into the stage
- avoid cinematic scale or blur choreography
- keep content order and meaning intact

### Interaction

- `Pular por agora` must be keyboard accessible from the start
- focus order must remain logical during the transition
- intro copy must meet contrast requirements on top of the image
- the stage and fallback UI must remain readable in all states

## Analytics

Preserve the existing onboarding event model and extend only if useful for presentation telemetry.

Useful events:

- intro shown
- transition started
- chat stage shown
- skip clicked during intro
- skip clicked during chat
- embed fallback shown

These events should support UX evaluation without changing onboarding business logic.

## Testing Strategy

### Unit / Component

- intro renders with logo, copy, and skip
- reduced-motion path enters stable chat state without full timeline
- skip works during intro and chat
- fallback state renders when Typebot is unavailable
- loading state appears without layout collapse

### Routing / Integration

- onboarding route still gates first-access users correctly
- existing skip/completion redirect behavior remains intact
- onboarding page still works when bootstrap data comes from the local fallback logic

### Visual / Manual Verification

Check:

- desktop intro pacing
- mobile intro pacing
- stage legibility
- image fallback
- Typebot slow-load experience
- reduced-motion behavior

## Implementation Notes

- This redesign should be implemented on top of the existing onboarding route instead of replacing the route structure.
- Existing onboarding service, auth wiring, and protected-route rules should remain intact.
- The redesign should minimize coupling to Typebot internals so it stays resilient if the embed behavior changes.
- The page should continue to work if the Typebot ID is missing, unpublished, or temporarily broken.

## Open Decisions Already Resolved

- visual direction: `vision board premium`
- opening pattern: `ritual full-screen + auto-start`
- image treatment: image dominates the opening, then dissolves away
- intro duration: `3 to 4 seconds`
- stage treatment: Typebot centered in a premium `hybrid` container
- copy tone: `coach premium`
- brand presence: discreet logo
- skip treatment: visible secondary action
- Typebot behavior: first message already visible when stage appears

## Recommended Next Step

Write an implementation plan that:

- maps the redesign into concrete file changes
- defines the GSAP timeline API and reduced-motion path
- specifies test additions before UI changes
- sequences image treatment, shell changes, motion work, and verification
