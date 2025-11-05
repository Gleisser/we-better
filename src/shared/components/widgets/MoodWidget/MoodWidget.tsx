import { type CSSProperties, useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import styles from './MoodWidget.module.css';
import { useCommonTranslation } from '@/shared/hooks/useTranslation';

type MoodId = 'elated' | 'bright' | 'balanced' | 'low' | 'drained';
type ViewMode = 'week' | 'month';

interface MoodDefinition {
  id: MoodId;
  emojiVariant: 'haha' | 'yay' | 'wow' | 'sad' | 'angry';
  accent: string;
}

interface MoodHistoryPoint {
  date: Date;
  moodIndex: number;
}

const GAUGE_RADIUS = 150;
const GAUGE_STROKE = 16;
const GAUGE_CENTER = GAUGE_RADIUS + GAUGE_STROKE;
const GAUGE_WIDTH = GAUGE_CENTER * 2;
const GAUGE_HEIGHT = GAUGE_RADIUS + GAUGE_STROKE + 24;
const TICK_COUNT = 25;
const POINTER_OFFSET = 26;

const MOODS: MoodDefinition[] = [
  {
    id: 'elated',
    emojiVariant: 'haha',
    accent: '#22d3ee',
  },
  {
    id: 'bright',
    emojiVariant: 'yay',
    accent: '#34d399',
  },
  {
    id: 'balanced',
    emojiVariant: 'wow',
    accent: '#fbbf24',
  },
  {
    id: 'low',
    emojiVariant: 'sad',
    accent: '#fb7185',
  },
  {
    id: 'drained',
    emojiVariant: 'angry',
    accent: '#ef4444',
  },
];

const PREVIOUS_WEEKS: number[][] = [
  [3, 3, 2, 3, 2, 2, 1],
  [2, 2, 2, 1, 2, 2, 2],
  [1, 2, 1, 1, 2, 3, 2],
];

const renderEmoji = (variant: MoodDefinition['emojiVariant']): JSX.Element => {
  switch (variant) {
    case 'haha':
      return (
        <span className={`${styles.emoji} ${styles.emojiHaha}`} aria-hidden="true">
          <span className={styles.emojiFace}>
            <span className={styles.emojiEyes} />
            <span className={styles.emojiMouth}>
              <span className={styles.emojiTongue} />
            </span>
          </span>
        </span>
      );
    case 'yay':
      return (
        <span className={`${styles.emoji} ${styles.emojiYay}`} aria-hidden="true">
          <span className={styles.emojiFace}>
            <span className={styles.emojiEyebrows} />
            <span className={styles.emojiMouth} />
          </span>
        </span>
      );
    case 'wow':
      return (
        <span className={`${styles.emoji} ${styles.emojiWow}`} aria-hidden="true">
          <span className={styles.emojiFace}>
            <span className={styles.emojiEyebrows} />
            <span className={styles.emojiEyes} />
            <span className={styles.emojiMouth} />
          </span>
        </span>
      );
    case 'sad':
      return (
        <span className={`${styles.emoji} ${styles.emojiSad}`} aria-hidden="true">
          <span className={styles.emojiFace}>
            <span className={styles.emojiEyebrows} />
            <span className={styles.emojiEyes} />
            <span className={styles.emojiMouth} />
          </span>
        </span>
      );
    case 'angry':
    default:
      return (
        <span className={`${styles.emoji} ${styles.emojiAngry}`} aria-hidden="true">
          <span className={styles.emojiFace}>
            <span className={styles.emojiEyebrows} />
            <span className={styles.emojiEyes} />
            <span className={styles.emojiMouth} />
          </span>
        </span>
      );
  }
};

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const polarToCartesian = (
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
): { x: number; y: number } => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
};

