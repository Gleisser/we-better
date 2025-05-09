import React, { useEffect, useRef, useState } from 'react';
import { Milestone } from '../../types';
import styles from './TimelineComponent.module.css';

interface TimelineComponentProps {
  milestones: Milestone[];
  formatDisplayDate: (dateString?: string) => string;
  dreamTitle: string;
}

const TimelineComponent: React.FC<TimelineComponentProps> = ({
  milestones,
  formatDisplayDate,
  dreamTitle,
}) => {
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

  // Calculate project progress for progress bar, excluding the goal itself
  const progressPercentage = React.useMemo(() => {
    if (milestones.length === 0) return 0;
    const completedCount = milestones.filter(m => m.completed).length;
    // Just show the percentage of completed milestones
    return Math.round((completedCount / milestones.length) * 100);
  }, [milestones]);

  // Generate timeline markers based on user milestones
  const timelineMarkers = React.useMemo(() => {
    if (sortedMilestones.length === 0) return [];

    // Calculate total timeline spaces between milestones
    const spacing = 100 / (sortedMilestones.length + 1); // +1 for the final goal (dream title)

    // Create markers for each milestone plus the final goal
    const markers = sortedMilestones.map((milestone, index) => {
      const position = spacing * (index + 1);
      return {
        id: milestone.id,
        title: milestone.title,
        description: milestone.description || '',
        position: `${position}%`,
        date: milestone.date,
        completed: milestone.completed,
      };
    });

    // Add the final goal (dream title) at the end
    markers.push({
      id: 'dream-goal',
      title: dreamTitle,
      description: 'Goal Completion',
      position: '100%',
      date: '',
      completed: false,
    });

    return markers;
  }, [sortedMilestones, dreamTitle]);

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

            {/* Timeline date markers - now using the user's milestones */}
            {timelineMarkers.map(marker => (
              <div key={marker.id} className={styles.dateMarker} style={{ left: marker.position }}>
                <div
                  className={`${styles.markerDot} ${marker.completed ? styles.completedMarker : ''}`}
                >
                  {/* Only add svg check if completed - no content in the CSS */}
                  {marker.completed && (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M5 12L10 17L19 8"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <div className={styles.markerLabel}>
                  {marker.date ? formatDisplayDate(marker.date) : 'Goal'}
                </div>
                <div className={styles.markerSubLabel}>{marker.title}</div>
                {marker.description && (
                  <div className={styles.markerDescription}>{marker.description}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineComponent;
