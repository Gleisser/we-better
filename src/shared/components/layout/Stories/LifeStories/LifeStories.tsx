import { motion } from 'framer-motion';
import styles from './LifeStories.module.css';

interface LifeCategory {
  id: string;
  name: string;
  color: {
    from: string;
    to: string;
  };
  icon: string;
  score: number;
  hasUpdate: boolean;
}

interface LifeStoriesProps {
  categories: LifeCategory[];
  onCategorySelect: (category: LifeCategory) => void;
}

const LifeStories = ({ categories, onCategorySelect }: LifeStoriesProps): JSX.Element => {
  return (
    <div className={styles.container}>
      <div className={styles.storiesWrapper}>
        {categories.map((category: LifeCategory) => (
          <motion.button
            key={category.id}
            className={styles.storyItem}
            onClick={() => onCategorySelect(category)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div
              className={`${styles.storyRing} ${category.hasUpdate ? styles.hasUpdate : ''}`}
              style={{
                background: `linear-gradient(45deg, ${category.color.from}, ${category.color.to})`,
              }}
            >
              <div className={styles.storyContent}>
                <span className={styles.storyIcon}>{category.icon}</span>
              </div>
            </div>
            <span className={styles.storyLabel}>{category.name}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default LifeStories;
