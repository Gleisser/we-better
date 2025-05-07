import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './LifeWheel.module.css';

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
  orbitRadius?: number;
  orbitSpeed?: number;
}

interface LifeWheelProps {
  categories: LifeCategory[];
  onCategorySelect: (category: LifeCategory) => void;
  userName?: string;
}

const MOCK_CATEGORIES: LifeCategory[] = [
  {
    id: 'social',
    name: 'Social',
    color: {
      from: '#8B5CF6',
      to: '#D946EF',
    },
    icon: '👥',
    score: 85,
    hasUpdate: true,
    orbitRadius: 120,
    orbitSpeed: 0.8,
  },
  {
    id: 'health',
    name: 'Health',
    color: {
      from: '#10B981',
      to: '#34D399',
    },
    icon: '💪',
    score: 70,
    hasUpdate: true,
    orbitRadius: 160,
    orbitSpeed: 0.5,
  },
  // ... other categories with different orbit radiuses and speeds
];

const LifeWheel = ({
  categories = MOCK_CATEGORIES,
  onCategorySelect,
  userName = 'Gleisser Souza',
}: LifeWheelProps): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const toggleMenu = (): void => {
    setIsOpen(!isOpen);
    if (isOpen) {
      setActiveCategory(null);
    }
  };

  // Calculate positions in a circle
  const getItemStyle = (
    index: number
  ): {
    left: string;
    top: string;
    scale: number;
    opacity: number;
  } => {
    const angle = (2 * Math.PI * index) / categories.length - Math.PI / 2;
    const radius = 90; // Adjusted radius for better spacing around center

    return {
      left: `calc(50% + ${Math.cos(angle) * radius}px)`,
      top: `calc(50% + ${Math.sin(angle) * radius}px)`,
      scale: isOpen ? 1 : 0,
      opacity: isOpen ? 1 : 0,
    };
  };

  // Get initials from name
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        {/* Center button */}
        <motion.button
          className={styles.centerPiece}
          onClick={toggleMenu}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className={styles.scoreRing}>
            <div className={styles.initials}>{getInitials(userName)}</div>
          </div>
        </motion.button>

        {/* Category Items */}
        <AnimatePresence>
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              className={styles.categoryBubble}
              initial={getItemStyle(index)}
              animate={getItemStyle(index)}
              exit={{
                x: 0,
                y: 0,
                scale: 0,
                opacity: 0,
              }}
              transition={{
                duration: 0.3,
                delay: isOpen ? index * 0.05 : 0,
                type: 'spring',
                stiffness: 300,
                damping: 30,
              }}
              onClick={() => onCategorySelect(category)}
              onHoverStart={() => setActiveCategory(category.id)}
              onHoverEnd={() => setActiveCategory(null)}
              style={{
                position: 'absolute',
                background: `linear-gradient(45deg, ${category.color.from}20, ${category.color.to}20)`,
              }}
            >
              <span className={styles.categoryIcon}>{category.icon}</span>

              {/* Category label */}
              <AnimatePresence>
                {isOpen && activeCategory === category.id && (
                  <motion.div
                    className={styles.categoryLabel}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <span className={styles.categoryName}>{category.name}</span>
                    <span className={styles.categoryScore}>{category.score}%</span>
                    {category.hasUpdate && <span className={styles.updateDot} />}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LifeWheel;
