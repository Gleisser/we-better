import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useState } from 'react';
import { CloseIcon } from '@/components/common/icons';
import styles from './VideoWidget.module.css';
import { Video } from './types';

interface YoutubeModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: Video;
}

export const YoutubeModal = ({ isOpen, onClose, video }: YoutubeModalProps) => {
  const [isLoading, setIsLoading] = useState(true);

  if (!isOpen) return null;

  const portalContent = (
    <AnimatePresence>
      <motion.div 
        className={styles.modalOverlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div 
          className={styles.modalContent}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Loading Spinner */}
          {isLoading && (
            <div className={styles.loadingContainer}>
              <motion.div 
                className={styles.loadingSpinner}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </div>
          )}
          
          <iframe
            src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className={styles.youtubeIframe}
            onLoad={() => setIsLoading(false)}
          />

          {/* Close Button */}
          <button 
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close video"
          >
            <CloseIcon className={styles.closeIcon} />
          </button>

          {/* Video Info Overlay */}
          <motion.div 
            className={styles.videoInfoOverlay}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className={styles.modalVideoTitle}>{video.title}</h3>
            <p className={styles.modalVideoMeta}>
              {video.author} • {video.views} views
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  const portalRoot = document.getElementById('portal-root');
  if (!portalRoot) return null;

  return createPortal(portalContent, portalRoot);
}; 