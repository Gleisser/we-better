import { useEffect, useRef, useState, type ReactNode } from 'react';

interface LottieLightPlayer {
  addEventListener(name: string, callback: () => void): void;
  destroy(): void;
  getDuration(inFrames?: boolean): number;
  goToAndPlay(value: number, isFrame?: boolean): void;
  goToAndStop(value: number, isFrame?: boolean): void;
  removeEventListener(name: string, callback: () => void): void;
  setSpeed(value: number): void;
}

interface LottieLightModule {
  default: {
    loadAnimation(params: {
      animationData: object;
      autoplay: boolean;
      container: Element;
      loop: boolean;
      renderer: 'svg';
      rendererSettings?: {
        hideOnTransparent?: boolean;
        preserveAspectRatio?: string;
        progressiveLoad?: boolean;
        runExpressions?: boolean;
      };
    }): LottieLightPlayer;
  };
}

interface LottieLightIconProps {
  animationData: object;
  className?: string;
  colorOverride?: string;
  fallback: ReactNode;
  replayKey: number | string;
  settleTo?: 'start' | 'end';
  speed?: number;
}

const loadLottieLight = (): Promise<LottieLightModule> =>
  import('lottie-web/build/player/lottie_light.js') as Promise<LottieLightModule>;

type NormalizedColor = [number, number, number];

const settlePlayerAtBoundary = (player: LottieLightPlayer, settleTo: 'start' | 'end'): void => {
  const totalFrames = Math.max(Math.round(player.getDuration(true)) - 1, 0);
  const targetFrame = settleTo === 'end' ? totalFrames : 0;
  player.goToAndStop(targetFrame, true);
};

const safelyRemoveCompleteListener = (
  player: LottieLightPlayer | null,
  callback: (() => void) | null
): void => {
  if (!player || !callback) {
    return;
  }

  try {
    player.removeEventListener('complete', callback);
  } catch (error) {
    if (error instanceof TypeError && /complete|null/i.test(error.message)) {
      return;
    }

    throw error;
  }
};

const cloneAnimationData = <T extends object>(animationData: T): T => {
  if (typeof structuredClone === 'function') {
    return structuredClone(animationData);
  }

  return JSON.parse(JSON.stringify(animationData)) as T;
};

const isNormalizedColor = (value: unknown): value is number[] =>
  Array.isArray(value) &&
  (value.length === 3 || value.length === 4) &&
  value.every(channel => typeof channel === 'number' && channel >= 0 && channel <= 1);

const remapColorArray = (value: number[], color: NormalizedColor): number[] => {
  if (!isNormalizedColor(value)) {
    return value;
  }

  if (value.length === 4) {
    return [...color, value[3]];
  }

  return [...color];
};

const remapAnimatedColorStops = (value: unknown, color: NormalizedColor): void => {
  if (!Array.isArray(value)) {
    return;
  }

  value.forEach(entry => {
    if (!entry || typeof entry !== 'object') {
      return;
    }

    const frame = entry as Record<string, unknown>;

    if (isNormalizedColor(frame.s)) {
      frame.s = remapColorArray(frame.s, color);
    }

    if (isNormalizedColor(frame.e)) {
      frame.e = remapColorArray(frame.e, color);
    }
  });
};

const remapAnimationColorProperties = (value: unknown, color: NormalizedColor): void => {
  if (!value || typeof value !== 'object') {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach(entry => remapAnimationColorProperties(entry, color));
    return;
  }

  const record = value as Record<string, unknown>;

  if (record.c && typeof record.c === 'object') {
    const colorProp = record.c as Record<string, unknown>;
    if (colorProp.a === 0 && isNormalizedColor(colorProp.k)) {
      colorProp.k = remapColorArray(colorProp.k, color);
    } else if (colorProp.a === 1) {
      remapAnimatedColorStops(colorProp.k, color);
    }
  }

  if (record.sc && isNormalizedColor(record.sc)) {
    record.sc = remapColorArray(record.sc, color);
  }

  Object.values(record).forEach(entry => remapAnimationColorProperties(entry, color));
};

