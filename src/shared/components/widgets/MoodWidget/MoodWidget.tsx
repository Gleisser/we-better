import { type CSSProperties, useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import styles from './MoodWidget.module.css';
import { useCommonTranslation } from '@/shared/hooks/useTranslation';
import { useMood } from '@/shared/hooks/useMood';
import type { MoodId, MoodPulseDirection } from '@/core/services/moodService';
import { getLocalDateString } from '@/utils/helpers/dateUtils';

type ViewMode = 'week' | 'month';

interface MoodDefinition {
  id: MoodId;
  emojiVariant: 'haha' | 'yay' | 'wow' | 'sad' | 'angry';
  accent: string;
}

interface MoodHistoryPoint {
  date: Date;
  dateKey: string;
  moodIndex: number;
}

interface MonthlyTrendDay {
  key: string;
  date: Date;
  moodIndex: number | null;
}

interface MonthlyTrendWeek {
  key: string;
  label: string;
  moods: MonthlyTrendDay[];
}

const FALLBACK_MOOD_ID: MoodId = 'balanced';
const HISTORY_DAYS = 28;
const WEEK_DAYS = 7;
const MONTH_WEEKS = 4;
const MONTH_DAYS = MONTH_WEEKS * WEEK_DAYS;

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

const MOOD_INDEX_BY_ID: Record<MoodId, number> = MOODS.reduce(
  (acc, mood, index) => ({
    ...acc,
    [mood.id]: index,
  }),
  {} as Record<MoodId, number>
);

const STATIC_EMOJI_MAP: Record<MoodId, string> = {
  elated: '😍',
  bright: '😊',
  balanced: '😮',
  low: '😢',
  drained: '😡',
};

const getMoodIndexFromId = (moodId: MoodId): number => MOOD_INDEX_BY_ID[moodId] ?? 2;

const getStaticEmoji = (moodIndex: number): string => {
  const mood = MOODS[moodIndex];
  if (!mood) return '🙂';
  return STATIC_EMOJI_MAP[mood.id] ?? '🙂';
};

const getRecentDates = (days: number): Date[] => {
  const today = new Date();
  return Array.from({ length: days }, (_, idx) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (days - 1 - idx));
    return date;
  });
};

const getDirectionSymbol = (direction: MoodPulseDirection): string => {
  if (direction === 'up') return '↑';
  if (direction === 'down') return '↓';
  if (direction === 'stable') return '→';
  return '•';
};

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

