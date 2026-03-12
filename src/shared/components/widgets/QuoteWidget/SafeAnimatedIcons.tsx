import styles from './QuoteWidget.module.css';

interface SafeIconProps {
  className?: string;
}

interface SafeBookmarkIconProps extends SafeIconProps {
  filled?: boolean;
}

export const SafeShareIcon = ({ className }: SafeIconProps): JSX.Element => (
  <svg
    viewBox="0 0 48 48"
    className={[styles.safeShareIcon, className].filter(Boolean).join(' ')}
    fill="none"
    aria-hidden="true"
  >
    <g className={styles.safeShareHub}>
      <circle
        className={styles.safeShareCore}
        cx="13.5"
        cy="24"
        r="5.5"
        stroke="currentColor"
        strokeWidth="2.6"
      />
      <circle className={styles.safeShareGlow} cx="13.5" cy="24" r="7.75" />
    </g>

    <g className={styles.safeShareTopArm}>
      <path
        className={styles.safeShareLine}
        d="M17.4 22.2L30.6 14.7"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.8"
      />
      <circle
        className={styles.safeShareCore}
        cx="34.5"
        cy="12.5"
        r="5.5"
        stroke="currentColor"
        strokeWidth="2.6"
      />
      <circle className={styles.safeShareGlow} cx="34.5" cy="12.5" r="7.75" />
    </g>

    <g className={styles.safeShareBottomArm}>
      <path
        className={styles.safeShareLine}
        d="M17.4 25.8L30.6 33.3"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.8"
      />
      <circle
        className={styles.safeShareCore}
        cx="34.5"
        cy="35.5"
        r="5.5"
        stroke="currentColor"
        strokeWidth="2.6"
      />
      <circle className={styles.safeShareGlow} cx="34.5" cy="35.5" r="7.75" />
    </g>

    <path
      className={styles.safeShareSweep}
      d="M11 23L37 39"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.6"
    />
  </svg>
);

export const SafeBookmarkIcon = ({
  className,
  filled = false,
}: SafeBookmarkIconProps): JSX.Element => (
  <svg
    viewBox="0 0 48 48"
    className={[styles.safeBookmarkIcon, className].filter(Boolean).join(' ')}
    fill="none"
    data-filled={filled ? 'true' : 'false'}
    aria-hidden="true"
  >
    <g className={styles.safeBookmarkBody}>
      <path
        className={styles.safeBookmarkPaper}
        d="M16 10.75C16 9.7835 16.7835 9 17.75 9H30.25C31.2165 9 32 9.7835 32 10.75V38.25L24 31.85L16 38.25V10.75Z"
        fill="currentColor"
      />
      <path
        className={styles.safeBookmarkOutline}
        d="M16 10.75C16 9.7835 16.7835 9 17.75 9H30.25C31.2165 9 32 9.7835 32 10.75V38.25L24 31.85L16 38.25V10.75Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="2.8"
      />
      <path
        className={styles.safeBookmarkStitch}
        d="M19.5 14.5H28.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.2"
      />
    </g>
  </svg>
);
