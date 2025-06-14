import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LifeWheelProps, LifeCategory } from './types';
import {
  DEFAULT_LIFE_CATEGORIES,
  MAX_CATEGORY_VALUE,
  MIN_CATEGORY_VALUE,
} from './constants/categories';
import RadarChart from './components/RadarChart/RadarChart';
import styles from './LifeWheel.module.css';
import { saveLifeWheelData, getLatestLifeWheelData } from './api/lifeWheelApi';

/**
 * Life Wheel component for visualizing and managing different life areas
 *
 * @param data - Life wheel data containing categories and values
 * @param isLoading - Loading state flag
 * @param error - Error object if any
 * @param onCategoryUpdate - Callback for when a category value is updated
 * @param onComplete - Callback for when all categories have been reviewed
 * @param className - Additional CSS class
 * @param readOnly - Whether the wheel is editable or just for display
 */
const LifeWheel = ({
  data,
  isLoading: externalLoading = false,
  error: externalError = null,
  onCategoryUpdate,
  onComplete,
  className = '',
  readOnly = false,
}: LifeWheelProps): JSX.Element => {
  // Internal loading and error states
  const [isLoading, setIsLoading] = useState(externalLoading);
  const [error, setError] = useState<Error | null>(externalError);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Use provided data or default values
  const [categories, setCategories] = useState<LifeCategory[]>(
    data?.categories || DEFAULT_LIFE_CATEGORIES
  );

  // Refs for category elements to highlight
  const categoryRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Active category for focused editing - keeping this for future functionality
  const [, setSelectedCategory] = useState<string | null>(null);

  // Tour guide state
  const [showTour, setShowTour] = useState(false);
  const [currentTourStep, setCurrentTourStep] = useState(0);
  const [highlightPosition, setHighlightPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Load latest life wheel data if no external data is provided
  useEffect(() => {
    if (!data && !externalLoading) {
      setIsLoading(true);
      getLatestLifeWheelData()
        .then(response => {
          if (response.entry) {
            setCategories(response.entry.categories);
          }
          setIsLoading(false);
        })
        .catch(err => {
          console.error('Error loading life wheel data:', err);
          setError(new Error('Failed to load life wheel data. Please try again.'));
          setIsLoading(false);
        });
    }
  }, [data, externalLoading]);

  // Handle category selection
  const handleCategorySelect = useCallback(
    (category: LifeCategory) => {
      if (readOnly) return;
      setSelectedCategory(category.id);
    },
    [readOnly]
  );

  // Handle value change
  const handleValueChange = useCallback(
    (categoryId: string, newValue: number) => {
      if (readOnly) return;

      // Update local state
      setCategories(prev =>
        prev.map(cat => (cat.id === categoryId ? { ...cat, value: newValue } : cat))
      );

      // Call the external handler if provided
      onCategoryUpdate?.(categoryId, newValue);
    },
    [onCategoryUpdate, readOnly]
  );

  // Handle complete button click - saves data and completes assessment
  const handleComplete = useCallback(async () => {
    if (readOnly) return;

    // First save the data
    try {
      setIsSaving(true);
      setSaveSuccess(false);
      setError(null); // Clear any previous errors

      // Call API to save data
      await saveLifeWheelData({ categories });

      // Show success message briefly
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000); // Clear success message after 3 seconds

      // Then call the onComplete callback if provided
      if (onComplete) {
        onComplete();
      }
    } catch (err: unknown) {
      console.error('Error saving life wheel data before completion:', err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to save your life wheel data. Please try again.';
      setError(new Error(errorMessage));

      // Show error for 5 seconds
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsSaving(false);
    }
  }, [categories, onComplete, readOnly]);

  // Start the tour
  const startTour = useCallback(() => {
    setShowTour(true);
    setCurrentTourStep(0);
  }, []);

  // End the tour
  const endTour = useCallback(() => {
    setShowTour(false);
    setCurrentTourStep(0);
  }, []);

  // Move to the next tour step
  const nextTourStep = useCallback(() => {
    if (currentTourStep < categories.length) {
      setCurrentTourStep(prev => prev + 1);
    } else {
      endTour();
    }
  }, [currentTourStep, categories.length, endTour]);

  // Move to the previous tour step
  const prevTourStep = useCallback(() => {
    if (currentTourStep > 0) {
      setCurrentTourStep(prev => prev - 1);
    }
  }, [currentTourStep]);

  // Skip tour (added functionality)
  const skipTour = useCallback(() => {
    endTour();
    localStorage.setItem('lifeWheelTourSeen', 'true');
  }, [endTour]);

  // Update window dimensions on resize
  useEffect(() => {
    const handleResize = (): void => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Show welcome tour automatically on first render
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('lifeWheelTourSeen');
    if (!hasSeenTour) {
      startTour();
    }
  }, [startTour]);

  // Update highlight position when tour step changes
  useEffect(() => {
    if (!showTour || currentTourStep === 0 || currentTourStep > categories.length) {
      return;
    }

    const currentElementRef = categoryRefs.current[currentTourStep - 1];
    if (currentElementRef) {
      const rect = currentElementRef.getBoundingClientRect();
      setHighlightPosition({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });

      // Calculate if we need extra scroll to make sure the element and tour card are visible
      const elementBottom = rect.top + rect.height;
      const estimatedCardHeight = 350; // A safe estimate of card height plus buttons
      const viewportHeight = window.innerHeight;

      // If the element is in the lower half of the screen, scroll more to ensure card is visible
      if (elementBottom > viewportHeight / 2) {
        window.scrollBy({
          top: Math.min(estimatedCardHeight, 150), // Add extra scroll space for the card
          behavior: 'smooth',
        });
      }

      // Scroll element into view
      currentElementRef.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentTourStep, categories.length, showTour]);

  // Calculate the tour card position based on element position and window dimensions
  const calculateTourCardPosition = useCallback(() => {
    if (currentTourStep === 0 || currentTourStep > categories.length) {
      return {
        position: 'fixed' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1002,
      };
    }

    const cardHeight = 350; // Approximate height of card including buttons
    const cardWidth = Math.min(400, windowDimensions.width * 0.9);
    const padding = 30; // Increased padding for better visibility

    // Get the viewport dimensions
    const viewportWidth = windowDimensions.width;
    const viewportHeight = windowDimensions.height;

    // First, determine if we should position the card to the side instead of above/below
    // This works better when dealing with horizontal space availability
    let top, left;

    // Try to position the card to the right of the element first
    if (highlightPosition.left + highlightPosition.width + padding + cardWidth <= viewportWidth) {
      // There's enough space to the right
      left = highlightPosition.left + highlightPosition.width + padding;
      // Center vertically with the highlighted element
      top = highlightPosition.top + highlightPosition.height / 2 - cardHeight / 2;
    }
    // Try to position the card to the left of the element
    else if (highlightPosition.left - padding - cardWidth >= 0) {
      // There's enough space to the left
      left = highlightPosition.left - padding - cardWidth;
      // Center vertically with the highlighted element
      top = highlightPosition.top + highlightPosition.height / 2 - cardHeight / 2;
    }
    // If there's not enough horizontal space, position below or above the element
    else {
      // Center horizontally
      left = Math.max(
        padding,
        Math.min(
          viewportWidth - cardWidth - padding,
          highlightPosition.left + highlightPosition.width / 2 - cardWidth / 2
        )
      );

      // Try below first
      if (
        highlightPosition.top + highlightPosition.height + padding + cardHeight <=
        viewportHeight
      ) {
        top = highlightPosition.top + highlightPosition.height + padding;
      }
      // If not enough space below, try above
      else if (highlightPosition.top - padding - cardHeight >= 0) {
        top = highlightPosition.top - padding - cardHeight;
      }
      // As a last resort, position at the top of the screen with a minimum margin
      else {
        top = padding;
      }
    }

    // Ensure the card stays within viewport boundaries for top position
    top = Math.max(padding, Math.min(viewportHeight - cardHeight - padding, top));

    // Additional safety check: Ensure we're not covering the highlighted element
    const cardRect = {
      top,
      left,
      bottom: top + cardHeight,
      right: left + cardWidth,
    };

    const highlightRect = {
      top: highlightPosition.top,
      left: highlightPosition.left,
      bottom: highlightPosition.top + highlightPosition.height,
      right: highlightPosition.left + highlightPosition.width,
    };

    // Check if there's any overlap
    if (
      !(
        cardRect.right < highlightRect.left ||
        cardRect.left > highlightRect.right ||
        cardRect.bottom < highlightRect.top ||
        cardRect.top > highlightRect.bottom
      )
    ) {
      // If there's overlap, position the card at the top of screen
      top = padding;
    }

    return {
      position: 'fixed' as const,
      top: `${top}px`,
      left: `${left}px`,
      maxWidth: `${cardWidth}px`,
      zIndex: 1002,
    };
  }, [currentTourStep, categories.length, highlightPosition, windowDimensions]);

  // Render loading state
  if (isLoading) {
    return (
      <div className={`${styles.lifeWheelContainer} ${className}`}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className={`${styles.lifeWheelContainer} ${className}`}>
        <div className={styles.errorState}>
          <h3>Something went wrong</h3>
          <p>{error.message || 'Failed to load life wheel data'}</p>
          <button onClick={() => setError(null)} className={styles.retryButton}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.fullScreenContainer}>
      {/* Background image */}
      <div className={styles.backgroundImage} />

      {/* Main content container */}
      <div className={styles.contentWrapper}>
        <div className={styles.glassCard}>
          <h1 className={styles.title}>Life Wheel Assessment</h1>

          <div
            className={styles.radarContainer}
            ref={el => (categoryRefs.current[-1] = el)} // For introduction step
          >
            <RadarChart
              data={categories.map(category => ({
                name: category.name,
                value: category.value,
                color: category.color,
                id: category.id,
                description: category.description,
                icon: category.icon,
                gradient: category.gradient,
              }))}
              animate={true}
              onCategoryClick={handleCategorySelect}
            />
          </div>

          <div className={styles.categoriesList}>
            {categories.map((category, index) => (
              <div
                key={category.id}
                className={`${styles.categoryItem} ${showTour && currentTourStep === index + 1 ? styles.highlighted : ''}`}
                ref={el => (categoryRefs.current[index] = el)}
              >
                <div className={styles.categoryHeader}>
                  <div className={styles.categoryColor} style={{ background: category.color }} />
                  <h3 className={styles.categoryName}>{category.name}</h3>
                </div>
                <input
                  type="range"
                  min={MIN_CATEGORY_VALUE}
                  max={MAX_CATEGORY_VALUE}
                  value={category.value}
                  onChange={e => handleValueChange(category.id, parseInt(e.target.value))}
                  className={styles.slider}
                  style={{ '--track-color': category.color } as React.CSSProperties}
                />
                <div className={styles.valueLabel}>
                  {category.value}/{MAX_CATEGORY_VALUE}
                </div>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className={styles.actionButtons}>
            {/* Tour guide button */}
            <button onClick={startTour} className={styles.tourButton} type="button">
              Need Help? Take the Tour
            </button>

            {/* Complete button - saves data and completes assessment */}
            {!readOnly && (
              <button
                onClick={handleComplete}
                className={styles.completeButton}
                disabled={isSaving}
                type="button"
              >
                {isSaving ? 'Saving...' : 'Complete Assessment'}
              </button>
            )}
          </div>

          {/* Success message */}
          {saveSuccess && (
            <div className={styles.successMessage}>
              Your Life Wheel data has been saved successfully!
            </div>
          )}
        </div>
      </div>

      {/* Semi-transparent Overlay (simplified) */}
      <AnimatePresence>
        {showTour && (
          <motion.div
            className={styles.tourOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={e => {
              // Close tour if clicking outside the tour card
              if ((e.target as HTMLElement).className === styles.tourOverlay) {
                endTour();
              }
            }}
          />
        )}
      </AnimatePresence>

      {/* Tour Guide Dialog */}
      <AnimatePresence>
        {showTour && (
          <>
            <motion.div
              className={styles.tourCard}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ type: 'spring', damping: 20 }}
              style={calculateTourCardPosition()}
            >
              {currentTourStep === 0 ? (
                <>
                  <h2 className={styles.tourTitle}>Welcome to Your Life Wheel!</h2>
                  <p className={styles.tourDescription}>
                    The Life Wheel helps you visualize and assess different areas of your life.
                    Let's walk through each category to understand what they mean and how to rate
                    them.
                  </p>
                </>
              ) : (
                currentTourStep <= categories.length && (
                  <>
                    <div
                      className={styles.tourCategoryIcon}
                      style={{ backgroundColor: categories[currentTourStep - 1].color }}
                    >
                      {categories[currentTourStep - 1].icon}
                    </div>
                    <h2 className={styles.tourTitle}>{categories[currentTourStep - 1].name}</h2>
                    <p className={styles.tourDescription}>
                      {categories[currentTourStep - 1].description}
                    </p>
                    <p className={styles.tourTip}>
                      Rate this category from 1-10 based on your current satisfaction and confidence
                      in this area of your life.
                    </p>
                  </>
                )
              )}

              {currentTourStep > categories.length && (
                <>
                  <h2 className={styles.tourTitle}>You're All Set!</h2>
                  <p className={styles.tourDescription}>
                    Now you can adjust your ratings for each category to get a visual representation
                    of your current life balance. This will help you identify areas that may need
                    more attention and focus.
                  </p>
                </>
              )}

              <div className={styles.tourNavigation}>
                <div className={styles.tourNavLeft}>
                  {currentTourStep > 0 && (
                    <button onClick={prevTourStep} className={styles.tourNavButton} type="button">
                      Previous
                    </button>
                  )}
                </div>

                <div className={styles.tourNavRight}>
                  <button
                    onClick={currentTourStep > categories.length ? endTour : nextTourStep}
                    className={`${styles.tourNavButton} ${styles.tourNavButtonPrimary}`}
                    type="button"
                  >
                    {currentTourStep > categories.length ? 'Finish' : 'Next'}
                  </button>
                </div>
              </div>

              {/* Close button */}
              <button
                className={styles.closeTourButton}
                onClick={endTour}
                aria-label="Close tour"
                type="button"
              >
                ×
              </button>
            </motion.div>

            {/* Skip tour button - separated from the card for better visibility */}
            <motion.button
              onClick={skipTour}
              className={styles.skipTourButton}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              type="button"
            >
              Skip Tour
            </motion.button>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LifeWheel;
