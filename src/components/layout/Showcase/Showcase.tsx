import { useState, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import styles from './Showcase.module.css';
import { SHOWCASE_ITEMS } from '@/constants/showcase';

const Showcase = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(0);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const totalPages = isMobile ? SHOWCASE_ITEMS.length : Math.ceil(SHOWCASE_ITEMS.length / 4);
  const itemsPerPage = isMobile ? 1 : 4;
  const currentItems = SHOWCASE_ITEMS.slice(
    currentPage * itemsPerPage, 
    (currentPage + 1) * itemsPerPage
  );

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

  useEffect(() => {
    if (hoveredItem) {
      const interval = setInterval(() => {
        setImageIndex((prev) => (prev + 1) % 3);
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setImageIndex(0);
    }
  }, [hoveredItem]);

  const nextPage = () => {
    setDirection(1);
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setDirection(-1);
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

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

  return (
    <section className={styles.showcaseContainer}>
      <div className={styles.showcaseContent}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            <span>Unveil New Creative Horizons</span>
            <span>with <span className={styles.gradientText}>Fine-tuned Models</span></span>
          </h2>
          {!isMobile && (
            <div className={styles.navigation}>
              <button onClick={prevPage} className={styles.navButton}>
                <svg viewBox="0 0 24 24" className={styles.navIcon} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button onClick={nextPage} className={styles.navButton}>
                <svg viewBox="0 0 24 24" className={styles.navIcon} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 5l7 7-7 7" />
                </svg>
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
          >
            {currentItems.map((item) => (
              <div
                key={item.id}
                className={styles.item}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => {
                  setHoveredItem(null);
                  setImageIndex(0);
                }}
              >
                <div className={styles.imageContainer}>
                  <img
                    src={item.images[hoveredItem === item.id ? imageIndex : 0]}
                    alt={item.title}
                    className={styles.image}
                  />
                </div>
                <h3 className={styles.itemTitle}>{item.title}</h3>
                <p className={styles.itemDescription}>{item.description}</p>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>

        {isMobile && (
          <div className={styles.navigation}>
            <button onClick={prevPage} className={styles.navButton}>
              <svg viewBox="0 0 24 24" className={styles.navIcon} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button onClick={nextPage} className={styles.navButton}>
              <svg viewBox="0 0 24 24" className={styles.navIcon} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Showcase; 