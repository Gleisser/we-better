import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LifeStories from '../Stories/LifeStories';
import { XIcon, PlayIcon, ChevronDownIcon } from '@/shared/components/common/icons';
import { useCommonTranslation } from '@/shared/hooks/useTranslation';
import styles from './StoriesBar.module.css';
import { useBottomSheet } from '@/shared/hooks/useBottomSheet';
import WeeklyMissions from './WeeklyMissions';
import { useLifeCategories, type LifeCategory } from '@/shared/hooks/useLifeCategories';

const StoriesBar = (): JSX.Element => {
  const { t } = useCommonTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<LifeCategory | null>(null);
  const isMobile = window.innerWidth <= 768;
  const { activeSheet, setActiveSheet, closeSheet } = useBottomSheet();
  const lifeCategories = useLifeCategories();

  const isFullScreen = isExpanded && selectedCategory !== null;

  const handleOpen = (): void => {
    setActiveSheet('stories');
    setSelectedCategory(null);
    setIsExpanded(true);
  };

  const handleClose = (): void => {
    closeSheet();
    setIsExpanded(false);
    setSelectedCategory(null);
  };

  useEffect(() => {
    if (activeSheet && activeSheet !== 'stories') {
      setIsExpanded(false);
      setSelectedCategory(null);
    }
  }, [activeSheet]);

  const handleCategorySelect = (category: LifeCategory): void => {
    setSelectedCategory(category);
    if (!isExpanded) {
      setIsExpanded(true);
    }
    if (activeSheet !== 'stories') {
      setActiveSheet('stories');
    }
  };

  const handleMinimize = (): void => {
    setSelectedCategory(null);
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

      <div className={`${styles.container} ${isFullScreen ? styles.fullscreenContainer : ''}`}>
        <AnimatePresence mode="wait">
          {isExpanded ? (
            <motion.div
              className={`${styles.storiesContainer} ${isFullScreen ? styles.fullscreenStories : ''}`}
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
              {isFullScreen && (
                <button
                  className={styles.minimizeButton}
                  onClick={handleMinimize}
                  aria-label="Minimize stories view"
                >
                  <ChevronDownIcon className={styles.minimizeIcon} />
                </button>
              )}
              <div
                className={`${styles.categoriesSection} ${
                  isFullScreen ? styles.categoriesSectionExpanded : ''
                }`}
              >
                <LifeStories categories={lifeCategories} onCategorySelect={handleCategorySelect} />
              </div>
              {selectedCategory && (
                <div className={styles.missionsArea}>
                  <WeeklyMissions
                    category={{
                      id: selectedCategory.id,
                      name: selectedCategory.name,
                      color: selectedCategory.color,
                      icon: selectedCategory.icon,
                    }}
                  />
                </div>
              )}
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
