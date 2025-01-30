import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, PlayIcon, StarIcon, ChevronLeftIcon, ChevronRightIcon, StarFilledIcon, StarEmptyIcon } from '@/components/common/icons';
import styles from './VideoWidget.module.css';
import { MOCK_VIDEOS } from './config';
import { Video, WatchProgress } from './types';
import { YoutubeModal } from './YoutubeModal';
import { useTiltEffect } from '@/hooks/useTiltEffect';
import ViewCounter from './ViewCounter';

const VideoWidget = () => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return window.innerWidth <= 768;
  });
  const [currentPage, setCurrentPage] = useState(0);
  const videosPerPage = 3;
  const totalPages = Math.ceil(MOCK_VIDEOS.length / videosPerPage);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [hoveredVideoId, setHoveredVideoId] = useState<string | null>(null);
  const [previewLoadError, setPreviewLoadError] = useState<Set<string>>(new Set());
  const [loadingPreviews, setLoadingPreviews] = useState<Set<string>>(new Set());
  const [userRatings, setUserRatings] = useState<Record<string, number>>({});
  const [hoverRating, setHoverRating] = useState<{id: string, rating: number} | null>(null);
  const [watchedVideos, setWatchedVideos] = useState<Record<string, WatchProgress>>({});
  const [direction, setDirection] = useState(0);

  const elementRef = useRef<HTMLDivElement>(null);
  const { handleMouseMove, handleMouseLeave, tilt } = useTiltEffect();

  const theme = {
    gradientStart: 'rgba(147, 51, 234, 0.12)',
    gradientMiddle: 'rgba(147, 51, 234, 0.08)',
    gradientEnd: 'rgba(147, 51, 234, 0.04)',
    accentRGB: '147, 51, 234'
  };

  const handleNextPage = useCallback(() => {
    setDirection(1);
    setCurrentPage((prev) => (prev + 1) % totalPages);
  }, [totalPages]);

  const handlePrevPage = useCallback(() => {
    setDirection(-1);
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  }, [totalPages]);

  const handleVideoClick = useCallback((video: Video) => {
    setSelectedVideo(video);
    setShowModal(true);
  }, []);

  const getVideoPreviewUrl = (videoId: string) => {
    if (previewLoadError.has(videoId)) {
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
    return `https://i.ytimg.com/vi_webp/${videoId}/maxresdefault.webp`;
  };

  const startPreviewLoad = (videoId: string) => {
    setLoadingPreviews(prev => new Set(prev).add(videoId));
    // Set timeout to stop shimmer after 1 second
    setTimeout(() => {
      setLoadingPreviews(prev => {
        const newSet = new Set(prev);
        newSet.delete(videoId);
        return newSet;
      });
    }, 1000);
  };

  const handlePreviewError = (videoId: string) => {
    setPreviewLoadError(prev => new Set(prev).add(videoId));
    setLoadingPreviews(prev => {
      const newSet = new Set(prev);
      newSet.delete(videoId);
      return newSet;
    });
  };

  const handleRating = (videoId: string, rating: number) => {
    setUserRatings(prev => ({
      ...prev,
      [videoId]: rating
    }));
  };

  const handleVideoProgress = (videoId: string, progress: number) => {
    setWatchedVideos(prev => ({
      ...prev,
      [videoId]: {
        progress,
        lastWatched: new Date()
      }
    }));
  };

  const renderStars = (video: Video) => {
    const currentRating = userRatings[video.id] || video.rating;
    const isHovering = hoverRating?.id === video.id;
    const hoverValue = hoverRating?.rating || 0;

    return (
      <div className={styles.ratingWrapper}>
        <motion.div 
          className={styles.ratingContainer}
          initial={false}
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <motion.button
              key={star}
              className={styles.starButton}
              onHoverStart={() => setHoverRating({ id: video.id, rating: star })}
              onHoverEnd={() => setHoverRating(null)}
              onClick={() => handleRating(video.id, star)}
              whileTap={{ scale: 0.8 }}
            >
              <motion.div
                animate={{
                  scale: (isHovering && hoverValue >= star) || (!isHovering && currentRating >= star) ? 1.2 : 1,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                {(isHovering && hoverValue >= star) || (!isHovering && currentRating >= star) ? (
                  <StarFilledIcon className={styles.starIconFilled} />
                ) : (
                  <StarEmptyIcon className={styles.starIconEmpty} />
                )}
              </motion.div>
            </motion.button>
          ))}
          <span className={styles.ratingValue}>{currentRating.toFixed(1)}</span>
        </motion.div>
        
        {/* Tooltip for potential rating */}
        <AnimatePresence>
          {isHovering && (
            <motion.div 
              className={styles.ratingTooltip}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              Rate: {hoverValue.toFixed(1)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // Memoize the modal props
  const modalProps = useMemo(() => ({
    isOpen: showModal,
    onClose: () => setShowModal(false),
    video: selectedVideo!,
    onProgress: handleVideoProgress
  }), [showModal, selectedVideo, handleVideoProgress]);

  // Calculate variants for parallax effect
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.5
      }
    })
  };

  // Add resize effect
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth <= 768;
      setIsCollapsed(isMobile);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      ref={elementRef}
      className={`${styles.container} ${isCollapsed ? styles.collapsed : ''}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        '--gradient-start': theme.gradientStart,
        '--gradient-middle': theme.gradientMiddle,
        '--gradient-end': theme.gradientEnd,
        '--accent-rgb': theme.accentRGB,
        transform: `perspective(1000px) 
                   rotateX(${tilt.rotateX}deg) 
                   rotateY(${tilt.rotateY}deg)
                   scale(${tilt.scale})`,
        transition: 'transform 0.1s ease-out'
      } as React.CSSProperties}
    >
      <div className={styles.backgroundGradient} />
      
      <div className={styles.header}>
        <div className={styles.headerMain}>
          <div className={styles.headerLeft}>
            <span className={styles.headerIcon}>🎥</span>
            <span className={styles.headerText}>Recommended Videos</span>
          </div>

          <button
            className={`${styles.collapseButton} ${isCollapsed ? styles.collapsed : ''}`}
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? "Expand videos widget" : "Collapse videos widget"}
          >
            <ChevronDownIcon className={styles.collapseIcon} />
          </button>
        </div>
      </div>

      <motion.div
        className={styles.collapsibleContent}
        animate={{
          height: isCollapsed ? 0 : "auto",
          opacity: isCollapsed ? 0 : 1
        }}
        transition={{
          duration: 0.3,
          ease: "easeInOut"
        }}
      >
        <div className={styles.carouselWrapper}>
          <div className={styles.carouselContainer}>
            <button 
              className={`${styles.navButton} ${styles.prevButton}`}
              onClick={handlePrevPage}
              aria-label="Previous page"
            >
              <ChevronLeftIcon className={styles.navIcon} />
            </button>

            <AnimatePresence
              mode="wait"
              custom={direction}
              initial={false}
            >
              <motion.div 
                key={currentPage}
                className={styles.videoCarousel}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                {MOCK_VIDEOS.slice(
                  currentPage * videosPerPage,
                  (currentPage + 1) * videosPerPage
                ).map((video, index) => (
                  <motion.div 
                    key={video.id}
                    className={styles.videoCard}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      transition: {
                        delay: index * 0.1 // Stagger effect
                      }
                    }}
                    whileHover={{ 
                      scale: 1.05,
                      y: -5,
                      transition: { duration: 0.2 }
                    }}
                    style={{
                      // Add perspective transform for depth
                      perspective: 1000,
                      translateZ: index * -20
                    }}
                    onHoverStart={() => setHoveredVideoId(video.id)}
                    onHoverEnd={() => setHoveredVideoId(null)}
                  >
                    <div className={`${styles.thumbnailContainer} ${loadingPreviews.has(video.youtubeId) ? styles.loading : ''}`}>
                      <motion.img 
                        src={hoveredVideoId === video.id && !previewLoadError.has(video.youtubeId)
                          ? getVideoPreviewUrl(video.youtubeId)
                          : `https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`
                        }
                        alt={video.title}
                        className={styles.thumbnail}
                        animate={{
                          scale: hoveredVideoId === video.id ? 1.05 : 1
                        }}
                        transition={{ duration: 0.3 }}
                        onError={() => handlePreviewError(video.youtubeId)}
                        onLoadStart={() => hoveredVideoId === video.id && startPreviewLoad(video.youtubeId)}
                      />
                      
                      {watchedVideos[video.id] && (
                        <div className={styles.progressIndicator}>
                          <div 
                            className={styles.progressBar}
                            style={{ width: `${watchedVideos[video.id].progress}%` }}
                          />
                          <span className={styles.watchedBadge}>
                            {watchedVideos[video.id].progress === 100 ? (
                              'Watched'
                            ) : (
                              `${Math.round(watchedVideos[video.id].progress)}%`
                            )}
                          </span>
                        </div>
                      )}
                      <motion.div 
                        className={styles.overlay}
                        animate={{
                          background: hoveredVideoId === video.id 
                            ? 'linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0.3))'
                            : 'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.2))'
                        }}
                      >
                        <button 
                          className={styles.playButton}
                          onClick={() => handleVideoClick(video)}
                        >
                          <PlayIcon className={styles.playIcon} />
                        </button>
                        <div className={styles.videoInfo}>
                          <div className={styles.titleSection}>
                            <h3 className={styles.videoTitle}>{video.title}</h3>
                            <motion.div 
                              className={styles.videoMetadata}
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ 
                                opacity: hoveredVideoId === video.id ? 1 : 0,
                                height: hoveredVideoId === video.id ? 'auto' : 0
                              }}
                            >
                              <div className={styles.metaRow}>
                                <span className={styles.duration}>{video.duration}</span>
                                <ViewCounter value={video.views} className={styles.views} />
                              </div>
                              <div className={styles.authorInfo}>
                                <span className={styles.authorName}>{video.author}</span>
                              </div>
                            </motion.div>
                            <div className={styles.categoryBadge}>
                              {video.category} / {video.subCategory}
                            </div>
                          </div>
                          <div className={styles.rating}>
                            {renderStars(video)}
                          </div>
                        </div>
                      </motion.div>
                      {video.badge && (
                        <motion.div 
                          className={`${styles.badge} ${video.badge === 'trending' ? styles.trendingBadge : styles.newBadge}`}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          {video.badge === 'trending' ? 'Trending' : 'New'}
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            <button 
              className={`${styles.navButton} ${styles.nextButton}`}
              onClick={handleNextPage}
              aria-label="Next page"
            >
              <ChevronRightIcon className={styles.navIcon} />
            </button>
          </div>
        </div>

        <div className={styles.pagination}>
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              className={`${styles.paginationDot} ${index === currentPage ? styles.active : ''}`}
              onClick={() => setCurrentPage(index)}
              aria-label={`Go to page ${index + 1}`}
            />
          ))}
        </div>
      </motion.div>

      {selectedVideo && (
        <YoutubeModal {...modalProps} />
      )}
    </div>
  );
};

export default VideoWidget; 