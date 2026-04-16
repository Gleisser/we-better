import { type RefObject } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { INTRO_DURATION_MS, type OnboardingPhase } from './onboardingPresentation';

gsap.registerPlugin(useGSAP);

export const useOnboardingMotion = (
  rootRef: RefObject<HTMLElement>,
  onPhaseChange: (phase: OnboardingPhase) => void
): void => {
  useGSAP(
    (_, contextSafe) => {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (reducedMotion) {
        onPhaseChange('reduced-motion-chat');
        return;
      }

      const safePhaseChange = contextSafe(onPhaseChange);
      const timeline = gsap.timeline({
        defaults: {
          duration: 0.8,
          ease: 'power2.out',
        },
      });

      timeline
        .call(() => safePhaseChange('intro'))
        .to('[data-hero-copy]', { autoAlpha: 1, y: 0 }, 0)
        .call(() => safePhaseChange('transitioning'), [], INTRO_DURATION_MS / 1000 - 1.2)
        .to('[data-hero-scene]', { filter: 'blur(10px)', scale: 1.04, duration: 1.1 }, '<')
        .to('[data-stage-shell]', { autoAlpha: 1, y: 0, duration: 0.9 }, '<0.2')
        .call(() => safePhaseChange('chat'));

      return () => {
        timeline.kill();
      };
    },
    { scope: rootRef }
  );
};
