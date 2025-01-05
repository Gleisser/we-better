import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import styles from './AffirmationWidget.module.css';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/common/icons';

type AffirmationCategory = 'confidence' | 'growth' | 'gratitude' | 'abundance' | 'health';

interface Affirmation {
  id: string;
  text: string;
  category: AffirmationCategory;
  intensity: 1 | 2 | 3; // 1: gentle, 2: moderate, 3: powerful
}

// Sample affirmations data
const AFFIRMATIONS: Record<AffirmationCategory, Affirmation[]> = {
  confidence: [
    {
      id: 'conf_1',
      text: 'I am capable of achieving anything I set my mind to',
      category: 'confidence',
      intensity: 3
    },
    {
      id: 'conf_2',
      text: 'I trust in my abilities and inner wisdom',
      category: 'confidence',
      intensity: 2
    },
    {
      id: 'conf_3',
      text: 'I radiate confidence, self-respect, and inner harmony',
      category: 'confidence',
      intensity: 2
    }
  ],
  growth: [
    {
      id: 'growth_1',
      text: "Every day I'm growing stronger and wiser",
      category: 'growth',
      intensity: 2
    },
    {
      id: 'growth_2',
      text: 'I embrace challenges as opportunities to learn',
      category: 'growth',
      intensity: 3
    },
    {
      id: 'growth_3',
      text: 'I am constantly evolving and becoming a better version of myself',
      category: 'growth',
      intensity: 2
    }
  ],
  gratitude: [
    {
      id: 'grat_1',
      text: 'I am thankful for all the abundance in my life',
      category: 'gratitude',
      intensity: 2
    },
    {
      id: 'grat_2',
      text: 'I appreciate the small moments of joy in each day',
      category: 'gratitude',
      intensity: 1
    },
    {
      id: 'grat_3',
      text: 'My heart is full of gratitude for all that I have',
      category: 'gratitude',
      intensity: 3
    }
  ],
  abundance: [
    {
      id: 'abund_1',
      text: 'I attract success and prosperity effortlessly',
      category: 'abundance',
      intensity: 3
    },
    {
      id: 'abund_2',
      text: 'I am open to receiving all the wealth life offers',
      category: 'abundance',
      intensity: 2
    },
    {
      id: 'abund_3',
      text: 'Abundance flows freely into my life',
      category: 'abundance',
      intensity: 2
    }
  ],
  health: [
    {
      id: 'health_1',
      text: 'My body is healthy, strong, and full of energy',
      category: 'health',
      intensity: 3
    },
    {
      id: 'health_2',
      text: 'I make choices that nourish my mind, body, and soul',
      category: 'health',
      intensity: 2
    },
    {
      id: 'health_3',
      text: 'I radiate health, vitality, and positive energy',
      category: 'health',
      intensity: 2
    }
  ]
};

const CATEGORY_CONFIG: Record<AffirmationCategory, {
  icon: string;
  label: string;
  colorRGB: string;
}> = {
  confidence: {
    icon: '⚡️',
    label: 'Confidence',
    colorRGB: '139, 92, 246' // Purple RGB values
  },
  growth: {
    icon: '🌱',
    label: 'Growth',
    colorRGB: '16, 185, 129' // Emerald RGB values
  },
  gratitude: {
    icon: '🙏',
    label: 'Gratitude',
    colorRGB: '245, 158, 11' // Amber RGB values
  },
  abundance: {
    icon: '✨',
    label: 'Abundance',
    colorRGB: '236, 72, 153' // Pink RGB values
  },
  health: {
    icon: '💪',
    label: 'Health',
    colorRGB: '59, 130, 246' // Blue RGB values
  }
};

const AffirmationWidget = () => {
  const [currentAffirmation, setCurrentAffirmation] = useState<Affirmation>(
    AFFIRMATIONS.confidence[0]
  );
  const [selectedCategory, setSelectedCategory] = useState<AffirmationCategory>('confidence');
  const [showScrollButtons, setShowScrollButtons] = useState({
    left: false,
    right: false
  });
  const categorySelectorRef = useRef<HTMLDivElement>(null);

  const getRandomAffirmation = (category: AffirmationCategory) => {
    const affirmations = AFFIRMATIONS[category];
    const randomIndex = Math.floor(Math.random() * affirmations.length);
    return affirmations[randomIndex];
  };

  const handleCategoryChange = (category: AffirmationCategory) => {
    setSelectedCategory(category);
    setCurrentAffirmation(getRandomAffirmation(category));
  };

  const handleRefresh = () => {
    setCurrentAffirmation(getRandomAffirmation(selectedCategory));
  };

  // Check if scroll buttons should be shown
  const checkScroll = () => {
    if (categorySelectorRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = categorySelectorRef.current;
      setShowScrollButtons({
        left: scrollLeft > 0,
        right: scrollLeft < scrollWidth - clientWidth - 1
      });
    }
  };

  // Add scroll listeners
  useEffect(() => {
    const selector = categorySelectorRef.current;
    if (selector) {
      selector.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      checkScroll();
    }
    return () => {
      selector?.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  const handleScroll = (direction: 'left' | 'right') => {
    if (categorySelectorRef.current) {
      const scrollAmount = 200; // Adjust this value as needed
      const newScrollLeft = categorySelectorRef.current.scrollLeft + 
        (direction === 'left' ? -scrollAmount : scrollAmount);
      
      categorySelectorRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.headerIcon}>✨</span>
          <span className={styles.headerText}>Daily Affirmation</span>
        </div>
        
        <div className={styles.categorySelectorWrapper}>
          {showScrollButtons.left && (
            <button
              className={`${styles.scrollButton} ${styles.scrollLeft}`}
              onClick={() => handleScroll('left')}
              aria-label="Scroll categories left"
            >
              <ChevronLeftIcon className={styles.scrollIcon} />
            </button>
          )}
          
          <div 
            ref={categorySelectorRef}
            className={styles.categorySelector}
          >
            {Object.entries(CATEGORY_CONFIG).map(([category, config]) => (
              <button
                key={category}
                className={`${styles.categoryButton} ${
                  selectedCategory === category ? styles.selected : ''
                }`}
                onClick={() => handleCategoryChange(category as AffirmationCategory)}
                style={{
                  '--category-color-rgb': config.colorRGB
                } as React.CSSProperties}
              >
                <span className={styles.categoryIcon}>{config.icon}</span>
                <span className={styles.categoryLabel}>{config.label}</span>
              </button>
            ))}
          </div>

          {showScrollButtons.right && (
            <button
              className={`${styles.scrollButton} ${styles.scrollRight}`}
              onClick={() => handleScroll('right')}
              aria-label="Scroll categories right"
            >
              <ChevronRightIcon className={styles.scrollIcon} />
            </button>
          )}
        </div>
      </div>

      <div className={styles.content}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentAffirmation.id}
            className={styles.affirmationText}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            "{currentAffirmation.text}"
          </motion.div>
        </AnimatePresence>

        <div className={styles.categoryTag}>
          <span className={styles.categoryIcon}>
            {CATEGORY_CONFIG[currentAffirmation.category].icon}
          </span>
          <span className={styles.categoryLabel}>
            {CATEGORY_CONFIG[currentAffirmation.category].label}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AffirmationWidget; 