import React, { useState, useRef, useEffect } from 'react';
import { Dream } from '../../types';
import styles from './DreamExplorer.module.css';
import { CosmicDreamExplorer } from './CosmicDreamExplorer';

interface DreamExplorerProps {
  dreams: Dream[];
  onDreamSelect: (dream: Dream) => void;
  activeDream: Dream | null;
}

export const DreamExplorer: React.FC<DreamExplorerProps> = ({
  dreams,
  onDreamSelect,
  activeDream,
}) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'classic' | 'cosmic'>('cosmic');
  const cardContainerRef = useRef<HTMLDivElement>(null);

  // Set active dream when index changes
  useEffect(() => {
    if (dreams.length > 0) {
      onDreamSelect(dreams[activeIndex]);
    }
  }, [activeIndex, dreams, onDreamSelect]);

  // Set index when active dream changes externally
  useEffect(() => {
    if (activeDream) {
      const index = dreams.findIndex(dream => dream.id === activeDream.id);
      if (index !== -1 && index !== activeIndex) {
        setActiveIndex(index);
      }
    }
  }, [activeDream, dreams, activeIndex]);

  const navigateToDream = (index: number): void => {
    if (isAnimating || index === activeIndex) return;

    setIsAnimating(true);
    setActiveIndex(index);

    // Reset animation state after transition completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };

  const handlePrevious = (): void => {
    if (activeIndex > 0) {
      navigateToDream(activeIndex - 1);
    } else {
      // Loop to the end
      navigateToDream(dreams.length - 1);
    }
  };

  const handleNext = (): void => {
    if (activeIndex < dreams.length - 1) {
      navigateToDream(activeIndex + 1);
    } else {
      // Loop to the beginning
      navigateToDream(0);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const getCategoryColor = (category: string): string => {
    const categoryColors: Record<string, string> = {
      Travel: '#4FD1C5',
      Skills: '#9F7AEA',
      Finance: '#F6AD55',
      Health: '#68D391',
      Relationships: '#FC8181',
      Career: '#63B3ED',
      Education: '#F687B3',
      Spirituality: '#B794F4',
    };

    return categoryColors[category] || '#8B5CF6';
  };

  // Toggle view between classic and cosmic modes
  const toggleViewMode = (): void => {
    setViewMode(viewMode === 'classic' ? 'cosmic' : 'classic');
  };

  return (
    <div className={styles.dreamExplorer}>
      <div className={styles.explorerHeader}>
        <h2>Dream Explorer</h2>
        <div className={styles.headerControls}>
          <button className={styles.viewToggleButton} onClick={toggleViewMode}>
            {viewMode === 'classic' ? 'Cosmic View' : 'Classic View'}
          </button>
          <div className={styles.dreamCounter}>
            {activeIndex + 1} / {dreams.length}
          </div>
        </div>
      </div>

      {viewMode === 'cosmic' ? (
        <CosmicDreamExplorer
          dreams={dreams}
          onDreamSelect={onDreamSelect}
          activeDream={activeDream}
        />
      ) : (
        <>
          <div className={styles.cardContainer} ref={cardContainerRef}>
            {dreams.map((dream, index) => {
              // Calculate card position
              const position = index - activeIndex;

              // Only render cards that are visible in the carousel
              if (Math.abs(position) > 2) return null;

              // Calculate z-index to ensure proper stacking
              const zIndex = 10 - Math.abs(position);

              // Apply different transforms based on position
              let transform = '';
              let opacity = 1;

              if (position === 0) {
                // Active card
                transform = 'translateX(0) scale(1)';
              } else if (position < 0) {
                // Cards to the left
                transform = `translateX(${position * 60}%) scale(${1 - Math.abs(position) * 0.2})`;
                opacity = 0.7 - Math.abs(position) * 0.2;
              } else {
                // Cards to the right
                transform = `translateX(${position * 60}%) scale(${1 - Math.abs(position) * 0.2})`;
                opacity = 0.7 - Math.abs(position) * 0.2;
              }

              return (
                <div
                  key={dream.id}
                  className={`${styles.dreamCard} ${position === 0 ? styles.activeDream : ''}`}
                  style={{
                    transform,
                    opacity,
                    zIndex,
                    borderColor: getCategoryColor(dream.category),
                  }}
                  onClick={() => navigateToDream(index)}
                >
                  <div
                    className={styles.cardCategory}
                    style={{ backgroundColor: getCategoryColor(dream.category) }}
                  >
                    {dream.category}
                  </div>
                  <h3 className={styles.cardTitle}>{dream.title}</h3>
                  <div className={styles.cardTimeframe}>
                    {dream.timeframe
                      .split('-')
                      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(' ')}
                  </div>
                  <p className={styles.cardDescription}>{dream.description}</p>
                  <div className={styles.cardProgress}>
                    <div className={styles.progressLabel}>Progress</div>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressFill}
                        style={{ width: `${dream.progress * 100}%` }}
                      />
                    </div>
                    <div className={styles.progressPercentage}>
                      {Math.round(dream.progress * 100)}%
                    </div>
                  </div>
                  <div className={styles.cardMeta}>
                    <div className={styles.cardDate}>Created: {formatDate(dream.createdAt)}</div>
                    <div className={styles.milestoneCount}>
                      {dream.milestones.filter(m => m.completed).length}/{dream.milestones.length}{' '}
                      milestones
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className={styles.navigationControls}>
            <button className={styles.navButton} onClick={handlePrevious} disabled={isAnimating}>
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" fill="currentColor" />
              </svg>
            </button>

            <div className={styles.dreamIndicators}>
              {dreams.map((dream, index) => (
                <button
                  key={dream.id}
                  className={`${styles.dreamIndicator} ${index === activeIndex ? styles.activeDreamIndicator : ''}`}
                  onClick={() => navigateToDream(index)}
                  style={{
                    backgroundColor:
                      index === activeIndex ? getCategoryColor(dream.category) : undefined,
                  }}
                />
              ))}
            </div>

            <button className={styles.navButton} onClick={handleNext} disabled={isAnimating}>
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" fill="currentColor" />
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
