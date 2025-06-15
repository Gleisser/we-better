import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { XIcon } from '@/shared/components/common/icons';
import { useCommonTranslation } from '@/shared/hooks/useTranslation';
import styles from './CreateAffirmationModal.module.css';

interface CreateAffirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (text: string) => void;
  existingAffirmation?: string;
}

const MAX_LENGTH = 100;

export const CreateAffirmationModal = ({
  isOpen,
  onClose,
  onSave,
  existingAffirmation,
}: CreateAffirmationModalProps): JSX.Element => {
  const { t } = useCommonTranslation();
  const [text, setText] = useState(existingAffirmation || '');
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSave = (): void => {
    if (existingAffirmation && !showConfirm) {
      setShowConfirm(true);
      return;
    }
    onSave(text);
    onClose();
  };

  const handleClose = (): void => {
    setText(existingAffirmation || '');
    setShowConfirm(false);
    onClose();
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />
          <motion.div
            className={styles.container}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className={styles.header}>
              <h2 className={styles.title}>
                {existingAffirmation
                  ? t('widgets.affirmation.modal.updateTitle')
                  : t('widgets.affirmation.modal.createTitle')}
              </h2>
              <button onClick={handleClose} className={styles.closeButton}>
                <XIcon className={styles.closeIcon} />
              </button>
            </div>

            <div className={styles.content}>
              <div className={styles.inputWrapper}>
                <textarea
                  value={text}
                  onChange={e => setText(e.target.value.slice(0, MAX_LENGTH))}
                  placeholder={t('widgets.affirmation.modal.placeholder') as string}
                  className={styles.input}
                  rows={3}
                />
                <div className={styles.charCount}>
                  {text.length}/{MAX_LENGTH}
                </div>
              </div>

              {text && (
                <div className={styles.preview}>
                  <div className={styles.previewLabel}>
                    {t('widgets.affirmation.modal.preview')}
                  </div>
                  <div className={styles.previewText}>"{text}"</div>
                </div>
              )}

              {showConfirm && (
                <div className={styles.confirmMessage}>
                  {t('widgets.affirmation.modal.confirmReplace')}
                </div>
              )}

              <div className={styles.actions}>
                <button onClick={handleClose} className={styles.cancelButton}>
                  {t('widgets.affirmation.modal.cancel')}
                </button>
                <button onClick={handleSave} className={styles.saveButton} disabled={!text.trim()}>
                  {showConfirm
                    ? t('widgets.affirmation.modal.yesReplace')
                    : t('widgets.affirmation.modal.save')}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};
