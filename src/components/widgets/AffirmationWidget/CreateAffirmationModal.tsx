import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { XIcon } from '@/components/common/icons';
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
  existingAffirmation
}: CreateAffirmationModalProps) => {
  const [text, setText] = useState(existingAffirmation || '');
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSave = () => {
    if (existingAffirmation && !showConfirm) {
      setShowConfirm(true);
      return;
    }
    onSave(text);
    onClose();
  };

  const handleClose = () => {
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
                {existingAffirmation ? 'Update Personal Affirmation' : 'Create Personal Affirmation'}
              </h2>
              <button onClick={handleClose} className={styles.closeButton}>
                <XIcon className={styles.closeIcon} />
              </button>
            </div>

            <div className={styles.content}>
              <div className={styles.inputWrapper}>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value.slice(0, MAX_LENGTH))}
                  placeholder="Write your personal affirmation..."
                  className={styles.input}
                  rows={3}
                />
                <div className={styles.charCount}>
                  {text.length}/{MAX_LENGTH}
                </div>
              </div>

              {text && (
                <div className={styles.preview}>
                  <div className={styles.previewLabel}>Preview:</div>
                  <div className={styles.previewText}>"{text}"</div>
                </div>
              )}

              {showConfirm && (
                <div className={styles.confirmMessage}>
                  This will replace your existing personal affirmation. Continue?
                </div>
              )}

              <div className={styles.actions}>
                <button onClick={handleClose} className={styles.cancelButton}>
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className={styles.saveButton}
                  disabled={!text.trim()}
                >
                  {showConfirm ? 'Yes, Replace' : 'Save'}
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