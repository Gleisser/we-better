import React from 'react';
import styles from '../../DreamBoardPage.module.css';

interface Challenge {
  id: string;
  title: string;
  duration: number;
  currentDay: number;
  completed: boolean;
}

interface DreamChallengeProps {
  challenges: Challenge[];
}

const DreamChallenge: React.FC<DreamChallengeProps> = ({ challenges }) => {
  const activeChallenges = challenges.filter(c => !c.completed);
  const hasActiveChallenges = activeChallenges.length > 0;

  return (
    <div className={styles.dreamChallengeContainer}>
      <div className={styles.challengeHeader}>
        <h3 className={styles.challengeTitle}>Challenge Mode</h3>
        <button className={styles.newChallengeButton}>New Challenge</button>
      </div>

      {hasActiveChallenges ? (
        <div className={styles.activeChallengeCard}>
          <div className={styles.challengeInfo}>
            <span className={styles.challengeName}>{activeChallenges[0].title}</span>
            <div className={styles.challengeProgress}>
              <div className={styles.progressText}>
                Day {activeChallenges[0].currentDay} of {activeChallenges[0].duration}
              </div>
              <div className={styles.progressBarContainer}>
                <div
                  className={styles.progressBarFill}
                  style={{
                    width: `${(activeChallenges[0].currentDay / activeChallenges[0].duration) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
          <div className={styles.challengeActions}>
            <button className={styles.completeButton}>Mark Today Complete</button>
          </div>
        </div>
      ) : (
        <div className={styles.noChallengeState}>
          <p>No active challenges. Start a new one!</p>
        </div>
      )}

      {activeChallenges.length > 1 && (
        <div className={styles.moreChallenges}>
          <span>{activeChallenges.length - 1} more active challenges</span>
        </div>
      )}
    </div>
  );
};

export default DreamChallenge;
