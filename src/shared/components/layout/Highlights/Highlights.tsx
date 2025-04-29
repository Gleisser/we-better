import { useEffect, useState, useRef, useCallback } from 'react';
import styles from './Highlights.module.css';
import { HIGHLIGHTS_FALLBACK } from '@/utils/constants/fallback';
import { useHighlight } from '@/shared/hooks/useHighlight';
import { API_CONFIG } from '@/core/config/api-config';
import HighlightsSkeleton from './HighlightsSkeleton';
import { useImagePreloader } from '@/shared/hooks/utils/useImagePreloader';
import { useErrorHandler } from '@/shared/hooks/utils/useErrorHandler';
import { useLoadingState } from '@/shared/hooks/utils/useLoadingState';

const Highlights = () => {
  // Initialize hooks
  const { data, isLoading: isDataLoading } = useHighlight();
  const { preloadImages } = useImagePreloader();
  const { handleError, isError, error } = useErrorHandler({
    fallbackMessage: 'Failed to load highlights content'
  });
  const { isLoading, startLoading, stopLoading } = useLoadingState({
    minimumLoadingTime: 500
  });

  // State management
  const [activeIndex, setActiveIndex] = useState(0);
  const [showFallback, setShowFallback] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  
  // Refs
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Determine data source with priority for fallback
  const highlights = error || showFallback || !data?.data?.slides 
    ? HIGHLIGHTS_FALLBACK 
    : data.data.slides;

  // Collect image URLs for preloading
  const getImageUrls = useCallback(() => {
    return highlights.map(highlight => {
      return data?.data?.slides
        ? API_CONFIG.imageBaseURL + highlight?.image?.img?.formats?.large?.url
        : highlight?.image?.img?.formats?.large?.url;
    });
  }, [highlights, data?.data?.slides]);

  // Handle image preloading
  const loadImages = useCallback(async () => {
    const imageUrls = getImageUrls();
    if (imageUrls.length === 0 || isLoading) return;

    try {
      startLoading();
      await preloadImages(imageUrls);
    } catch (err) {
      handleError(err);
    } finally {
      stopLoading();
    }
  }, [getImageUrls, isLoading, startLoading, preloadImages, handleError, stopLoading]);

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

  // Setup Intersection Observer
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              observerRef.current?.unobserve(img);
            }
          }
        });
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.1
      }
    );

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  // Preload next image when active index changes
  useEffect(() => {
    const nextIndex = (activeIndex + 1) % highlights.length;
    if (!loadedImages.has(nextIndex) && imageRefs.current[nextIndex]) {
      const img = imageRefs.current[nextIndex];
      if (img?.dataset.src) {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        setLoadedImages(prev => new Set(prev).add(nextIndex));
      }
    }
  }, [activeIndex, highlights.length, loadedImages]);

  // Handle slider rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % highlights.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [highlights.length]);

  // Load initial images
  useEffect(() => {
    loadImages();
  }, [loadImages]);

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
            <button 
              onClick={() => window.location.reload()}
              className={styles.retryButton}
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      className={styles.highlightsContainer}
      aria-labelledby="highlights-title"
    >
      <div className={styles.highlightsContent}>
        <h2 
          className={styles.highlightsTitle}
          id="highlights-title"
        >
          <span>{data?.data?.title || 'Use We Better today for'}</span>
          <span className={styles.gradientText}>{highlights[activeIndex]?.title}</span>
        </h2>
        <div 
          className={styles.sliderContainer}
          role="region"
          aria-label="Highlights slider"
        >
          {highlights.map((highlight, index) => {
            const imageSrc = data?.data?.slides 
              ? API_CONFIG.imageBaseURL + highlight?.image?.img?.formats?.large?.url 
              : highlight?.image?.img?.formats?.large?.url;

            return (
              <div 
                key={highlight.id}
                className={`${styles.slide} ${index === activeIndex ? styles.activeSlide : ''}`}
                role="tabpanel"
                aria-hidden={index !== activeIndex}
                aria-label={`Slide ${index + 1} of ${highlights.length}`}
              >
                <img
                  ref={el => {
                    imageRefs.current[index] = el;
                    if (el && !loadedImages.has(index)) {
                      observerRef.current?.observe(el);
                    }
                  }}
                  src={index === activeIndex || loadedImages.has(index) 
                    ? imageSrc 
                    : "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
                  }
                  data-src={imageSrc}
                  alt={`${highlight.title} - Example of AI-generated artwork showcasing ${highlight.title.toLowerCase()} capabilities`}
                  className={styles.slideImage}
                  loading={index === 0 ? "eager" : "lazy"}
                  decoding="async"
                  onLoad={() => {
                    setLoadedImages(prev => new Set(prev).add(index));
                  }}
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