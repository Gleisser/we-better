import React, { useState, useEffect } from 'react';
import { useCommonTranslation } from '@/shared/hooks/useTranslation';
import styles from './ChallengeModal.module.css';
import { Dream } from '../../types';
import { CreateDreamChallengeInput, DreamChallenge } from '../../api/dreamChallengesApi';

interface ChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (challengeData: CreateDreamChallengeInput) => Promise<void>;
  dreams: Dream[];
  editingChallenge?: DreamChallenge;
}

const ChallengeModal: React.FC<ChallengeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  dreams,
  editingChallenge,
}) => {
  const { t } = useCommonTranslation();
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
    // Reset form when modal opens or populate with editing data
    if (isOpen) {
      if (editingChallenge) {
        // Populate form with existing challenge data
        setTitle(editingChallenge.title);
        setDescription(editingChallenge.description);
        setDuration(editingChallenge.duration.toString());
        setDurationUnit('days'); // Default since we store everything in days
        setFrequency(editingChallenge.frequency);
        setSelectedDays(editingChallenge.selected_days || []);
        setDifficultyLevel(editingChallenge.difficulty_level);
        setLinkedDream(editingChallenge.dream_id || '');
        setEnableReminders(editingChallenge.enable_reminders);
        setReminderTime(editingChallenge.reminder_time || '09:00');
      } else {
        // Reset form for new challenge
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
    }
  }, [isOpen, editingChallenge]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    // Calculate actual duration in days
    let durationInDays = parseInt(duration);
    if (durationUnit === 'weeks') durationInDays *= 7;
    if (durationUnit === 'months') durationInDays *= 30;

    // Create challenge object matching API interface
    const newChallenge: CreateDreamChallengeInput = {
      title,
      description,
      duration: durationInDays,
      frequency,
      selected_days: frequency === 'custom' ? selectedDays : [],
      difficulty_level: difficultyLevel,
      dream_id: linkedDream || null,
      enable_reminders: enableReminders,
      reminder_time: enableReminders ? reminderTime : null,
      start_date: new Date().toISOString(),
      current_day: 0,
      completed: false,
    };

    try {
      await onSave(newChallenge);
      onClose();
    } catch (error) {
      console.error('Error creating challenge:', error);
      // Could add error state here to show to user
    }
  };

  const handleDayToggle = (day: number): void => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  // Calculate day total for display
  const calculateTotalDays = (): number => {
    const durationNum = parseInt(duration);
    if (durationUnit === 'weeks') return durationNum * 7;
    if (durationUnit === 'months') return durationNum * 30;
    return durationNum;
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.challengeModal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {editingChallenge
              ? t('dreamBoard.challenge.modal.editTitle')
              : t('dreamBoard.challenge.modal.createTitle')}
          </h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label={t('dreamBoard.challenge.modal.close') as string}
          >
            ×
          </button>
        </div>

        <div className={styles.modalContent}>
          <form onSubmit={handleSubmit}>
            <div className={styles.formSection}>
              <div className={styles.formSectionHeader}>
                <div className={styles.sectionIcon}>📝</div>
                <h3 className={styles.sectionTitle}>
                  {t('dreamBoard.challenge.modal.sections.basicInfo')}
                </h3>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="title">{t('dreamBoard.challenge.modal.form.challengeTitle')}</label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder={t('dreamBoard.challenge.modal.form.titlePlaceholder') as string}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="description">
                  {t('dreamBoard.challenge.modal.form.description')}
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder={
                    t('dreamBoard.challenge.modal.form.descriptionPlaceholder') as string
                  }
                  required
                />
              </div>
            </div>

            <div className={styles.formSection}>
              <div className={styles.formSectionHeader}>
                <div className={styles.sectionIcon}>⏱️</div>
                <h3 className={styles.sectionTitle}>
                  {t('dreamBoard.challenge.modal.sections.durationDifficulty')}
                </h3>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="duration">{t('dreamBoard.challenge.modal.form.duration')}</label>
                <div className={styles.durationInputs}>
                  <input
                    type="number"
                    id="duration"
                    min="1"
                    value={duration}
                    onChange={e => setDuration(e.target.value)}
                    required
                  />
                  <div className={styles.unitSelectionWrapper}>
                    <select
                      value={durationUnit}
                      onChange={e => setDurationUnit(e.target.value as 'days' | 'weeks' | 'months')}
                      className={styles.unitSelect}
                    >
                      <option value="days">{t('dreamBoard.challenge.modal.units.days')}</option>
                      <option value="weeks">{t('dreamBoard.challenge.modal.units.weeks')}</option>
                      <option value="months">{t('dreamBoard.challenge.modal.units.months')}</option>
                    </select>
                  </div>
                </div>
                {durationUnit !== 'days' && (
                  <div className={styles.durationHint}>
                    {t('dreamBoard.challenge.progress.totalDays', { days: calculateTotalDays() })}
                  </div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label>{t('dreamBoard.challenge.modal.form.difficultyLevel')}</label>
                <div className={styles.difficultyInputs}>
                  <button
                    type="button"
                    className={`${styles.difficultyBtn} ${styles.easyBtn} ${difficultyLevel === 'easy' ? styles.active : ''}`}
                    onClick={() => setDifficultyLevel('easy')}
                  >
                    <span className={styles.difficultyIcon}>🌱</span>
                    {t('dreamBoard.challenge.modal.difficulty.easy')}
                  </button>
                  <button
                    type="button"
                    className={`${styles.difficultyBtn} ${styles.mediumBtn} ${difficultyLevel === 'medium' ? styles.active : ''}`}
                    onClick={() => setDifficultyLevel('medium')}
                  >
                    <span className={styles.difficultyIcon}>🔄</span>
                    {t('dreamBoard.challenge.modal.difficulty.medium')}
                  </button>
                  <button
                    type="button"
                    className={`${styles.difficultyBtn} ${styles.hardBtn} ${difficultyLevel === 'hard' ? styles.active : ''}`}
                    onClick={() => setDifficultyLevel('hard')}
                  >
                    <span className={styles.difficultyIcon}>🔥</span>
                    {t('dreamBoard.challenge.modal.difficulty.hard')}
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <div className={styles.formSectionHeader}>
                <div className={styles.sectionIcon}>🔄</div>
                <h3 className={styles.sectionTitle}>
                  {t('dreamBoard.challenge.modal.sections.frequency')}
                </h3>
              </div>

              <div className={styles.formGroup}>
                <div className={styles.frequencyOptions}>
                  <button
                    type="button"
                    className={`${styles.frequencyBtn} ${frequency === 'daily' ? styles.active : ''}`}
                    onClick={() => setFrequency('daily')}
                  >
                    {t('dreamBoard.challenge.modal.frequency.daily')}
                  </button>
                  <button
                    type="button"
                    className={`${styles.frequencyBtn} ${frequency === 'weekly' ? styles.active : ''}`}
                    onClick={() => setFrequency('weekly')}
                  >
                    {t('dreamBoard.challenge.modal.frequency.weekly')}
                  </button>
                  <button
                    type="button"
                    className={`${styles.frequencyBtn} ${frequency === 'custom' ? styles.active : ''}`}
                    onClick={() => setFrequency('custom')}
                  >
                    {t('dreamBoard.challenge.modal.frequency.custom')}
                  </button>
                </div>
              </div>

              {frequency === 'custom' && (
                <div className={styles.formGroup}>
                  <label>{t('dreamBoard.challenge.modal.form.selectDays')}</label>
                  <div className={styles.daySelector}>
                    {[
                      t('dreamBoard.challenge.modal.weekDays.mon'),
                      t('dreamBoard.challenge.modal.weekDays.tue'),
                      t('dreamBoard.challenge.modal.weekDays.wed'),
                      t('dreamBoard.challenge.modal.weekDays.thu'),
                      t('dreamBoard.challenge.modal.weekDays.fri'),
                      t('dreamBoard.challenge.modal.weekDays.sat'),
                      t('dreamBoard.challenge.modal.weekDays.sun'),
                    ].map((day, index) => (
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

              <div className={styles.tipContainer}>
                <div className={styles.tipIcon}>💡</div>
                <div className={styles.tipText}>
                  {frequency === 'daily'
                    ? t('dreamBoard.challenge.modal.tips.daily')
                    : frequency === 'weekly'
                      ? t('dreamBoard.challenge.modal.tips.weekly')
                      : t('dreamBoard.challenge.modal.tips.custom')}
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <div className={styles.formSectionHeader}>
                <div className={styles.sectionIcon}>🔗</div>
                <h3 className={styles.sectionTitle}>
                  {t('dreamBoard.challenge.modal.sections.connectRemind')}
                </h3>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="linkedDream">
                  {t('dreamBoard.challenge.modal.form.linkToDream')}
                </label>
                <select
                  id="linkedDream"
                  value={linkedDream}
                  onChange={e => setLinkedDream(e.target.value)}
                >
                  <option value="">{t('dreamBoard.challenge.modal.form.none')}</option>
                  {dreams.map(dream => (
                    <option key={dream.id} value={dream.id}>
                      {dream.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <div className={styles.reminderToggle}>
                  <label htmlFor="enableReminders" className={styles.switchLabel}>
                    <span className={styles.switchLabelText}>
                      {t('dreamBoard.challenge.modal.form.enableReminders')}
                    </span>
                    <div className={styles.switchWrapper}>
                      <input
                        type="checkbox"
                        id="enableReminders"
                        checked={enableReminders}
                        onChange={e => setEnableReminders(e.target.checked)}
                        className={styles.switchInput}
                      />
                      <span className={styles.switchSlider}></span>
                    </div>
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
            </div>

            <div className={styles.modalFooter}>
              <button type="button" onClick={onClose} className={styles.cancelButton}>
                {t('dreamBoard.challenge.modal.buttons.cancel')}
              </button>
              <button type="submit" className={styles.saveButton}>
                {editingChallenge
                  ? t('dreamBoard.challenge.modal.buttons.update')
                  : t('dreamBoard.challenge.modal.buttons.create')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChallengeModal;
