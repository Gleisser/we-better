import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import styles from './Toast.module.css';

interface ToastProps {
  message: string;
  isVisible: boolean;
  type?: 'success' | 'error';
}

export const Toast = ({ message, isVisible, type = 'success' }: ToastProps) => {
  return createPortal(
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`${styles.container} ${styles[type]}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}; 