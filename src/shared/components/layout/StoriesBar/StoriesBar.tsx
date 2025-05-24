import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LifeStories from '../Stories/LifeStories/LifeStories'; // Adjusted path
import { XIcon, PlayIcon, LoadingSpinner } from '@/shared/components/common/icons'; // Added LoadingSpinner
import styles from './StoriesBar.module.css';
import { useBottomSheet } from '@/shared/hooks/useBottomSheet';
import { useStories } from '@/shared/hooks/useStories'; // Import the new hook

// MOCK_CATEGORIES is now removed as data will come from the hook

const StoriesBar = (): JSX.Element => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const { activeSheet, setActiveSheet, closeSheet } = useBottomSheet();
  const storiesQuery = useStories(); // Use the hook

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
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
    // This function will likely receive a category or story ID
    console.log('Category selected (to be implemented)');
  };
  
  const storiesData = storiesQuery.data?.categories || [];

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
                aria-label="Collapse stories"
              >
                <XIcon className={styles.collapseIcon} />
              </button>
              {storiesQuery.isLoading && (
                <div className={styles.loadingContainer}>
                  <LoadingSpinner />
                  <p>Loading stories...</p>
                </div>
              )}
              {storiesQuery.isError && (
                <div className={styles.errorContainer}>
                  <p>Could not load stories.</p>
                  <button onClick={() => storiesQuery.refetch()}>Try again</button>
                </div>
              )}
              {storiesQuery.isSuccess && storiesData.length > 0 && (
                <LifeStories categories={storiesData} onCategorySelect={handleCategorySelect} />
              )}
               {storiesQuery.isSuccess && storiesData.length === 0 && (
                <div className={styles.emptyContainer}>
                  <p>No stories available at the moment.</p>
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
              <span className={styles.collapsedText}>Quick Inspiration</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default StoriesBar;
