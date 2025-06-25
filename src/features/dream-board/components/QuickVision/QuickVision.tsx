import React, { useEffect, useState, useRef } from 'react';
import { Dream } from '../../types';
import { useDreamProgress } from '../../hooks/useDreamProgress';
import { useCommonTranslation } from '@/shared/hooks/useTranslation';
import styles from '../../DreamBoardPage.module.css';

interface QuickVisionProps {
  dreams: Dream[];
  expandedMiniBoard: boolean;
  toggleMiniBoard: () => void;
  updateDreamProgress: (dreamId: string, adjustment: number) => void;
  openDreamBoardModal: () => void;
}

const QuickVision: React.FC<QuickVisionProps> = ({
  dreams,
  expandedMiniBoard,
  toggleMiniBoard,
  updateDreamProgress: externalUpdateDreamProgress,
  openDreamBoardModal,
}) => {
  const { t } = useCommonTranslation();

  const {
    updateDreamProgress: updateProgressBackend,
    getProgressForDream,
    loading,
    error,
  } = useDreamProgress();
  const [dreamProgresses, setDreamProgresses] = useState<Record<string, number>>({});
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Initialize progress values from backend when component mounts
  useEffect(() => {
    const loadProgressValues = async (): Promise<void> => {
      const progressMap: Record<string, number> = {};

      for (const dream of dreams) {
        try {
          // Get latest progress from backend
          const latestProgress = await getProgressForDream(dream.id);
          if (latestProgress !== undefined) {
            progressMap[dream.id] = latestProgress;
          } else {
            // Use the current progress from the dream object as fallback
            progressMap[dream.id] = dream.progress;
          }
        } catch (error) {
          console.error(`Error loading progress for dream ${dream.id}:`, error);
          progressMap[dream.id] = dream.progress;
        }
      }

      setDreamProgresses(progressMap);
    };

    if (dreams.length > 0) {
      loadProgressValues();
    }
  }, [dreams, getProgressForDream]);

  // Check if scroll indicator should be shown
  useEffect(() => {
    const checkScrollNeeded = (): void => {
      if (scrollContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
        const hasMoreContent = scrollHeight > clientHeight + 2; // Small buffer for rounding
        const canScrollDown = scrollTop < scrollHeight - clientHeight - 10; // 10px threshold
        setShowScrollIndicator(hasMoreContent && canScrollDown);
      }
    };

    // Add a small delay to ensure DOM is updated
    const timeoutId = setTimeout(checkScrollNeeded, 100);

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', checkScrollNeeded);
      return () => {
        scrollContainer.removeEventListener('scroll', checkScrollNeeded);
        clearTimeout(timeoutId);
      };
    }

    return () => clearTimeout(timeoutId);
  }, [dreams, expandedMiniBoard]);

  // Handle scroll indicator click
  const handleScrollDown = (): void => {
    if (scrollContainerRef.current) {
      const { clientHeight } = scrollContainerRef.current;
      scrollContainerRef.current.scrollBy({
        top: clientHeight * 0.7, // Scroll 70% of visible height
        behavior: 'smooth',
      });
    }
  };

  // Enhanced updateDreamProgress function that saves to backend
  const handleDreamProgressUpdate = async (dreamId: string, adjustment: number): Promise<void> => {
    const dream = dreams.find(d => d.id === dreamId);
    if (!dream) {
      console.error('Dream not found:', dreamId);
      return;
    }

    try {
      // Update backend first
      const newProgress = await updateProgressBackend(dreamId, adjustment, dream);

      if (newProgress !== null) {
        // Update local state with the new progress from backend
        setDreamProgresses(prev => ({
          ...prev,
          [dreamId]: newProgress,
        }));

        // Call the external update function to update the parent component's state
        externalUpdateDreamProgress(dreamId, adjustment);
      } else {
        // Backend update failed, show error
        console.error('Failed to update progress in backend');
      }
    } catch (error) {
      console.error('Error updating dream progress:', error);
    }
  };

  // Get icon based on category
  const getIconForCategory = (category: string): string => {
    const icons: Record<string, string> = {
      Travel: '✈️',
      Skills: '🎯',
      Finance: '💰',
      Health: '💪',
      Relationships: '❤️',
      Career: '💼',
      Education: '🎓',
      Spirituality: '✨',
    };
    return icons[category] || '🌟';
  };

  return (
    <section className={`${styles.miniBoard} ${expandedMiniBoard ? styles.expanded : ''}`}>
      <div className={styles.miniBoardHeader}>
        <h2>{t('dreamBoard.quickVision.title')}</h2>
        <div className={styles.miniBoardHeaderControls}>
          <button className={styles.dreamBoardButton} onClick={openDreamBoardModal}>
            <span className={styles.dreamBoardButtonIcon}>🎨</span>
            <span>{t('dreamBoard.quickVision.myDreamBoard')}</span>
          </button>
          <button
            className={expandedMiniBoard ? styles.minimizeButton : styles.expandButton}
            onClick={toggleMiniBoard}
          >
            <span>
              {expandedMiniBoard
                ? t('dreamBoard.quickVision.minimize')
                : t('dreamBoard.quickVision.expand')}
            </span>
          </button>
        </div>
      </div>

      {/* Show error state */}
      {error && (
        <div className={styles.errorState}>
          <span>{t('dreamBoard.quickVision.errorLoading', { error })}</span>
        </div>
      )}

      <div className={styles.miniBoardContentWrapper}>
        <div ref={scrollContainerRef} className={styles.miniBoardContent}>
          {dreams.map(dream => {
            // Use progress from backend state, fallback to dream.progress
            const currentProgress = dreamProgresses[dream.id] ?? dream.progress;

            return (
              <div key={dream.id} className={styles.miniDream}>
                <div className={styles.dreamIcon}>{getIconForCategory(dream.category)}</div>

                <div className={styles.dreamContentWrapper}>
                  <div className={styles.dreamTitle}>{dream.title}</div>
                  <div className={styles.progressContainer}>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressIndicator}
                        style={{ width: `${currentProgress * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.dreamStatus}>
                  <div className={styles.progressControls}>
                    <button
                      className={styles.progressButton}
                      onClick={e => {
                        e.stopPropagation();
                        handleDreamProgressUpdate(dream.id, -0.1);
                      }}
                      disabled={currentProgress <= 0 || loading}
                      aria-label={t('dreamBoard.quickVision.decreaseProgress') as string}
                    >
                      <span className={styles.buttonIcon}>-</span>
                    </button>
                    <div className={styles.progressValue}>{Math.round(currentProgress * 100)}%</div>
                    <button
                      className={styles.progressButton}
                      onClick={e => {
                        e.stopPropagation();
                        handleDreamProgressUpdate(dream.id, 0.1);
                      }}
                      disabled={currentProgress >= 1 || loading}
                      aria-label={t('dreamBoard.quickVision.increaseProgress') as string}
                    >
                      <span className={styles.buttonIcon}>+</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Scroll indicator */}
        {showScrollIndicator && (
          <button
            className={styles.scrollIndicator}
            onClick={handleScrollDown}
            aria-label={t('dreamBoard.quickVision.scrollToSeeMore') as string}
          >
            <span className={styles.scrollArrow}>⬇</span>
          </button>
        )}
      </div>
    </section>
  );
};

export default QuickVision;
