import React, { useState, useRef, useEffect, TouchEvent } from 'react';
import styles from '../../DreamBoardPage.module.css';

interface Challenge {
  id: string;
  title: string;
  description: string;
  dreamId: string;
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

  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // For swiping functionality
  const handleTouchStart = (e: TouchEvent): void => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent): void => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (): void => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isSwipe = Math.abs(distance) > 50; // Minimum distance for a swipe

    if (isSwipe) {
      if (distance > 0) {
        // Swipe left, go to next
        navigateToChallenge('next');
      } else {
        // Swipe right, go to previous
        navigateToChallenge('prev');
      }
    }

    // Reset values
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Reset index when challenges change
  useEffect(() => {
    if (currentChallengeIndex >= activeChallenges.length) {
      setCurrentChallengeIndex(0);
    }
  }, [activeChallenges.length, currentChallengeIndex]);

  const navigateToChallenge = (direction: 'prev' | 'next'): void => {
    if (direction === 'prev') {
      setCurrentChallengeIndex(prevIndex =>
        prevIndex === 0 ? activeChallenges.length - 1 : prevIndex - 1
      );
    } else {
      setCurrentChallengeIndex(prevIndex =>
        prevIndex === activeChallenges.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const currentChallenge = hasActiveChallenges ? activeChallenges[currentChallengeIndex] : null;

  return (
    <div className={styles.dreamChallengeContainer}>
      <div className={styles.challengeHeader}>
        <h3 className={styles.challengeTitle}>Challenge Mode</h3>
        <button className={styles.newChallengeButton}>New Challenge</button>
      </div>

      {hasActiveChallenges ? (
        <>
          <div
            className={styles.activeChallengeCard}
            ref={cardRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className={styles.challengeInfo}>
              <span className={styles.challengeName}>{currentChallenge?.title}</span>

              {activeChallenges.length > 1 && (
                <div className={styles.carouselIndicators}>
                  {activeChallenges.map((_, index) => (
                    <span
                      key={index}
                      className={`${styles.indicator} ${index === currentChallengeIndex ? styles.activeIndicator : ''}`}
                      onClick={() => setCurrentChallengeIndex(index)}
                    />
                  ))}
                </div>
              )}

              <div className={styles.challengeDescription}>{currentChallenge?.description}</div>

              <div className={styles.challengeProgress}>
                <div className={styles.progressText}>
                  Day {currentChallenge?.currentDay} of {currentChallenge?.duration}
                </div>
                <div className={styles.progressBarContainer}>
                  <div
                    className={styles.progressBarFill}
                    style={{
                      width: `${((currentChallenge?.currentDay || 0) / (currentChallenge?.duration || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className={styles.challengeActions}>
              <button className={styles.completeButton}>Mark Today Complete</button>
            </div>
          </div>

          {activeChallenges.length > 1 && (
            <div className={styles.carouselControls}>
              <button
                className={styles.carouselButton}
                onClick={() => navigateToChallenge('prev')}
                aria-label="Previous challenge"
              >
                ←
              </button>
              <div className={styles.carouselCounter}>
                {currentChallengeIndex + 1} / {activeChallenges.length}
              </div>
              <button
                className={styles.carouselButton}
                onClick={() => navigateToChallenge('next')}
                aria-label="Next challenge"
              >
                →
              </button>
            </div>
          )}
        </>
      ) : (
        <div className={styles.noChallengeState}>
          <p>No active challenges. Start a new one!</p>
        </div>
      )}
    </div>
  );
};

export default DreamChallenge;
