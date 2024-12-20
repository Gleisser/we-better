import Featured from './Featured/Featured';
import styles from './Features.module.css';
import FeaturesCard from './Card/FeaturesCard';
import { useFeature } from '@/hooks/useFeature';
import { FEATURES_CONSTANTS } from '@/constants/fallback';
import { useEffect, useState } from 'react';

const Features = () => {
  const { data, isLoading, error } = useFeature();
  const [showFallback, setShowFallback] = useState(false);

  // Faster fallback strategy
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading || error) {
        setShowFallback(true);
      }
    }, 1000); // Reduced from default to 1s

    if (data) {
      setShowFallback(false);
    }

    return () => clearTimeout(timer);
  }, [isLoading, error, data]);

  // Determine data source with priority for fallback when needed
  const cards = error || showFallback || !data?.data?.cards 
    ? FEATURES_CONSTANTS 
    : data.data.cards;

  // Get brands or provide empty array as fallback
  const brands = data?.data?.brands || [];
  const title = data?.data?.subtext;

  // Don't show loading state if we're going to show fallback
  if (isLoading && !showFallback) {
    return (
      <section className={styles.featuresContainer}>
        <div className={styles.loadingState}>
          {/* Optional: Add a nice loading animation here */}
        </div>
      </section>
    );
  }

  return (
    <section className={styles.featuresContainer}>
      <div>
        <div className={styles.featuresCard}>
          {cards.map((card, index) => (
            <FeaturesCard 
              key={card.id || index} 
              card={card} 
              index={index} 
            />
          ))}
        </div>
        <Featured brands={brands} title={title} />
      </div>
    </section>
  );
};

export default Features;