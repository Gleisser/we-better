import React, { useEffect, useRef, useState } from 'react';
import { Milestone } from '../../types';
import styles from './TimelineComponent.module.css';

interface TimelineComponentProps {
  milestones: Milestone[];
  formatDisplayDate: (dateString?: string) => string;
}

const TimelineComponent: React.FC<TimelineComponentProps> = ({ milestones, formatDisplayDate }) => {
  const timelineWrapperRef = useRef<HTMLDivElement>(null);
  const [showScrollIndicators, setShowScrollIndicators] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Filter milestones with dates and sort them chronologically
  const sortedMilestones = React.useMemo(() => {
    return milestones
      .filter(m => m.date)
      .sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateA - dateB;
      });
  }, [milestones]);

  // Calculate project progress for progress bar
  const progressPercentage = React.useMemo(() => {
    if (milestones.length === 0) return 0;
    const completedCount = milestones.filter(m => m.completed).length;
    return Math.round((completedCount / milestones.length) * 100);
  }, [milestones]);

  // Check if the timeline is scrollable and update indicators
  useEffect(() => {
    const checkScroll = (): void => {
      if (timelineWrapperRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = timelineWrapperRef.current;

        // Is the content wider than the container?
        setShowScrollIndicators(scrollWidth > clientWidth);

        // Can we scroll left?
        setCanScrollLeft(scrollLeft > 0);

        // Can we scroll right?
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
      }
    };

    // Initial check
    checkScroll();

    // Add scroll event listener
    const wrapperElement = timelineWrapperRef.current;
    if (wrapperElement) {
      wrapperElement.addEventListener('scroll', checkScroll);

      // Check on window resize too
      window.addEventListener('resize', checkScroll);
    }

    return () => {
      if (wrapperElement) {
        wrapperElement.removeEventListener('scroll', checkScroll);
      }
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  // Helper function to scroll timeline
  const scrollTimeline = (direction: 'left' | 'right'): void => {
    if (timelineWrapperRef.current) {
      const scrollAmount = 300; // Scroll by 300px
      const currentScroll = timelineWrapperRef.current.scrollLeft;

      timelineWrapperRef.current.scrollTo({
        left: direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Mouse drag handlers for timeline
  const handleMouseDown = (e: React.MouseEvent): void => {
    if (timelineWrapperRef.current) {
      setIsDragging(true);
      setStartX(e.pageX - timelineWrapperRef.current.offsetLeft);
      setScrollLeft(timelineWrapperRef.current.scrollLeft);

      // Change cursor to indicate grabbing
      timelineWrapperRef.current.style.cursor = 'grabbing';
    }
  };

  const handleMouseMove = (e: React.MouseEvent): void => {
    if (!isDragging || !timelineWrapperRef.current) return;

    // Prevent default to stop text selection during drag
    e.preventDefault();

    const x = e.pageX - timelineWrapperRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Multiply by 2 for faster scrolling
    timelineWrapperRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = (): void => {
    setIsDragging(false);
    if (timelineWrapperRef.current) {
      timelineWrapperRef.current.style.cursor = '';
    }
  };

  const handleMouseLeave = (): void => {
    if (isDragging) {
      setIsDragging(false);
      if (timelineWrapperRef.current) {
        timelineWrapperRef.current.style.cursor = '';
      }
    }
  };

  // Touch handlers for mobile devices
  const handleTouchStart = (e: React.TouchEvent): void => {
    if (timelineWrapperRef.current) {
      setIsDragging(true);
      setStartX(e.touches[0].clientX - timelineWrapperRef.current.offsetLeft);
      setScrollLeft(timelineWrapperRef.current.scrollLeft);
    }
  };

  const handleTouchMove = (e: React.TouchEvent): void => {
    if (!isDragging || !timelineWrapperRef.current) return;

    const x = e.touches[0].clientX - timelineWrapperRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    timelineWrapperRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = (): void => {
    setIsDragging(false);
  };

  if (sortedMilestones.length === 0) {
    return (
      <div className={styles.emptyTimeline}>
        <p>No milestone dates set. Add target dates to your milestones to see a timeline.</p>
      </div>
    );
  }

  // Generate timeline milestones based on the reference image
  return (
    <div className={styles.timelineContainer}>
      {showScrollIndicators && (
        <>
          {canScrollLeft && (
            <button
              className={`${styles.scrollButton} ${styles.scrollLeft}`}
              onClick={() => scrollTimeline('left')}
              aria-label="Scroll timeline left"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15 6L9 12L15 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
          {canScrollRight && (
            <button
              className={`${styles.scrollButton} ${styles.scrollRight}`}
              onClick={() => scrollTimeline('right')}
              aria-label="Scroll timeline right"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 6L15 12L9 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </>
      )}

      <div
        className={styles.timelineWrapper}
        ref={timelineWrapperRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag indicator shown at the top of the timeline */}
        <div className={styles.dragIndicator}>
          <div className={styles.dragHandle}></div>
        </div>

        <div className={styles.timelineContent}>
          <div className={styles.timelineTrack}>
            {sortedMilestones.map(milestone => {
              const isCompleted = milestone.completed;
              const milestoneDate = milestone.date ? new Date(milestone.date) : new Date();

              // Calculate label positions for evenly distributed dates
              const dateLabels = [
                { date: new Date('2024-01-20'), label: 'Jan 20', position: '0%' },
                { date: new Date('2024-02-14'), label: 'Feb 14', position: '16.6%' },
                { date: new Date('2024-03-08'), label: 'Mar 8', position: '33.3%' },
                { date: new Date('2024-04-30'), label: 'Apr 30', position: '50%' },
                { date: new Date('2024-06-07'), label: 'Jun 7', position: '66.6%' },
                { date: new Date('2024-09-16'), label: 'Sep 16', position: '100%' },
              ];

              // Find which date segment this milestone belongs to
              let position = '0%';
              for (let i = 0; i < dateLabels.length - 1; i++) {
                if (
                  milestoneDate >= dateLabels[i].date &&
                  milestoneDate <= dateLabels[i + 1].date
                ) {
                  const segmentStart = dateLabels[i].date.getTime();
                  const segmentEnd = dateLabels[i + 1].date.getTime();
                  const segmentRange = segmentEnd - segmentStart;
                  const milestonePosition = milestoneDate.getTime() - segmentStart;

                  const startPos = parseFloat(dateLabels[i].position);
                  const endPos = parseFloat(dateLabels[i + 1].position);
                  const posRange = endPos - startPos;

                  const percentInSegment = milestonePosition / segmentRange;
                  const finalPosition = startPos + percentInSegment * posRange;

                  position = `${finalPosition}%`;
                  break;
                }
              }

              return (
                <div
                  key={milestone.id}
                  className={styles.milestonePoint}
                  style={{ left: position }}
                >
                  <div className={`${styles.milestoneIcon} ${isCompleted ? styles.completed : ''}`}>
                    {isCompleted ? '✓' : ''}
                  </div>
                  <div className={styles.milestoneInfo}>
                    <span className={styles.milestoneTitle}>{milestone.title}</span>
                    <span className={styles.milestoneDate}>
                      {formatDisplayDate(milestone.date)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Timeline track with dates */}
          <div className={styles.timelineAxis}>
            <div className={styles.timelineProgress}>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Progress Badge */}
            <div className={styles.progressBadge} style={{ left: `${progressPercentage}%` }}>
              <div className={styles.badgeContent}>{progressPercentage}%</div>
            </div>

            {/* Timeline date markers */}
            <div className={styles.dateMarker} style={{ left: '0%' }}>
              <div className={`${styles.markerDot} ${styles.completedMarker}`}></div>
              <div className={styles.markerLabel}>Jan 20</div>
              <div className={styles.markerSubLabel}>Start of Evaluation</div>
              <div className={styles.markerDescription}>Preparation</div>
            </div>

            <div className={styles.dateMarker} style={{ left: '16.6%' }}>
              <div className={`${styles.markerDot} ${styles.completedMarker}`}></div>
              <div className={styles.markerLabel}>Feb 14</div>
              <div className={styles.markerSubLabel}>Initial Scoping</div>
              <div className={styles.markerDescription}>Data checking</div>
            </div>

            <div className={styles.dateMarker} style={{ left: '33.3%' }}>
              <div className={`${styles.markerDot} ${styles.completedMarker}`}></div>
              <div className={styles.markerLabel}>Mar 8</div>
              <div className={styles.markerSubLabel}>Validation</div>
              <div className={styles.markerDescription}>Completed proof of concept</div>
            </div>

            <div className={styles.dateMarker} style={{ left: '50%' }}>
              <div className={`${styles.markerDot} ${styles.completedMarker}`}></div>
              <div className={styles.markerLabel}>Apr 30</div>
              <div className={styles.markerSubLabel}>Contracting</div>
              <div className={styles.markerDescription}>Signed Contract</div>
            </div>

            <div className={styles.dateMarker} style={{ left: '66.6%' }}>
              <div className={`${styles.markerDot} ${styles.completedMarker}`}></div>
              <div className={styles.markerLabel}>Jun 7</div>
              <div className={styles.markerSubLabel}>Migration</div>
              <div className={styles.markerDescription}>All information is migrated</div>
            </div>

            <div className={styles.dateMarker} style={{ left: '100%' }}>
              <div className={styles.markerDot}></div>
              <div className={styles.markerLabel}>Sep 16</div>
              <div className={styles.markerSubLabel}>Global Launch</div>
              <div className={styles.markerDescription}>In Asia, Australia, Latin America</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineComponent;
