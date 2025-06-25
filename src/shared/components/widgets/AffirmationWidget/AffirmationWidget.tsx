import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './AffirmationWidget.module.css';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MicrophoneIcon,
  StopIcon,
  XIcon,
  BellIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  BookmarkIcon,
} from '@/shared/components/common/icons';
import { useCommonTranslation } from '@/shared/hooks/useTranslation';
import ParticleEffect from './ParticleEffect';
import { useVoiceRecorder } from '@/shared/hooks/useVoiceRecorder';
import { Tooltip } from '@/shared/components/common/Tooltip';
import { ReminderSettings } from './ReminderSettings';
import { useTimeBasedTheme } from '@/shared/hooks/useTimeBasedTheme';
import { useTiltEffect } from '@/shared/hooks/useTiltEffect';
import { CreateAffirmationModal } from './CreateAffirmationModal';
import { ConfirmDialog } from '@/shared/components/common/ConfirmDialog/ConfirmDialog';
import { Toast } from '@/shared/components/common/Toast/Toast';
import { useBookmarkedAffirmations } from '@/shared/hooks/useBookmarkedAffirmations';
import { affirmationService } from '@/core/services/affirmationService';
import { useAffirmations } from '@/shared/hooks/useAffirmations';

type AffirmationCategory =
  | 'personal'
  | 'beauty'
  | 'blessing'
  | 'gratitude'
  | 'happiness'
  | 'health'
  | 'love'
  | 'money'
  | 'sleep'
  | 'spiritual';

interface UserAffirmation {
  id: string;
  text: string;
  category: AffirmationCategory;
  intensity: 1 | 2 | 3; // 1: gentle, 2: moderate, 3: powerful
}

const getCategoryConfig = (
  t: (key: string) => string | string[]
): Record<
  AffirmationCategory,
  {
    icon: string;
    label: string;
    colorRGB: string;
  }
> => ({
  personal: {
    icon: '💫',
    label: t('widgets.affirmation.categories.personal') as string,
    colorRGB: '236, 72, 153', // Pink RGB values
  },
  beauty: {
    icon: '✨',
    label: t('widgets.affirmation.categories.beauty') as string,
    colorRGB: '244, 114, 182', // Pink-500
  },
  blessing: {
    icon: '🙌',
    label: t('widgets.affirmation.categories.blessing') as string,
    colorRGB: '139, 92, 246', // Purple-500
  },
  gratitude: {
    icon: '🙏',
    label: t('widgets.affirmation.categories.gratitude') as string,
    colorRGB: '245, 158, 11', // Amber-500
  },
  happiness: {
    icon: '😊',
    label: t('widgets.affirmation.categories.happiness') as string,
    colorRGB: '250, 204, 21', // Yellow-400
  },
  health: {
    icon: '💪',
    label: t('widgets.affirmation.categories.health') as string,
    colorRGB: '34, 197, 94', // Green-500
  },
  love: {
    icon: '❤️',
    label: t('widgets.affirmation.categories.love') as string,
    colorRGB: '239, 68, 68', // Red-500
  },
  money: {
    icon: '💰',
    label: t('widgets.affirmation.categories.money') as string,
    colorRGB: '16, 185, 129', // Emerald-500
  },
  sleep: {
    icon: '😴',
    label: t('widgets.affirmation.categories.sleep') as string,
    colorRGB: '99, 102, 241', // Indigo-500
  },
  spiritual: {
    icon: '🕊️',
    label: t('widgets.affirmation.categories.spiritual') as string,
    colorRGB: '168, 85, 247', // Purple-500
  },
});

