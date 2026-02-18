import { motion } from 'framer-motion';
import styles from './MissionCategories.module.css';

export interface MissionCategory {
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

interface MissionCategoriesProps {
  categories: MissionCategory[];
  selectedCategoryId: string | null;
  onCategorySelect: (category: MissionCategory) => void;
}

const MissionCategories = ({
  categories,
  selectedCategoryId,
  onCategorySelect,
}: MissionCategoriesProps): JSX.Element => {
  return (
    <div className={styles.container}>
      <div className={styles.categoriesWrapper}>
        {categories.map((category: MissionCategory) => (
          <motion.button
            key={category.id}
            className={styles.categoryItem}
            onClick={() => onCategorySelect(category)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div
              className={`${styles.categoryRing} ${
                category.hasUpdate ? styles.hasUpdate : ''
              } ${selectedCategoryId === category.id ? styles.selected : ''}`}
              style={{
                background: `linear-gradient(45deg, ${category.color.from}, ${category.color.to})`,
              }}
            >
              <div className={styles.categoryContent}>
                <span className={styles.categoryIcon}>{category.icon}</span>
              </div>
            </div>
            <span className={styles.categoryLabel}>{category.name}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default MissionCategories;
