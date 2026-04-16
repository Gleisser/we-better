import styles from './OnboardingHero.module.css';

type OnboardingHeroProps = {
  body: string;
  eyebrow: string;
  isSubmitting: boolean;
  skipLabel: string;
  title: string;
  onSkip: () => void;
  errorMessage?: string | null;
};

const OnboardingHero = ({
  body,
  eyebrow,
  errorMessage,
  isSubmitting,
  skipLabel,
  title,
  onSkip,
}: OnboardingHeroProps): JSX.Element => (
  <section className={styles.hero} data-testid="onboarding-hero">
    <img
      alt=""
      aria-hidden="true"
      className={styles.heroImage}
      src="/assets/images/onboarding/we-better-ritual-hero.webp"
    />
    <div className={styles.overlay} />

    <div className={styles.chrome}>
      <span className={styles.logo}>We Better</span>
      <button type="button" className={styles.skipButton} onClick={onSkip} disabled={isSubmitting}>
        {skipLabel}
      </button>
    </div>

    <div className={styles.copy}>
      <span className={styles.eyebrow}>{eyebrow}</span>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.body}>{body}</p>
      {errorMessage ? (
        <p className={styles.errorMessage} role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  </section>
);

export default OnboardingHero;