const describeArc = (
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string => {
  const normalizedStart = ((startAngle % 360) + 360) % 360;
  const normalizedEnd = ((endAngle % 360) + 360) % 360;
  const start = polarToCartesian(cx, cy, radius, normalizedStart);
  const end = polarToCartesian(cx, cy, radius, normalizedEnd);

  const delta = (normalizedEnd - normalizedStart + 360) % 360;
  const largeArcFlag = delta > 180 ? 1 : 0;
  const sweepFlag = delta >= 0 ? 1 : 0;

  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${end.x} ${end.y}`;
};

const computeAverage = (values: number[]): number => {
  if (values.length === 0) return 0;
  return values.reduce((total, current) => total + current, 0) / values.length;
};

const createInitialHistory = (): MoodHistoryPoint[] => {
  const today = new Date();
  const indices = [2, 2, 3, 1, 2, 1, 2];
  return indices.map((value, idx) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (indices.length - 1 - idx));
    return {
      date,
      moodIndex: clamp(value, 0, MOODS.length - 1),
    };
  });
};

const MoodWidget = (): JSX.Element => {
  const { t, currentLanguage } = useCommonTranslation();
  const translate = useCallback(
    (key: string, options?: Record<string, unknown>): string => {
      const value = t(key, options);
      return Array.isArray(value) ? (value[0] ?? '') : value;
    },
    [t]
  );
  const [selectedMoodIndex, setSelectedMoodIndex] = useState<number>(2);
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [history, setHistory] = useState<MoodHistoryPoint[]>(() => createInitialHistory());

  const selectedMood = MOODS[selectedMoodIndex];
  const progress = (MOODS.length - selectedMoodIndex - 1) / (MOODS.length - 1);
  const trackPath = useMemo(
    () => describeArc(GAUGE_CENTER, GAUGE_CENTER, GAUGE_RADIUS, 270, 90),
    []
  );

  useEffect(() => {
    setHistory(prev => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      updated[updated.length - 1] = {
        ...updated[updated.length - 1],
        moodIndex: selectedMoodIndex,
      };
      return updated;
    });
  }, [selectedMoodIndex]);

  const pointerAngle = 270 + progress * 180;
  const pointerEnd = useMemo(
    () => polarToCartesian(GAUGE_CENTER, GAUGE_CENTER, GAUGE_RADIUS - POINTER_OFFSET, pointerAngle),
    [pointerAngle]
  );

  const pointerKnob = useMemo(() => {
    return polarToCartesian(
      GAUGE_CENTER,
      GAUGE_CENTER,
      GAUGE_RADIUS - POINTER_OFFSET - 8,
      pointerAngle
    );
  }, [pointerAngle]);
  const showPointerKnob = progress > 0;

  const locale = currentLanguage === 'pt' ? 'pt-BR' : 'en-US';
  const dayFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { weekday: 'short' }),
    [locale]
  );

  const weeklyTrend = useMemo(
    () =>
      history.map(point => ({
        key: point.date.toISOString(),
        label: dayFormatter.format(point.date),
        moodIndex: point.moodIndex,
      })),
    [history, dayFormatter]
  );

  const monthlyTrend = useMemo(() => {
    const allWeeks = [...PREVIOUS_WEEKS, history.map(point => point.moodIndex)];

    return allWeeks.map((values, index) => ({
      key: `week-${index}`,
      label: translate('widgets.mood.weeks.short', { index: index + 1 }),
      average: computeAverage(values),
    }));
  }, [history, translate]);

  const ticks = useMemo(() => {
    return Array.from({ length: TICK_COUNT }, (_, index) => {
      const angle = 270 + (index / (TICK_COUNT - 1)) * 180;
      const outer = polarToCartesian(GAUGE_CENTER, GAUGE_CENTER, GAUGE_RADIUS - 4, angle);
      const inner = polarToCartesian(
        GAUGE_CENTER,
        GAUGE_CENTER,
        GAUGE_RADIUS - (index % 4 === 0 ? 32 : 22),
        angle
      );

      return {
        id: index,
        x1: outer.x,
        y1: outer.y,
        x2: inner.x,
        y2: inner.y,
        major: index % 4 === 0,
      };
    });
  }, []);

  const handleSelectMood = useCallback((index: number) => {
    setSelectedMoodIndex(clamp(index, 0, MOODS.length - 1));
  }, []);

  const handleToggleView = useCallback((mode: ViewMode) => {
    setViewMode(mode);
  }, []);

  const accentStyle = useMemo(
    () => ({ '--accent-color': selectedMood.accent }) as CSSProperties,
    [selectedMood.accent]
  );

  return (
    <section className={styles.container} style={accentStyle} aria-live="polite">
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>{translate('widgets.mood.title')}</h2>
          <p className={styles.subtitle}>{translate('widgets.mood.subtitle')}</p>
        </div>
        <div className={styles.viewSwitch}>
          <button
            type="button"
            className={`${styles.viewButton} ${viewMode === 'week' ? styles.viewButtonActive : ''}`}
            onClick={() => handleToggleView('week')}
          >
            {translate('widgets.mood.view.week')}
          </button>
          <button
            type="button"
            className={`${styles.viewButton} ${
              viewMode === 'month' ? styles.viewButtonActive : ''
            }`}
            onClick={() => handleToggleView('month')}
          >
            {translate('widgets.mood.view.month')}
          </button>
        </div>
      </header>

      <div className={styles.emojiRow}>
        {MOODS.map((mood, index) => {
          const isActive = index === selectedMoodIndex;
          const buttonClassNames = [styles.emojiButton];
          if (isActive) buttonClassNames.push(styles.emojiButtonActive);

          return (
            <button
              key={mood.id}
              type="button"
              className={buttonClassNames.join(' ')}
              onClick={() => handleSelectMood(index)}
              aria-pressed={isActive}
              aria-label={translate(`widgets.mood.moods.${mood.id}.label`)}
            >
              {renderEmoji(mood.emojiVariant)}
            </button>
          );
        })}
      </div>

      <div className={styles.moodSummary}>
        <AnimatePresence mode="popLayout">
          <motion.span
            key={selectedMood.id}
            className={styles.moodName}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {translate(`widgets.mood.moods.${selectedMood.id}.label`)}
          </motion.span>
        </AnimatePresence>
        <AnimatePresence mode="wait">
          <motion.p
            key={`${selectedMood.id}-description`}
            className={styles.moodDescription}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
          >
            {translate(`widgets.mood.moods.${selectedMood.id}.description`)}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className={styles.gaugeSection}>
        <div className={styles.gaugeShell}>
          <svg
            className={styles.gauge}
            viewBox={`0 0 ${GAUGE_WIDTH} ${GAUGE_HEIGHT}`}
            role="presentation"
          >
            <defs>
              <linearGradient id="moodGaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
              </linearGradient>
            </defs>

            {ticks.map(tick => (
              <line
                key={tick.id}
                x1={tick.x1}
                y1={tick.y1}
                x2={tick.x2}
                y2={tick.y2}
                className={tick.major ? styles.tickMajor : styles.tickMinor}
              />
            ))}

            <path
              d={trackPath}
              pathLength={1}
              stroke="rgba(148, 163, 184, 0.25)"
              strokeWidth={GAUGE_STROKE}
              strokeLinecap="round"
              fill="none"
            />
            {progress > 0 ? (
              <motion.path
                key="gauge-progress"
                d={trackPath}
                pathLength={1}
                stroke="var(--accent-color)"
                strokeWidth={GAUGE_STROKE}
                strokeLinecap="round"
                fill="none"
                strokeDasharray={1}
                animate={{ strokeDashoffset: 1 - progress }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            ) : null}

            <motion.line
              x1={GAUGE_CENTER}
              y1={GAUGE_CENTER}
              x2={pointerEnd.x}
              y2={pointerEnd.y}
              className={styles.pointer}
              transition={{ duration: 0.45, ease: 'easeOut' }}
            />
            <motion.circle
              cx={pointerKnob.x}
              cy={pointerKnob.y}
              r={10}
              className={styles.pointerKnob}
              transition={{ duration: 0.45, ease: 'easeOut' }}
            />
            {showPointerKnob ? (
              <motion.circle
                key="pointer-knob"
                cx={pointerKnob.x}
                cy={pointerKnob.y}
                r={10}
                className={styles.pointerKnob}
                transition={{ duration: 0.45, ease: 'easeOut' }}
              />
            ) : null}
          </svg>
        </div>
      </div>

      <footer className={styles.trendSection}>
        <div className={styles.trendHeader}>
          <span className={styles.trendTitle}>
            {viewMode === 'week'
              ? translate('widgets.mood.trend.weekly')
              : translate('widgets.mood.trend.monthly')}
          </span>
          <span className={styles.trendMeta}>
            {translate('widgets.mood.trend.average', {
              value:
                viewMode === 'week'
                  ? computeAverage(weeklyTrend.map(item => item.moodIndex)).toFixed(1)
                  : computeAverage(monthlyTrend.map(item => item.average)).toFixed(1),
            })}
          </span>
        </div>

        <div className={styles.trendChart} data-view={viewMode}>
          {viewMode === 'week'
            ? weeklyTrend.map(point => (
                <div key={point.key} className={styles.barGroup}>
                  <div className={styles.barTrack}>
                    <motion.div
                      className={styles.barFill}
                      animate={{ height: `${((point.moodIndex + 1) / MOODS.length) * 100}%` }}
                      transition={{ duration: 0.4, delay: 0.05 }}
                    />
                  </div>
                  <span className={styles.barLabel}>{point.label}</span>
                </div>
              ))
            : monthlyTrend.map(point => (
                <div key={point.key} className={styles.barGroup}>
                  <div className={styles.barTrack}>
                    <motion.div
                      className={styles.barFill}
                      animate={{ height: `${(point.average / (MOODS.length - 1)) * 100}%` }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                  <span className={styles.barLabel}>{point.label}</span>
                </div>
              ))}
        </div>
      </footer>
    </section>
  );
};

export default MoodWidget;