const MoodWidget = (): JSX.Element => {
  const { t, currentLanguage } = useCommonTranslation();
  const {
    saveMoodEntry,
    getMoodForDate,
    todayMood,
    weeklyPulse,
    monthlyPulse,
    isLoading,
    isWeeklyPulseLoading,
    isMonthlyPulseLoading,
    error,
  } = useMood();

  const translate = useCallback(
    (key: string, options?: Record<string, unknown>): string => {
      const value = t(key, options);
      return Array.isArray(value) ? (value[0] ?? '') : value;
    },
    [t]
  );

  const [selectedMoodIndex, setSelectedMoodIndex] = useState<number>(
    getMoodIndexFromId(FALLBACK_MOOD_ID)
  );
  const [viewMode, setViewMode] = useState<ViewMode>('week');

  useEffect(() => {
    if (todayMood) {
      setSelectedMoodIndex(getMoodIndexFromId(todayMood.mood_id));
      return;
    }
    setSelectedMoodIndex(getMoodIndexFromId(FALLBACK_MOOD_ID));
  }, [todayMood]);

  useEffect(() => {
    if (error) {
      console.error('Mood widget failed to sync data:', error);
    }
  }, [error]);

  const history = useMemo<MoodHistoryPoint[]>(() => {
    return getRecentDates(HISTORY_DAYS).map(date => {
      const dateKey = getLocalDateString(date);
      const entry = getMoodForDate(dateKey);
      const moodId = entry?.mood_id ?? FALLBACK_MOOD_ID;

      return {
        date,
        dateKey,
        moodIndex: getMoodIndexFromId(moodId),
      };
    });
  }, [getMoodForDate]);

  const selectedMood = MOODS[selectedMoodIndex];
  const progress = (MOODS.length - selectedMoodIndex - 1) / (MOODS.length - 1);

  const trackPath = useMemo(
    () => describeArc(GAUGE_CENTER, GAUGE_CENTER, GAUGE_RADIUS, 270, 90),
    []
  );

  const pointerAngle = 270 + progress * 180;
  const pointerEnd = useMemo(
    () => polarToCartesian(GAUGE_CENTER, GAUGE_CENTER, GAUGE_RADIUS - POINTER_OFFSET, pointerAngle),
    [pointerAngle]
  );

  const pointerKnob = useMemo(
    () =>
      polarToCartesian(GAUGE_CENTER, GAUGE_CENTER, GAUGE_RADIUS - POINTER_OFFSET - 8, pointerAngle),
    [pointerAngle]
  );
  const showPointerKnob = progress > 0;

  const locale = currentLanguage === 'pt' ? 'pt-BR' : 'en-US';
  const dayFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { weekday: 'short' }),
    [locale]
  );
  const weekRangeFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' }),
    [locale]
  );

  const formatWeekRangeLabel = useCallback(
    (startDate: Date, endDate: Date): string =>
      `${weekRangeFormatter.format(startDate)} - ${weekRangeFormatter.format(endDate)}`,
    [weekRangeFormatter]
  );

  const weeklyTrend = useMemo(
    () =>
      history.slice(-WEEK_DAYS).map(point => ({
        key: point.dateKey,
        label: dayFormatter.format(point.date),
        moodIndex: point.moodIndex,
      })),
    [history, dayFormatter]
  );

  const pulseWeeklyTrend = useMemo(() => {
    if (!weeklyPulse) return [];
    return weeklyPulse.current_week.days.map(point => {
      const date = new Date(`${point.date}T00:00:00`);
      return {
        key: point.date,
        label: dayFormatter.format(date),
        moodIndex: getMoodIndexFromId(point.mood_id),
      };
    });
  }, [weeklyPulse, dayFormatter]);

  const usingPulseData = Boolean(weeklyPulse);
  const hasWeeklyPulseDays = Boolean(weeklyPulse && weeklyPulse.coverage.logged_days > 0);
  const displayedWeeklyTrend = usingPulseData ? pulseWeeklyTrend : weeklyTrend;

  const weeklyAverageLabel = useMemo(() => {
    if (!weeklyPulse?.current_week.average_mood_id) return null;
    return translate(`widgets.mood.moods.${weeklyPulse.current_week.average_mood_id}.label`);
  }, [translate, weeklyPulse]);

  const weeklyAverageText = useMemo(() => {
    if (!weeklyAverageLabel) return null;
    return translate('widgets.mood.trend.average', { value: weeklyAverageLabel });
  }, [translate, weeklyAverageLabel]);

  const weeklyPulseDirection = weeklyPulse?.comparison.direction || 'insufficient_data';
  const weeklyPulseDirectionSymbol = getDirectionSymbol(weeklyPulseDirection);

  const monthlyTrend = useMemo<MonthlyTrendWeek[]>(() => {
    const weeks = Array.from({ length: MONTH_WEEKS }, (_, index) =>
      history.slice(index * WEEK_DAYS, (index + 1) * WEEK_DAYS)
    );

    return weeks.map((weekPoints, index) => {
      const moods = weekPoints.map(point => ({
        key: point.dateKey,
        date: point.date,
        moodIndex: point.moodIndex,
      }));

      const weekStartDate = moods[0]?.date;
      const weekEndDate = moods[moods.length - 1]?.date;

      return {
        key: `week-${index}`,
        label:
          weekStartDate && weekEndDate
            ? formatWeekRangeLabel(weekStartDate, weekEndDate)
            : translate('widgets.mood.weeks.short', { index: index + 1 }),
        moods,
      };
    });
  }, [history, formatWeekRangeLabel, translate]);

  const pulseMonthlyTrend = useMemo<MonthlyTrendWeek[]>(() => {
    if (!monthlyPulse) return [];

    const byDate = new Map<string, number>();
    monthlyPulse.current_week.days.forEach(day => {
      byDate.set(day.date, getMoodIndexFromId(day.mood_id));
    });

    const startDate = new Date(`${monthlyPulse.window.start_date}T00:00:00`);
    const monthDays = Array.from({ length: MONTH_DAYS }, (_, index) => {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + index);
      const dateKey = getLocalDateString(currentDate);
      return {
        key: dateKey,
        date: currentDate,
        moodIndex: byDate.get(dateKey) ?? null,
      };
    });

    return Array.from({ length: MONTH_WEEKS }, (_, index) => {
      const moods = monthDays.slice(index * WEEK_DAYS, (index + 1) * WEEK_DAYS);
      const weekStartDate = moods[0]?.date;
      const weekEndDate = moods[moods.length - 1]?.date;

      return {
        key: `pulse-week-${index}`,
        label:
          weekStartDate && weekEndDate
            ? formatWeekRangeLabel(weekStartDate, weekEndDate)
            : translate('widgets.mood.weeks.short', { index: index + 1 }),
        moods,
      };
    });
  }, [monthlyPulse, formatWeekRangeLabel, translate]);

  const usingMonthlyPulseData = Boolean(monthlyPulse);
  const hasMonthlyPulseDays = Boolean(monthlyPulse && monthlyPulse.coverage.logged_days > 0);
  const displayedMonthlyTrend = usingMonthlyPulseData ? pulseMonthlyTrend : monthlyTrend;

  const monthlyAverageLabel = useMemo(() => {
    if (!monthlyPulse?.current_week.average_mood_id) return null;
    return translate(`widgets.mood.moods.${monthlyPulse.current_week.average_mood_id}.label`);
  }, [translate, monthlyPulse]);

  const monthlyAverageText = useMemo(() => {
    if (!monthlyAverageLabel) return null;
    return translate('widgets.mood.trend.average', { value: monthlyAverageLabel });
  }, [translate, monthlyAverageLabel]);

  const monthlyPulseDirection = monthlyPulse?.comparison.direction || 'insufficient_data';
  const monthlyPulseDirectionSymbol = getDirectionSymbol(monthlyPulseDirection);

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

  const handleSelectMood = useCallback(
    (index: number) => {
      const nextMoodIndex = clamp(index, 0, MOODS.length - 1);
      const nextMood = MOODS[nextMoodIndex] || MOODS[getMoodIndexFromId(FALLBACK_MOOD_ID)];

      setSelectedMoodIndex(nextMoodIndex);
      void saveMoodEntry(nextMood.id, getLocalDateString());
    },
    [saveMoodEntry]
  );

  const handleToggleView = useCallback((mode: ViewMode) => {
    setViewMode(mode);
  }, []);

  const accentStyle = useMemo(
    () => ({ '--accent-color': selectedMood.accent }) as CSSProperties,
    [selectedMood.accent]
  );

  return (
    <section
      className={styles.container}
      style={accentStyle}
      aria-live="polite"
      aria-busy={isLoading || isWeeklyPulseLoading || isMonthlyPulseLoading}
    >
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
                initial={{ strokeDashoffset: 1 }}
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
          <div className={styles.trendHeaderMain}>
            <span className={styles.trendTitle}>
              {viewMode === 'week'
                ? translate('widgets.mood.trend.weekly')
                : translate('widgets.mood.trend.monthly')}
            </span>
            {viewMode === 'week' && weeklyAverageText ? (
              <span className={styles.trendSubtext}>{weeklyAverageText}</span>
            ) : null}
            {viewMode === 'month' && usingMonthlyPulseData && monthlyAverageText ? (
              <span className={styles.trendSubtext}>{monthlyAverageText}</span>
            ) : null}
          </div>
          {viewMode === 'week' && weeklyPulse ? (
            <div className={styles.trendMetaGroup}>
              <span className={styles.trendMeta}>
                {translate('widgets.mood.trend.coverage', {
                  count: weeklyPulse.coverage.logged_days,
                  total: WEEK_DAYS,
                })}
              </span>
              <span
                className={`${styles.trendDirection} ${
                  styles[`trendDirection_${weeklyPulseDirection}`]
                }`}
              >
                {weeklyPulseDirectionSymbol}
              </span>
            </div>
          ) : null}
          {viewMode === 'month' && monthlyPulse ? (
            <div className={styles.trendMetaGroup}>
              <span className={styles.trendMeta}>
                {translate('widgets.mood.trend.coverage', {
                  count: monthlyPulse.coverage.logged_days,
                  total: MONTH_DAYS,
                })}
              </span>
              <span
                className={`${styles.trendDirection} ${
                  styles[`trendDirection_${monthlyPulseDirection}`]
                }`}
              >
                {monthlyPulseDirectionSymbol}
              </span>
            </div>
          ) : null}
        </div>

        <div className={styles.trendDisplay} data-view={viewMode}>
          {viewMode === 'week' ? (
            usingPulseData && !hasWeeklyPulseDays ? (
              <div className={styles.weeklyEmptyState}>
                {translate('widgets.mood.trend.weeklyEmpty')}
              </div>
            ) : (
              <div className={styles.trendRow}>
                {displayedWeeklyTrend.map(point => {
                  const emoji = getStaticEmoji(point.moodIndex);
                  return (
                    <div key={point.key} className={styles.trendItem}>
                      <div className={styles.trendEmojiLarge}>{emoji}</div>
                      <span className={styles.trendLabel}>{point.label}</span>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            <div className={styles.monthGrid}>
              {usingMonthlyPulseData && !hasMonthlyPulseDays ? (
                <div className={styles.monthlyEmptyState}>
                  {translate('widgets.mood.trend.monthlyEmpty')}
                </div>
              ) : null}
              {displayedMonthlyTrend.map(week => (
                <div key={week.key} className={styles.monthRow}>
                  <span className={styles.monthLabel}>{week.label}</span>
                  <div className={styles.monthEmojis}>
                    {week.moods.map(day => {
                      if (day.moodIndex === null) {
                        return (
                          <div
                            key={day.key}
                            className={`${styles.trendEmojiSmall} ${styles.trendEmojiSmallEmpty}`}
                            aria-hidden="true"
                          />
                        );
                      }
                      const emoji = getStaticEmoji(day.moodIndex);
                      return (
                        <div key={day.key} className={styles.trendEmojiSmall}>
                          {emoji}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </footer>
    </section>
  );
};

export default MoodWidget;
