import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LifeStories from '../Stories/LifeStories';
import { XIcon, PlayIcon } from '@/shared/components/common/icons';
import { useCommonTranslation } from '@/shared/hooks/useTranslation';
import styles from './StoriesBar.module.css';
import { useBottomSheet } from '@/shared/hooks/useBottomSheet';

const StoriesBar = (): JSX.Element => {
  const { t } = useCommonTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const isMobile = window.innerWidth <= 768;
  const { activeSheet, setActiveSheet, closeSheet } = useBottomSheet();

  const MOCK_CATEGORIES = [
    {
      id: 'social',
      name: t('floating.lifeCategories.social'),
      color: {
        from: '#8B5CF6',
        to: '#D946EF',
      },
      icon: '👥',
      score: 85,
      hasUpdate: true,
    },
    {
      id: 'health',
      name: t('floating.lifeCategories.health'),
      color: {
        from: '#10B981',
        to: '#34D399',
      },
      icon: '💪',
      score: 70,
      hasUpdate: true,
    },
    {
      id: 'selfCare',
      name: t('floating.lifeCategories.selfCare'),
      color: {
        from: '#F59E0B',
        to: '#FBBF24',
      },
      icon: '🧘‍♂️',
      score: 65,
      hasUpdate: false,
    },
    {
      id: 'money',
      name: t('floating.lifeCategories.money'),
      color: {
        from: '#3B82F6',
        to: '#60A5FA',
      },
      icon: '💰',
      score: 75,
      hasUpdate: true,
    },
    {
      id: 'family',
      name: t('floating.lifeCategories.family'),
      color: {
        from: '#EC4899',
        to: '#F472B6',
      },
      icon: '👨‍👩‍👧‍👦',
      score: 90,
      hasUpdate: true,
    },
    {
      id: 'spirituality',
      name: t('floating.lifeCategories.spirituality'),
      color: {
        from: '#8B5CF6',
        to: '#A78BFA',
      },
      icon: '🧘‍♀️',
      score: 60,
      hasUpdate: false,
    },
    {
      id: 'relationship',
      name: t('floating.lifeCategories.relationship'),
      color: {
        from: '#EF4444',
        to: '#F87171',
      },
      icon: '❤️',
      score: 80,
      hasUpdate: true,
    },
    {
      id: 'career',
      name: t('floating.lifeCategories.career'),
      color: {
        from: '#6366F1',
        to: '#818CF8',
      },
      icon: '💼',
      score: 85,
      hasUpdate: true,
    },
  ];

  const handleOpen = (): void => {
    setActiveSheet('stories');
    setIsExpanded(true);
  };

  const handleClose = (): void => {
    closeSheet();
    setIsExpanded(false);
  };

  useEffect(() => {
    if (activeSheet && activeSheet !== 'stories') {
      setIsExpanded(false);
    }
  }, [activeSheet]);

  const handleCategorySelect = (): void => {
    // TODO: Implement category selection
  };

  return (
    <>
      {isMobile && isExpanded && activeSheet === 'stories' && (
        <motion.div
          className={styles.backdrop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        />
      )}

      <div className={styles.container}>
        <AnimatePresence mode="wait">
          {isExpanded ? (
            <motion.div
              className={`${styles.storiesContainer} ${styles.open}`}
              initial={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.8 }}
              animate={isMobile ? { y: 0 } : { opacity: 1, scale: 1 }}
              exit={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              <button
                className={styles.collapseButton}
                onClick={handleClose}
                aria-label={t('floating.collapseStories')}
              >
                <XIcon className={styles.collapseIcon} />
              </button>
              <LifeStories categories={MOCK_CATEGORIES} onCategorySelect={handleCategorySelect} />
            </motion.div>
          ) : (
            <motion.button
              className={styles.collapsedButton}
              onClick={handleOpen}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              whileHover={!isMobile ? { scale: 1.05 } : undefined}
              whileTap={!isMobile ? { scale: 0.95 } : undefined}
            >
              <div className={styles.collapsedIcon}>
                <PlayIcon className={styles.playIcon} />
              </div>
              <span className={styles.collapsedText}>{t('floating.quickInspiration')}</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default StoriesBar;
