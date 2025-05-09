import React from 'react';
import styles from '../../DreamBoardPage.module.css';
import { Dream } from '../../types';

interface DreamProgressProps {
  dreams: Dream[];
  handleOpenMilestoneManager: (dreamId: string) => void;
}

const DreamProgress: React.FC<DreamProgressProps> = ({ dreams, handleOpenMilestoneManager }) => {
  return (
    <section className={styles.progressSection}>
      <h2>Dream Progress</h2>
      <div className={styles.dreamsProgress}>
        {dreams.map(dream => (
          <div key={dream.id} className={styles.dreamProgressCard}>
            <h3>{dream.title}</h3>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${dream.progress * 100}%` }} />
            </div>
            <span className={styles.progressText}>{Math.round(dream.progress * 100)}%</span>
            <div className={styles.milestonesInfo}>
              {dream.milestones.filter(m => m.completed).length} of {dream.milestones.length}{' '}
              milestones completed
            </div>

            {/* Milestone Management Button */}
            <button
              className={styles.manageMilestonesButton}
              onClick={() => handleOpenMilestoneManager(dream.id)}
            >
              Manage Milestones
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default DreamProgress;
