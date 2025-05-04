import { motion, AnimatePresence } from 'framer-motion';
import { STATUS_CONFIG } from './config';
import styles from './StatusMenu.module.css';
import { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { HabitStatus } from './types';

interface StatusMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (status: HabitStatus) => void;
  position: { x: number; y: number };
}

export const StatusMenu: React.FC<StatusMenuProps> = ({
  isOpen,
  onClose,
  onSelect,
  position,
}: StatusMenuProps): JSX.Element => {
  const menuRef = useRef<HTMLDivElement>(null);
  const isMobile = window.innerWidth <= 768;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (!isOpen) return <></>;

  const menuStyle = !isMobile
    ? {
        left: `${position.x}px`,
        top: `${position.y}px`,
      }
    : undefined;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {isMobile && <div className={styles.backdrop} onClick={onClose} />}
          <motion.div
            ref={menuRef}
            className={`${styles.menu} ${isMobile ? styles.mobileMenu : ''}`}
            style={menuStyle}
            initial={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.95, y: -10 }}
            animate={isMobile ? { y: 0 } : { opacity: 1, scale: 1, y: 0 }}
            exit={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.95, y: -10 }}
          >
            <div className={styles.options}>
              {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                <button
                  key={status}
                  className={styles.option}
                  onClick={() => {
                    onSelect(status as HabitStatus);
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
    </AnimatePresence>,
    document.body
  );
};
