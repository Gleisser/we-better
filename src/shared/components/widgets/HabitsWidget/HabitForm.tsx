import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { XIcon } from '@/shared/components/common/icons';
import { Habit, HabitCategory } from './types';
import { CATEGORY_CONFIG } from './config';
import styles from './HabitForm.module.css';

/**
 * Props interface for the HabitForm component.
 * @interface HabitFormProps
 * @property {boolean} isOpen - Controls the visibility of the form modal
 * @property {() => void} onClose - Callback function to close the form modal
 * @property {(habit: Omit<Habit, 'id' | 'streak' | 'completedDays'>) => void} onSubmit - Callback function when form is submitted
 * @property {Habit} [initialValues] - Optional initial values for editing an existing habit
 * @property {'create' | 'edit'} mode - Determines if the form is for creating or editing a habit
 */
interface HabitFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (habit: Omit<Habit, 'id' | 'streak' | 'completedDays'>) => void;
  initialValues?: Habit;
  mode: 'create' | 'edit';
}

/**
 * A modal form component for creating and editing habits.
 * Features:
 * - Animated entrance and exit using Framer Motion
 * - Portal-based rendering for proper modal stacking
 * - Form validation
 * - Category selection with icons
 * - Responsive design
 * - Support for both creation and editing modes
 *
 * The form handles habit name and category selection, with the category options
 * being predefined in the CATEGORY_CONFIG.
 *
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Controls modal visibility
 * @param {() => void} props.onClose - Handler for closing the modal
 * @param {Function} props.onSubmit - Handler for form submission
 * @param {Habit} [props.initialValues] - Initial values for editing mode
 * @param {'create' | 'edit'} props.mode - Form mode
 *
 * @example
 * ```tsx
 * // Creating a new habit
 * function HabitManager() {
 *   const [isFormOpen, setIsFormOpen] = useState(false);
 *
 *   const handleSubmit = (habitData) => {
 *     // Handle habit creation
 *     console.log('New habit:', habitData);
 *     setIsFormOpen(false);
 *   };
 *
 *   return (
 *     <>
 *       <button onClick={() => setIsFormOpen(true)}>
 *         Add New Habit
 *       </button>
 *       <HabitForm
 *         isOpen={isFormOpen}
 *         onClose={() => setIsFormOpen(false)}
 *         onSubmit={handleSubmit}
 *         mode="create"
 *       />
 *     </>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Editing an existing habit
 * function EditHabit({ habit }) {
 *   const [isEditing, setIsEditing] = useState(false);
 *
 *   const handleEdit = (updatedHabit) => {
 *     // Handle habit update
 *     console.log('Updated habit:', updatedHabit);
 *     setIsEditing(false);
 *   };
 *
 *   return (
 *     <HabitForm
 *       isOpen={isEditing}
 *       onClose={() => setIsEditing(false)}
 *       onSubmit={handleEdit}
 *       initialValues={habit}
 *       mode="edit"
 *     />
 *   );
 * }
 * ```
 */
export const HabitForm = ({
  isOpen,
  onClose,
  onSubmit,
  initialValues,
  mode,
}: HabitFormProps): JSX.Element => {
  const [name, setName] = useState(initialValues?.name ?? '');
  const [category, setCategory] = useState<HabitCategory>(initialValues?.category ?? 'health');

  /**
   * Handles form submission by preventing default behavior,
   * calling the onSubmit callback with form data, and closing the modal.
   *
   * @param {React.FormEvent} e - The form submission event
   */
  const handleSubmit = (e: React.FormEvent): void => {
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
              <h3 className={styles.title}>{mode === 'create' ? 'New Habit' : 'Edit Habit'}</h3>
              <button onClick={onClose} className={styles.closeButton}>
                <XIcon className={styles.closeIcon} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <label htmlFor="name" className={styles.label}>
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
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
