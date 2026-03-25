import { lazy, Suspense, useEffect, useRef, useState, type ReactNode, type Ref } from 'react';
import styles from './DashboardGrid.module.css';
import { useDeferredSectionQuery } from '@/shared/hooks/utils/useDeferredSectionQuery';
import { useIdleActivation } from '@/shared/hooks/utils/useIdleActivation';

const loadQuoteWidget = (): Promise<
  typeof import('@/shared/components/widgets/QuoteWidget/QuoteWidget')
> => import('@/shared/components/widgets/QuoteWidget/QuoteWidget');
const loadCardsWidget = (): Promise<
  typeof import('@/shared/components/widgets/CardsWidget/CardsWidget')
> => import('@/shared/components/widgets/CardsWidget/CardsWidget');
const loadRadialLifeChartWidget = (): Promise<
  typeof import('@/shared/components/widgets/RadialLifeChartWidget/RadialLifeChartWidget')
> => import('@/shared/components/widgets/RadialLifeChartWidget/RadialLifeChartWidget');
const loadMoodWidget = (): Promise<
  typeof import('@/shared/components/widgets/MoodWidget/MoodWidget')
> => import('@/shared/components/widgets/MoodWidget/MoodWidget');
const loadDreamBoardTimelineWidget = (): Promise<
  typeof import('@/shared/components/widgets/DreamBoardTimelineWidget')
> => import('@/shared/components/widgets/DreamBoardTimelineWidget');
const loadHabitsWidget = (): Promise<
  typeof import('@/shared/components/widgets/HabitsWidget/HabitsWidget')
> => import('@/shared/components/widgets/HabitsWidget/HabitsWidget');
const loadGoalsWidget = (): Promise<
  typeof import('@/shared/components/widgets/GoalsWidget/GoalsWidget')
> => import('@/shared/components/widgets/GoalsWidget/GoalsWidget');

const QuoteWidget = lazy(loadQuoteWidget);
const CardsWidget = lazy(loadCardsWidget);
const RadialLifeChartWidget = lazy(loadRadialLifeChartWidget);
const MoodWidget = lazy(loadMoodWidget);
const DreamBoardTimelineWidget = lazy(loadDreamBoardTimelineWidget);
const HabitsWidget = lazy(loadHabitsWidget);
const GoalsWidget = lazy(loadGoalsWidget);

type DashboardWidgetKey = 'quote' | 'cards' | 'radial' | 'mood' | 'dreamBoard' | 'habits' | 'goals';

interface WidgetSlotProps {
  widgetKey: DashboardWidgetKey;
  widgetClassName: string;
  shouldRender: boolean;
  fallbackLabel: string;
  children: ReactNode;
  slotRef?: Ref<HTMLDivElement>;
}

const widgetFallbackClassByKey: Record<DashboardWidgetKey, string> = {
  quote: styles.quoteFallback,
  cards: styles.cardsFallback,
  radial: styles.radialFallback,
  mood: styles.moodFallback,
  dreamBoard: styles.dreamBoardFallback,
  habits: styles.habitsFallback,
  goals: styles.goalsFallback,
};

const DeferredWidgetFallback = ({
  widgetKey,
  fallbackLabel,
  isPendingScroll,
}: {
  widgetKey: DashboardWidgetKey;
  fallbackLabel: string;
  isPendingScroll: boolean;
}): JSX.Element => (
  <div
    className={`${styles.widgetFallback} ${widgetFallbackClassByKey[widgetKey]}`}
    data-testid={`${widgetKey}-fallback`}
    aria-label={fallbackLabel}
  >
    <div className={styles.widgetFallbackGlow} />
    <div className={styles.widgetFallbackContent}>
      <span className={styles.widgetFallbackEyebrow}>
        {isPendingScroll ? 'Queued for scroll' : 'Loading widget'}
      </span>
      <div className={styles.widgetFallbackTitle} />
      <div className={styles.widgetFallbackBody}>
        <span />
        <span />
        <span />
      </div>
    </div>
  </div>
);

