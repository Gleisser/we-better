import { motion } from 'framer-motion';
import styles from './MissionCategories.module.css';
import type {
  MissionCategoryId,
  MissionCategoryImage,
} from '@/features/missions/constants/categoryImageMap';

export interface MissionCategory {
  id: MissionCategoryId;
  name: string;
  image: MissionCategoryImage;
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
  selectedCategoryId: MissionCategoryId | null;
  onCategorySelect: (categoryId: MissionCategoryId) => void;
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
            className={`${styles.categoryItem} ${
              selectedCategoryId === category.id ? styles.activeItem : ''
            }`}
            onClick={() => onCategorySelect(category.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-pressed={selectedCategoryId === category.id}
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
                <picture>
                  <source srcSet={category.image.webp} type="image/webp" />
                  <img
                    className={styles.categoryImage}
                    src={category.image.png}
                    alt={category.name}
                    width={96}
                    height={96}
                    loading="lazy"
                    decoding="async"
                  />
                </picture>
                <span className={styles.imageOverlay} aria-hidden="true" />
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
