import React, { useEffect, useState } from 'react';
import { Dream } from '../../types';
import { useDreamProgress } from '../../hooks/useDreamProgress';
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
  const {
    updateDreamProgress: updateProgressBackend,
    getProgressForDream,
    loading,
    error,
  } = useDreamProgress();
  const [dreamProgresses, setDreamProgresses] = useState<Record<string, number>>({});

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
        <h2>Quick Vision</h2>
        <div className={styles.miniBoardHeaderControls}>
          <button className={styles.dreamBoardButton} onClick={openDreamBoardModal}>
            <span className={styles.dreamBoardButtonIcon}>🎨</span>
            <span>My Dream Board</span>
          </button>
          <button
            className={expandedMiniBoard ? styles.minimizeButton : styles.expandButton}
            onClick={toggleMiniBoard}
          >
            <span>{expandedMiniBoard ? 'Minimize' : 'Expand'}</span>
          </button>
        </div>
      </div>

      {/* Show error state */}
      {error && (
        <div className={styles.errorState}>
          <span>Error: {error}</span>
        </div>
      )}

      <div className={styles.miniBoardContent}>
        {dreams.slice(0, 3).map(dream => {
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
                    aria-label="Decrease progress"
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
                    aria-label="Increase progress"
                  >
                    <span className={styles.buttonIcon}>+</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default QuickVision;
