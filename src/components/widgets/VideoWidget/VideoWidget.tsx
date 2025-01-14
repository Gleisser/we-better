import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, PlayIcon, StarIcon, ChevronLeftIcon, ChevronRightIcon } from '@/components/common/icons';
import styles from './VideoWidget.module.css';
import { MOCK_VIDEOS } from './config';
import { Video } from './types';
import { YoutubeModal } from './YoutubeModal';

const VideoWidget = () => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return window.innerWidth <= 768;
  });
  const [currentPage, setCurrentPage] = useState(0);
  const videosPerPage = 3;
  const totalPages = Math.ceil(MOCK_VIDEOS.length / videosPerPage);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleNextPage = useCallback(() => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  }, [totalPages]);

  const handlePrevPage = useCallback(() => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  }, [totalPages]);

  const handleVideoClick = (video: Video) => {
    setSelectedVideo(video);
    setShowModal(true);
  };

  return (
    <div className={styles.container}>
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
        <div className={styles.carouselContainer}>
          <button 
            className={`${styles.navButton} ${styles.prevButton}`}
            onClick={handlePrevPage}
            aria-label="Previous page"
          >
            <ChevronLeftIcon className={styles.navIcon} />
          </button>

          <AnimatePresence mode='wait'>
            <motion.div 
              key={currentPage}
              className={styles.videoCarousel}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              {MOCK_VIDEOS.slice(currentPage * videosPerPage, (currentPage + 1) * videosPerPage).map((video) => (
                <motion.div 
                  key={video.id}
                  className={styles.videoCard}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className={styles.thumbnailContainer}>
                    <img 
                      src={`https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
                      alt={video.title}
                      className={styles.thumbnail}
                    />
                    <div className={styles.overlay}>
                      <button 
                        className={styles.playButton}
                        onClick={() => handleVideoClick(video)}
                      >
                        <PlayIcon className={styles.playIcon} />
                      </button>
                      <div className={styles.videoInfo}>
                        <div className={styles.titleSection}>
                          <h3 className={styles.videoTitle}>{video.title}</h3>
                          <div className={styles.categoryBadge}>
                            {video.category} / {video.subCategory}
                          </div>
                        </div>
                        <div className={styles.rating}>
                          <StarIcon className={styles.starIcon} />
                          <span className={styles.ratingValue}>{video.rating}</span>
                        </div>
                      </div>
                    </div>
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
        <YoutubeModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          video={selectedVideo}
        />
      )}
    </div>
  );
};

export default VideoWidget; 