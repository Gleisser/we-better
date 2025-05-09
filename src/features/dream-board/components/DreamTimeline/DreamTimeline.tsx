import React from 'react';
import styles from '../../DreamBoardPage.module.css';
import { Dream } from '../../types';

interface DreamTimelineProps {
  dreams: Dream[];
}

const DreamTimeline: React.FC<DreamTimelineProps> = ({ dreams }) => {
  return (
    <section className={styles.timelineSection}>
      <h2>Dream Timeline</h2>
      <div className={styles.timelineContainer}>
        <div className={styles.timeframeColumn}>
          <h3>Short-term</h3>
          {dreams
            .filter(dream => dream.timeframe === 'short-term')
            .map(dream => (
              <div key={dream.id} className={styles.timelineDream}>
                <div className={styles.dreamTitle}>{dream.title}</div>
                <div className={styles.categoryBadge}>{dream.category}</div>
              </div>
            ))}
        </div>
        <div className={styles.timeframeColumn}>
          <h3>Mid-term</h3>
          {dreams
            .filter(dream => dream.timeframe === 'mid-term')
            .map(dream => (
              <div key={dream.id} className={styles.timelineDream}>
                <div className={styles.dreamTitle}>{dream.title}</div>
                <div className={styles.categoryBadge}>{dream.category}</div>
              </div>
            ))}
        </div>
        <div className={styles.timeframeColumn}>
          <h3>Long-term</h3>
          {dreams
            .filter(dream => dream.timeframe === 'long-term')
            .map(dream => (
              <div key={dream.id} className={styles.timelineDream}>
                <div className={styles.dreamTitle}>{dream.title}</div>
                <div className={styles.categoryBadge}>{dream.category}</div>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
};

export default DreamTimeline;
