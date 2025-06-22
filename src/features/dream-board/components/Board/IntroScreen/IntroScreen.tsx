import React from 'react';
import { useCommonTranslation } from '@/shared/hooks/useTranslation';
import styles from '../Board.module.css';

interface IntroScreenProps {
  onClose: () => void;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({ onClose }) => {
  const { t } = useCommonTranslation();

  return (
    <div className={styles.introScreenOverlay} onClick={onClose}>
      <div className={styles.introScreen} onClick={e => e.stopPropagation()}>
        <div className={styles.introContent}>
          <h2 className={styles.introTitle}>{t('dreamBoard.board.introScreen.title')}</h2>
          <p className={styles.introDescription}>{t('dreamBoard.board.introScreen.description')}</p>

          <div className={styles.introSteps}>
            <div className={styles.introStep}>
              <div className={styles.stepIcon}>✨</div>
              <div className={styles.stepContent}>
                <h3>{t('dreamBoard.board.introScreen.steps.addContent.title')}</h3>
                <p>{t('dreamBoard.board.introScreen.steps.addContent.description')}</p>
              </div>
            </div>

            <div className={styles.introStep}>
              <div className={styles.stepIcon}>🎯</div>
              <div className={styles.stepContent}>
                <h3>{t('dreamBoard.board.introScreen.steps.trackGoals.title')}</h3>
                <p>{t('dreamBoard.board.introScreen.steps.trackGoals.description')}</p>
              </div>
            </div>

            <div className={styles.introStep}>
              <div className={styles.stepIcon}>🎨</div>
              <div className={styles.stepContent}>
                <h3>{t('dreamBoard.board.introScreen.steps.customize.title')}</h3>
                <p>{t('dreamBoard.board.introScreen.steps.customize.description')}</p>
              </div>
            </div>

            <div className={styles.introStep}>
              <div className={styles.stepIcon}>💾</div>
              <div className={styles.stepContent}>
                <h3>{t('dreamBoard.board.introScreen.steps.saveShare.title')}</h3>
                <p>{t('dreamBoard.board.introScreen.steps.saveShare.description')}</p>
              </div>
            </div>
          </div>

          <button className={styles.getStartedButton} onClick={onClose}>
            {t('dreamBoard.board.introScreen.getStarted')}
          </button>
        </div>
      </div>
    </div>
  );
};
