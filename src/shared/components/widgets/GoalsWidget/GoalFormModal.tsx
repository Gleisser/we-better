import { useState } from 'react';
import { motion } from 'framer-motion';
import { XIcon } from '@/shared/components/common/icons';
import { Portal } from '@/shared/components/common/Portal/Portal';
import { Goal, GoalCategory } from './types';
import { CATEGORY_CONFIG } from './config';
import styles from './GoalFormModal.module.css';

/**
 * Props interface for the GoalFormModal component.
 * @interface GoalFormModalProps
 * @property {boolean} isOpen - Controls the visibility of the modal
 * @property {() => void} onClose - Callback function to close the modal
 * @property {(goal: Omit<Goal, 'id'>) => void} onSave - Callback function when form is submitted
 * @property {Goal | null | undefined} initialGoal - Optional initial goal data for editing mode
 */
interface GoalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: Omit<Goal, 'id'>) => void;
  initialGoal: Goal | null | undefined;
}

/**
 * A modal form component for creating and editing goals with milestone tracking.
 * Features:
 * - Animated entrance and exit using Framer Motion
 * - Portal-based rendering
 * - Category selection with icons
 * - Date picker integration
 * - Dynamic milestone management
 * - Form validation
 * - Responsive design
 *
 * The form handles:
 * - Goal title and category
 * - Target date selection
 * - Milestone creation and deletion
 * - Progress tracking
 *
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Controls modal visibility
 * @param {() => void} props.onClose - Handler for closing the modal
 * @param {(goal: Omit<Goal, 'id'>) => void} props.onSave - Handler for form submission
 * @param {Goal | null | undefined} props.initialGoal - Initial goal data for editing
 *
 * @example
 * ```tsx
 * // Creating a new goal
 * function GoalManager() {
 *   const [isModalOpen, setIsModalOpen] = useState(false);
 *
 *   const handleSave = (goalData: Omit<Goal, 'id'>) => {
 *     // Handle goal creation
 *     console.log('New goal:', goalData);
 *     setIsModalOpen(false);
 *   };
 *
 *   return (
 *     <>
 *       <button onClick={() => setIsModalOpen(true)}>
 *         Add New Goal
 *       </button>
 *       <GoalFormModal
 *         isOpen={isModalOpen}
 *         onClose={() => setIsModalOpen(false)}
 *         onSave={handleSave}
 *         initialGoal={null}
 *       />
 *     </>
 *   );
 * }
 * ```
 */
export const GoalFormModal = ({
  isOpen,
  onClose,
  onSave,
  initialGoal,
}: GoalFormModalProps): JSX.Element => {
  /**
   * Form state containing all goal data except the ID.
   * Initialized with initial goal data or default values.
   */
  const [formData, setFormData] = useState<Omit<Goal, 'id'>>({
    title: initialGoal?.title || '',
    category: initialGoal?.category || 'personal',
    progress: initialGoal?.progress || 0,
    targetDate: initialGoal?.targetDate || '',
    milestones: initialGoal?.milestones || [],
  });

  /**
   * State for managing new milestone input.
   */
  const [newMilestone, setNewMilestone] = useState('');

  /**
   * Adds a new milestone to the goal if the input is not empty.
   * Generates a unique ID using timestamp and resets the input field.
   */
  const handleAddMilestone = (): void => {
    if (newMilestone.trim()) {
      setFormData(prev => ({
        ...prev,
        milestones: [
          ...prev.milestones,
          { id: `m-${Date.now()}`, title: newMilestone.trim(), completed: false },
        ],
      }));
      setNewMilestone('');
    }
  };

  /**
   * Removes a milestone from the goal by its ID.
   * @param {string} id - The ID of the milestone to remove
   */
  const handleRemoveMilestone = (id: string): void => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.filter(m => m.id !== id),
    }));
  };

  /**
   * Handles form submission by preventing default behavior,
   * calling the onSave callback with form data, and closing the modal.
   *
   * @param {React.FormEvent} e - The form submission event
   */
  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <Portal>
      <motion.div
        className={styles.overlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: isOpen ? 1 : 0 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className={styles.modal}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
        >
          <div className={styles.header}>
            <h2 className={styles.title}>{initialGoal ? 'Edit Goal' : 'Create New Goal'}</h2>
            <button className={styles.closeButton} onClick={onClose} aria-label="Close modal">
              <XIcon className={styles.closeIcon} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className={styles.content}>
            <div className={styles.section}>
              <label className={styles.label}>
                Goal Title
                <input
                  type="text"
                  className={styles.input}
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter your goal"
                  required
                />
              </label>
            </div>

            <div className={styles.section}>
              <label className={styles.label}>Category</label>
              <div className={styles.categoryOptions}>
                {Object.entries(CATEGORY_CONFIG).map(([category, config]) => (
                  <button
                    key={category}
                    type="button"
                    className={`${styles.categoryButton} ${
                      formData.category === category ? styles.selected : ''
                    }`}
                    onClick={() =>
                      setFormData(prev => ({
                        ...prev,
                        category: category as GoalCategory,
                      }))
                    }
                  >
                    <span className={styles.categoryIcon}>{config.icon}</span>
                    <span className={styles.categoryLabel}>{config.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.section}>
              <label className={styles.label}>Target Date</label>
              <div className={styles.dateInputWrapper}>
                <input
                  type="date"
                  className={styles.input}
                  value={formData.targetDate}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      targetDate: e.target.value,
                    }))
                  }
                  required
                />
                <button
                  type="button"
                  className={styles.calendarButton}
                  onClick={() => {
                    const dateInput = document.querySelector(
                      'input[type="date"]'
                    ) as HTMLInputElement;
                    dateInput?.showPicker?.();
                  }}
                >
                  📅
                </button>
              </div>
            </div>

            <div className={styles.section}>
              <label className={styles.label}>Milestones</label>
              <div className={styles.milestoneInput}>
                <input
                  type="text"
                  className={styles.input}
                  value={newMilestone}
                  onChange={e => setNewMilestone(e.target.value)}
                  placeholder="Add a milestone"
                  onKeyPress={e => e.key === 'Enter' && handleAddMilestone()}
                />
                <button type="button" className={styles.addButton} onClick={handleAddMilestone}>
                  Add
                </button>
              </div>
              <ul className={styles.milestoneList}>
                {formData.milestones.map(milestone => (
                  <li key={milestone.id} className={styles.milestoneItem}>
                    <span>{milestone.title}</span>
                    <button
                      type="button"
                      className={styles.removeButton}
                      onClick={() => handleRemoveMilestone(milestone.id)}
                    >
                      <XIcon className={styles.removeIcon} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.footer}>
              <button type="button" className={styles.cancelButton} onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className={styles.saveButton}>
                {initialGoal ? 'Save Changes' : 'Create Goal'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </Portal>
  );
};
