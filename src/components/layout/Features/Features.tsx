import Featured from './Featured/Featured';
import styles from './Features.module.css';
import FeaturesCard from './Card/FeaturesCard';
import { useFeature } from '@/hooks/useFeature';
import { FEATURES_CONSTANTS } from '@/constants/fallback';
import { useEffect, useState } from 'react';
import FeaturesSkeleton from './FeaturesSkeleton';

const Features = () => {
  const { data, isLoading, error } = useFeature();
  const [showFallback, setShowFallback] = useState(false);

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

  if (isLoading && !showFallback) {
    return <FeaturesSkeleton />;
  }

  const cards = error || showFallback || !data?.data?.cards 
    ? FEATURES_CONSTANTS 
    : data.data.cards;

  const brands = data?.data?.brands || [];
  const title = data?.data?.subtext;

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
        />
      </div>
    </section>
  );
};

export default Features;