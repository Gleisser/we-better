import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Standard } from '@typebot.io/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/hooks/useAuth';
import { useTranslation } from '@/shared/hooks/useTranslation';
import type { OnboardingStarterPlan } from '@/types/onboarding';
import OnboardingHero from './OnboardingHero';
import OnboardingStage from './OnboardingStage';
import { OnboardingPersonalization } from './OnboardingPersonalization';
import { trackOnboardingEvent } from './analytics';
import { PHASE_ATTRIBUTE, type OnboardingPhase } from './onboardingPresentation';
import { useOnboardingMotion } from './useOnboardingMotion';
import styles from './OnboardingPage.module.css';
import { WeBetterLogo } from '@/components/ui/WeBetterLogo';
import { applyStarterPlanControl, createStarterPlan } from './starterPlan';
import { extractStructuredOnboardingSeed } from './typebotPersistence';
import { OnboardingReview } from './OnboardingReview';
import { persistStarterPlan } from './persistStarterPlan';
import { getDreamOptions } from './structuredCatalog';

const getTypebotApiHost = (): string =>
  import.meta.env.VITE_TYPEBOT_API_HOST || 'https://viewer.typebot.io';

const getTypebotOnboardingId = (): string => import.meta.env.VITE_TYPEBOT_ONBOARDING_ID || '';

const getTypebotCompletionSignal = (): string =>
  (import.meta.env.VITE_TYPEBOT_ONBOARDING_COMPLETION_SIGNAL || 'onboarding-complete').trim();

type NativeStep = 'typebot' | 'personalization' | 'review';

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

const mapObservedFocusAreaLabel = (label: string | null): string | null => {
  if (!label) {
    return null;
  }

  const normalized = label.trim().toLowerCase();
  if (normalized === 'saúde' || normalized === 'saude') return 'health';
  if (normalized === 'relacionamentos') return 'relationships';
  if (normalized === 'finanças' || normalized === 'financas') return 'finances';
  return null;
};

const isKnownDreamLabel = (label: string): boolean =>
  ['health', 'relationships', 'finances'].some(focusArea =>
    getDreamOptions(focusArea).some(option => option.label === label)
  );

