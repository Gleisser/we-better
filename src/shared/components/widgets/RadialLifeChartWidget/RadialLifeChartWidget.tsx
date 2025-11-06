import { type CSSProperties, useCallback, useEffect, useMemo, useState } from 'react';
import styles from './RadialLifeChartWidget.module.css';
import { useCommonTranslation } from '@/shared/hooks/useTranslation';
import { useLatestLifeWheel } from '@/features/life-wheel/hooks/useLatestLifeWheel';
import { useNavigate } from 'react-router-dom';

type LifeArea = {
  id: string;
  label: string;
  score: number;
  gradient: [string, string];
  background: string;
};

type ArcPresentation = {
  item: LifeArea;
  radius: number;
  circumference: number;
  targetOffset: number;
  tooltipPoint: { x: number; y: number };
  delay: number;
};

const TAU = Math.PI * 2;
const START_ANGLE = -Math.PI / 2;
const BASE_RADIUS = 280;
const BAND_THICKNESS = 20;
const BAND_GAP = 8;
const CENTER = 320;
const VIEWBOX_SIZE = 640;
const MAX_RINGS = 10;

const FALLBACK_PRESENTATION: { gradient: [string, string]; background: string } = {
  gradient: ['#38bdf8', '#0ea5e9'],
  background: '#0f172a',
};

const CATEGORY_PRESENTATION: Record<string, { gradient: [string, string]; background: string }> = {
  health: { gradient: ['#ff2d95', '#ff005c'], background: '#3f0625' },
  personalGrowth: { gradient: ['#00f5ff', '#0099ff'], background: '#01274c' },
  relationship: { gradient: ['#8dff1f', '#3dff65'], background: '#18370f' },
  relationships: { gradient: ['#8dff1f', '#3dff65'], background: '#18370f' },
  career: { gradient: ['#8b46ff', '#2b0dff'], background: '#1f0b4c' },
  finances: { gradient: ['#ff5f6d', '#ffb347'], background: '#4b140d' },
  spiritual: { gradient: ['#5cffe7', '#00f8b9'], background: '#0f312d' },
  spirituality: { gradient: ['#5cffe7', '#00f8b9'], background: '#0f312d' },
  recreation: { gradient: ['#ff52ff', '#ff9d00'], background: '#3b0a2a' },
  community: { gradient: ['#00ffd1', '#00c3ff'], background: '#083038' },
};

const CATEGORY_KEY_MAP: Record<string, string> = {
  health: 'health',
  career: 'career',
  money: 'money',
  family: 'family',
  relationship: 'relationship',
  relationships: 'relationship',
  social: 'social',
  spirituality: 'spirituality',
  spiritual: 'spiritual',
  selfcare: 'selfCare',
  personal: 'personal',
  education: 'education',
  recreation: 'recreation',
  environment: 'environment',
  community: 'community',
  finances: 'finances',
  personalgrowth: 'personalGrowth',
  growth: 'personalGrowth',
  vitality: 'health',
  wellness: 'health',
};

const clampPercentage = (value: number): number => Math.max(0, Math.min(100, value));
const normalizeScore = (score: number): number => clampPercentage((score / 10) * 100);

const polarToCartesian = (radius: number, angle: number): { x: number; y: number } => ({
  x: CENTER + radius * Math.cos(angle),
  y: CENTER + radius * Math.sin(angle),
});

const gradientId = (id: string): string => `radial-life-gradient-${id}`;

const normalizeCategoryName = (categoryName: string): string =>
  categoryName
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]/g, '');

const normalizeHex = (color: string): string | null => {
  if (!color) return null;
  const hexMatch = color.trim().match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
  if (!hexMatch) return null;
  const value = hexMatch[1];
  if (value.length === 3) {
    return `#${value
      .split('')
      .map(char => char + char)
      .join('')}`;
  }
  return `#${value.toLowerCase()}`;
};

const componentToHex = (component: number): string => {
  const clamped = Math.max(0, Math.min(255, Math.round(component)));
  const hex = clamped.toString(16);
  return hex.length === 1 ? `0${hex}` : hex;
};

const darkenColor = (color: string, amount = 0.25): string | null => {
  const normalized = normalizeHex(color);
  if (!normalized) return null;

  const r = parseInt(normalized.slice(1, 3), 16);
  const g = parseInt(normalized.slice(3, 5), 16);
  const b = parseInt(normalized.slice(5, 7), 16);

  const factor = Math.max(0, Math.min(1, amount));

  const darkened = {
    r: r * (1 - factor),
    g: g * (1 - factor),
    b: b * (1 - factor),
  };

  return `#${componentToHex(darkened.r)}${componentToHex(darkened.g)}${componentToHex(darkened.b)}`;
};

const resolveCategoryKey = (categoryName: string): string => {
  const normalized = normalizeCategoryName(categoryName);
  return CATEGORY_KEY_MAP[normalized] ?? normalized;
};

