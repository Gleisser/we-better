import styles from './OnboardingHero.module.css';

type OnboardingHeroProps = {
  body: string;
  eyebrow: string;
  title: string;
  errorMessage?: string | null;
};

const OnboardingHero = ({
  body,
  eyebrow,
  errorMessage,
  title,
}: OnboardingHeroProps): JSX.Element => (
  <section className={styles.hero} data-hero-scene="" data-testid="onboarding-hero">
    <img
      alt=""
      aria-hidden="true"
      className={styles.heroImage}
      src="/assets/images/onboarding/we-better-ritual-hero.webp"
    />
    <div className={styles.overlay} />

    <div className={styles.copy} data-hero-copy="">
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
