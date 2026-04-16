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
