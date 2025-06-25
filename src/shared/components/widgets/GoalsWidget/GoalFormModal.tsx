import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { XIcon } from '@/shared/components/common/icons';
import { Portal } from '@/shared/components/common/Portal/Portal';
import { useCommonTranslation } from '@/shared/hooks/useTranslation';
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
  const { t } = useCommonTranslation();

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

  // Reset form when initialGoal changes (switching between create/edit modes)
  useEffect(() => {
    setFormData({
      title: initialGoal?.title || '',
      category: initialGoal?.category || 'personal',
      progress: initialGoal?.progress || 0,
      targetDate: initialGoal?.targetDate || '',
      milestones: initialGoal?.milestones || [],
    });
    // Reset editing states when goal changes
    setEditingMilestoneId(null);
    setEditingMilestoneTitle('');
  }, [initialGoal]);

  /**
   * State for managing new milestone input.
   */
  const [newMilestone, setNewMilestone] = useState('');

  /**
   * State for tracking milestone being edited (inline editing).
   */
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null);
  const [editingMilestoneTitle, setEditingMilestoneTitle] = useState('');

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
   * Toggle milestone completion status.
   * @param {string} id - The ID of the milestone to toggle
   */
  const handleToggleMilestone = (id: string): void => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.map(milestone =>
        milestone.id === id ? { ...milestone, completed: !milestone.completed } : milestone
      ),
    }));
  };

  /**
   * Start editing a milestone title.
   * @param {string} id - The ID of the milestone to edit
   * @param {string} currentTitle - The current title of the milestone
   */
  const handleStartEditMilestone = (id: string, currentTitle: string): void => {
    setEditingMilestoneId(id);
    setEditingMilestoneTitle(currentTitle);
  };

  /**
   * Save the edited milestone title.
   */
  const handleSaveEditMilestone = (): void => {
    if (editingMilestoneId && editingMilestoneTitle.trim()) {
      setFormData(prev => ({
        ...prev,
        milestones: prev.milestones.map(milestone =>
          milestone.id === editingMilestoneId
            ? { ...milestone, title: editingMilestoneTitle.trim() }
            : milestone
        ),
      }));
    }
    setEditingMilestoneId(null);
    setEditingMilestoneTitle('');
  };

  /**
   * Cancel editing a milestone.
   */
  const handleCancelEditMilestone = (): void => {
    setEditingMilestoneId(null);
    setEditingMilestoneTitle('');
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
            <h2 className={styles.title}>
              {initialGoal ? t('widgets.goals.form.editGoal') : t('widgets.goals.form.newGoal')}
            </h2>
            <button
              className={styles.closeButton}
              onClick={onClose}
              aria-label={t('actions.close') as string}
            >
              <XIcon className={styles.icon} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className={styles.content}>
            <div className={styles.section}>
              <label htmlFor="goalTitle" className={styles.label}>
                {t('widgets.goals.form.title')}
              </label>
              <input
                id="goalTitle"
                type="text"
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder={t('widgets.goals.form.titlePlaceholder') as string}
                className={styles.input}
                required
              />
            </div>

            <div className={styles.section}>
              <label className={styles.label}>{t('widgets.goals.form.category')}</label>
              <div className={styles.categoryOptions}>
                {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                  <button
                    key={key}
                    type="button"
                    className={`${styles.categoryButton} ${
                      formData.category === key ? styles.selected : ''
                    }`}
                    onClick={() =>
                      setFormData(prev => ({ ...prev, category: key as GoalCategory }))
                    }
                  >
                    <span className={styles.categoryIcon}>{config.icon}</span>
                    <span className={styles.categoryLabel}>
                      {t(`widgets.goals.categories.${key}`)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.section}>
              <label htmlFor="targetDate" className={styles.label}>
                {t('widgets.goals.form.targetDate')}
              </label>
              <input
                id="targetDate"
                type="date"
                value={formData.targetDate}
                onChange={e => setFormData(prev => ({ ...prev, targetDate: e.target.value }))}
                className={styles.input}
                placeholder={t('widgets.goals.form.targetDatePlaceholder') as string}
              />
            </div>

            <div className={styles.section}>
              <div className={styles.milestonesHeader}>
                <h3 className={styles.milestonesTitle}>{t('widgets.goals.form.milestones')}</h3>
                <p className={styles.milestonesDescription}>
                  {t('widgets.goals.form.milestonesDescription')}
                </p>
              </div>

              <div className={styles.milestoneInput}>
                <input
                  type="text"
                  value={newMilestone}
                  onChange={e => setNewMilestone(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddMilestone())}
                  placeholder={t('widgets.goals.form.milestonePlaceholder') as string}
                  className={styles.input}
                />
                <button type="button" onClick={handleAddMilestone} className={styles.addButton}>
                  {t('widgets.goals.form.addMilestone')}
                </button>
              </div>

              {/* Milestone list and actions */}
              <div className={styles.milestoneList}>
                {formData.milestones.map(milestone => (
                  <div key={milestone.id} className={styles.milestoneItem}>
                    {editingMilestoneId === milestone.id ? (
                      <div className={styles.editingMilestone}>
                        <input
                          type="text"
                          value={editingMilestoneTitle}
                          onChange={e => setEditingMilestoneTitle(e.target.value)}
                          onKeyPress={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSaveEditMilestone();
                            } else if (e.key === 'Escape') {
                              handleCancelEditMilestone();
                            }
                          }}
                          className={styles.editInput}
                          autoFocus
                        />
                        <div className={styles.editActions}>
                          <button
                            type="button"
                            onClick={handleSaveEditMilestone}
                            className={styles.saveEditButton}
                          >
                            {t('widgets.goals.milestones.save')}
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEditMilestone}
                            className={styles.cancelEditButton}
                          >
                            {t('widgets.goals.milestones.cancel')}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className={styles.milestoneContent}>
                        <button
                          type="button"
                          onClick={() => handleToggleMilestone(milestone.id)}
                          className={`${styles.checkmark} ${milestone.completed ? styles.completed : ''}`}
                          aria-label={
                            milestone.completed
                              ? (t('widgets.goals.milestones.completed') as string)
                              : (t('widgets.goals.milestones.pending') as string)
                          }
                        >
                          {milestone.completed && <span className={styles.checkmark}>✓</span>}
                        </button>
                        <span
                          className={`${styles.milestoneTitle} ${milestone.completed ? styles.completedText : ''}`}
                          onClick={() => handleStartEditMilestone(milestone.id, milestone.title)}
                          title={t('widgets.goals.milestones.edit') as string}
                        >
                          {milestone.title}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveMilestone(milestone.id)}
                          className={styles.removeButton}
                          aria-label={t('widgets.goals.milestones.delete') as string}
                          title={t('widgets.goals.milestones.delete') as string}
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.footer}>
              <button type="button" onClick={onClose} className={styles.cancelButton}>
                {t('widgets.goals.form.cancel')}
              </button>
              <button type="submit" className={styles.saveButton}>
                {initialGoal
                  ? t('widgets.goals.form.saveButton')
                  : t('widgets.goals.form.createButton')}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </Portal>
  );
};