const WidgetSlot = ({
  widgetKey,
  widgetClassName,
  shouldRender,
  fallbackLabel,
  children,
  slotRef,
}: WidgetSlotProps): JSX.Element => (
  <div
    ref={slotRef}
    className={`${styles.widget} ${widgetClassName}`}
    data-testid={`${widgetKey}-slot`}
    data-dashboard-widget={widgetKey}
    data-dashboard-state={shouldRender ? 'active' : 'deferred'}
  >
    {shouldRender ? (
      <Suspense
        fallback={
          <DeferredWidgetFallback
            widgetKey={widgetKey}
            fallbackLabel={fallbackLabel}
            isPendingScroll={false}
          />
        }
      >
        {children}
      </Suspense>
    ) : (
      <DeferredWidgetFallback widgetKey={widgetKey} fallbackLabel={fallbackLabel} isPendingScroll />
    )}
  </div>
);

const DeferredWidgetSlot = ({
  widgetKey,
  widgetClassName,
  fallbackLabel,
  children,
  unlockRender = true,
}: Omit<WidgetSlotProps, 'shouldRender'> & { unlockRender?: boolean }): JSX.Element => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const shouldIntersectRender = useDeferredSectionQuery(containerRef, {
    rootMargin: '250px 0px',
    threshold: 0.01,
  });
  const shouldRender = unlockRender && shouldIntersectRender;

  return (
    <WidgetSlot
      slotRef={containerRef}
      widgetKey={widgetKey}
      widgetClassName={widgetClassName}
      shouldRender={shouldRender}
      fallbackLabel={fallbackLabel}
    >
      {children}
    </WidgetSlot>
  );
};

const DashboardGrid = (): JSX.Element => {
  const shouldPrefetchDeferredWidgets = useIdleActivation({
    timeout: 3000,
    fallbackDelay: 1800,
  });
  const shouldUnlockOptionalWidgetsOnIdle = useIdleActivation({
    minimumDelay: 6000,
    timeout: 8000,
    fallbackDelay: 6000,
  });
  const [hasScrolledDashboard, setHasScrolledDashboard] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleScroll = (): void => {
      if (window.scrollY > 24) {
        setHasScrolledDashboard(true);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const shouldUnlockOptionalWidgets = hasScrolledDashboard || shouldUnlockOptionalWidgetsOnIdle;

  useEffect(() => {
    if (!shouldPrefetchDeferredWidgets) {
      return;
    }

    void loadMoodWidget();
    void loadDreamBoardTimelineWidget();
    void loadHabitsWidget();
    void loadGoalsWidget();
  }, [shouldPrefetchDeferredWidgets]);

  return (
    <div className={styles.container}>
      <div className={styles.bentoGrid}>
        <WidgetSlot
          widgetKey="quote"
          widgetClassName={styles.quote}
          shouldRender
          fallbackLabel="Loading quote widget"
        >
          <QuoteWidget />
        </WidgetSlot>

        <WidgetSlot
          widgetKey="cards"
          widgetClassName={styles.cards}
          shouldRender
          fallbackLabel="Loading affirmations widget"
        >
          <CardsWidget />
        </WidgetSlot>

        <WidgetSlot
          widgetKey="radial"
          widgetClassName={styles.radial}
          shouldRender
          fallbackLabel="Loading life wheel widget"
        >
          <RadialLifeChartWidget />
        </WidgetSlot>

        <DeferredWidgetSlot
          widgetKey="mood"
          widgetClassName={styles.mood}
          fallbackLabel="Loading mood widget"
        >
          <MoodWidget />
        </DeferredWidgetSlot>

        <DeferredWidgetSlot
          widgetKey="dreamBoard"
          widgetClassName={styles.dreamBoard}
          fallbackLabel="Loading dream board timeline widget"
          unlockRender={shouldUnlockOptionalWidgets}
        >
          <DreamBoardTimelineWidget />
        </DeferredWidgetSlot>

        <DeferredWidgetSlot
          widgetKey="habits"
          widgetClassName={styles.habits}
          fallbackLabel="Loading habits widget"
          unlockRender={shouldUnlockOptionalWidgets}
        >
          <HabitsWidget />
        </DeferredWidgetSlot>

        <DeferredWidgetSlot
          widgetKey="goals"
          widgetClassName={styles.goals}
          fallbackLabel="Loading goals widget"
          unlockRender={shouldUnlockOptionalWidgets}
        >
          <GoalsWidget />
        </DeferredWidgetSlot>
      </div>
    </div>
  );
};

export default DashboardGrid;
