import { motion, AnimatePresence } from 'framer-motion';
import { STATUS_CONFIG } from './config';
import styles from './StatusMenu.module.css';

interface StatusMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (status: string) => void;
  position?: { x: number; y: number };
}

export const StatusMenu = ({ isOpen, onClose, onSelect, position }: StatusMenuProps) => {
  const isMobile = window.innerWidth <= 768;

  return (
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
            className={styles.menu}
            style={!isMobile ? {
              left: position?.x,
              top: position?.y,
            } : undefined}
            initial={isMobile ? { y: '100%' } : { opacity: 0, y: 10 }}
            animate={isMobile ? { y: 0 } : { opacity: 1, y: 0 }}
            exit={isMobile ? { y: '100%' } : { opacity: 0, y: 10 }}
          >
            <div className={styles.options}>
              {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                <button
                  key={status}
                  className={styles.option}
                  onClick={() => {
                    onSelect(status);
                    onClose();
                  }}
                >
                  <span className={styles.icon}>{config.icon}</span>
                  <span className={styles.label}>{config.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}; 