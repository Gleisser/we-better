import { motion, AnimatePresence } from 'framer-motion';
import { HabitStatus, STATUS_CONFIG } from './types';
import styles from './StatusMenu.module.css';
import { createPortal } from 'react-dom';

interface StatusMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (status: HabitStatus) => void;
  position: { x: number; y: number };
}

export const StatusMenu = ({ isOpen, onClose, onSelect, position }: StatusMenuProps) => {
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <div className={styles.backdrop} onClick={onClose} />
          <motion.div
            className={styles.menu}
            style={{
              left: position.x,
              top: position.y
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>Statuses</h4>
              <div className={styles.options}>
                {(['completed', 'sick', 'weather', 'travel'] as const).map(status => (
                  <button
                    key={status}
                    className={styles.option}
                    onClick={() => {
                      onSelect(status);
                      onClose();
                    }}
                  >
                    <span className={styles.icon}>{STATUS_CONFIG[status].icon}</span>
                    <span className={styles.label}>{STATUS_CONFIG[status].label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>Partial</h4>
              <div className={styles.options}>
                {(['partial', 'rescheduled', 'half'] as const).map(status => (
                  <button
                    key={status}
                    className={styles.option}
                    onClick={() => {
                      onSelect(status);
                      onClose();
                    }}
                  >
                    <span className={styles.icon}>{STATUS_CONFIG[status].icon}</span>
                    <span className={styles.label}>{STATUS_CONFIG[status].label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>Valid Skip</h4>
              <div className={styles.options}>
                {(['medical', 'break', 'event', 'rest'] as const).map(status => (
                  <button
                    key={status}
                    className={styles.option}
                    onClick={() => {
                      onSelect(status);
                      onClose();
                    }}
                  >
                    <span className={styles.icon}>{STATUS_CONFIG[status].icon}</span>
                    <span className={styles.label}>{STATUS_CONFIG[status].label}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}; 