import { type CSSProperties, useMemo, useState } from 'react';
import styles from './RadialLifeChartWidget.module.css';
import { useCommonTranslation } from '@/shared/hooks/useTranslation';

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
const BASE_RADIUS = 220;
const BAND_THICKNESS = 20;
const BAND_GAP = 8;
const CENTER = 240;
const VIEWBOX_SIZE = 480;

const clampPercentage = (value: number): number => Math.max(0, Math.min(100, value));
const normalizeScore = (score: number): number => clampPercentage((score / 10) * 100);

const polarToCartesian = (radius: number, angle: number): { x: number; y: number } => ({
  x: CENTER + radius * Math.cos(angle),
  y: CENTER + radius * Math.sin(angle),
});

const gradientId = (id: string): string => `radial-life-gradient-${id}`;

const RadialLifeChartWidget = (): JSX.Element => {
  const { t } = useCommonTranslation();

  const areas = useMemo<LifeArea[]>(
    () => [
      {
        id: 'vitality',
        label: t('widgets.lifeWheel.categories.health') as string,
        score: 8.2,
        gradient: ['#ff2d95', '#ff005c'],
        background: '#3f0625',
      },
      {
        id: 'growth',
        label: t('widgets.lifeWheel.categories.personalGrowth') as string,
        score: 7.4,
        gradient: ['#00f5ff', '#0099ff'],
        background: '#01274c',
      },
      {
        id: 'relationships',
        label: t('widgets.lifeWheel.categories.relationships') as string,
        score: 6.9,
        gradient: ['#8dff1f', '#3dff65'],
        background: '#18370f',
      },
      {
        id: 'career',
        label: t('widgets.lifeWheel.categories.career') as string,
        score: 5.8,
        gradient: ['#8b46ff', '#2b0dff'],
        background: '#1f0b4c',
      },
      {
        id: 'finances',
        label: t('widgets.lifeWheel.categories.finances') as string,
        score: 6.3,
        gradient: ['#ff5f6d', '#ffb347'],
        background: '#4b140d',
      },
      {
        id: 'spiritual',
        label: t('widgets.lifeWheel.categories.spiritual') as string,
        score: 5.2,
        gradient: ['#5cffe7', '#00f8b9'],
        background: '#0f312d',
      },
      {
        id: 'recreation',
        label: t('widgets.lifeWheel.categories.recreation') as string,
        score: 4.8,
        gradient: ['#ff52ff', '#ff9d00'],
        background: '#3b0a2a',
      },
      {
        id: 'community',
        label: t('widgets.lifeWheel.categories.community') as string,
        score: 4.4,
        gradient: ['#00ffd1', '#00c3ff'],
        background: '#083038',
      },
    ],
    [t]
  );

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
      : (t('widgets.radialLifeChart.tooltipValue', {
          category: hoveredArc.item.label,
          value: hoveredArc.item.score.toFixed(1),
        }) as string);

  return (
    <section
      className={styles.container}
      aria-label={t('widgets.radialLifeChart.accessibleLabel') as string}
    >
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>{t('widgets.radialLifeChart.title') as string}</h2>
          <p className={styles.subtitle}>{t('widgets.radialLifeChart.subtitle') as string}</p>
        </div>
      </header>

      <div className={styles.chartWrapper}>
        <svg
          className={styles.chart}
          viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
          role="img"
          aria-labelledby="radial-chart-title"
        >
          <title id="radial-chart-title">{t('widgets.radialLifeChart.chartTitle') as string}</title>
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
                  setHoveredArc(previous => (previous?.item.id === arc.item.id ? null : previous))
                }
                onBlur={() =>
                  setHoveredArc(previous => (previous?.item.id === arc.item.id ? null : previous))
                }
                tabIndex={0}
                aria-label={
                  t('widgets.radialLifeChart.tooltipValue', {
                    category: arc.item.label,
                    value: arc.item.score.toFixed(1),
                  }) as string
                }
              />
            </g>
          ))}
        </svg>

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
    </section>
  );
};

export default RadialLifeChartWidget;
