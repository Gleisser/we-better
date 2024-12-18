import Featured from './Featured/Featured';
import styles from './Features.module.css';
import FeaturesCard from './Card/FeaturesCard';
import { useFeature } from '@/hooks/useFeature';
import { FEATURES_CONSTANTS } from '@/constants/features';

const Features = () => {
  const { data, isLoading } = useFeature();

  if (isLoading) return <div>Loading...</div>;

  // Get cards from API or use fallback
  const cards = data?.data?.cards || FEATURES_CONSTANTS;
  // Get brands or provide empty array as fallback
  const brands = data?.data?.brands || [];

  const title = data?.data?.subtext;

  return (
    <section className={styles.featuresContainer}>
      <div>
        <div className={styles.featuresCard}>
          {cards.map((card, index) => (
            <FeaturesCard 
              key={index} 
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