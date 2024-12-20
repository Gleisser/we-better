import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import styles from './Showcase.module.css';
import { SHOWCASE_FALLBACK } from '@/constants/fallback';
import { useShowcase } from '@/hooks/useShowcase';
import { API_CONFIG } from '@/lib/api-config';

const Showcase = () => {
  const { data: showcase } = useShowcase();
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(0);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const belts = showcase?.data.belts || SHOWCASE_FALLBACK.belts;

  const totalPages = isMobile ? belts.length : Math.ceil(belts.length / 4);
  const itemsPerPage = isMobile ? 1 : 4;
  const currentItems = belts.slice(
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
        setImageIndex((prev) => {
          const nextIndex = (prev + 1) % 3;
          const currentItemRef = imageRefs.current.find((_, i) => 
            currentItems[i]?.id === hoveredItem
          );
          
          if (currentItemRef) {
            const item = currentItems.find(item => item.id === hoveredItem);
            if (item) {
              const newSrc = showcase 
                ? API_CONFIG.imageBaseURL + item.images[nextIndex].img.formats.thumbnail.url
                : item.images[nextIndex].src;
              
              currentItemRef.src = newSrc;
            }
          }
          
          return nextIndex;
        });
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setImageIndex(0);
      imageRefs.current.forEach((ref, index) => {
        if (ref && currentItems[index]) {
          const item = currentItems[index];
          const initialSrc = showcase 
            ? API_CONFIG.imageBaseURL + item.images[0].img.formats.thumbnail.url
            : item.images[0].src;
          
          ref.src = initialSrc;
        }
      });
    }
  }, [hoveredItem, showcase, currentItems]);

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

  useEffect(() => {
    imageRefs.current = new Array(itemsPerPage).fill(null);
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    observerRef.current?.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              setTimeout(() => {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observerRef.current?.unobserve(img);
              }, 100);
            }
          }
        });
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.1
      }
    );

    setTimeout(() => {
      imageRefs.current.forEach((imageRef) => {
        if (imageRef) {
          observerRef.current?.observe(imageRef);
        }
      });
    }, 100);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [currentPage]);

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
            {currentItems.map((item, index) => (
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
                    ref={el => {
                      imageRefs.current[index] = el;
                      if (el) {
                        observerRef.current?.observe(el);
                        const initialSrc = showcase 
                          ? API_CONFIG.imageBaseURL + item.images[0].img.formats.thumbnail.url
                          : item.images[0].src;
                        
                        if (el.src === "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7") {
                          el.src = initialSrc;
                        }
                      }
                    }}
                    src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
                    data-src={showcase 
                      ? API_CONFIG.imageBaseURL + item.images[0].img.formats.thumbnail.url
                      : item.images[0].src
                    }
                    alt={item.images[hoveredItem === item.id ? imageIndex : 0].alt}
                    className={styles.image}
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = item.images[0].src;
                    }}
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