const AffirmationWidget = (): JSX.Element => {
  const { t } = useCommonTranslation();
  const categoryConfig = getCategoryConfig(t);
  const [currentAffirmation, setCurrentAffirmation] = useState<UserAffirmation | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<AffirmationCategory>('personal');
  const [showScrollButtons, setShowScrollButtons] = useState({
    left: false,
    right: false,
  });
  const categorySelectorRef = useRef<HTMLDivElement>(null);
  const [isAffirming, setIsAffirming] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [isNewMilestone, setIsNewMilestone] = useState(false);
  const {
    isRecording,
    audioUrl,
    error: recordingError,
    startRecording,
    stopRecording,
    clearRecording,
  } = useVoiceRecorder();
  const { theme } = useTimeBasedTheme();
  const { elementRef, tilt, handleMouseMove, handleMouseLeave } = useTiltEffect(5); // Lower intensity for subtlety
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showReminderSettings, setShowReminderSettings] = useState(false);

  // Backend integration using useAffirmations hook
  const {
    personalAffirmation,
    reminderSettings: backendReminderSettings,
    streak,
    createPersonalAffirmation,
    updatePersonalAffirmation,
    deletePersonalAffirmation,
    logAffirmation,
    updateReminderSettings,
  } = useAffirmations();

  // Notification permission state
  const [permission, setPermission] = useState<NotificationPermission>('default');

  // Request notification permission
  const requestPermission = async (): Promise<boolean> => {
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  // Transform backend reminder settings to component format
  const reminderSettings = backendReminderSettings
    ? {
        enabled: backendReminderSettings.is_enabled,
        time: backendReminderSettings.reminder_time,
        days: backendReminderSettings.days_of_week || [1, 2, 3, 4, 5, 6, 0],
      }
    : {
        enabled: false,
        time: '09:00',
        days: [1, 2, 3, 4, 5, 6, 0],
      };

  // Update settings handler - transform component format to backend format
  const updateSettings = async (newSettings: {
    enabled: boolean;
    time: string;
    days: number[];
  }): Promise<void> => {
    try {
      await updateReminderSettings({
        is_enabled: newSettings.enabled,
        reminder_time: newSettings.time,
        frequency: 'custom', // Default to custom when updating via component
        days_of_week: newSettings.days,
      });
    } catch (error) {
      console.error('Failed to update reminder settings:', error);
    }
  };

  // Initialize notification permission on mount
  useEffect(() => {
    setPermission(Notification.permission);
  }, []);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarkedAffirmations();
  const [affirmations, setAffirmations] = useState<UserAffirmation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkedPersonal, setCheckedPersonal] = useState(false);

  const fetchAffirmationsByCategory = useCallback(
    async (category: AffirmationCategory) => {
      try {
        setLoading(true);

        if (category === 'personal') {
          if (personalAffirmation) {
            // Convert backend personal affirmation to widget format
            setCurrentAffirmation({
              id: personalAffirmation.id,
              text: personalAffirmation.text,
              category: 'personal',
              intensity: personalAffirmation.intensity,
            });
            setCheckedPersonal(true);
          } else if (!checkedPersonal) {
            // No personal affirmation, switch to beauty category
            setSelectedCategory('beauty');
            setCheckedPersonal(true);
            setLoading(false);
            return;
          }
        } else {
          // Use external service for non-personal affirmations
          const response = await affirmationService.getAffirmationsByCategory(category, {
            sort: 'publishedAt:desc',
            pagination: {
              page: 1,
              pageSize: 15,
            },
          });

          const mappedServiceAffirmations = affirmationService.mapAffirmationResponse(response);
          // Convert service affirmations to user affirmations
          const userAffirmations = mappedServiceAffirmations.map(item => ({
            id: item.documentId,
            text: item.text,
            category: affirmationService.determineAffirmationType(item.categories),
            intensity: affirmationService.determineIntensity(item.categories),
          }));

          setAffirmations(userAffirmations);

          if (userAffirmations.length > 0) {
            const randomIndex = Math.floor(Math.random() * userAffirmations.length);
            setCurrentAffirmation(userAffirmations[randomIndex]);
          }
        }
      } catch (error) {
        console.error('Error fetching affirmations:', error);
        // Use a static error message to avoid dependency on t function
        setError('Failed to load affirmations for this category');

        if (category === 'personal' && !checkedPersonal) {
          setSelectedCategory('beauty');
          setCheckedPersonal(true);
        }
      } finally {
        setLoading(false);
      }
    },
    [personalAffirmation, checkedPersonal]
  );

  useEffect(() => {
    fetchAffirmationsByCategory(selectedCategory);
  }, [fetchAffirmationsByCategory, selectedCategory]);

  const handleCategoryChange = (category: AffirmationCategory): void => {
    setSelectedCategory(category);
    fetchAffirmationsByCategory(category);
  };

  const getRandomAffirmation = (): UserAffirmation | null => {
    if (selectedCategory === 'personal' && personalAffirmation) {
      // Convert backend personal affirmation to widget format
      return {
        id: personalAffirmation.id,
        text: personalAffirmation.text,
        category: 'personal',
        intensity: personalAffirmation.intensity,
      };
    }

    if (affirmations.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * affirmations.length);
    return affirmations[randomIndex];
  };

  const checkScroll = (): void => {
    if (categorySelectorRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = categorySelectorRef.current;
      setShowScrollButtons({
        left: scrollLeft > 0,
        right: scrollLeft < scrollWidth - clientWidth - 1,
      });
    }
  };

  useEffect(() => {
    const selector = categorySelectorRef.current;
    if (selector) {
      selector.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      checkScroll();
    }
    return () => {
      selector?.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  const handleScroll = (direction: 'left' | 'right'): void => {
    if (categorySelectorRef.current) {
      const scrollAmount = 200;
      const newScrollLeft =
        categorySelectorRef.current.scrollLeft +
        (direction === 'left' ? -scrollAmount : scrollAmount);

      categorySelectorRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });
    }
  };

  const handleAffirm = async (): Promise<void> => {
    if (!currentAffirmation) return;

    try {
      // Log the affirmation to backend
      await logAffirmation(
        currentAffirmation.text,
        selectedCategory === 'personal' ? personalAffirmation?.id : undefined
      );

      // Show visual feedback
      setIsAffirming(true);
      setShowParticles(true);

      // Check for new milestone (simple check based on streak)
      if (streak && (streak.current_streak + 1) % 7 === 0) {
        setIsNewMilestone(true);
      }

      setTimeout(() => setIsAffirming(false), 1000);
    } catch (error) {
      console.error('Failed to log affirmation:', error);
    }
  };

  const handleParticlesComplete = (): void => {
    setShowParticles(false);
  };

  const handleSavePersonalAffirmation = async (text: string): Promise<void> => {
    try {
      if (personalAffirmation) {
        // Update existing
        await updatePersonalAffirmation(personalAffirmation.id, { text });
      } else {
        // Create new
        await createPersonalAffirmation(text, 'personal', 2);
      }

      setSelectedCategory('personal');
      // The hook will update personalAffirmation state automatically
    } catch (error) {
      console.error('Failed to save personal affirmation:', error);
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!personalAffirmation) return;

    try {
      await deletePersonalAffirmation(personalAffirmation.id);
      setShowDeleteConfirm(false);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);

      setSelectedCategory('beauty');
      setCurrentAffirmation(getRandomAffirmation());
    } catch (error) {
      console.error('Failed to delete personal affirmation:', error);
    }
  };

  return (
    <div
      ref={elementRef}
      className={styles.container}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={
        {
          '--gradient-start': theme.gradientStart,
          '--gradient-middle': theme.gradientMiddle,
          '--gradient-end': theme.gradientEnd,
          '--accent-rgb': theme.accentRGB,
          transform: `perspective(1000px) 
                   rotateX(${tilt.rotateX}deg) 
                   rotateY(${tilt.rotateY}deg)
                   scale(${tilt.scale})`,
          transition: 'transform 0.1s ease-out',
        } as React.CSSProperties
      }
    >
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.headerLeft}>
            <span className={styles.headerIcon}>✨</span>
            <span className={styles.headerText}>{t('widgets.affirmation.title')}</span>
          </div>

          <div className={styles.headerActions}>
            <Tooltip
              content={
                personalAffirmation
                  ? t('widgets.affirmation.edit')
                  : t('widgets.affirmation.create')
              }
            >
              <button
                className={styles.createButton}
                onClick={() => setShowCreateModal(true)}
                aria-label={
                  personalAffirmation
                    ? (t('widgets.affirmation.editPersonal') as string)
                    : (t('widgets.affirmation.createCustom') as string)
                }
              >
                {personalAffirmation ? (
                  <PencilIcon className={styles.createIcon} />
                ) : (
                  <PlusIcon className={styles.createIcon} />
                )}
              </button>
            </Tooltip>
          </div>
        </div>

        <div className={styles.categorySelectorWrapper}>
          {showScrollButtons.left && (
            <button
              className={`${styles.scrollButton} ${styles.scrollLeft}`}
              onClick={() => handleScroll('left')}
              aria-label={t('widgets.affirmation.scrollLeft') as string}
            >
              <ChevronLeftIcon className={styles.scrollIcon} />
            </button>
          )}

          <div ref={categorySelectorRef} className={styles.categorySelector}>
            {Object.entries(categoryConfig)
              .filter(([category]) => category !== 'personal' || personalAffirmation !== null)
              .map(([category, config]) => (
                <button
                  key={category}
                  className={`${styles.categoryButton} ${
                    selectedCategory === category ? styles.selected : ''
                  }`}
                  onClick={() => handleCategoryChange(category as AffirmationCategory)}
                  style={
                    {
                      '--category-color-rgb': config.colorRGB,
                    } as React.CSSProperties
                  }
                >
                  <span className={styles.categoryIcon}>{config.icon}</span>
                  <span className={styles.categoryLabel}>{config.label}</span>
                </button>
              ))}
          </div>

          {showScrollButtons.right && (
            <button
              className={`${styles.scrollButton} ${styles.scrollRight}`}
              onClick={() => handleScroll('right')}
              aria-label={t('widgets.affirmation.scrollRight') as string}
            >
              <ChevronRightIcon className={styles.scrollIcon} />
            </button>
          )}
        </div>
      </div>

      <div className={styles.content}>
        <ParticleEffect isTriggered={showParticles} onComplete={handleParticlesComplete} />

        {loading ? (
          <div className={styles.loading}>{t('widgets.affirmation.loadingAffirmations')}</div>
        ) : error ? (
          <div className={styles.error}>
            <span className={styles.errorIcon}>⚠️</span>
            <span className={styles.errorMessage}>{t('widgets.affirmation.failedToLoad')}</span>
            <button
              onClick={() => fetchAffirmationsByCategory(selectedCategory)}
              className={styles.retryButton}
            >
              {t('widgets.affirmation.tryAgain')}
            </button>
          </div>
        ) : currentAffirmation ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentAffirmation.id}
              className={styles.affirmationText}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              "{currentAffirmation.text}"
            </motion.div>
          </AnimatePresence>
        ) : null}

        <motion.button
          className={`${styles.affirmButton} ${isAffirming ? styles.affirming : ''}`}
          onClick={handleAffirm}
          whileTap={{ scale: 0.95 }}
          animate={
            isAffirming
              ? {
                  scale: [1, 1.05, 1],
                  transition: { duration: 0.5 },
                }
              : {}
          }
        >
          <span className={styles.affirmIcon}>✨</span>
          <span className={styles.affirmText}>{t('widgets.affirmation.iAffirm')}</span>
        </motion.button>

        <div className={styles.voiceControls}>
          {!audioUrl ? (
            <div className={styles.controlButtons}>
              {selectedCategory === 'personal' && (
                <Tooltip content={t('widgets.affirmation.deleteAffirmation')}>
                  <button
                    className={styles.voiceButton}
                    onClick={() => setShowDeleteConfirm(true)}
                    aria-label={t('widgets.affirmation.deleteAffirmation') as string}
                  >
                    <TrashIcon className={styles.voiceIcon} />
                  </button>
                </Tooltip>
              )}
              <Tooltip content={t('widgets.affirmation.recordAffirmation')}>
                <button
                  className={`${styles.voiceButton} ${isRecording ? styles.recording : ''}`}
                  onClick={isRecording ? stopRecording : startRecording}
                  aria-label={
                    isRecording
                      ? (t('widgets.affirmation.stopRecording') as string)
                      : (t('widgets.affirmation.recordAffirmation') as string)
                  }
                >
                  {isRecording ? (
                    <StopIcon className={styles.voiceIcon} />
                  ) : (
                    <MicrophoneIcon className={styles.voiceIcon} />
                  )}
                </button>
              </Tooltip>

              <Tooltip content={t('widgets.affirmation.setReminder')}>
                <button
                  className={styles.voiceButton}
                  onClick={() => setShowReminderSettings(true)}
                  aria-label={t('widgets.affirmation.setReminder') as string}
                >
                  <BellIcon className={styles.voiceIcon} />
                </button>
              </Tooltip>

              <Tooltip content={t('widgets.affirmation.daysStreaking')}>
                <motion.div
                  className={styles.streakBadge}
                  animate={
                    isNewMilestone
                      ? {
                          scale: [1, 1.2, 1],
                          rotate: [0, 10, -10, 0],
                        }
                      : {}
                  }
                  onAnimationComplete={() => setIsNewMilestone(false)}
                >
                  <span className={styles.streakIcon}>🔥</span>
                  <span className={styles.streakCount}>{streak?.current_streak || 0}</span>
                </motion.div>
              </Tooltip>

              <Tooltip
                content={
                  currentAffirmation?.id && isBookmarked(currentAffirmation.id)
                    ? t('widgets.affirmation.removeBookmark')
                    : t('widgets.affirmation.bookmark')
                }
              >
                <button
                  className={`${styles.voiceButton} ${currentAffirmation?.id && isBookmarked(currentAffirmation.id) ? styles.bookmarked : ''}`}
                  onClick={() => {
                    if (currentAffirmation?.id) {
                      if (isBookmarked(currentAffirmation.id)) {
                        removeBookmark(currentAffirmation.id);
                      } else {
                        addBookmark({
                          id: currentAffirmation.id,
                          text: currentAffirmation.text,
                          category: currentAffirmation.category,
                          timestamp: Date.now(),
                        });
                      }
                    }
                  }}
                  aria-label={
                    currentAffirmation?.id && isBookmarked(currentAffirmation.id)
                      ? (t('widgets.affirmation.removeBookmark') as string)
                      : (t('widgets.affirmation.bookmarkAffirmation') as string)
                  }
                  disabled={!currentAffirmation?.id}
                >
                  <BookmarkIcon
                    className={styles.voiceIcon}
                    filled={currentAffirmation?.id ? isBookmarked(currentAffirmation.id) : false}
                  />
                </button>
              </Tooltip>
            </div>
          ) : (
            <div className={styles.recordingPlayback}>
              {audioUrl && (
                <audio
                  key={audioUrl}
                  src={audioUrl}
                  controls
                  className={styles.audioPlayer}
                  controlsList="nodownload noplaybackrate"
                  preload="metadata"
                />
              )}
              <button
                onClick={clearRecording}
                className={styles.clearRecording}
                aria-label={t('widgets.affirmation.clearRecording') as string}
              >
                <XIcon className={styles.clearIcon} />
              </button>
            </div>
          )}
          {recordingError && <p className={styles.recordingError}>{recordingError}</p>}
        </div>
      </div>

      <ReminderSettings
        isOpen={showReminderSettings}
        onClose={() => setShowReminderSettings(false)}
        settings={reminderSettings}
        onUpdate={updateSettings}
        onRequestPermission={requestPermission}
        permission={permission}
      />

      <CreateAffirmationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleSavePersonalAffirmation}
        existingAffirmation={personalAffirmation?.text}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title={t('widgets.affirmation.deletePersonalAffirmation') as string}
        message={t('widgets.affirmation.deleteConfirmMessage') as string}
      />

      <Toast
        message={t('widgets.affirmation.deletedSuccessfully') as string}
        isVisible={showSuccessToast}
        type="success"
      />
    </div>
  );
};

export default AffirmationWidget;
