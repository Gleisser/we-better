import Featured from './Featured/Featured';
import styles from './Features.module.css';
import FeaturesCard from './Card/FeaturesCard';
import { useFeature } from '@/hooks/useFeature';
import { FEATURES_CONSTANTS } from '@/constants/fallback';
import { useEffect, useState, useCallback } from 'react';
import FeaturesSkeleton from './FeaturesSkeleton';
import { useImagePreloader } from '@/hooks/utils/useImagePreloader';
import { useErrorHandler } from '@/hooks/utils/useErrorHandler';
import { useLoadingState } from '@/hooks/utils/useLoadingState';

const Features = () => {
  // Initialize hooks
  const { data, isLoading: isDataLoading } = useFeature();
  const { preloadImages } = useImagePreloader();
  const { handleError, isError, error } = useErrorHandler({
    fallbackMessage: 'Failed to load features content'
  });
  const { isLoading, startLoading, stopLoading } = useLoadingState({
    minimumLoadingTime: 500
  });

  const [showFallback, setShowFallback] = useState(false);

  // Determine content
  const cards = error || showFallback || !data?.data?.cards 
    ? FEATURES_CONSTANTS 
    : data.data.cards;

  const brands = data?.data?.brands || [];
  const title = data?.data?.subtext;

  // Collect brand logo URLs for preloading
  const getBrandUrls = useCallback(() => {
    return brands.map(brand => brand.logo?.img?.url || '').filter(Boolean);
  }, [brands]);

  // Handle image preloading
  const loadImages = useCallback(async () => {
    const brandUrls = getBrandUrls();
    if (brandUrls.length === 0 || isLoading) return;

    try {
      startLoading();
      await preloadImages(brandUrls);
    } catch (err) {
      handleError(err);
    } finally {
      stopLoading();
    }
  }, [getBrandUrls, isLoading, startLoading, preloadImages, handleError, stopLoading]);

  // Fallback strategy
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

  // Load brand images
  useEffect(() => {
    loadImages();
  }, [loadImages]);

  // Show loading state
  if (isDataLoading && !showFallback) {
    return <FeaturesSkeleton />;
  }

  // Show error state
  if (isError && !showFallback) {
    return (
      <section className={styles.featuresContainer}>
        <div className={styles.errorState} role="alert">
          <p>{error?.message}</p>
          <button 
            onClick={() => window.location.reload()}
            className={styles.retryButton}
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section 
      className={styles.featuresContainer}
      aria-labelledby="features-title"
    >
      <div role="main">
        <h2 
          className={styles.sectionTitle}
          id="features-title"
        >
          {/* Main section title */}
        </h2>
        
        <div className={styles.featuresCard}>
          {cards.map((card, index) => (
            <div key={card.id || index}>
              <h3 className={styles.cardTitle}>
                {card.title}
              </h3>
              <FeaturesCard 
                card={card} 
                index={index} 
              />
            </div>
          ))}
        </div>

        <Featured 
          brands={brands} 
          title={title}
          headingLevel="h3"
          isLoading={isLoading}
        />
      </div>
    </section>
  );
};

export default Features;