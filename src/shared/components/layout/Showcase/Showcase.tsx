import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import styles from './Showcase.module.css';
import { SHOWCASE_FALLBACK } from '@/utils/constants/fallback';
import { useShowcase } from '@/shared/hooks/useShowcase';
import {
  ShowcaseArrowIcon,
  ShowcaseArrowRightIcon,
  ShowcaseMobileArrowIcon,
  ShowcaseMobileArrowRightIcon,
} from '@/shared/components/common/icons';
import ShowcaseSkeleton from './ShowcaseSkeleton';
import { useErrorHandler } from '@/shared/hooks/utils/useErrorHandler';
import { useDeferredSectionQuery } from '@/shared/hooks/utils/useDeferredSectionQuery';
import ResponsiveImage from '@/shared/components/common/ResponsiveImage/ResponsiveImage';
import { LANDING_MEDIA } from '@/utils/constants/media/landingMedia';
import { createResponsiveMediaFromImage } from '@/utils/helpers/responsiveMedia';

interface ShowcaseCardProps {
  item: {
    id: number;
    title: string;
    description: string;
    images: Array<{
      src: string;
      alt: string;
    }>;
  };
  eager: boolean;
}

const ShowcaseCard = ({ item, eager }: ShowcaseCardProps): JSX.Element => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const imageCount = item.images.length;

  useEffect(() => {
    if (!isHovered || imageCount <= 1) {
      setImageIndex(0);
      return;
    }

    const intervalId = window.setInterval(() => {
      setImageIndex(prev => (prev + 1) % imageCount);
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [imageCount, isHovered]);

  const activeImage = item.images[imageIndex] ?? item.images[0];
  const fallbackKey = item.title
    .toLowerCase()
    .replace(/[^a-z]+/g, '') as keyof typeof LANDING_MEDIA.showcase;
  const media =
    createResponsiveMediaFromImage(activeImage, {
      alt: activeImage?.alt ?? item.title,
      sizes: '(max-width: 768px) 100vw, 25vw',
    }) ??
    LANDING_MEDIA.showcase[fallbackKey] ??
    LANDING_MEDIA.showcase.tracking;

  return (
    <div
      className={styles.item}
      role="article"
      aria-label={item.title}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={styles.imageContainer}>
        <ResponsiveImage
          media={media}
          className={styles.image}
          loading={eager ? 'eager' : 'lazy'}
        />
      </div>
      <h3 className={styles.itemTitle}>{item.title}</h3>
      <p className={styles.itemDescription}>{item.description}</p>
    </div>
  );
};

const Showcase = (): JSX.Element => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const shouldFetch = useDeferredSectionQuery(sectionRef);

  // State management
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Initialize hooks
  const { data: showcase, isLoading: isDataLoading } = useShowcase({ enabled: shouldFetch });
  const { isError, error } = useErrorHandler({
    fallbackMessage: 'Failed to load showcase content',
  });

  // Memoize belts and derived values
  const showcaseData = showcase?.data ?? SHOWCASE_FALLBACK;
  const belts = showcaseData.belts;
  const totalPages = useMemo(
    () => (isMobile ? belts.length : Math.ceil(belts.length / 4)),
    [isMobile, belts.length]
  );
  const itemsPerPage = useMemo(() => (isMobile ? 1 : 4), [isMobile]);
  const currentItems = useMemo(
    () => belts.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage),
    [belts, currentPage, itemsPerPage]
  );

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

  // Navigation handlers
  const nextPage = (): void => {
    setDirection(1);
    setCurrentPage(prev => (prev + 1) % totalPages);
  };

  const prevPage = (): void => {
    setDirection(-1);
    setCurrentPage(prev => (prev - 1 + totalPages) % totalPages);
  };

  // Swipe handlers
  const swipePower = (offset: number, velocity: number): number => {
    return Math.abs(offset) * velocity;
  };

  const swipeConfidenceThreshold = 10000;

  const handleDragEnd = (
    _e: MouseEvent | TouchEvent | PointerEvent,
    { offset, velocity }: PanInfo
  ): void => {
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
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
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
            <button onClick={() => window.location.reload()} className={styles.retryButton}>
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Rest of the component remains the same...
  return (
    <section ref={sectionRef} className={styles.showcaseContainer} aria-labelledby="showcase-title">
      <div className={styles.showcaseContent}>
        <div className={styles.header}>
          <h2 className={styles.title} id="showcase-title">
            <span>{showcaseData.title}</span>
            <span className={styles.gradientText}>{showcaseData.subtitle}</span>
          </h2>
          {!isMobile && (
            <div className={styles.navigation} role="navigation" aria-label="Showcase navigation">
              <button
                onClick={prevPage}
                className={styles.navButton}
                aria-label="Previous showcase"
              >
                <ShowcaseArrowIcon className={styles.navIcon} aria-hidden="true" />
              </button>
              <button onClick={nextPage} className={styles.navButton} aria-label="Next showcase">
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
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className={styles.belt}
            drag={isMobile ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={handleDragEnd}
            whileDrag={{ cursor: 'grabbing' }}
            role="region"
            aria-label="Showcase items"
          >
            {currentItems.map((item, index: number) => (
              <ShowcaseCard key={item.id} item={item} eager={index === 0} />
            ))}
          </motion.div>
        </AnimatePresence>

        {isMobile && (
          <div
            className={styles.navigation}
            role="navigation"
            aria-label="Mobile showcase navigation"
          >
            <button onClick={prevPage} className={styles.navButton} aria-label="Previous showcase">
              <ShowcaseMobileArrowIcon className={styles.navIcon} aria-hidden="true" />
            </button>
            <button onClick={nextPage} className={styles.navButton} aria-label="Next showcase">
              <ShowcaseMobileArrowRightIcon className={styles.navIcon} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Showcase;
