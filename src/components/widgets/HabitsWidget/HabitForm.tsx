import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { XIcon } from '@/components/common/icons';
import { HabitCategory, CATEGORY_CONFIG } from './types';
import styles from './HabitForm.module.css';

interface HabitFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (habit: {
    name: string;
    category: HabitCategory;
  }) => void;
  initialValues?: {
    name: string;
    category: HabitCategory;
  };
  mode: 'create' | 'edit';
}

export const HabitForm = ({ isOpen, onClose, onSubmit, initialValues, mode }: HabitFormProps) => {
  const [name, setName] = useState(initialValues?.name ?? '');
  const [category, setCategory] = useState<HabitCategory>(initialValues?.category ?? 'health');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, category });
    onClose();
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <div className={styles.backdrop} onClick={onClose} />
          <motion.div
            className={styles.container}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className={styles.header}>
              <h3 className={styles.title}>
                {mode === 'create' ? 'New Habit' : 'Edit Habit'}
              </h3>
              <button onClick={onClose} className={styles.closeButton}>
                <XIcon className={styles.closeIcon} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <label htmlFor="name" className={styles.label}>Name</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={styles.input}
                  placeholder="e.g., Morning Meditation"
                  required
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Category</label>
                <div className={styles.categories}>
                  {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                    <button
                      key={key}
                      type="button"
                      className={`${styles.categoryButton} ${
                        category === key ? styles.selected : ''
                      }`}
                      onClick={() => setCategory(key as HabitCategory)}
                    >
                      <span className={styles.categoryIcon}>{config.icon}</span>
                      <span className={styles.categoryLabel}>{config.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.actions}>
                <button type="submit" className={styles.submitButton}>
                  {mode === 'create' ? 'Create Habit' : 'Save Changes'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}; 