const resolveCssColor = (container: HTMLElement, colorOverride: string): NormalizedColor | null => {
  const probe = document.createElement('span');
  probe.style.color = colorOverride;
  container.appendChild(probe);

  const computedColor = window.getComputedStyle(probe).color;
  probe.remove();

  const match = computedColor.match(
    /^rgba?\(\s*([0-9]+(?:\.[0-9]+)?)\s*,\s*([0-9]+(?:\.[0-9]+)?)\s*,\s*([0-9]+(?:\.[0-9]+)?)/i
  );

  if (!match) {
    return null;
  }

  return [
    Number.parseFloat(match[1]) / 255,
    Number.parseFloat(match[2]) / 255,
    Number.parseFloat(match[3]) / 255,
  ];
};

export const LottieLightIcon = ({
  animationData,
  className,
  colorOverride,
  fallback,
  replayKey,
  settleTo = 'start',
  speed = 1,
}: LottieLightIconProps): JSX.Element => {
  const containerRef = useRef<HTMLSpanElement>(null);
  const playerRef = useRef<LottieLightPlayer | null>(null);
  const settleRef = useRef(settleTo);
  const completeListenerRef = useRef<(() => void) | null>(null);
  const lastReplayKeyRef = useRef<number | string | null>(null);
  const [hasFailed, setHasFailed] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    settleRef.current = settleTo;
  }, [settleTo]);

  useEffect(() => {
    let isDisposed = false;
    setHasFailed(false);
    setIsReady(false);
    lastReplayKeyRef.current = null;

    const mountAnimation = async (): Promise<void> => {
      const container = containerRef.current;
      if (!container) {
        return;
      }

      try {
        const { default: lottie } = await loadLottieLight();
        if (isDisposed || !containerRef.current) {
          return;
        }

        const normalizedColor =
          colorOverride && container instanceof HTMLElement
            ? resolveCssColor(container, colorOverride)
            : null;
        const resolvedAnimationData = normalizedColor
          ? cloneAnimationData(animationData)
          : animationData;

        if (normalizedColor) {
          remapAnimationColorProperties(resolvedAnimationData, normalizedColor);
        }

        const player = lottie.loadAnimation({
          container,
          renderer: 'svg',
          loop: false,
          autoplay: false,
          animationData: resolvedAnimationData,
          rendererSettings: {
            preserveAspectRatio: 'xMidYMid meet',
            progressiveLoad: true,
            hideOnTransparent: true,
            runExpressions: false,
          },
        });

        playerRef.current = player;
        player.setSpeed(speed);

        const handleComplete = (): void => {
          if (isDisposed) {
            return;
          }

          settlePlayerAtBoundary(player, settleRef.current);
        };

        completeListenerRef.current = handleComplete;
        player.addEventListener('complete', handleComplete);
        settlePlayerAtBoundary(player, settleRef.current);
        setIsReady(true);
      } catch (error) {
        if (!isDisposed) {
          console.error('Failed to load lottie_light animation:', error);
          setHasFailed(true);
        }
      }
    };

    void mountAnimation();

    return () => {
      isDisposed = true;
      setIsReady(false);
      const player = playerRef.current;
      const completeListener = completeListenerRef.current;

      completeListenerRef.current = null;
      safelyRemoveCompleteListener(player, completeListener);

      if (player) {
        player.destroy();
        playerRef.current = null;
      }
    };
  }, [animationData, colorOverride, speed]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player || !isReady) {
      return;
    }

    const isFirstReplay = lastReplayKeyRef.current === null;
    lastReplayKeyRef.current = replayKey;

    if (isFirstReplay) {
      settlePlayerAtBoundary(player, settleTo);
      return;
    }

    player.goToAndPlay(0, true);
  }, [isReady, replayKey, settleTo]);

  if (hasFailed) {
    return <>{fallback}</>;
  }

  return (
    <span className={className} aria-hidden="true">
      <span ref={containerRef} className={className} />
    </span>
  );
};
