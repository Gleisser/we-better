import { motion, AnimatePresence } from 'framer-motion';
import { XIcon } from '@/shared/components/common/icons';
import { useCommonTranslation } from '@/shared/hooks/useTranslation';
import styles from './ConfirmationModal.module.css';
import { createPortal } from 'react-dom';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}: ConfirmationModalProps): JSX.Element => {
  const { t } = useCommonTranslation();

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
            <div className={styles.header}>
              <h2 className={styles.title}>{title}</h2>
              <button
                className={styles.closeButton}
                onClick={onClose}
                aria-label={t('widgets.goals.confirmDelete.closeModal') as string}
              >
                <XIcon className={styles.closeIcon} />
              </button>
            </div>

            <div className={styles.content}>
              <p className={styles.message}>{message}</p>
            </div>

            <div className={styles.footer}>
              <button className={styles.cancelButton} onClick={onClose}>
                {t('widgets.goals.confirmDelete.cancel')}
              </button>
              <button
                className={styles.confirmButton}
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
              >
                {t('widgets.goals.confirmDelete.delete')}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};
