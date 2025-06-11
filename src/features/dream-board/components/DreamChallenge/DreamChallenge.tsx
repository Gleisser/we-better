import React, { useState, useRef, useEffect, TouchEvent } from 'react';
import styles from '../../DreamBoardPage.module.css';
import { Dream } from '../../types';
import { DreamChallenge as DreamChallengeType } from '../../api/dreamChallengesApi';

interface DreamChallengeProps {
  dreams?: Dream[];
  activeChallenges: DreamChallengeType[];
  loading: boolean;
  error: string | null;
  onOpenChallengeModal?: () => void;
  onEditChallenge?: (challengeId: string) => void;
  onDeleteChallenge?: (challengeId: string) => void;
  onUpdateChallenge: (data: {
    id: string;
    current_day?: number;
    completed?: boolean;
  }) => Promise<DreamChallengeType | null>;
  onDeleteChallengeAction: (id: string) => Promise<boolean>;
}

const DreamChallenge: React.FC<DreamChallengeProps> = ({
  activeChallenges,
  loading,
  error,
  onOpenChallengeModal = () => {},
  onEditChallenge = () => {},
  onDeleteChallenge = () => {},
  onUpdateChallenge,
  onDeleteChallengeAction,
}) => {
  const hasActiveChallenges = activeChallenges.length > 0;

  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  // Track which challenges have been marked as complete today
  const [markedCompletedToday, setMarkedCompletedToday] = useState<Set<string>>(new Set());

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

  // Handle marking a day as complete
  const handleMarkDayComplete = async (challengeId: string, currentDay: number): Promise<void> => {
    try {
      // Update the challenge's current_day
      await onUpdateChallenge({
        id: challengeId,
        current_day: currentDay + 1,
      });

      // Add the challenge to the marked complete set
      setMarkedCompletedToday(prev => {
        const newSet = new Set(prev);
        newSet.add(challengeId);
        return newSet;
      });

      // Check if the challenge is now completed
      const challenge = activeChallenges.find(c => c.id === challengeId);
      if (challenge && currentDay + 1 >= challenge.duration) {
        // If currentDay + 1 equals or exceeds the duration, mark as completed
        await onUpdateChallenge({
          id: challengeId,
          completed: true,
        });
      }
    } catch (error) {
      console.error('Error marking day complete:', error);
    }
  };

  // Handle undoing a day as complete
  const handleUndoMarkDayComplete = async (
    challengeId: string,
    currentDay: number
  ): Promise<void> => {
    try {
      // Only allow undo if currentDay is greater than 0
      if (currentDay > 0) {
        // Subtract a day from the challenge progress
        await onUpdateChallenge({
          id: challengeId,
          current_day: currentDay - 1,
        });

        // Remove the challenge from the marked complete set
        setMarkedCompletedToday(prev => {
          const newSet = new Set(prev);
          newSet.delete(challengeId);
          return newSet;
        });
      }
    } catch (error) {
      console.error('Error undoing day complete:', error);
    }
  };

  // Handle deleting a challenge
  const handleDeleteChallenge = async (challengeId: string): Promise<void> => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this challenge? This action cannot be undone.'
    );

    if (confirmed) {
      try {
        await onDeleteChallengeAction(challengeId);
        onDeleteChallenge(challengeId); // Notify parent component
      } catch (error) {
        console.error('Error deleting challenge:', error);
      }
    }
  };

  const currentChallenge = hasActiveChallenges ? activeChallenges[currentChallengeIndex] : null;
  const isCurrentChallengeMarkedComplete = currentChallenge
    ? markedCompletedToday.has(currentChallenge.id)
    : false;

  // Show loading state
  if (loading) {
    return (
      <div className={styles.dreamChallengeContainer}>
        <div className={styles.challengeHeader}>
          <h3 className={styles.challengeTitle}>Challenge Mode</h3>
          <button className={styles.newChallengeButton} onClick={onOpenChallengeModal}>
            New Challenge
          </button>
        </div>
        <div className={styles.noChallengeState}>
          <p>Loading challenges...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className={styles.dreamChallengeContainer}>
        <div className={styles.challengeHeader}>
          <h3 className={styles.challengeTitle}>Challenge Mode</h3>
          <button className={styles.newChallengeButton} onClick={onOpenChallengeModal}>
            New Challenge
          </button>
        </div>
        <div className={styles.noChallengeState}>
          <p>Error loading challenges: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dreamChallengeContainer}>
      <div className={styles.challengeHeader}>
        <h3 className={styles.challengeTitle}>Challenge Mode</h3>
        <button className={styles.newChallengeButton} onClick={onOpenChallengeModal}>
          New Challenge
        </button>
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
                  Day {currentChallenge?.current_day} of {currentChallenge?.duration}
                </div>
                <div className={styles.progressBarContainer}>
                  <div
                    className={styles.progressBarFill}
                    style={{
                      width: `${((currentChallenge?.current_day || 0) / (currentChallenge?.duration || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className={styles.challengeActions}>
              {currentChallenge && (
                <>
                  <div className={styles.mainAction}>
                    {isCurrentChallengeMarkedComplete ? (
                      <button
                        className={`${styles.completeButton} ${styles.undoButton}`}
                        onClick={() =>
                          handleUndoMarkDayComplete(
                            currentChallenge.id,
                            currentChallenge.current_day
                          )
                        }
                      >
                        Undo Today Complete
                      </button>
                    ) : (
                      <button
                        className={styles.completeButton}
                        onClick={() =>
                          handleMarkDayComplete(currentChallenge.id, currentChallenge.current_day)
                        }
                      >
                        Mark Today Complete
                      </button>
                    )}
                  </div>

                  <div className={styles.challengeManagementActions}>
                    <button
                      className={styles.editButton}
                      onClick={() => onEditChallenge(currentChallenge.id)}
                      title="Edit Challenge"
                    >
                      ✏️
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDeleteChallenge(currentChallenge.id)}
                      title="Delete Challenge"
                    >
                      🗑️
                    </button>
                  </div>
                </>
              )}
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
