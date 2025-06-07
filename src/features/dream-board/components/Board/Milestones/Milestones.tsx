import React, { useState } from 'react';
import { DreamBoardContent } from '../../../types';
import styles from './Milestones.module.css';

interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
}

interface MilestonesProps {
  content: DreamBoardContent;
  onUpdate: (changes: Partial<DreamBoardContent>) => void;
}

export const Milestones: React.FC<MilestonesProps> = ({ content, onUpdate: _onUpdate }) => {
  // Use content.id as a key for storing/retrieving milestones
  const contentId = content.id;

  // Initialize milestones from localStorage or create empty array
  const [milestones, setMilestones] = useState<Milestone[]>(() => {
    const savedMilestones = localStorage.getItem(`milestones-${contentId}`);
    return savedMilestones ? JSON.parse(savedMilestones) : [];
  });

  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDueDate, setNewMilestoneDueDate] = useState('');
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null);

  // Save milestones to localStorage whenever they change
  const saveMilestones = (updatedMilestones: Milestone[]): void => {
    localStorage.setItem(`milestones-${contentId}`, JSON.stringify(updatedMilestones));
    setMilestones(updatedMilestones);
  };

  // Add a new milestone
  const handleAddMilestone = (): void => {
    if (!newMilestoneTitle.trim()) return;

    const newMilestone: Milestone = {
      id: `milestone-${Date.now()}`,
      title: newMilestoneTitle,
      completed: false,
      dueDate: newMilestoneDueDate || undefined,
    };

    const updatedMilestones = [...milestones, newMilestone];
    saveMilestones(updatedMilestones);
    setNewMilestoneTitle('');
    setNewMilestoneDueDate('');
  };

  // Toggle milestone completion status
  const toggleMilestoneCompletion = (id: string): void => {
    const updatedMilestones = milestones.map(milestone =>
      milestone.id === id ? { ...milestone, completed: !milestone.completed } : milestone
    );
    saveMilestones(updatedMilestones);
  };

  // Delete a milestone
  const deleteMilestone = (id: string): void => {
    const updatedMilestones = milestones.filter(milestone => milestone.id !== id);
    saveMilestones(updatedMilestones);
    if (editingMilestoneId === id) {
      setEditingMilestoneId(null);
    }
  };

  // Update milestone title
  const updateMilestoneTitle = (id: string, title: string): void => {
    const updatedMilestones = milestones.map(milestone =>
      milestone.id === id ? { ...milestone, title } : milestone
    );
    saveMilestones(updatedMilestones);
  };

  return (
    <div className={styles.milestonesContainer}>
      <h3 className={styles.milestonesTitle}>Dream Milestones</h3>
      <p className={styles.milestonesDescription}>Break down your dream into achievable steps</p>

      {/* Add new milestone form */}
      <div className={styles.addMilestoneForm}>
        <input
          type="text"
          value={newMilestoneTitle}
          onChange={e => setNewMilestoneTitle(e.target.value)}
          placeholder="New milestone title..."
          className={styles.milestoneInput}
        />
        <button
          onClick={handleAddMilestone}
          disabled={!newMilestoneTitle.trim()}
          className={styles.addMilestoneButton}
        >
          Add
        </button>
      </div>

      {/* Milestones list */}
      <div className={styles.milestonesList}>
        {milestones.length === 0 ? (
          <div className={styles.emptyState}>
            No milestones yet. Add your first milestone to track progress!
          </div>
        ) : (
          milestones.map(milestone => (
            <div key={milestone.id} className={styles.milestoneItem}>
              <div className={styles.milestoneCheckbox}>
                <input
                  type="checkbox"
                  checked={milestone.completed}
                  onChange={() => toggleMilestoneCompletion(milestone.id)}
                  id={`milestone-${milestone.id}`}
                />
                <label
                  htmlFor={`milestone-${milestone.id}`}
                  className={milestone.completed ? styles.completedMilestone : ''}
                >
                  {editingMilestoneId === milestone.id ? (
                    <input
                      type="text"
                      value={milestone.title}
                      onChange={e => updateMilestoneTitle(milestone.id, e.target.value)}
                      onBlur={() => setEditingMilestoneId(null)}
                      autoFocus
                      className={styles.editMilestoneInput}
                    />
                  ) : (
                    <span
                      onClick={() => setEditingMilestoneId(milestone.id)}
                      className={styles.milestoneTitle}
                    >
                      {milestone.title}
                    </span>
                  )}
                </label>
              </div>

              <div className={styles.milestoneActions}>
                {milestone.dueDate && (
                  <span className={styles.milestoneDueDate}>
                    {new Date(milestone.dueDate).toLocaleDateString()}
                  </span>
                )}

                <button
                  onClick={() => deleteMilestone(milestone.id)}
                  className={styles.deleteMilestoneButton}
                  aria-label="Delete milestone"
                >
                  ×
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
