import { useEffect, useState, useRef, useMemo } from 'react';
import styles from './Highlights.module.css';
import { HIGHLIGHTS_FALLBACK } from '@/utils/constants/fallback';
import { useHighlight } from '@/shared/hooks/useHighlight';
import HighlightsSkeleton from './HighlightsSkeleton';
import { useErrorHandler } from '@/shared/hooks/utils/useErrorHandler';
import { useDeferredSectionQuery } from '@/shared/hooks/utils/useDeferredSectionQuery';
import { useElementVisibility } from '@/shared/hooks/utils/useElementVisibility';
import { usePageVisibility } from '@/shared/hooks/utils/usePageVisibility';
import { usePrefersReducedMotion } from '@/shared/hooks/utils/usePrefersReducedMotion';
import { createResponsiveMediaFromImage } from '@/utils/helpers/responsiveMedia';
import { LANDING_MEDIA } from '@/utils/constants/media/landingMedia';
import type { ResponsiveMediaSource } from '@/utils/types/responsiveMedia';

const FALLBACK_HIGHLIGHT_MEDIA: Record<string, ResponsiveMediaSource> = {
  Goals: LANDING_MEDIA.highlights.goals,
  Relationships: LANDING_MEDIA.highlights.relationships,
  Resilience: LANDING_MEDIA.highlights.resilience,
  Career: LANDING_MEDIA.highlights.career,
  Finances: LANDING_MEDIA.highlights.finances,
};

const isUnsafeHighlightMedia = (media: ResponsiveMediaSource | null): boolean => {
  const source = media?.src?.toLowerCase() ?? '';

  return source.includes('localhost:1337') || source.endsWith('.gif') || source.includes('.gif?');
};

const resolveHighlightMedia = (
  highlight:
    | (typeof HIGHLIGHTS_FALLBACK)[number]
    | NonNullable<ReturnType<typeof useHighlight>['data']>['data']['slides'][number]
): ResponsiveMediaSource => {
  const resolvedMedia = createResponsiveMediaFromImage(highlight.image, {
    alt: highlight.title,
    sizes: '(max-width: 768px) 100vw, 960px',
  });

  if (resolvedMedia && !isUnsafeHighlightMedia(resolvedMedia)) {
    return resolvedMedia;
  }

  return FALLBACK_HIGHLIGHT_MEDIA[highlight.title] ?? LANDING_MEDIA.highlights.goals;
};

const Highlights = (): JSX.Element => {
  // Refs
  const sectionRef = useRef<HTMLElement | null>(null);
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const shouldFetch = useDeferredSectionQuery(sectionRef);
  const prefersReducedMotion = usePrefersReducedMotion();
  const isPageVisible = usePageVisibility();

  // Initialize hooks
  const { data, isLoading: isDataLoading } = useHighlight({ enabled: shouldFetch });
  const { isError, error } = useErrorHandler({
    fallbackMessage: 'Failed to load highlights content',
  });

  // State management
  const [activeIndex, setActiveIndex] = useState(0);
  const [showFallback, setShowFallback] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  // Determine data source with priority for fallback
  const highlights =
    error || showFallback || !data?.data?.slides ? HIGHLIGHTS_FALLBACK : data.data.slides;

  const highlightMedia = useMemo(() => highlights.map(resolveHighlightMedia), [highlights]);
  const shouldRenderContent = !(isDataLoading && !showFallback) && !(isError && !showFallback);
  const isSectionVisible = useElementVisibility(sliderRef, {
    rootMargin: '250px 0px',
    threshold: 0.01,
    disabled: !shouldRenderContent,
  });

  // Faster fallback strategy
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isDataLoading || error) {
        setShowFallback(true);
      }
    }, 1000);

    if (data) {
      setShowFallback(false);
    }

    return () => clearTimeout(timer);
  }, [isDataLoading, error, data]);

  // Load only the active and next slide once the section is near the viewport
  useEffect(() => {
    if (!isSectionVisible) {
      return;
    }

    const nextIndex = (activeIndex + 1) % highlights.length;
    setLoadedImages(prev => {
      const next = new Set(prev);
      next.add(activeIndex);
      next.add(nextIndex);
      return next;
    });
  }, [activeIndex, highlights.length, isSectionVisible]);

  const shouldAutoplay =
    shouldRenderContent &&
    highlights.length > 1 &&
    isSectionVisible &&
    isPageVisible &&
    !prefersReducedMotion;

  useEffect(() => {
    if (!shouldAutoplay) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setActiveIndex(current => (current + 1) % highlights.length);
    }, 2000);

    return () => window.clearTimeout(timeoutId);
  }, [activeIndex, highlights.length, shouldAutoplay]);
  // Show loading state
  if (isDataLoading && !showFallback) {
    return <HighlightsSkeleton />;
  }

  // Show error state
  if (isError && !showFallback) {
    return (
      <section className={styles.highlightsContainer}>
        <div className={styles.highlightsContent}>
          <div className={styles.errorState} role="alert">
            <p>{error?.message}</p>
            <button onClick={() => window.location.reload()} className={styles.retryButton}>
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className={styles.highlightsContainer}
      aria-labelledby="highlights-title"
    >
      <div className={styles.highlightsContent}>
        <h2 className={styles.highlightsTitle} id="highlights-title">
          <span>{data?.data?.title || 'Use We Better today for'}</span>
          <span className={styles.gradientText}>{highlights[activeIndex]?.title}</span>
        </h2>
        <div
          ref={sliderRef}
          className={styles.sliderContainer}
          role="region"
          aria-label="Highlights slider"
        >
          {highlights.map((highlight, index: number) => {
            const media = highlightMedia[index];
            const shouldLoad = loadedImages.has(index);

            return (
              <div
                key={highlight.id}
                className={`${styles.slide} ${index === activeIndex ? styles.activeSlide : ''}`}
                role="tabpanel"
                aria-hidden={index !== activeIndex}
                aria-label={`Slide ${index + 1} of ${highlights.length}`}
              >
                <img
                  src={
                    shouldLoad
                      ? media.src
                      : 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
                  }
                  srcSet={shouldLoad ? media.srcSet : undefined}
                  sizes={shouldLoad ? media.sizes : undefined}
                  alt={`${highlight.title} - Example of AI-generated artwork showcasing ${highlight.title.toLowerCase()} capabilities`}
                  className={styles.slideImage}
                  loading={index === activeIndex ? 'eager' : 'lazy'}
                  decoding="async"
                  width={media.width}
                  height={media.height}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Highlights;
