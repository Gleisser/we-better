import Featured from './Featured/Featured';
import styles from './Features.module.css';
import FeaturesCard from './Card/FeaturesCard';
import { useFeature } from '@/shared/hooks/useFeature';
import { FEATURES_CONSTANTS } from '@/utils/constants/fallback';
import { useEffect, useState, useMemo } from 'react';
import FeaturesSkeleton from './FeaturesSkeleton';
import { useAssetPreload } from '@/shared/hooks/utils/useAssetPreload';
import { useErrorHandler } from '@/shared/hooks/utils/useErrorHandler';
import { Brand } from '@/utils/types/features-response';

const Features = (): JSX.Element => {
  // Initialize hooks
  const { data, isLoading: isDataLoading } = useFeature();
  const { handleError, isError, error } = useErrorHandler({
    fallbackMessage: 'Failed to load features content',
  });

  const [showFallback, setShowFallback] = useState(false);

  // Determine content
  const cards = error || showFallback || !data?.data?.cards ? FEATURES_CONSTANTS : data.data.cards;

  const brands = useMemo(() => data?.data?.brands || [], [data?.data?.brands]);
  const title = data?.data?.subtext;

  const brandUrls = useMemo(
    () => brands.map((brand: Brand) => brand.logo?.img?.url || '').filter(Boolean),
    [brands]
  );

  const { isLoading } = useAssetPreload({
    urls: brandUrls,
    onError: handleError,
  });

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
          <button onClick={() => window.location.reload()} className={styles.retryButton}>
            Try Again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.featuresContainer} aria-labelledby="features-title">
      <div role="main">
        <h2 className={styles.sectionTitle} id="features-title">
          {/* Main section title */}
        </h2>

        <div className={styles.featuresCard} data-testid="features-cards">
          {cards.map((card, index: number) => (
            <div key={'id' in card ? card.id : index}>
              <h3 className={styles.cardTitle}>{card.title}</h3>
              <FeaturesCard card={card} index={index} />
            </div>
          ))}
        </div>

        <Featured brands={brands} title={title} headingLevel="h3" isLoading={isLoading} />
      </div>
    </section>
  );
};

export default Features;
