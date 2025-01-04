import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LifeStories from '../Stories/LifeStories';
import { XIcon, PlayIcon } from '@/components/common/icons';
import styles from './StoriesBar.module.css';

const MOCK_CATEGORIES = [
  {
    id: 'social',
    name: 'Social',
    color: {
      from: '#8B5CF6',
      to: '#D946EF'
    },
    icon: '👥',
    score: 85,
    hasUpdate: true
  },
  {
    id: 'health',
    name: 'Health',
    color: {
      from: '#10B981',
      to: '#34D399'
    },
    icon: '💪',
    score: 70,
    hasUpdate: true
  },
  {
    id: 'selfCare',
    name: 'Self Care',
    color: {
      from: '#F59E0B',
      to: '#FBBF24'
    },
    icon: '🧘‍♂️',
    score: 65,
    hasUpdate: false
  },
  {
    id: 'money',
    name: 'Money',
    color: {
      from: '#3B82F6',
      to: '#60A5FA'
    },
    icon: '💰',
    score: 75,
    hasUpdate: true
  },
  {
    id: 'family',
    name: 'Family',
    color: {
      from: '#EC4899',
      to: '#F472B6'
    },
    icon: '👨‍👩‍👧‍👦',
    score: 90,
    hasUpdate: true
  },
  {
    id: 'spirituality',
    name: 'Spirituality',
    color: {
      from: '#8B5CF6',
      to: '#A78BFA'
    },
    icon: '🧘‍♀️',
    score: 60,
    hasUpdate: false
  },
  {
    id: 'relationship',
    name: 'Relationship',
    color: {
      from: '#EF4444',
      to: '#F87171'
    },
    icon: '❤️',
    score: 80,
    hasUpdate: true
  },
  {
    id: 'career',
    name: 'Career',
    color: {
      from: '#6366F1',
      to: '#818CF8'
    },
    icon: '💼',
    score: 85,
    hasUpdate: true
  }
];

const StoriesBar = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const handleCategorySelect = (category: any) => {
    console.log('Selected category:', category);
  };

  return (
    <div className={styles.container}>
      <AnimatePresence mode="wait">
        {isExpanded ? (
          <motion.div 
            className={styles.storiesContainer}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <button 
              className={styles.collapseButton}
              onClick={() => setIsExpanded(false)}
              aria-label="Collapse stories"
            >
              <XIcon className={styles.collapseIcon} />
            </button>
            <LifeStories 
              categories={MOCK_CATEGORIES} 
              onCategorySelect={handleCategorySelect}
            />
          </motion.div>
        ) : (
          <motion.button
            className={styles.collapsedButton}
            onClick={() => setIsExpanded(true)}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className={styles.collapsedIcon}>
              <PlayIcon className={styles.playIcon} />
            </div>
            <span className={styles.collapsedText}>Quick Inspiration</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StoriesBar; 