const parseGradientDefinition = (
  value?: string | { from: string; to: string }
): [string, string] | null => {
  if (!value) {
    return null;
  }

  if (typeof value === 'object' && 'from' in value && 'to' in value) {
    const { from, to } = value;
    if (typeof from === 'string' && typeof to === 'string') {
      return [from, to];
    }
  }

  if (typeof value === 'string') {
    const hexMatches = value.match(/#(?:[0-9a-fA-F]{3,8})/g);
    if (hexMatches && hexMatches.length >= 2) {
      return [hexMatches[0], hexMatches[hexMatches.length - 1]];
    }

    const trimmed = value.trim();
    if (/^#(?:[0-9a-fA-F]{3,8})$/.test(trimmed)) {
      return [trimmed, trimmed];
    }
  }

  return null;
};

const clampScore = (value: unknown): number => {
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric)) {
    return 0;
  }
  return Math.max(0, Math.min(10, numeric));
};

const extractString = (value: string | string[]): string =>
  Array.isArray(value) ? (value[0] ?? '') : value;

const RadialLifeChartWidget = (): JSX.Element => {
  const { t } = useCommonTranslation();
  const navigate = useNavigate();

  const {
    data: latestLifeWheel,
    isLoading,
    isError,
    error: latestLifeWheelError,
  } = useLatestLifeWheel();

  const fetchError =
    isError && latestLifeWheelError
      ? latestLifeWheelError instanceof Error
        ? latestLifeWheelError.message
        : String(latestLifeWheelError)
      : null;

  const rawCategories = useMemo(() => latestLifeWheel?.entry?.categories ?? [], [latestLifeWheel]);

  const translateCategory = useCallback(
    (categoryName: string): { key: string; label: string } => {
      const categoryKey = resolveCategoryKey(categoryName);
      const translationKey = `widgets.lifeWheel.categories.${categoryKey}`;
      const translated = extractString(t(translationKey));
      const label = !translated || translated === translationKey ? categoryName : translated;

      return { key: categoryKey, label };
    },
    [t]
  );

  const translateString = useCallback(
    (key: string, options?: Record<string, unknown>): string => {
      const result = t(key, options);
      const translated = extractString(result);
      return translated || key;
    },
    [t]
  );

  const areas = useMemo<LifeArea[]>(() => {
    if (!rawCategories.length) {
      return [];
    }

    return rawCategories.slice(0, MAX_RINGS).map(category => {
      const { key, label } = translateCategory(category.name);
      const presentation = CATEGORY_PRESENTATION[key] ?? FALLBACK_PRESENTATION;
      const dynamicGradient =
        CATEGORY_PRESENTATION[key] === undefined
          ? (parseGradientDefinition(category.gradient) ?? parseGradientDefinition(category.color))
          : null;
      const gradient = dynamicGradient ?? presentation.gradient;
      const baseBackground =
        CATEGORY_PRESENTATION[key] === undefined && dynamicGradient
          ? dynamicGradient[0]
          : presentation.background;
      const background = darkenColor(baseBackground, 0.35) ?? presentation.background;

      return {
        id: category.id,
        label,
        score: clampScore(category.value),
        gradient,
        background,
      };
    });
  }, [rawCategories, translateCategory]);

  useEffect(() => {
    setHoveredArc(null);
  }, [areas]);

  const arcs = useMemo<ArcPresentation[]>(() => {
    return areas.map((item, index) => {
      const radius = BASE_RADIUS - index * (BAND_THICKNESS + BAND_GAP);
      const progress = normalizeScore(item.score);
      const circumference = TAU * radius;
      const targetOffset = circumference * (1 - progress / 100);
      const tooltipAngle = START_ANGLE + (progress / 100) * TAU * 0.5;
      const tooltipPoint = polarToCartesian(radius - BAND_THICKNESS / 2, tooltipAngle);

      return {
        item,
        radius,
        circumference,
        targetOffset,
        tooltipPoint,
        delay: index * 0.18,
      };
    });
  }, [areas]);

  const [hoveredArc, setHoveredArc] = useState<ArcPresentation | null>(null);

  const tooltipContent =
    hoveredArc === null
      ? null
      : translateString('widgets.radialLifeChart.tooltipValue', {
          category: hoveredArc.item.label,
          value: hoveredArc.item.score.toFixed(1),
        });

  const hasFetchError = Boolean(fetchError);
  const hasData = areas.length > 0;
  const handleNavigate = useCallback(() => {
    navigate('/app/life-wheel');
  }, [navigate]);

  return (
    <section
      className={styles.container}
      aria-label={translateString('widgets.radialLifeChart.accessibleLabel')}
    >
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>{translateString('widgets.radialLifeChart.title')}</h2>
          <p className={styles.subtitle}>{translateString('widgets.radialLifeChart.subtitle')}</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.headerButton} onClick={handleNavigate}>
            {translateString('widgets.lifeWheel.goToDetails')}
          </button>
        </div>
      </header>

      {isLoading ? (
        <div className={styles.stateWrapper}>
          <p className={styles.stateText}>{translateString('widgets.lifeWheel.loading')}</p>
        </div>
      ) : hasFetchError ? (
        <div className={styles.stateWrapper}>
          <p className={styles.stateText}>
            {translateString('widgets.lifeWheel.errors.failedToLoad')}
          </p>
        </div>
      ) : !hasData ? (
        <div className={styles.stateWrapper}>
          <p className={styles.stateText}>
            {translateString('widgets.lifeWheel.history.noHistoryYet')}
          </p>
        </div>
      ) : (
        <>
          <div className={styles.chartWrapper}>
            <svg
              className={styles.chart}
              viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
              role="img"
              aria-labelledby="radial-chart-title"
            >
              <title id="radial-chart-title">
                {translateString('widgets.radialLifeChart.chartTitle')}
              </title>
              <defs>
                <filter id="arc-depth" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow
                    dx="0"
                    dy="18"
                    stdDeviation="12"
                    floodColor="#000000"
                    floodOpacity="0.55"
                  />
                  <feDropShadow
                    dx="0"
                    dy="6"
                    stdDeviation="4"
                    floodColor="#020617"
                    floodOpacity="0.35"
                  />
                </filter>
                {arcs.map(arc => (
                  <linearGradient
                    key={arc.item.id}
                    id={gradientId(arc.item.id)}
                    gradientUnits="userSpaceOnUse"
                    x1={CENTER - arc.radius}
                    y1={CENTER + arc.radius}
                    x2={CENTER + arc.radius}
                    y2={CENTER - arc.radius}
                  >
                    <stop offset="0%" stopColor={arc.item.gradient[0]} />
                    <stop offset="100%" stopColor={arc.item.gradient[1]} />
                  </linearGradient>
                ))}
              </defs>

              {arcs.map(arc => (
                <g key={arc.item.id} className={styles.arcGroup}>
                  <circle
                    className={styles.ringBackground}
                    cx={CENTER}
                    cy={CENTER}
                    r={arc.radius}
                    stroke={arc.item.background}
                    strokeWidth={BAND_THICKNESS}
                    fill="none"
                    transform={`rotate(-90 ${CENTER} ${CENTER})`}
                  />

                  <circle
                    className={styles.progressArc}
                    cx={CENTER}
                    cy={CENTER}
                    r={arc.radius}
                    stroke={`url(#${gradientId(arc.item.id)})`}
                    strokeWidth={BAND_THICKNESS}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    strokeDasharray={arc.circumference}
                    strokeDashoffset={arc.targetOffset}
                    filter="url(#arc-depth)"
                    style={
                      {
                        '--circumference': `${arc.circumference}`,
                        '--target-offset': `${arc.targetOffset}`,
                        '--animation-delay': `${arc.delay}s`,
                      } as CSSProperties
                    }
                    transform={`rotate(-90 ${CENTER} ${CENTER})`}
                    onMouseEnter={() => setHoveredArc(arc)}
                    onFocus={() => setHoveredArc(arc)}
                    onMouseLeave={() =>
                      setHoveredArc(previous =>
                        previous?.item.id === arc.item.id ? null : previous
                      )
                    }
                    onBlur={() =>
                      setHoveredArc(previous =>
                        previous?.item.id === arc.item.id ? null : previous
                      )
                    }
                    tabIndex={0}
                    aria-label={translateString('widgets.radialLifeChart.tooltipValue', {
                      category: arc.item.label,
                      value: arc.item.score.toFixed(1),
                    })}
                  />
                </g>
              ))}
            </svg>

            <div className={styles.avatarSlot}>
              <div className={styles.avatarShell}>
                <img
                  className={styles.avatarImage}
                  src="https://images.unsplash.com/photo-1679611978819-f10168367155?auto=format&fit=crop&w=240&q=80"
                  alt="Profile avatar"
                />
              </div>
            </div>

            {hoveredArc && tooltipContent ? (
              <div
                className={styles.tooltip}
                style={{
                  left: `${(hoveredArc.tooltipPoint.x / VIEWBOX_SIZE) * 100}%`,
                  top: `${(hoveredArc.tooltipPoint.y / VIEWBOX_SIZE) * 100}%`,
                }}
                role="status"
              >
                {tooltipContent}
              </div>
            ) : null}
          </div>

          <ul className={styles.legend} role="list">
            {areas.map(area => (
              <li key={area.id} className={styles.legendItem}>
                <span
                  className={styles.legendSwatch}
                  style={{
                    background: `linear-gradient(135deg, ${area.gradient[0]}, ${area.gradient[1]})`,
                  }}
                />
                <div className={styles.legendContent}>
                  <span className={styles.legendLabel}>{area.label}</span>
                  <span className={styles.legendValue}>{area.score.toFixed(1)}/10</span>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
};

export default RadialLifeChartWidget;
