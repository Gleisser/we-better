import React from 'react';
import styles from '../../DreamBoardPage.module.css';
import { Dream } from '../../types';

// CategoryDetails type for styling and presentation
type CategoryDetails = {
  icon: string;
  illustration: string;
  gradient: string;
  hoverGradient: string;
  shadowColor: string;
  color: string;
};

interface DreamProgressProps {
  dreams: Dream[];
  handleOpenMilestoneManager: (dreamId: string) => void;
  getCategoryDetails: (category: string) => CategoryDetails;
}

const DreamProgress: React.FC<DreamProgressProps> = ({
  dreams,
  handleOpenMilestoneManager,
  getCategoryDetails,
}) => {
  return (
    <section className={styles.progressSection}>
      <h2>Dream Progress</h2>
      <div className={styles.dreamsProgress}>
        {dreams.map(dream => {
          const categoryDetail = getCategoryDetails(dream.category);

          return (
            <div
              key={dream.id}
              className={styles.dreamProgressCard}
              style={{
                background: categoryDetail.gradient,
                boxShadow: `0 8px 16px ${categoryDetail.shadowColor}`,
                borderRadius: '12px',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <div
                style={{
                  padding: '16px',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                {/* Category Icon - moved to left side */}
                <div
                  className={styles.categoryIconContainer}
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}
                >
                  <div
                    className={styles.categoryIcon}
                    aria-hidden="true"
                    style={{
                      backgroundImage: `url(${categoryDetail.illustration})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      width: '100%',
                      height: '100%',
                    }}
                  ></div>
                </div>

                {/* Content div */}
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 12px 0' }}>{dream.title}</h3>
                  <div
                    className={styles.progressBar}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      height: '10px',
                      borderRadius: '5px',
                      position: 'relative',
                    }}
                  >
                    <div
                      className={styles.progressFill}
                      style={{
                        width: `${dream.progress * 100}%`,
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        height: '100%',
                        borderRadius: '5px',
                      }}
                    />
                  </div>
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}
                  >
                    <span className={styles.progressText}>{Math.round(dream.progress * 100)}%</span>
                    <div className={styles.milestonesInfo}>
                      {dream.milestones.filter(m => m.completed).length} of{' '}
                      {dream.milestones.length} milestones completed
                    </div>
                  </div>

                  {/* Milestone Management Button */}
                  <button
                    className={styles.manageMilestonesButton}
                    onClick={() => handleOpenMilestoneManager(dream.id)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      color: 'white',
                      marginTop: '12px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      transition: 'background 0.3s ease',
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                    }}
                  >
                    Manage Milestones
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default DreamProgress;
