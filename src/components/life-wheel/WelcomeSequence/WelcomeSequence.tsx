import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WELCOME_SEQUENCE } from './constants/messages';
import { WelcomeSequenceProps, UserProfileData } from './types';
import MessageAnimation from './components/MessageAnimation';
import ContentCard from './components/ContentCard/ContentCard';
import ButtonGroup from './components/ContentCard/ButtonGroup';
import AnimatedTitle from './components/AnimatedText/AnimatedTitle';
import ProgressIndicator from './components/ProgressIndicator';
import LifeWheelVisualization from './components/Visualization/LifeWheelVisualization';
import ErrorBoundary from './components/Visualization/ErrorBoundary';
import Modal from './components/Modal';
import UserProfileForm from './components/UserProfileForm';
import styles from './WelcomeSequence.module.css';

const WelcomeSequence = ({ 
  onComplete, 
  onSkip, 
  userName = '',
  isLoading = false
}: WelcomeSequenceProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfileData>({});
  
  // Handle advancement to next message
  const handleNext = useCallback(() => {
    if (currentIndex < WELCOME_SEQUENCE.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Instead of completing immediately, show the profile modal
      setShowProfileModal(true);
    }
  }, [currentIndex]);
  
  // Start sequence
  const handleStart = useCallback(() => {
    setIsStarted(true);
  }, []);
  
  // Handle skip button
  const handleSkip = useCallback(() => {
    setIsFinished(true);
    // Small delay before calling onSkip for exit animation
    setTimeout(onSkip, 300);
  }, [onSkip]);

  // Handle form submission
  const handleProfileSubmit = useCallback((profileData: UserProfileData) => {
    setUserProfile(profileData);
    setShowProfileModal(false);
    setIsFinished(true);
    // Small delay before calling onComplete for exit animation
    setTimeout(() => onComplete(profileData), 500);
  }, [onComplete]);

  // Skip profile form
  const handleSkipProfile = useCallback(() => {
    setShowProfileModal(false);
    setIsFinished(true);
    // Complete without profile data
    setTimeout(() => onComplete(), 500);
  }, [onComplete]);
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showProfileModal) return; // Don't handle keyboard events when modal is open
      
      if (!isStarted || isFinished) {
        if (e.key === 'Enter' && !isStarted) handleStart();
        if (e.key === 'Escape' && !isStarted) handleSkip();
        return;
      }
      
      if (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') {
        handleNext();
      } else if (e.key === 'Escape') {
        handleSkip();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isStarted, isFinished, handleNext, handleSkip, handleStart, showProfileModal]);
  
  // Check if current index is valid
  const isValidIndex = currentIndex >= 0 && currentIndex < WELCOME_SEQUENCE.length;
  
  // Current message
  const currentMessage = isValidIndex ? WELCOME_SEQUENCE[currentIndex] : null;
  const currentVisualStage = currentMessage?.visualStage || 'intro';
  
  return (
    <div className={styles.fullScreenContainer}>
      {/* Login background */}
      <div className={styles.backgroundImage} />
      
      {/* 3D Visualization - always present but changes states */}
      <ErrorBoundary>
        <LifeWheelVisualization 
          currentStage={currentVisualStage}
          currentIndex={currentIndex}
        />
      </ErrorBoundary>
      
      <div className={styles.contentWrapper}>
        {isLoading ? (
          <ContentCard className={styles.loadingCard}>
            <motion.div 
              className={styles.loadingSpinner}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p>Loading your experience...</p>
          </ContentCard>
        ) : !isStarted ? (
          <ContentCard className={styles.welcomeCard}>
            <AnimatedTitle 
              title={`Welcome${userName ? `, ${userName}` : ''}!`}
              subtitle="Begin your journey to better well-being with our interactive experience"
            />
            <ButtonGroup 
              onBegin={handleStart}
              onSkip={handleSkip}
              beginLabel="Begin Journey"
              skipLabel="Skip Intro"
            />
          </ContentCard>
        ) : (
          <AnimatePresence mode="wait">
            {currentMessage && (
              <div className={styles.sequenceContainer}>
                <ContentCard className={styles.messageCard}>
                  <MessageAnimation 
                    key={currentMessage.id} 
                    message={currentMessage} 
                    onComplete={handleNext}
                    userName={userName}
                  />
                  
                  <div className={styles.controlsContainer}>
                    <ProgressIndicator 
                      total={WELCOME_SEQUENCE.length} 
                      current={currentIndex} 
                    />
                    
                    <div className={styles.buttons}>
                      <motion.button 
                        className={styles.nextButton}
                        onClick={handleNext}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label="Next message"
                      >
                        Next
                      </motion.button>
                      <motion.button 
                        className={styles.skipButton}
                        onClick={handleSkip}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label="Skip introduction"
                      >
                        Skip
                      </motion.button>
                    </div>
                  </div>
                </ContentCard>
              </div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* User Profile Modal */}
      <Modal isOpen={showProfileModal} onClose={handleSkipProfile}>
        <UserProfileForm 
          onSubmit={handleProfileSubmit}
          onCancel={handleSkipProfile}
          initialData={userProfile}
        />
      </Modal>
    </div>
  );
};

export default WelcomeSequence; 