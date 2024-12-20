import { useEffect, useState, useRef } from 'react';
import styles from './Highlights.module.css';
import { HIGHLIGHTS_FALLBACK } from '@/constants/fallback';
import { useHighlight } from '@/hooks/useHighlight';
import { API_CONFIG } from '@/lib/api-config';

const Highlights = () => {
  const { data, isLoading, error } = useHighlight();
  const [activeIndex, setActiveIndex] = useState(0);
  const [showFallback, setShowFallback] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  // Faster fallback strategy
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading || error) {
        setShowFallback(true);
      }
    }, 1000);

    if (data) {
      setShowFallback(false);
    }

    return () => clearTimeout(timer);
  }, [isLoading, error, data]);

  // Determine data source with priority for fallback
  const highlights = error || showFallback || !data?.data?.slides 
    ? HIGHLIGHTS_FALLBACK 
    : data.data.slides;

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

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % highlights.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [highlights.length]);

  // Don't show loading state if we're going to show fallback
  if (isLoading && !showFallback) {
    return (
      <section className={styles.highlightsContainer}>
        <div className={styles.loadingState}>
          {/* Optional: Add a nice loading animation here */}
        </div>
      </section>
    );
  }

  return (
    <section className={styles.highlightsContainer}>
      <h2 className={styles.highlightsTitle}>
        <span>{data?.data?.title || 'Use Leonardo today for'}</span>
        <span className={styles.gradientText}>{highlights[activeIndex]?.title}</span>
      </h2>
      <div className={styles.sliderContainer}>
        {highlights.map((highlight, index) => {
          const imageSrc = data?.data?.slides 
            ? API_CONFIG.imageBaseURL + highlight?.image?.img?.formats?.large?.url 
            : highlight?.image?.img?.formats?.large?.url;

          return (
            <div 
              key={highlight.id}
              className={`${styles.slide} ${index === activeIndex ? styles.activeSlide : ''}`}
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
                alt={highlight.title}
                className={styles.slideImage}
                loading="lazy"
                onLoad={() => {
                  setLoadedImages(prev => new Set(prev).add(index));
                }}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Highlights; 