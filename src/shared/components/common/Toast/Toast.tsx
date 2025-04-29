import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import styles from './Toast.module.css';

/**
 * Props interface for the Toast component.
 * @interface ToastProps
 * @property {string} message - The text message to display in the toast
 * @property {boolean} isVisible - Controls the visibility state of the toast
 * @property {'success' | 'error'} [type='success'] - The type of toast which determines its styling
 */
interface ToastProps {
  message: string;
  isVisible: boolean;
  type?: 'success' | 'error';
}

/**
 * A toast notification component that displays temporary messages.
 * Features:
 * - Animated entrance and exit using Framer Motion
 * - Portal-based rendering to avoid stacking context issues
 * - Support for success and error states
 * - Smooth slide-up animation
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} props.message - The text message to display
 * @param {boolean} props.isVisible - Controls toast visibility
 * @param {'success' | 'error'} [props.type='success'] - Toast type for styling
 * 
 * @example
 * ```tsx
 * function App() {
 *   const [isVisible, setIsVisible] = useState(false);
 * 
 *   const showSuccessToast = () => {
 *     setIsVisible(true);
 *     setTimeout(() => setIsVisible(false), 3000);
 *   };
 * 
 *   return (
 *     <>
 *       <button onClick={showSuccessToast}>Show Toast</button>
 *       <Toast
 *         message="Operation successful!"
 *         isVisible={isVisible}
 *         type="success"
 *       />
 *     </>
 *   );
 * }
 * ```
 */
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