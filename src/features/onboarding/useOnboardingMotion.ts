import { type RefObject } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  INTRO_DURATION_MS,
  MOBILE_INTRO_DURATION_MS,
  type OnboardingPhase,
} from './onboardingPresentation';

gsap.registerPlugin(useGSAP);

export const useOnboardingMotion = (
  rootRef: RefObject<HTMLElement>,
  onPhaseChange: (phase: OnboardingPhase) => void
): void => {
  useGSAP(
    (_, contextSafe) => {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const isMobile = window.matchMedia('(max-width: 767px)').matches;

      if (reducedMotion) {
        onPhaseChange('reduced-motion-chat');
        return;
      }

      const introDuration = (isMobile ? MOBILE_INTRO_DURATION_MS : INTRO_DURATION_MS) / 1000;
      const transitionLead = isMobile ? 0.8 : 1.1;
      const safePhaseChange = contextSafe ? contextSafe(onPhaseChange) : onPhaseChange;
      const timeline = gsap.timeline({
        defaults: {
          duration: 0.75,
          ease: 'power2.out',
        },
      });

      gsap.set('[data-hero-copy]', {
        autoAlpha: 1,
        y: 0,
        filter: 'blur(0px)',
      });
      gsap.set('[data-stage-shell]', {
        autoAlpha: 0,
        y: 26,
        scale: 0.985,
      });
      gsap.set('[data-hero-scene]', {
        filter: 'blur(0px)',
      });

      timeline
        .call(() => safePhaseChange('intro'))
        .to('[data-hero-scene]', { scale: 1.02, duration: introDuration }, 0)
        .call(
          () => safePhaseChange('transitioning'),
          [],
          Math.max(introDuration - transitionLead, 0.1)
        )
        .to('[data-hero-copy]', { autoAlpha: 0, y: -16, filter: 'blur(4px)', duration: 0.55 }, '<')
        .to('[data-hero-scene]', { filter: 'blur(8px)', scale: 1.05, duration: 0.9 }, '<')
        .to('[data-stage-shell]', { autoAlpha: 1, y: 0, scale: 1, duration: 0.85 }, '<0.15')
        .call(() => safePhaseChange('chat'));

      return () => {
        timeline.kill();
      };
    },
    { scope: rootRef }
  );
};
