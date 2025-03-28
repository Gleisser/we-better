import React from 'react';
import { motion } from 'framer-motion';
import styles from '../VisionBoard.module.css';

interface IntroScreenProps {
  onClose: () => void;
  className?: string;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({
  onClose,
  className = ''
}) => {
  return (
    <motion.div
      className={`${styles.introScreenOverlay} ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className={styles.introScreen}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ delay: 0.1 }}
      >
        <button 
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        
        <div className={styles.introContent}>
          <h2 className={styles.introTitle}>Welcome to Your Vision Board</h2>
          
          <p className={styles.introDescription}>
            This is where your goals and dreams come to life. Based on your Life Wheel assessment, 
            we've created a custom space for you to visualize your aspirations.
          </p>
          
          <div className={styles.introSteps}>
            <div className={styles.introStep}>
              <div className={styles.stepIcon}>🖼️</div>
              <div className={styles.stepContent}>
                <h3>Add Images & Text</h3>
                <p>Upload images that represent your goals or add motivational text.</p>
              </div>
            </div>
            
            <div className={styles.introStep}>
              <div className={styles.stepIcon}>🤖</div>
              <div className={styles.stepContent}>
                <h3>Generate with AI</h3>
                <p>Use AI to create custom visuals based on your goals and aspirations.</p>
              </div>
            </div>
            
            <div className={styles.introStep}>
              <div className={styles.stepIcon}>🔀</div>
              <div className={styles.stepContent}>
                <h3>Arrange & Customize</h3>
                <p>Drag items, resize them, and organize by Life Wheel category.</p>
              </div>
            </div>
            
            <div className={styles.introStep}>
              <div className={styles.stepIcon}>🔄</div>
              <div className={styles.stepContent}>
                <h3>Track Progress</h3>
                <p>Mark items as goals and track your progress over time.</p>
              </div>
            </div>
          </div>
          
          <button 
            className={styles.getStartedButton}
            onClick={onClose}
          >
            Get Started
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}; 