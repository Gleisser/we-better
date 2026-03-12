import { useId } from 'react';
import styles from './SafeHeartIcon.module.css';

export interface SafeHeartIconProps {
  className?: string;
  filled?: boolean;
  replayKey?: number | string;
  variant?: 'like' | 'favorite';
}

const HEART_PATH =
  'M24 40.6 21.3 38.18C11.9 29.78 5.6 24.04 5.6 15.2c0-4.31 3.39-7.7 7.7-7.7 2.44 0 4.77 1.14 6.3 2.92L24 15.27l4.4-4.85c1.53-1.78 3.86-2.92 6.3-2.92 4.31 0 7.7 3.39 7.7 7.7 0 8.84-6.3 14.58-15.7 22.98L24 40.6Z';

export const SafeHeartIcon = ({
  className,
  filled = false,
  replayKey = 0,
  variant = 'favorite',
}: SafeHeartIconProps): JSX.Element => {
  const clipSeed = useId().replace(/:/g, '');
  const leftClipId = `${clipSeed}-left`;
  const rightClipId = `${clipSeed}-right`;
  const outlineGradientId = `${clipSeed}-outline`;
  const fillGradientId = `${clipSeed}-fill`;
  const haloGradientId = `${clipSeed}-halo`;
  const normalizedReplayKey = String(replayKey);
  const shouldReplay = normalizedReplayKey !== '0';
  const isFavorite = variant === 'favorite';

  return (
    <svg
      key={`${variant}-${filled ? 'filled' : 'idle'}-${normalizedReplayKey}`}
      viewBox="0 0 48 48"
      className={[styles.heartIcon, shouldReplay ? styles.replay : '', className]
        .filter(Boolean)
        .join(' ')}
      data-filled={filled ? 'true' : 'false'}
      data-variant={variant}
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={outlineGradientId}
          x1="8"
          y1="10"
          x2="40"
          y2="38"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#cb5eee" />
          <stop offset="0.48" stopColor="#a978f8" />
          <stop offset="1" stopColor="#4be1ec" />
        </linearGradient>
        <linearGradient
          id={fillGradientId}
          x1="11"
          y1="11"
          x2="36"
          y2="35"
          gradientUnits="userSpaceOnUse"
        >
          {isFavorite ? (
            <>
              <stop stopColor="#fff4ff" />
              <stop offset="0.56" stopColor="#f8fbff" />
              <stop offset="1" stopColor="#d6fbff" />
            </>
          ) : (
            <>
              <stop stopColor="#f2d3ff" />
              <stop offset="0.5" stopColor="#e7ddff" />
              <stop offset="1" stopColor="#c5f9ff" />
            </>
          )}
        </linearGradient>
        <radialGradient
          id={haloGradientId}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(24 23) rotate(90) scale(16)"
        >
          <stop stopColor="#cb5eee" stopOpacity="0.52" />
          <stop offset="0.56" stopColor="#7d86f7" stopOpacity="0.28" />
          <stop offset="1" stopColor="#4be1ec" stopOpacity="0" />
        </radialGradient>
        <clipPath id={leftClipId}>
          <rect x="6" y="6" width="18" height="34" rx="2" />
        </clipPath>
        <clipPath id={rightClipId}>
          <rect x="24" y="6" width="18" height="34" rx="2" />
        </clipPath>
      </defs>

      <circle
        className={styles.heartHalo}
        cx="24"
        cy="24"
        r="13.5"
        fill={`url(#${haloGradientId})`}
      />

      <g>
        <circle className={`${styles.spark} ${styles.sparkTop}`} cx="24" cy="8.5" r="1.5" />
        <circle className={`${styles.spark} ${styles.sparkLeft}`} cx="11.5" cy="18" r="1.25" />
        <circle className={`${styles.spark} ${styles.sparkRight}`} cx="36.5" cy="18" r="1.25" />
      </g>

      <g className={styles.heartFillGroup}>
        <g className={styles.heartLeftHalf} clipPath={`url(#${leftClipId})`}>
          <path className={styles.heartFillShape} d={HEART_PATH} fill={`url(#${fillGradientId})`} />
        </g>
        <g className={styles.heartRightHalf} clipPath={`url(#${rightClipId})`}>
          <path className={styles.heartFillShape} d={HEART_PATH} fill={`url(#${fillGradientId})`} />
        </g>
      </g>

      <path
        className={styles.heartOutline}
        d={HEART_PATH}
        stroke={`url(#${outlineGradientId})`}
        strokeWidth="2.75"
        strokeLinejoin="round"
      />
      <path
        className={styles.heartSheen}
        d="M15.6 17.4c1.6-2.35 3.9-3.53 6.9-3.53 2.1 0 4 .56 5.72 1.7"
        stroke="rgba(255,255,255,0.9)"
        strokeLinecap="round"
        strokeWidth="1.45"
      />
    </svg>
  );
};
