import { useTranslation } from '@/shared/hooks/useTranslation';
import type { OnboardingStarterPlan } from '@/types/onboarding';
import styles from './OnboardingPersonalization.module.css';

type OnboardingPersonalizationProps = {
  plan: OnboardingStarterPlan;
  onControlChange: (controlId: string, nextValue: string) => void;
  onContinue: () => void;
};

const getSliderIndex = (value: string, values: string[]): number => values.indexOf(value);

export const OnboardingPersonalization = ({
  plan,
  onControlChange,
  onContinue,
}: OnboardingPersonalizationProps) => {
  const { t } = useTranslation('onboarding');

  return (
    <section className={styles.panel} data-testid="onboarding-personalization">
      <div className={styles.previewGrid}>
        <article data-testid="starter-dream-preview" className={styles.card}>
          <span className={styles.label}>{t('onboarding.native.dream')}</span>
          <strong>{plan.dream.label}</strong>
        </article>
        <article data-testid="starter-goal-preview" className={styles.card}>
          <span className={styles.label}>{t('onboarding.native.goal')}</span>
          <strong>{plan.goal.title}</strong>
        </article>
        <article data-testid="starter-habit-preview" className={styles.card}>
          <span className={styles.label}>{t('onboarding.native.habit')}</span>
          <strong>{plan.habit.title}</strong>
        </article>
      </div>

      {plan.controls.map(control =>
        control.kind === 'slider' ? (
          <div key={control.id} className={styles.control}>
            <span>{control.label}</span>
            <input
              type="range"
              min={0}
              max={control.options.length - 1}
              value={getSliderIndex(
                control.value,
                control.options.map(option => option.value)
              )}
              onChange={event => {
                const nextOption = control.options[Number(event.currentTarget.value)];
                if (nextOption) {
                  onControlChange(control.id, nextOption.value);
                }
              }}
            />
            <div className={styles.chips}>
              {control.options.map(option => (
                <button
                  key={option.value}
                  type="button"
                  className={
                    option.value === control.value ? styles.chipActive : styles.chip
                  }
                  onClick={() => onControlChange(control.id, option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div key={control.id} className={styles.control}>
            <span>{control.label}</span>
            <div className={styles.chips}>
              {control.options.map(option => (
                <button
                  key={option.value}
                  type="button"
                  className={
                    option.value === control.value ? styles.chipActive : styles.chip
                  }
                  onClick={() => onControlChange(control.id, option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )
      )}

      <button type="button" className={styles.primaryButton} onClick={onContinue}>
        {t('onboarding.actions.continue')}
      </button>
    </section>
  );
};
