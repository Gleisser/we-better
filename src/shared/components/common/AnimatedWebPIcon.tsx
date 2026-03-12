import { useEffect, useRef, useState, type ReactNode } from 'react';
import styles from './AnimatedWebPIcon.module.css';

export interface AnimatedWebPIconProps {
  className?: string;
  durationMs?: number;
  fallback?: ReactNode;
  posterSrc?: string;
  replayKey: number | string;
  src: string;
}

const REPLAY_HIDE_OFFSET_MS = 32;

export const AnimatedWebPIcon = ({
  className,
  durationMs = 1000,
  fallback,
  posterSrc,
  replayKey,
  src,
}: AnimatedWebPIconProps): JSX.Element => {
  const [playbackToken, setPlaybackToken] = useState<string | null>(null);
  const lastReplayKeyRef = useRef<number | string | null>(null);
  const hideTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current !== null) {
        window.clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (lastReplayKeyRef.current === null) {
      lastReplayKeyRef.current = replayKey;
      return;
    }

    if (lastReplayKeyRef.current === replayKey) {
      return;
    }

    lastReplayKeyRef.current = replayKey;

    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
      if (mediaQuery?.matches) {
        setPlaybackToken(null);
        return;
      }

      if (hideTimeoutRef.current !== null) {
        window.clearTimeout(hideTimeoutRef.current);
      }

      setPlaybackToken(String(replayKey));
      hideTimeoutRef.current = window.setTimeout(
        () => {
          setPlaybackToken(null);
        },
        Math.max(durationMs - REPLAY_HIDE_OFFSET_MS, 0)
      );
    }
  }, [durationMs, replayKey]);

  return (
    <span className={[styles.root, className].filter(Boolean).join(' ')}>
      <span
        className={[styles.fallback, playbackToken ? styles.fallbackHidden : '']
          .filter(Boolean)
          .join(' ')}
      >
        {posterSrc ? (
          <img
            className={styles.poster}
            src={posterSrc}
            alt=""
            aria-hidden="true"
            decoding="async"
          />
        ) : (
          (fallback ?? null)
        )}
      </span>

      {playbackToken ? (
        <img
          key={playbackToken}
          className={styles.image}
          src={src}
          alt=""
          aria-hidden="true"
          decoding="async"
        />
      ) : null}

      <img className={styles.preload} src={src} alt="" aria-hidden="true" decoding="async" />
    </span>
  );
};
