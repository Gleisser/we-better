import type { ReactNode } from 'react';
import type { OnboardingPhase } from './onboardingPresentation';
import styles from './OnboardingStage.module.css';

type OnboardingStageProps = {
  embed: ReactNode;
  fallbackBody?: string;
  fallbackTitle?: string;
  phase: OnboardingPhase;
  retryLabel: string;
  showFallback: boolean;
  skipLabel: string;
  onRetry: () => void;
  onSkip: () => void;
};

const OnboardingStage = ({
  embed,
  fallbackBody,
  fallbackTitle,
  phase,
  retryLabel,
  showFallback,
  skipLabel,
  onRetry,
  onSkip,
}: OnboardingStageProps): JSX.Element => (
  <section className={styles.stage} data-testid="onboarding-stage" data-phase={phase}>
    <div className={styles.container}>
      {showFallback ? (
        <div className={styles.fallback} role="status">
          <h2 className={styles.fallbackTitle}>{fallbackTitle}</h2>
          <p className={styles.fallbackBody}>{fallbackBody}</p>
          <div className={styles.fallbackActions}>
            <button type="button" className={styles.primaryButton} onClick={onRetry}>
              {retryLabel}
            </button>
            <button type="button" className={styles.secondaryButton} onClick={onSkip}>
              {skipLabel}
            </button>
          </div>
        </div>
      ) : (
        <>
          {phase !== 'chat' && phase !== 'reduced-motion-chat' ? (
            <div className={styles.loadingShell} data-testid="onboarding-stage-loading" />
          ) : null}
          <div className={styles.embedSlot}>{embed}</div>
        </>
      )}
    </div>
  </section>
);

export default OnboardingStage;
