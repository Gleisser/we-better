import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import styles from './VideoWidget.module.css';

interface YoutubeModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
}

export const YoutubeModal = ({ isOpen, onClose, videoId }: YoutubeModalProps) => {
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
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className={styles.youtubeIframe}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  // Get portal root element
  const portalRoot = document.getElementById('portal-root');
  
  // Only render if portal root exists
  if (!portalRoot) return null;

  return createPortal(portalContent, portalRoot);
}; 