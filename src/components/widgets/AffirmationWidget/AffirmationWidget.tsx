import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import styles from './AffirmationWidget.module.css';
import { ChevronLeftIcon, ChevronRightIcon, MicrophoneIcon, StopIcon, XIcon, BellIcon, PlusIcon, PencilIcon, TrashIcon, BookmarkIcon } from '@/components/common/icons';
import ParticleEffect from './ParticleEffect';
import { useAffirmationStreak } from '@/hooks/useAffirmationStreak';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import Tooltip from '@/components/common/Tooltip/Tooltip';
import { useAffirmationReminder } from '@/hooks/useAffirmationReminder';
import { ReminderSettings } from './ReminderSettings';
import { useTimeBasedTheme } from '@/hooks/useTimeBasedTheme';
import { useTiltEffect } from '@/hooks/useTiltEffect';
import { CreateAffirmationModal } from './CreateAffirmationModal';
import { usePersonalAffirmation } from '@/hooks/usePersonalAffirmation';
import { ConfirmDialog } from '@/components/common/ConfirmDialog/ConfirmDialog';
import { Toast } from '@/components/common/Toast/Toast';
import { useBookmarkedAffirmations } from '@/hooks/useBookmarkedAffirmations';

type AffirmationCategory = 'personal' | 'confidence' | 'growth' | 'gratitude' | 'abundance' | 'health';

interface Affirmation {
  id: string;
  text: string;
  category: AffirmationCategory;
  intensity: 1 | 2 | 3; // 1: gentle, 2: moderate, 3: powerful
}

// Sample affirmations data
const AFFIRMATIONS: Record<AffirmationCategory, Affirmation[]> = {
  personal: [
    {
      id: 'personal_1',
      text: 'I am capable of achieving anything I set my mind to',
      category: 'personal',
      intensity: 3
    },
    {
      id: 'personal_2',
      text: 'I trust in my abilities and inner wisdom',
      category: 'personal',
      intensity: 2
    }
  ],
  confidence: [
    {
      id: 'conf_1',
      text: 'I am capable of achieving anything I set my mind to',
      category: 'confidence',
      intensity: 3
    },
    {
      id: 'conf_2',
      text: 'I trust in my abilities and inner wisdom',
      category: 'confidence',
      intensity: 2
    },
    {
      id: 'conf_3',
      text: 'I radiate confidence, self-respect, and inner harmony',
      category: 'confidence',
      intensity: 2
    }
  ],
  growth: [
    {
      id: 'growth_1',
      text: "Every day I'm growing stronger and wiser",
      category: 'growth',
      intensity: 2
    },
    {
      id: 'growth_2',
      text: 'I embrace challenges as opportunities to learn',
      category: 'growth',
      intensity: 3
    },
    {
      id: 'growth_3',
      text: 'I am constantly evolving and becoming a better version of myself',
      category: 'growth',
      intensity: 2
    }
  ],
  gratitude: [
    {
      id: 'grat_1',
      text: 'I am thankful for all the abundance in my life',
      category: 'gratitude',
      intensity: 2
    },
    {
      id: 'grat_2',
      text: 'I appreciate the small moments of joy in each day',
      category: 'gratitude',
      intensity: 1
    },
    {
      id: 'grat_3',
      text: 'My heart is full of gratitude for all that I have',
      category: 'gratitude',
      intensity: 3
    }
  ],
  abundance: [
    {
      id: 'abund_1',
      text: 'I attract success and prosperity effortlessly',
      category: 'abundance',
      intensity: 3
    },
    {
      id: 'abund_2',
      text: 'I am open to receiving all the wealth life offers',
      category: 'abundance',
      intensity: 2
    },
    {
      id: 'abund_3',
      text: 'Abundance flows freely into my life',
      category: 'abundance',
      intensity: 2
    }
  ],
  health: [
    {
      id: 'health_1',
      text: 'My body is healthy, strong, and full of energy',
      category: 'health',
      intensity: 3
    },
    {
      id: 'health_2',
      text: 'I make choices that nourish my mind, body, and soul',
      category: 'health',
      intensity: 2
    },
    {
      id: 'health_3',
      text: 'I radiate health, vitality, and positive energy',
      category: 'health',
      intensity: 2
    }
  ]
};

