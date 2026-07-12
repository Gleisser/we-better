export type OnboardingAnalyticsEvent =
  | 'onboarding_shown'
  | 'onboarding_intro_shown'
  | 'onboarding_stage_shown'
  | 'onboarding_fallback_shown'
  | 'onboarding_skipped'
  | 'onboarding_completed'
  | 'onboarding_completion_redirect';

export const trackOnboardingEvent = (
  eventName: OnboardingAnalyticsEvent,
  detail?: Record<string, unknown>
): void => {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(
    new CustomEvent('we-better:onboarding-analytics', {
      detail: {
        eventName,
        ...detail,
      },
    })
  );
};
