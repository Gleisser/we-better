import type { OnboardingStarterPlan } from '@/types/onboarding';
import styles from './OnboardingReview.module.css';

type OnboardingReviewProps = {
  plan: OnboardingStarterPlan;
  onConfirm: () => void;
  onRestart: () => void;
  restartLabel: string;
  confirmLabel: string;
  isSubmitting: boolean;
};

export const OnboardingReview = ({
  plan,
  onConfirm,
  onRestart,
  restartLabel,
  confirmLabel,
  isSubmitting,
}: OnboardingReviewProps): React.JSX.Element => (
  <section className={styles.panel} data-testid="onboarding-review">
    <article className={styles.card}>
      <span>Dream</span>
      <strong>{plan.dream.label}</strong>
    </article>
    <article className={styles.card}>
      <span>Goal</span>
      <strong>{plan.goal.title}</strong>
    </article>
    <article className={styles.card}>
      <span>Habit</span>
      <strong>{plan.habit.title}</strong>
    </article>

    <div className={styles.actions}>
      <button type="button" onClick={onRestart} disabled={isSubmitting}>
        {restartLabel}
      </button>
      <button type="button" onClick={onConfirm} disabled={isSubmitting}>
        {confirmLabel}
      </button>
    </div>
  </section>
);