const CATEGORY_CONFIG: Record<AffirmationCategory, {
  icon: string;
  label: string;
  colorRGB: string;
}> = {
  personal: {
    icon: '💫',
    label: 'Personal',
    colorRGB: '236, 72, 153' // Pink RGB values
  },
  confidence: {
    icon: '⚡️',
    label: 'Confidence',
    colorRGB: '139, 92, 246' // Purple RGB values
  },
  growth: {
    icon: '🌱',
    label: 'Growth',
    colorRGB: '16, 185, 129' // Emerald RGB values
  },
  gratitude: {
    icon: '🙏',
    label: 'Gratitude',
    colorRGB: '245, 158, 11' // Amber RGB values
  },
  abundance: {
    icon: '✨',
    label: 'Abundance',
    colorRGB: '236, 72, 153' // Pink RGB values
  },
  health: {
    icon: '💪',
    label: 'Health',
    colorRGB: '59, 130, 246' // Blue RGB values
  }
};

const AffirmationWidget = () => {
  const [currentAffirmation, setCurrentAffirmation] = useState<Affirmation>(
    AFFIRMATIONS.confidence[0]
  );
  const [selectedCategory, setSelectedCategory] = useState<AffirmationCategory>('confidence');
  const [showScrollButtons, setShowScrollButtons] = useState({
    left: false,
    right: false
  });
  const categorySelectorRef = useRef<HTMLDivElement>(null);
  const [isAffirming, setIsAffirming] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const { streak, isNewMilestone, incrementStreak, resetMilestone } = useAffirmationStreak();
  const {
    isRecording,
    audioUrl,
    error: recordingError,
    startRecording,
    stopRecording,
    clearRecording
  } = useVoiceRecorder();
  const [showReminderSettings, setShowReminderSettings] = useState(false);
  const {
    settings: reminderSettings,
    permission,
    requestPermission,
    updateSettings
  } = useAffirmationReminder();
  const { theme } = useTimeBasedTheme();
  const { elementRef, tilt, handleMouseMove, handleMouseLeave } = useTiltEffect(5); // Lower intensity for subtlety
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { personalAffirmation, saveAffirmation, deleteAffirmation } = usePersonalAffirmation();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarkedAffirmations();

  const getRandomAffirmation = (category: AffirmationCategory): Affirmation => {
    if (category === 'personal') {
      return personalAffirmation ?? AFFIRMATIONS.confidence[0]; // Fallback to confidence
    }
    const affirmations = AFFIRMATIONS[category];
    const randomIndex = Math.floor(Math.random() * affirmations.length);
    return affirmations[randomIndex];
  };

  const handleCategoryChange = (category: AffirmationCategory) => {
    setSelectedCategory(category);
    setCurrentAffirmation(getRandomAffirmation(category));
  };

  // Check if scroll buttons should be shown
  const checkScroll = () => {
    if (categorySelectorRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = categorySelectorRef.current;
      setShowScrollButtons({
        left: scrollLeft > 0,
        right: scrollLeft < scrollWidth - clientWidth - 1
      });
    }
  };

  // Add scroll listeners
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

  const handleScroll = (direction: 'left' | 'right') => {
    if (categorySelectorRef.current) {
      const scrollAmount = 200; // Adjust this value as needed
      const newScrollLeft = categorySelectorRef.current.scrollLeft + 
        (direction === 'left' ? -scrollAmount : scrollAmount);
      
      categorySelectorRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const handleAffirm = () => {
    const didIncrementStreak = incrementStreak();
    if (didIncrementStreak) {
      setIsAffirming(true);
      setShowParticles(true);
      // Reset the animation state after animation completes
      setTimeout(() => setIsAffirming(false), 1000);
    }
  };

  const handleParticlesComplete = () => {
    setShowParticles(false);
  };

  const handleSavePersonalAffirmation = (text: string) => {
    saveAffirmation(text);
    setSelectedCategory('personal');
    setCurrentAffirmation({
      id: 'personal_1',
      text,
      category: 'personal',
      intensity: 2
    });
  };

  const handleDelete = () => {
    deleteAffirmation();
    setShowDeleteConfirm(false);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
    
    // Switch to confidence category
    setSelectedCategory('confidence');
    setCurrentAffirmation(getRandomAffirmation('confidence'));
  };

  return (
    <div 
      ref={elementRef}
      className={styles.container}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        '--gradient-start': theme.gradientStart,
        '--gradient-middle': theme.gradientMiddle,
        '--gradient-end': theme.gradientEnd,
        '--accent-rgb': theme.accentRGB,
        transform: `perspective(1000px) 
                   rotateX(${tilt.rotateX}deg) 
                   rotateY(${tilt.rotateY}deg)
                   scale(${tilt.scale})`,
        transition: 'transform 0.1s ease-out'
      } as React.CSSProperties}
    >
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.headerLeft}>
            <span className={styles.headerIcon}>✨</span>
            <span className={styles.headerText}>Daily Affirmation</span>
          </div>

          <div className={styles.headerActions}>
            <Tooltip text={personalAffirmation ? "Edit" : "Create"} position="bottom">
              <button
                className={styles.createButton}
                onClick={() => setShowCreateModal(true)}
                aria-label={personalAffirmation ? "Edit personal affirmation" : "Create custom affirmation"}
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
              aria-label="Scroll categories left"
            >
              <ChevronLeftIcon className={styles.scrollIcon} />
            </button>
          )}
          
          <div 
            ref={categorySelectorRef}
            className={styles.categorySelector}
          >
            {Object.entries(CATEGORY_CONFIG)
              // Only show personal category if there's a personal affirmation
              .filter(([category]) => category !== 'personal' || personalAffirmation !== null)
              .map(([category, config]) => (
                <button
                  key={category}
                  className={`${styles.categoryButton} ${
                    selectedCategory === category ? styles.selected : ''
                  }`}
                  onClick={() => handleCategoryChange(category as AffirmationCategory)}
                  style={{
                    '--category-color-rgb': config.colorRGB
                  } as React.CSSProperties}
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
              aria-label="Scroll categories right"
            >
              <ChevronRightIcon className={styles.scrollIcon} />
            </button>
          )}
        </div>
      </div>

      <div className={styles.content}>
        <ParticleEffect 
          isTriggered={showParticles}
          onComplete={handleParticlesComplete}
        />

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

        <motion.button
          className={`${styles.affirmButton} ${isAffirming ? styles.affirming : ''}`}
          onClick={handleAffirm}
          whileTap={{ scale: 0.95 }}
          animate={isAffirming ? {
            scale: [1, 1.05, 1],
            transition: { duration: 0.5 }
          } : {}}
        >
          <span className={styles.affirmIcon}>✨</span>
          <span className={styles.affirmText}>I Affirm</span>
        </motion.button>

        <div className={styles.voiceControls}>
          {!audioUrl ? (
            <div className={styles.controlButtons}>
              {selectedCategory === 'personal' && (
                <Tooltip text="Delete affirmation" position="top">
                  <button
                    className={styles.voiceButton}
                    onClick={() => setShowDeleteConfirm(true)}
                    aria-label="Delete personal affirmation"
                  >
                    <TrashIcon className={styles.voiceIcon} />
                  </button>
                </Tooltip>
              )}
              <Tooltip text="Record affirmation" position="top">
                <button
                  className={`${styles.voiceButton} ${isRecording ? styles.recording : ''}`}
                  onClick={isRecording ? stopRecording : startRecording}
                  aria-label={isRecording ? 'Stop recording' : 'Record affirmation'}
                >
                  {isRecording ? (
                    <StopIcon className={styles.voiceIcon} />
                  ) : (
                    <MicrophoneIcon className={styles.voiceIcon} />
                  )}
                </button>
              </Tooltip>

              <Tooltip text="Set reminder">
                <button
                  className={styles.voiceButton}
                  onClick={() => setShowReminderSettings(true)}
                  aria-label="Set reminder"
                >
                  <BellIcon className={styles.voiceIcon} />
                </button>
              </Tooltip>

              <Tooltip text="Days streaking">
                <motion.div 
                  className={styles.streakBadge}
                  animate={isNewMilestone ? {
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  } : {}}
                  onAnimationComplete={resetMilestone}
                >
                  <span className={styles.streakIcon}>🔥</span>
                  <span className={styles.streakCount}>{streak}</span>
                </motion.div>
              </Tooltip>

              <Tooltip text={isBookmarked(currentAffirmation.id) ? "Remove bookmark" : "Bookmark"} position="top">
                <button
                  className={`${styles.voiceButton} ${isBookmarked(currentAffirmation.id) ? styles.bookmarked : ''}`}
                  onClick={() => {
                    if (isBookmarked(currentAffirmation.id)) {
                      removeBookmark(currentAffirmation.id);
                    } else {
                      addBookmark({
                        id: currentAffirmation.id,
                        text: currentAffirmation.text,
                        category: currentAffirmation.category,
                        timestamp: Date.now()
                      });
                    }
                  }}
                  aria-label={isBookmarked(currentAffirmation.id) ? "Remove bookmark" : "Bookmark affirmation"}
                >
                  <BookmarkIcon 
                    className={styles.voiceIcon} 
                    filled={isBookmarked(currentAffirmation.id)}
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
                aria-label="Clear recording"
              >
                <XIcon className={styles.clearIcon} />
              </button>
            </div>
          )}
          {recordingError && (
            <p className={styles.recordingError}>{recordingError}</p>
          )}
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
        title="Delete Personal Affirmation"
        message="Are you sure you want to delete your personal affirmation? This action cannot be undone."
      />

      <Toast
        message="Personal affirmation deleted successfully"
        isVisible={showSuccessToast}
        type="success"
      />
    </div>
  );
};

export default AffirmationWidget; 