import React, { useState, useEffect } from 'react';
import styles from '../../DreamBoardPage.module.css';
import { Dream } from '../../types';

interface NewChallenge {
  title: string;
  description: string;
  duration: number;
  frequency: 'daily' | 'weekly' | 'custom';
  selectedDays: number[];
  difficultyLevel: 'easy' | 'medium' | 'hard';
  dreamId: string | null;
  enableReminders: boolean;
  reminderTime: string | null;
  startDate: string;
  currentDay: number;
  completed: boolean;
}

interface ChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (challengeData: NewChallenge) => void;
  dreams: Dream[];
}

const ChallengeModal: React.FC<ChallengeModalProps> = ({ isOpen, onClose, onSave, dreams }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('30');
  const [durationUnit, setDurationUnit] = useState<'days' | 'weeks' | 'months'>('days');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'custom'>('daily');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [difficultyLevel, setDifficultyLevel] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [linkedDream, setLinkedDream] = useState('');
  const [enableReminders, setEnableReminders] = useState(false);
  const [reminderTime, setReminderTime] = useState('09:00');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  useEffect(() => {
    // Reset form when modal opens
    if (isOpen) {
      setTitle('');
      setDescription('');
      setDuration('30');
      setDurationUnit('days');
      setFrequency('daily');
      setSelectedDays([]);
      setDifficultyLevel('medium');
      setLinkedDream('');
      setEnableReminders(false);
      setReminderTime('09:00');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();

    // Calculate actual duration in days
    let durationInDays = parseInt(duration);
    if (durationUnit === 'weeks') durationInDays *= 7;
    if (durationUnit === 'months') durationInDays *= 30;

    // Create challenge object
    const newChallenge = {
      title,
      description,
      duration: durationInDays,
      frequency,
      selectedDays: frequency === 'custom' ? selectedDays : [],
      difficultyLevel,
      dreamId: linkedDream || null,
      enableReminders,
      reminderTime: enableReminders ? reminderTime : null,
      startDate: new Date().toISOString(),
      currentDay: 0,
      completed: false,
    };

    onSave(newChallenge);
    onClose();
  };

  const handleDayToggle = (day: number): void => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.challengeModal} onClick={e => e.stopPropagation()}>
        <h2>Create New Challenge</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="title">Challenge Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="30-Day Meditation Challenge"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Meditate for 10 minutes each day"
              required
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="duration">Duration</label>
              <div className={styles.durationInputs}>
                <input
                  type="number"
                  id="duration"
                  min="1"
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                  required
                />
                <select
                  value={durationUnit}
                  onChange={e => setDurationUnit(e.target.value as 'days' | 'weeks' | 'months')}
                >
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                  <option value="months">Months</option>
                </select>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Difficulty</label>
              <div className={styles.difficultyInputs}>
                <button
                  type="button"
                  className={`${styles.difficultyBtn} ${difficultyLevel === 'easy' ? styles.active : ''}`}
                  onClick={() => setDifficultyLevel('easy')}
                >
                  Easy
                </button>
                <button
                  type="button"
                  className={`${styles.difficultyBtn} ${difficultyLevel === 'medium' ? styles.active : ''}`}
                  onClick={() => setDifficultyLevel('medium')}
                >
                  Medium
                </button>
                <button
                  type="button"
                  className={`${styles.difficultyBtn} ${difficultyLevel === 'hard' ? styles.active : ''}`}
                  onClick={() => setDifficultyLevel('hard')}
                >
                  Hard
                </button>
              </div>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Frequency</label>
            <div className={styles.frequencyOptions}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="frequency"
                  value="daily"
                  checked={frequency === 'daily'}
                  onChange={() => setFrequency('daily')}
                />
                Daily
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="frequency"
                  value="weekly"
                  checked={frequency === 'weekly'}
                  onChange={() => setFrequency('weekly')}
                />
                Weekly
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="frequency"
                  value="custom"
                  checked={frequency === 'custom'}
                  onChange={() => setFrequency('custom')}
                />
                Custom
              </label>
            </div>
          </div>

          {frequency === 'custom' && (
            <div className={styles.formGroup}>
              <label>Select Days</label>
              <div className={styles.daySelector}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                  <button
                    key={day}
                    type="button"
                    className={`${styles.dayButton} ${selectedDays.includes(index) ? styles.selectedDay : ''}`}
                    onClick={() => handleDayToggle(index)}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="linkedDream">Link to Dream (Optional)</label>
            <select
              id="linkedDream"
              value={linkedDream}
              onChange={e => setLinkedDream(e.target.value)}
            >
              <option value="">None</option>
              {dreams.map(dream => (
                <option key={dream.id} value={dream.id}>
                  {dream.title}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <div className={styles.reminderToggle}>
              <label htmlFor="enableReminders" className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  id="enableReminders"
                  checked={enableReminders}
                  onChange={e => setEnableReminders(e.target.checked)}
                />
                Enable Daily Reminders
              </label>

              {enableReminders && (
                <input
                  type="time"
                  value={reminderTime}
                  onChange={e => setReminderTime(e.target.value)}
                  className={styles.timeInput}
                />
              )}
            </div>
          </div>

          <div className={styles.modalButtons}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" className={styles.saveButton}>
              Create Challenge
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChallengeModal;
