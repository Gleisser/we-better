import { motion, AnimatePresence } from 'framer-motion';
import styles from './VideoWidget.module.css';

interface YoutubeModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
}

export const YoutubeModal = ({ isOpen, onClose, videoId }: YoutubeModalProps) => {
  if (!isOpen) return null;

  return (
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
}; 