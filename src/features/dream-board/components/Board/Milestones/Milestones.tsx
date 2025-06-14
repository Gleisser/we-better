import React, { useState, useEffect } from 'react';
import { DreamBoardContent } from '../../../types';
import {
  getMilestonesForContent,
  createMilestoneForContent,
  toggleMilestoneCompletionForContent,
  deleteMilestoneForContent,
  updateMilestoneForContent,
} from '../../../services/milestonesService';
import styles from './Milestones.module.css';

interface MilestonesProps {
  content: DreamBoardContent;
  onUpdate: (changes: Partial<DreamBoardContent>) => void;
}

import { Milestone } from '../../../types';

export const Milestones: React.FC<MilestonesProps> = ({ content, onUpdate: _onUpdate }) => {
  const contentId = content.id;

  // State for milestones
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDueDate, setNewMilestoneDueDate] = useState('');
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null);

  // Load milestones from backend
  useEffect(() => {
    const loadMilestones = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        const fetchedMilestones = await getMilestonesForContent(contentId);
        setMilestones(fetchedMilestones);
      } catch (err) {
        console.error('Error loading milestones:', err);
        setError('Failed to load milestones');
      } finally {
        setLoading(false);
      }
    };

    loadMilestones();
  }, [contentId]);

  // Add a new milestone
  const handleAddMilestone = async (): Promise<void> => {
    if (!newMilestoneTitle.trim()) return;

    try {
      const newMilestone = await createMilestoneForContent(contentId, {
        title: newMilestoneTitle,
        date: newMilestoneDueDate || undefined,
      });

      // Update local state and clear form
      setMilestones([...milestones, newMilestone]);
      setNewMilestoneTitle('');
      setNewMilestoneDueDate('');
    } catch (err) {
      console.error('Error adding milestone:', err);
      setError('Failed to add milestone');
    }
  };

  // Toggle milestone completion status
  const handleToggleMilestoneCompletion = async (id: string): Promise<void> => {
    try {
      const updatedMilestone = await toggleMilestoneCompletionForContent(id);

      setMilestones(
        milestones.map(milestone => (milestone.id === id ? updatedMilestone : milestone))
      );
    } catch (err) {
      console.error('Error toggling milestone completion:', err);
      setError('Failed to update milestone');
    }
  };

  // Delete a milestone
  const handleDeleteMilestone = async (id: string): Promise<void> => {
    try {
      await deleteMilestoneForContent(id);

      setMilestones(milestones.filter(milestone => milestone.id !== id));
      if (editingMilestoneId === id) {
        setEditingMilestoneId(null);
      }
    } catch (err) {
      console.error('Error deleting milestone:', err);
      setError('Failed to delete milestone');
    }
  };

  // Update milestone title
  const handleUpdateMilestoneTitle = async (id: string, title: string): Promise<void> => {
    try {
      const milestoneToUpdate = milestones.find(m => m.id === id);
      if (!milestoneToUpdate) return;

      const updatedMilestone = await updateMilestoneForContent({
        ...milestoneToUpdate,
        title,
      });

      setMilestones(
        milestones.map(milestone => (milestone.id === id ? updatedMilestone : milestone))
      );
    } catch (err) {
      console.error('Error updating milestone title:', err);
      setError('Failed to update milestone');
    }
  };

  if (loading) {
    return (
      <div className={styles.milestonesContainer}>
        <h3 className={styles.milestonesTitle}>Dream Milestones</h3>
        <div className={styles.loadingState}>Loading milestones...</div>
      </div>
    );
  }

  return (
    <div className={styles.milestonesContainer}>
      <h3 className={styles.milestonesTitle}>Dream Milestones</h3>
      <p className={styles.milestonesDescription}>Break down your dream into achievable steps</p>

      {error && (
        <div className={styles.errorState}>
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Add new milestone form */}
      <div className={styles.addMilestoneForm}>
        <input
          type="text"
          value={newMilestoneTitle}
          onChange={e => setNewMilestoneTitle(e.target.value)}
          placeholder="New milestone title..."
          className={styles.milestoneInput}
        />
        <input
          type="date"
          value={newMilestoneDueDate}
          onChange={e => setNewMilestoneDueDate(e.target.value)}
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
                  onChange={() => handleToggleMilestoneCompletion(milestone.id)}
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
                      onChange={e => {
                        const updatedMilestones = milestones.map(m =>
                          m.id === milestone.id ? { ...m, title: e.target.value } : m
                        );
                        setMilestones(updatedMilestones);
                      }}
                      onBlur={() => {
                        handleUpdateMilestoneTitle(milestone.id, milestone.title);
                        setEditingMilestoneId(null);
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          handleUpdateMilestoneTitle(milestone.id, milestone.title);
                          setEditingMilestoneId(null);
                        }
                        if (e.key === 'Escape') {
                          setEditingMilestoneId(null);
                        }
                      }}
                      autoFocus
                      className={styles.milestoneEditInput}
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
              {milestone.date && (
                <div className={styles.milestoneDueDate}>
                  Due: {new Date(milestone.date).toLocaleDateString()}
                </div>
              )}
              <button
                onClick={() => handleDeleteMilestone(milestone.id)}
                className={styles.deleteMilestoneButton}
                title="Delete milestone"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
