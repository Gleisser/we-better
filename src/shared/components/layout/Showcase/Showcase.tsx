import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import styles from './Showcase.module.css';
import { SHOWCASE_FALLBACK } from '@/utils/constants/fallback';
import { useShowcase } from '@/shared/hooks/useShowcase';
import { API_CONFIG } from '@/core/config/api-config';
import { ShowcaseArrowIcon, ShowcaseArrowRightIcon, ShowcaseMobileArrowIcon, ShowcaseMobileArrowRightIcon } from '@/shared/components/common/icons';
import ShowcaseSkeleton from './ShowcaseSkeleton';
import { useImagePreloader } from '@/shared/hooks/utils/useImagePreloader';
import { useErrorHandler } from '@/shared/hooks/utils/useErrorHandler';
import { useLoadingState } from '@/shared/hooks/utils/useLoadingState';

const Showcase = () => {
  // State management
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(0);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  // Refs
  const observerRef = useRef<IntersectionObserver | null>(null);
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);

  // Initialize hooks
  const { data: showcase, isLoading: isDataLoading } = useShowcase();
  const { preloadImages } = useImagePreloader();
  const { handleError, isError, error } = useErrorHandler({
    fallbackMessage: 'Failed to load showcase content'
  });
  const { isLoading, startLoading, stopLoading } = useLoadingState({
    minimumLoadingTime: 500
  });

  // Memoize belts and derived values
  const belts = showcase?.data.belts || SHOWCASE_FALLBACK.belts;
  const totalPages = useMemo(() => 
    isMobile ? belts.length : Math.ceil(belts.length / 4),
    [isMobile, belts.length]
  );
  const itemsPerPage = useMemo(() => isMobile ? 1 : 4, [isMobile]);
  const currentItems = useMemo(() => 
    belts.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage),
    [belts, currentPage, itemsPerPage]
  );

  // Memoize current page URLs calculation
  const getCurrentPageUrls = useCallback(() => {
    if (!currentItems.length) return [];
    
    return currentItems.reduce((urls: string[], item) => {
      const itemUrls = item.images.map(image => 
        showcase 
          ? image.src
          : image.src
      );
      return [...urls, ...itemUrls];
    }, []);
  }, [currentItems, showcase]);

  // Memoize load images function
  const loadImages = useCallback(async () => {
    const imageUrls = getCurrentPageUrls();
    if (imageUrls.length === 0 || isLoading) return;

    try {
      startLoading();
      await preloadImages(imageUrls);
    } catch (err) {
      handleError(err);
    } finally {
      if (isLoading) {
        stopLoading();
      }
    }
  }, [getCurrentPageUrls, preloadImages, handleError, startLoading, stopLoading, isLoading]);

  // Initialize image refs
  useEffect(() => {
    imageRefs.current = new Array(itemsPerPage).fill(null);
  }, [itemsPerPage]);

  // Memoize image reset function
  const resetImages = useCallback(() => {
    if (!currentItems.length) return;
    
    imageRefs.current.forEach((ref, index) => {
      if (ref && currentItems[index]) {
        const item = currentItems[index];
        const initialSrc = showcase 
          ? item.images[0].src
          : item.images[0].src;
        ref.src = initialSrc;
      }
    });
  }, [currentItems, showcase]);

  // Handle image rotation
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    
    if (hoveredItem && currentItems.length) {
      const hoveredBelt = currentItems.find(item => item.id === hoveredItem);
      // Only set up interval if there are multiple images
      if (hoveredBelt && hoveredBelt.images.length > 1) {
        interval = setInterval(() => {
          setImageIndex(prev => {
            const currentItemRef = imageRefs.current.find((_, i) => 
              currentItems[i]?.id === hoveredItem
            );
            
            if (currentItemRef && hoveredBelt) {
              // Use modulo with actual number of images
              const nextIndex = (prev + 1) % hoveredBelt.images.length;
              currentItemRef.src = hoveredBelt.images[nextIndex].src;
              return nextIndex;
            }
            
            return prev;
          });
        }, 1000);
      }
    } else {
      setImageIndex(0);
      resetImages();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [hoveredItem, currentItems, resetImages]);

  // Handle mobile detection
  const checkIfMobile = useCallback(() => {
    requestAnimationFrame(() => {
      setIsMobile(window.innerWidth <= 768);
    });
  }, []);

  useEffect(() => {
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, [checkIfMobile]);

  // Load images on page change
  useEffect(() => {
    let mounted = true;

    if (!isDataLoading && currentItems.length > 0 && mounted) {
      loadImages();
    }

    return () => {
      mounted = false;
    };
  }, [loadImages, currentPage, isDataLoading, currentItems.length]);

  // Navigation handlers
  const nextPage = () => {
    setDirection(1);
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setDirection(-1);
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  // Swipe handlers
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const swipeConfidenceThreshold = 10000;

  const handleDragEnd = (e: MouseEvent | TouchEvent | PointerEvent, { offset, velocity }: PanInfo) => {
    if (isMobile) {
      const swipe = swipePower(offset.x, velocity.x);

      if (swipe < -swipeConfidenceThreshold) {
        nextPage();
      } else if (swipe > swipeConfidenceThreshold) {
        prevPage();
      }
    }
  };

  // Animation variants
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  // Show loading state
  if (isDataLoading) {
    return <ShowcaseSkeleton />;
  }

  // Show error state
  if (isError) {
    return (
      <section className={styles.showcaseContainer}>
        <div className={styles.showcaseContent}>
          <div className={styles.errorState} role="alert">
            <p>{error?.message}</p>
            <button 
              onClick={() => window.location.reload()}
              className={styles.retryButton}
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Rest of the component remains the same...
  return (
    <section 
      className={styles.showcaseContainer}
      aria-labelledby="showcase-title"
    >
      <div className={styles.showcaseContent}>
        <div className={styles.header}>
          <h2 
            className={styles.title}
            id="showcase-title"
          >
            <span>{showcase?.data.title}</span>
            <span className={styles.gradientText}>{showcase?.data.subtitle}</span>
          </h2>
          {!isMobile && (
            <div 
              className={styles.navigation}
              role="navigation"
              aria-label="Showcase navigation"
            >
              <button 
                onClick={prevPage} 
                className={styles.navButton}
                aria-label="Previous showcase"
              >
                <ShowcaseArrowIcon className={styles.navIcon} aria-hidden="true" /> 
              </button>
              <button 
                onClick={nextPage} 
                className={styles.navButton}
                aria-label="Next showcase"
              >
                <ShowcaseArrowRightIcon className={styles.navIcon} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>

        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentPage}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className={styles.belt}
            drag={isMobile ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={handleDragEnd}
            whileDrag={{ cursor: "grabbing" }}
            role="region"
            aria-label="Showcase items"
          >
            {currentItems.map((item, index) => (
              <div
                key={item.id}
                className={styles.item}
                role="article"
                aria-label={item.title}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => {
                  setHoveredItem(null);
                  setImageIndex(0);
                }}
              >
                <div className={styles.imageContainer}>
                  <img
                    ref={el => imageRefs.current[index] = el}
                    src={showcase 
                      ? item.images[0].src
                      : item.images[0].src
                    }
                    alt={item.images[hoveredItem === item.id ? imageIndex : 0].alt}
                    className={styles.image}
                    loading={index === 0 ? "eager" : "lazy"}
                    decoding="async"
                    width="600"
                    height="450"
                    sizes="(max-width: 768px) 100vw, 25vw"
                  />
                </div>
                <h3 className={styles.itemTitle}>{item.title}</h3>
                <p className={styles.itemDescription}>{item.description}</p>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>

        {isMobile && (
          <div 
            className={styles.navigation}
            role="navigation"
            aria-label="Mobile showcase navigation"
          >
            <button 
              onClick={prevPage} 
              className={styles.navButton}
              aria-label="Previous showcase"
            >
              <ShowcaseMobileArrowIcon className={styles.navIcon} aria-hidden="true" /> 
            </button>
            <button 
              onClick={nextPage} 
              className={styles.navButton}
              aria-label="Next showcase"
            >
              <ShowcaseMobileArrowRightIcon className={styles.navIcon} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Showcase; 