import Featured from './Featured/Featured';
import styles from './Features.module.css';
import { FEATURES_CONSTANTS } from '@/constants/features';
import FeaturesCard from './Card/FeaturesCard';

const Features = () => {

  return (
    <section className={styles.featuresContainer}>
      <div>
        <div className={styles.featuresCard}>
          {FEATURES_CONSTANTS.map((feature, index) => (
            <FeaturesCard key={index} feature={feature} index={index} />
          ))}
        </div>
        {/* Add the Featured component */}
        <Featured />
      </div>
    </section>
  );
};

export default Features;