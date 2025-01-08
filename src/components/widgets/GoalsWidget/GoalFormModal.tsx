import { useState } from 'react';
import { motion } from 'framer-motion';
import { XIcon } from '@/components/common/icons';
import { Portal } from '@/components/common/Portal/Portal';
import { Goal, GoalCategory } from './types';
import { CATEGORY_CONFIG } from './config';
import styles from './GoalFormModal.module.css';

interface GoalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: Omit<Goal, 'id'>) => void;
  initialGoal?: Goal;
}

export const GoalFormModal = ({ 
  isOpen, 
  onClose, 
  onSave,
  initialGoal 
}: GoalFormModalProps) => {
  const [formData, setFormData] = useState<Omit<Goal, 'id'>>({
    title: initialGoal?.title || '',
    category: initialGoal?.category || 'personal',
    progress: initialGoal?.progress || 0,
    targetDate: initialGoal?.targetDate || '',
    milestones: initialGoal?.milestones || []
  });

  const [newMilestone, setNewMilestone] = useState('');

  const handleAddMilestone = () => {
    if (newMilestone.trim()) {
      setFormData(prev => ({
        ...prev,
        milestones: [
          ...prev.milestones,
          { id: `m-${Date.now()}`, title: newMilestone.trim(), completed: false }
        ]
      }));
      setNewMilestone('');
    }
  };

  const handleRemoveMilestone = (id: string) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.filter(m => m.id !== id)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
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
              {initialGoal ? 'Edit Goal' : 'Create New Goal'}
            </h2>
            <button
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Close modal"
            >
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
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
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
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      category: category as GoalCategory 
                    }))}
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
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    targetDate: e.target.value 
                  }))}
                  required
                />
                <button 
                  type="button"
                  className={styles.calendarButton}
                  onClick={() => {
                    // This will trigger the native date picker
                    const dateInput = document.querySelector('input[type="date"]');
                    dateInput?.showPicker();
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
                  onChange={(e) => setNewMilestone(e.target.value)}
                  placeholder="Add a milestone"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddMilestone()}
                />
                <button
                  type="button"
                  className={styles.addButton}
                  onClick={handleAddMilestone}
                >
                  Add
                </button>
              </div>
              <ul className={styles.milestoneList}>
                {formData.milestones.map((milestone) => (
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
              <button 
                type="button" 
                className={styles.cancelButton} 
                onClick={onClose}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className={styles.saveButton}
              >
                {initialGoal ? 'Update Goal' : 'Create Goal'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </Portal>
  );
}; 