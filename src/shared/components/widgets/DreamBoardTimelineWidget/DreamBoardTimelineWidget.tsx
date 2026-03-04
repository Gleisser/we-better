import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCommonTranslation } from '@/shared/hooks/useTranslation';
import {
  useLatestDreamBoardSnapshot,
  UseLatestDreamBoardSnapshotResult,
} from '@/features/dream-board/hooks/useLatestDreamBoardSnapshot';
import { getDreamCategoryTranslationKey } from '@/features/dream-board/utils/categoryUtils';
import styles from './DreamBoardTimelineWidget.module.css';

type DreamBoardTimelineWidgetProps = {
  snapshotOverride?: UseLatestDreamBoardSnapshotResult;
};

const DreamBoardTimelineWidget: React.FC<DreamBoardTimelineWidgetProps> = ({
  snapshotOverride,
}) => {
  const { t } = useCommonTranslation();
  const navigate = useNavigate();
  const snapshot = useLatestDreamBoardSnapshot();
  const { dreams, metrics, isLoading, error, refresh } = snapshotOverride ?? snapshot;

  const [activeIndex, setActiveIndex] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionPreference = (): void => setPrefersReducedMotion(mediaQuery.matches);

    updateMotionPreference();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', updateMotionPreference);
      return () => mediaQuery.removeEventListener('change', updateMotionPreference);
    }

    mediaQuery.addListener(updateMotionPreference);
    return () => mediaQuery.removeListener(updateMotionPreference);
  }, []);

  useEffect(() => {
    setActiveIndex(previousIndex => {
      if (dreams.length === 0) {
        return 0;
      }

      return Math.min(previousIndex, dreams.length - 1);
    });
  }, [dreams.length]);

  const translatedDreamCategory = useMemo(() => {
    const activeDream = dreams[activeIndex];
    if (!activeDream) {
      return '';
    }

    const translationKey = getDreamCategoryTranslationKey(activeDream.category);
    const translated = t(translationKey) as string;
    return translated !== translationKey ? translated : activeDream.category;
  }, [activeIndex, dreams, t]);

  const rotateTo = (index: number): void => {
    if (dreams.length === 0) {
      return;
    }

    const normalizedIndex = ((index % dreams.length) + dreams.length) % dreams.length;
    setActiveIndex(normalizedIndex);
  };

  const rotateNext = (): void => rotateTo(activeIndex + 1);
  const rotatePrevious = (): void => rotateTo(activeIndex - 1);

  const handleKeyboardNavigation = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      rotateNext();
      return;
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      rotatePrevious();
    }
  };

  const getRelativeOffset = (index: number): number => {
    if (dreams.length === 0) {
      return 0;
    }

    let offset = index - activeIndex;
    const half = dreams.length / 2;

    if (offset > half) {
      offset -= dreams.length;
    } else if (offset < -half) {
      offset += dreams.length;
    }

    return offset;
  };

  const handleRefresh = async (): Promise<void> => {
    if (isRefreshing) {
      return;
    }

    setIsRefreshing(true);
    try {
      await refresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const activeDream = dreams[activeIndex] || null;
  const counterText =
    activeDream && dreams.length > 0
      ? (t('widgets.dreamBoardWidget.counter', {
          current: activeIndex + 1,
          total: dreams.length,
        }) as string)
      : '';
  const averageProgressLabel = t('widgets.dreamBoardWidget.metrics.averageProgress') as string;
  const averageProgressText =
    metrics.averageProgress === null
      ? '—'
      : `${Math.round(Math.max(0, Math.min(1, metrics.averageProgress)) * 100)}%`;

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <div>
          <h3 className={styles.title}>{t('widgets.dreamBoardWidget.title')}</h3>
          <p className={styles.subtitle}>{t('widgets.dreamBoardWidget.subtitle')}</p>
        </div>

        <div className={styles.headerActions}>
          <div className={styles.progressBadge}>
            <span>{averageProgressLabel}</span>
            <strong>{averageProgressText}</strong>
          </div>
          <button
            type="button"
            className={styles.openBoardButton}
            onClick={() => navigate('/app/dream-board')}
          >
            {t('widgets.dreamBoardWidget.openDreamBoard')}
          </button>
          <button
            type="button"
            className={styles.refreshButton}
            onClick={() => void handleRefresh()}
            disabled={isLoading || isRefreshing}
          >
            {isRefreshing
              ? t('widgets.dreamBoardWidget.refreshing')
              : t('widgets.dreamBoardWidget.refresh')}
          </button>
        </div>
      </header>

      {isLoading && (
        <div className={styles.loadingState} role="status" aria-live="polite">
          <div className={styles.loadingSkeletonCard} />
          <div className={styles.loadingSkeletonLine} />
          <div className={styles.loadingSkeletonMeta} />
          <p>{t('widgets.dreamBoardWidget.loading')}</p>
        </div>
      )}

      {!isLoading && error && (
        <div className={styles.errorState} role="alert">
          <p>{t('widgets.dreamBoardWidget.error')}</p>
          <button type="button" onClick={() => void handleRefresh()}>
            {t('widgets.dreamBoardWidget.retry')}
          </button>
        </div>
      )}

      {!isLoading && !error && dreams.length === 0 && (
        <div className={styles.emptyState}>
          <h4>{t('widgets.dreamBoardWidget.empty.title')}</h4>
          <p>{t('widgets.dreamBoardWidget.empty.description')}</p>
        </div>
      )}

      {!isLoading && !error && dreams.length > 0 && activeDream && (
        <div
          className={styles.carouselViewport}
          tabIndex={0}
          onKeyDown={handleKeyboardNavigation}
          aria-label={t('widgets.dreamBoardWidget.carouselAria') as string}
        >
          <button
            className={`${styles.navButton} ${styles.navButtonLeft}`}
            type="button"
            onClick={rotatePrevious}
            aria-label={t('widgets.dreamBoardWidget.previousImage') as string}
            disabled={dreams.length <= 1}
          >
            <span aria-hidden="true">‹</span>
          </button>

          <div
            className={`${styles.galleryStage} ${prefersReducedMotion ? styles.reducedMotion : ''}`}
          >
            <div className={styles.cardLayer}>
              {dreams.map((dream, index) => {
                const offset = getRelativeOffset(index);
                const absoluteOffset = Math.abs(offset);
                const isActive = absoluteOffset === 0;
                const isHidden = absoluteOffset > 3;

                return (
                  <article
                    key={dream.id}
                    className={`${styles.galleryCard} ${isActive ? styles.activeCard : ''} ${
                      isHidden ? styles.hiddenCard : ''
                    }`}
                    style={
                      {
                        '--offset': `${offset}`,
                        '--abs-offset': `${absoluteOffset}`,
                        zIndex: 200 - absoluteOffset,
                      } as React.CSSProperties
                    }
                    onClick={() => rotateTo(index)}
                    role="button"
                    tabIndex={-1}
                    aria-label={`${dream.title} - ${counterText}`}
                  >
                    <img src={dream.imageUrl} alt={dream.title} loading="lazy" />
                  </article>
                );
              })}
            </div>

            <div className={styles.captionOverlay}>
              <p className={styles.activeCaption}>{activeDream.title}</p>
              <div className={styles.captionMeta}>
                <span className={styles.categoryChip}>{translatedDreamCategory}</span>
                <span>{counterText}</span>
                <span>{t('widgets.dreamBoardWidget.keyboardHint')}</span>
              </div>
            </div>
          </div>

          <button
            className={`${styles.navButton} ${styles.navButtonRight}`}
            type="button"
            onClick={rotateNext}
            aria-label={t('widgets.dreamBoardWidget.nextImage') as string}
            disabled={dreams.length <= 1}
          >
            <span aria-hidden="true">›</span>
          </button>
        </div>
      )}
    </section>
  );
};

export default DreamBoardTimelineWidget;
