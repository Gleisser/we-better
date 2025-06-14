import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import styles from './ConfirmDialog.module.css';

/**
 * Props interface for the ConfirmDialog component.
 * @interface ConfirmDialogProps
 * @property {boolean} isOpen - Controls the visibility state of the dialog
 * @property {() => void} onClose - Callback function triggered when dialog should close (cancel action)
 * @property {() => void} onConfirm - Callback function triggered when user confirms the action
 * @property {string} title - The title text displayed in the dialog header
 * @property {string} message - The message text displayed in the dialog body
 */
interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

/**
 * A modal dialog component for confirming user actions.
 * Features:
 * - Animated entrance and exit using Framer Motion
 * - Backdrop overlay with click-to-close
 * - Portal-based rendering
 * - Responsive design with centered positioning
 * - Cancel and confirm action buttons
 *
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Controls dialog visibility
 * @param {() => void} props.onClose - Handler for closing/canceling
 * @param {() => void} props.onConfirm - Handler for confirmation action
 * @param {string} props.title - Dialog title text
 * @param {string} props.message - Dialog message text
 *
 * @example
 * ```tsx
 * function DeleteItem() {
 *   const [isDialogOpen, setIsDialogOpen] = useState(false);
 *
 *   const handleDelete = () => {
 *     setIsDialogOpen(false);
 *     // Perform delete operation
 *   };
 *
 *   return (
 *     <>
 *       <button onClick={() => setIsDialogOpen(true)}>
 *         Delete Item
 *       </button>
 *       <ConfirmDialog
 *         isOpen={isDialogOpen}
 *         onClose={() => setIsDialogOpen(false)}
 *         onConfirm={handleDelete}
 *         title="Confirm Deletion"
 *         message="Are you sure you want to delete this item? This action cannot be undone."
 *       />
 *     </>
 *   );
 * }
 * ```
 */
export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}: ConfirmDialogProps): JSX.Element | null => {
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className={styles.container}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <h3 className={styles.title}>{title}</h3>
            <p className={styles.message}>{message}</p>
            <div className={styles.actions}>
              <button onClick={onClose} className={styles.cancelButton}>
                Cancel
              </button>
              <button onClick={onConfirm} className={styles.confirmButton}>
                Delete
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};