const OnboardingPage = (): JSX.Element => {
  const navigate = useNavigate();
  const { user, skipOnboarding, completeOnboarding } = useAuth();
  const { t, currentLanguage } = useTranslation('onboarding');
  const rootRef = useRef<HTMLDivElement>(null);
  const observedSelectionsRef = useRef<{
    focusAreaLabel: string | null;
    dreamLabel: string | null;
  }>({
    focusAreaLabel: null,
    dreamLabel: null,
  });
  const [phase, setPhase] = useState<OnboardingPhase>('intro');
  const [nativeStep, setNativeStep] = useState<NativeStep>('typebot');
  const [starterPlan, setStarterPlan] = useState<OnboardingStarterPlan | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [embedAttempt, setEmbedAttempt] = useState(0);
  const typebotOnboardingId = getTypebotOnboardingId().trim();
  const typebotApiHost = getTypebotApiHost();
  const typebotCompletionSignal = getTypebotCompletionSignal().toLowerCase();
  const isEmbedConfigured = typebotOnboardingId.length > 0;

  useOnboardingMotion(rootRef, setPhase);

  useEffect(() => {
    trackOnboardingEvent('onboarding_shown', {
      userId: user?.id ?? null,
    });
  }, [user?.id]);

  useEffect(() => {
    trackOnboardingEvent('onboarding_intro_shown', {
      userId: user?.id ?? null,
    });
  }, [user?.id]);

  useEffect(() => {
    if (!isEmbedConfigured) {
      trackOnboardingEvent('onboarding_fallback_shown', {
        userId: user?.id ?? null,
      });
    }
  }, [isEmbedConfigured, user?.id]);

  useEffect(() => {
    if (phase === 'chat' || phase === 'reduced-motion-chat') {
      trackOnboardingEvent('onboarding_stage_shown', {
        phase,
        userId: user?.id ?? null,
      });
    }
  }, [phase, user?.id]);

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

  const handleStructuredCompletion = useCallback(
    (payload: unknown) => {
      const seed = extractStructuredOnboardingSeed(
        payload,
        typebotCompletionSignal,
        currentLanguage,
        observedSelectionsRef.current
      );
      if (!seed) {
        return false;
      }

      setStarterPlan(createStarterPlan(seed, currentLanguage));
      setNativeStep('personalization');
      setPhase(currentPhase =>
        currentPhase === 'reduced-motion-chat' ? 'reduced-motion-chat' : 'chat'
      );
      setErrorMessage(null);
      return true;
    },
    [currentLanguage, typebotCompletionSignal]
  );

  const handleScriptExecutionSuccess = useCallback(
    async (rawValue: unknown) => {
      let value = rawValue;
      if (typeof rawValue === 'string') {
        try {
          const parsed = JSON.parse(rawValue);
          if (typeof parsed === 'object' && parsed !== null) {
            value = parsed;
          }
        } catch {
          // It's a regular string, not JSON. That is fine.
        }
      }

      if (handleStructuredCompletion(value)) {
        return;
      }

      const normalizedSignal = normalizeScriptResult(value);

      if (!normalizedSignal || normalizedSignal !== typebotCompletionSignal) {
        return;
      }
    },
    [handleStructuredCompletion, typebotCompletionSignal]
  );

  useEffect(() => {
    if (!isEmbedConfigured) {
      return;
    }

    const attachHandlers = (): void => {
      if (!rootRef.current) {
        return;
      }

      const element = rootRef.current.querySelector('typebot-standard') as
        | (HTMLElement & {
            onScriptExecutionSuccess?: (value: unknown) => void | Promise<void>;
          })
        | null;

      if (!element) {
        return;
      }

      element.onScriptExecutionSuccess = (value: unknown) => {
        void handleScriptExecutionSuccess(value);
      };
    };

    attachHandlers();
    const intervalId = window.setInterval(attachHandlers, 250);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [embedAttempt, handleScriptExecutionSuccess, isEmbedConfigured]);

  useEffect(() => {
    if (!isEmbedConfigured || nativeStep !== 'typebot') {
      return;
    }

    const handleDocumentClick = (event: MouseEvent): void => {
      const path = event.composedPath();
      const originatedFromTypebot = path.some(
        entry => entry instanceof HTMLElement && entry.tagName.toLowerCase() === 'typebot-standard'
      );

      if (!originatedFromTypebot) {
        return;
      }

      const clickedButton = path.find(entry => entry instanceof HTMLButtonElement);
      if (!(clickedButton instanceof HTMLButtonElement)) {
        return;
      }

      const label = clickedButton.textContent?.trim() ?? '';
      if (!label) {
        return;
      }

      if (mapObservedFocusAreaLabel(label)) {
        observedSelectionsRef.current.focusAreaLabel = label;
        return;
      }

      if (isKnownDreamLabel(label)) {
        observedSelectionsRef.current.dreamLabel = label;
      }
    };

    document.addEventListener('click', handleDocumentClick, true);

    return () => {
      document.removeEventListener('click', handleDocumentClick, true);
    };
  }, [isEmbedConfigured, nativeStep]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent): void => {
      if (event.data && typeof event.data === 'object') {
        const candidateSignal =
          typeof event.data.signal === 'string' ? event.data.signal.trim().toLowerCase() : null;

        if (candidateSignal === typebotCompletionSignal) {
          void handleScriptExecutionSuccess(event.data);
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleScriptExecutionSuccess, typebotCompletionSignal]);

  const handleRetry = useCallback(() => {
    setEmbedAttempt(current => current + 1);
    setNativeStep('typebot');
    setStarterPlan(null);
    setErrorMessage(null);
    observedSelectionsRef.current = {
      focusAreaLabel: null,
      dreamLabel: null,
    };
  }, []);

  const handleControlChange = useCallback((controlId: string, nextValue: string) => {
    setStarterPlan(current =>
      current ? applyStarterPlanControl(current, controlId, nextValue) : current
    );
  }, []);

  const handleConfirmStarterPlan = useCallback(async () => {
    if (!starterPlan || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await persistStarterPlan(starterPlan);
      await handleComplete();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : t('onboarding.status.completionFailed')
      );
      setIsSubmitting(false);
    }
  }, [handleComplete, isSubmitting, starterPlan, t]);

  const handleCorrectStarterPlan = useCallback(() => {
    setStarterPlan(null);
    setNativeStep('typebot');
    setEmbedAttempt(current => current + 1);
    observedSelectionsRef.current = {
      focusAreaLabel: null,
      dreamLabel: null,
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={styles.page}
      data-testid="onboarding-page"
      {...{ [PHASE_ATTRIBUTE]: phase }}
    >
      <header className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <WeBetterLogo size={32} theme="warm" />
          <span className={styles.logo}>We Better</span>
        </div>
        <button
          type="button"
          className={styles.skipButton}
          onClick={() => {
            void handleSkip();
          }}
          disabled={isSubmitting}
        >
          {t('onboarding.actions.skip')}
        </button>
      </header>

      <OnboardingHero
        eyebrow={t('onboarding.hero.eyebrow')}
        title={t('onboarding.hero.title')}
        body={t('onboarding.hero.body')}
        errorMessage={errorMessage}
      />

      <OnboardingStage
        forceVisible={nativeStep !== 'typebot'}
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
          nativeStep === 'typebot' ? (
            <Standard
              key={embedAttempt}
              typebot={typebotOnboardingId}
              apiHost={typebotApiHost}
              prefilledVariables={prefilledVariables}
              onScriptExecutionSuccess={(value: unknown) => {
                void handleScriptExecutionSuccess(value);
              }}
              style={{ width: '100%', height: '600px' }}
            />
          ) : nativeStep === 'personalization' && starterPlan ? (
            <OnboardingPersonalization
              plan={starterPlan}
              dreamLabel={t('onboarding.native.dream')}
              goalLabel={t('onboarding.native.goal')}
              habitLabel={t('onboarding.native.habit')}
              continueLabel={t('onboarding.actions.continue')}
              restartLabel={t('onboarding.actions.restart')}
              onControlChange={handleControlChange}
              onContinue={() => setNativeStep('review')}
              onRestart={handleCorrectStarterPlan}
            />
          ) : nativeStep === 'review' && starterPlan ? (
            <OnboardingReview
              plan={starterPlan}
              onConfirm={() => {
                void handleConfirmStarterPlan();
              }}
              onRestart={handleCorrectStarterPlan}
              restartLabel={t('onboarding.actions.restart')}
              confirmLabel={t('onboarding.actions.confirm')}
              isSubmitting={isSubmitting}
            />
          ) : null
        }
      />
    </div>
  );
};

export default OnboardingPage;
