import React from 'react';
import { Dream } from '../../types';
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
  updateDreamProgress,
  openDreamBoardModal,
}) => {
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
      <div className={styles.miniBoardContent}>
        {dreams.slice(0, 3).map(dream => (
          <div key={dream.id} className={styles.miniDream}>
            <div className={styles.dreamIcon}>{getIconForCategory(dream.category)}</div>

            <div className={styles.dreamContentWrapper}>
              <div className={styles.dreamTitle}>{dream.title}</div>
              <div className={styles.progressContainer}>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressIndicator}
                    style={{ width: `${dream.progress * 100}%` }}
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
                    updateDreamProgress(dream.id, -0.1);
                  }}
                  disabled={dream.progress <= 0}
                  aria-label="Decrease progress"
                >
                  <span className={styles.buttonIcon}>-</span>
                </button>
                <div className={styles.progressValue}>{Math.round(dream.progress * 100)}%</div>
                <button
                  className={styles.progressButton}
                  onClick={e => {
                    e.stopPropagation();
                    updateDreamProgress(dream.id, 0.1);
                  }}
                  disabled={dream.progress >= 1}
                  aria-label="Increase progress"
                >
                  <span className={styles.buttonIcon}>+</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default QuickVision;
