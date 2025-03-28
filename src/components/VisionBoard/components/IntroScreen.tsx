import React from 'react';
import styles from '../VisionBoard.module.css';

interface IntroScreenProps {
  onClose: () => void;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({ onClose }) => {
  return (
    <div className={styles.introScreenOverlay} onClick={onClose}>
      <div className={styles.introScreen} onClick={e => e.stopPropagation()}>
        <div className={styles.introContent}>
          <h2 className={styles.introTitle}>Welcome to Your Vision Board</h2>
          <p className={styles.introDescription}>
            Visualize your goals and aspirations based on your Life Wheel assessment.
            Create a personalized space that inspires and motivates you to achieve your dreams.
          </p>
          
          <div className={styles.introSteps}>
            <div className={styles.introStep}>
              <div className={styles.stepIcon}>✨</div>
              <div className={styles.stepContent}>
                <h3>Add Content</h3>
                <p>Add images, text, and audio to represent your goals in each Life Wheel category.</p>
              </div>
            </div>
            
            <div className={styles.introStep}>
              <div className={styles.stepIcon}>🎯</div>
              <div className={styles.stepContent}>
                <h3>Track Goals</h3>
                <p>Mark items as goals and track your progress as you work towards achieving them.</p>
              </div>
            </div>
            
            <div className={styles.introStep}>
              <div className={styles.stepIcon}>🎨</div>
              <div className={styles.stepContent}>
                <h3>Customize</h3>
                <p>Change the theme, arrange items, and personalize your vision board to reflect your style.</p>
              </div>
            </div>
            
            <div className={styles.introStep}>
              <div className={styles.stepIcon}>💾</div>
              <div className={styles.stepContent}>
                <h3>Save & Share</h3>
                <p>Save your vision board to track progress over time and share it with trusted friends.</p>
              </div>
            </div>
          </div>
          
          <button className={styles.getStartedButton} onClick={onClose}>
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}; 