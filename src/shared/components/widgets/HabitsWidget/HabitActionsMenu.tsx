import { motion, AnimatePresence } from 'framer-motion';
import { PencilIcon, TrashIcon } from '@/shared/components/common/icons';
import { useCommonTranslation } from '@/shared/hooks/useTranslation';
import styles from './HabitActionsMenu.module.css';
import { createPortal } from 'react-dom';

interface HabitActionsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  position: { x: number; y: number };
}

export const HabitActionsMenu = ({
  isOpen,
  onClose,
  onEdit,
  onDelete,
  position,
}: HabitActionsMenuProps): JSX.Element => {
  const { t } = useCommonTranslation();

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <div className={styles.backdrop} onClick={onClose} />
          <motion.div
            className={styles.menu}
            style={{
              left: position.x,
              top: position.y,
            }}
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
          >
            <button
              className={styles.menuItem}
              onClick={() => {
                onEdit();
                onClose();
              }}
            >
              <PencilIcon className={styles.menuIcon} />
              <span>{t('widgets.habits.actions.edit')}</span>
            </button>
            <button
              className={`${styles.menuItem} ${styles.delete}`}
              onClick={() => {
                onDelete();
                onClose();
              }}
            >
              <TrashIcon className={styles.menuIcon} />
              <span>{t('widgets.habits.actions.delete')}</span>
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};
