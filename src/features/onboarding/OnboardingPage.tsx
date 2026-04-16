import { useCallback, useEffect, useMemo, useState } from 'react';
import { Standard } from '@typebot.io/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/hooks/useAuth';
import { useTranslation } from '@/shared/hooks/useTranslation';
import OnboardingHero from './OnboardingHero';
import OnboardingStage from './OnboardingStage';
import { trackOnboardingEvent } from './analytics';
import { PHASE_ATTRIBUTE, type OnboardingPhase } from './onboardingPresentation';
import styles from './OnboardingPage.module.css';

const getTypebotApiHost = (): string =>
  import.meta.env.VITE_TYPEBOT_API_HOST || 'https://typebot.io';

const getTypebotOnboardingId = (): string => import.meta.env.VITE_TYPEBOT_ONBOARDING_ID || '';

const getTypebotCompletionSignal = (): string =>
  (import.meta.env.VITE_TYPEBOT_ONBOARDING_COMPLETION_SIGNAL || 'onboarding-complete').trim();

const normalizeScriptResult = (value: unknown): string | null => {
  if (typeof value === 'string') {
    return value.trim().toLowerCase();
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value).trim().toLowerCase();
  }

  if (typeof value === 'object' && value !== null) {
    const candidateKeys = ['id', 'name', 'status', 'signal', 'event'];

    for (const key of candidateKeys) {
      const candidate = (value as Record<string, unknown>)[key];
      if (typeof candidate === 'string' && candidate.trim().length > 0) {
        return candidate.trim().toLowerCase();
      }
    }
  }

  return null;
};

const OnboardingPage = (): JSX.Element => {
  const navigate = useNavigate();
  const { user, skipOnboarding, completeOnboarding } = useAuth();
  const { t, currentLanguage } = useTranslation('onboarding');
  const [phase] = useState<OnboardingPhase>('intro');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [embedAttempt, setEmbedAttempt] = useState(0);
  const typebotOnboardingId = getTypebotOnboardingId().trim();
  const typebotApiHost = getTypebotApiHost();
  const typebotCompletionSignal = getTypebotCompletionSignal().toLowerCase();

  useEffect(() => {
    trackOnboardingEvent('onboarding_shown', {
      userId: user?.id ?? null,
    });
  }, [user?.id]);

  const prefilledVariables = useMemo(
    () => ({
      'User name': user?.display_name || user?.full_name || user?.email || 'We Better User',
      'User email': user?.email || '',
      'Current URL': window.location.href,
      Locale: currentLanguage,
    }),
    [currentLanguage, user?.display_name, user?.email, user?.full_name]
  );

  const redirectToDashboard = useCallback(() => {
    navigate('/app/dashboard', { replace: true });
  }, [navigate]);

  const handleSkip = useCallback(async () => {
    if (!skipOnboarding || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const didSkip = await skipOnboarding();

    if (!didSkip) {
      setErrorMessage(t('onboarding.status.skipFailed'));
      setIsSubmitting(false);
      return;
    }

    trackOnboardingEvent('onboarding_skipped', {
      userId: user?.id ?? null,
    });
    redirectToDashboard();
  }, [isSubmitting, redirectToDashboard, skipOnboarding, t, user?.id]);

  const handleComplete = useCallback(async () => {
    if (!completeOnboarding || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const didComplete = await completeOnboarding();

    if (!didComplete) {
      setErrorMessage(t('onboarding.status.completionFailed'));
      setIsSubmitting(false);
      return;
    }

    trackOnboardingEvent('onboarding_completed', {
      userId: user?.id ?? null,
    });
    trackOnboardingEvent('onboarding_completion_redirect', {
      target: '/app/dashboard',
    });
    redirectToDashboard();
  }, [completeOnboarding, isSubmitting, redirectToDashboard, t, user?.id]);

  const handleScriptExecutionSuccess = useCallback(
    async (value: unknown) => {
      const normalizedSignal = normalizeScriptResult(value);

      if (!normalizedSignal || normalizedSignal !== typebotCompletionSignal) {
        return;
      }

      await handleComplete();
    },
    [handleComplete, typebotCompletionSignal]
  );

  const handleRetry = useCallback(() => {
    setEmbedAttempt(current => current + 1);
    setErrorMessage(null);
  }, []);

  const isEmbedConfigured = typebotOnboardingId.length > 0;

  return (
    <div className={styles.page} data-testid="onboarding-page" {...{ [PHASE_ATTRIBUTE]: phase }}>
      <OnboardingHero
        eyebrow={t('onboarding.hero.eyebrow')}
        title={t('onboarding.hero.title')}
        body={t('onboarding.hero.body')}
        skipLabel={t('onboarding.actions.skip')}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        onSkip={() => {
          void handleSkip();
        }}
      />

      <OnboardingStage
        phase={phase}
        showFallback={!isEmbedConfigured}
        fallbackTitle={t('onboarding.status.embedUnavailableTitle')}
        fallbackBody={t('onboarding.status.embedUnavailableBody')}
        retryLabel={t('onboarding.actions.retry')}
        skipLabel={t('onboarding.actions.skip')}
        onRetry={handleRetry}
        onSkip={() => {
          void handleSkip();
        }}
        embed={
          <Standard
            key={embedAttempt}
            typebot={typebotOnboardingId}
            apiHost={typebotApiHost}
            prefilledVariables={prefilledVariables}
            onScriptExecutionSuccess={(value: unknown) => {
              void handleScriptExecutionSuccess(value);
            }}
            style={{ width: '100%', height: '100%' }}
          />
        }
      />
    </div>
  );
};

export default OnboardingPage;
