import { ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Modal.module.css';

/**
 * Props interface for the Modal component.
 * @interface ModalProps
 * @property {boolean} isOpen - Controls the visibility state of the modal
 * @property {() => void} onClose - Callback function triggered when the modal should close
 * @property {ReactNode} children - The content to be rendered inside the modal
 */
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

/**
 * A reusable Modal component that creates a portal for displaying content in an animated overlay.
 * Features:
 * - Animated entrance and exit using Framer Motion
 * - Automatically manages body scroll lock when open
 * - Click outside to close
 * - Portal-based rendering to avoid stacking context issues
 *
 * @component
 * @param {ModalProps} props - The component props
 * @param {boolean} props.isOpen - Controls the visibility of the modal
 * @param {() => void} props.onClose - Callback function to close the modal
 * @param {ReactNode} props.children - Content to be rendered inside the modal
 *
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false);
 *
 * return (
 *   <Modal
 *     isOpen={isOpen}
 *     onClose={() => setIsOpen(false)}
 *   >
 *     <div>Modal Content</div>
 *   </Modal>
 * );
 * ```
 */
export const Modal = ({ isOpen, onClose, children }: ModalProps): JSX.Element => {
  /**
   * Effect hook to manage body scroll lock when modal is open.
   * Prevents background content from scrolling while modal is visible.
   * Automatically cleans up by resetting overflow style on unmount or when modal closes.
   */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
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
            onClick={e => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
