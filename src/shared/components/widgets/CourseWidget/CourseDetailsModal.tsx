import { motion } from 'framer-motion';
import { Course } from './types';
import styles from './CourseDetailsModal.module.css';
import { XIcon } from '@/shared/components/common/icons';
import { Modal } from '@/shared/components/common/Modal';

interface CourseDetailsModalProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
  activeTab: 'skills' | 'why';
  onTabChange: (tab: 'skills' | 'why') => void;
}

export const CourseDetailsModal = ({ 
  course, 
  isOpen, 
  onClose, 
  activeTab,
  onTabChange 
}: CourseDetailsModalProps) => {
  const getMatchDescription = (matchScore: number): string => {
    if (matchScore >= 90) return "Perfect match for your interests!";
    if (matchScore >= 80) return "Highly relevant to your goals";
    if (matchScore >= 70) return "Aligns with your learning path";
    return "Recommended based on your profile";
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={styles.modalHeader}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'skills' ? styles.active : ''}`}
            onClick={() => onTabChange('skills')}
          >
            Skills you'll gain
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'why' ? styles.active : ''}`}
            onClick={() => onTabChange('why')}
          >
            Why this course?
          </button>
        </div>
        <button className={styles.closeButton} onClick={onClose}>
          <XIcon className={styles.closeIcon} />
        </button>
      </div>

      <div className={styles.modalBody}>
        {activeTab === 'skills' ? (
          <div className={styles.skillsContent}>
            <div className={styles.skillsTags}>
              {course.skills.map((skill, index) => (
                <motion.span
                  key={skill}
                  className={styles.skillTag}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </div>
        ) : (
          <div className={styles.whyContent}>
            <div className={styles.matchScore}>
              <div className={styles.matchScoreCircle}
                style={{
                  background: `conic-gradient(#8B5CF6 ${course.matchScore}%, transparent ${course.matchScore}%)`
                }}
              >
                <span className={styles.matchScoreText}>
                  {course.matchScore}%
                </span>
              </div>
              <span className={styles.matchDescription}>
                {getMatchDescription(course.matchScore)}
              </span>
            </div>

            <div className={styles.whyPoints}>
              <motion.div 
                className={styles.whyPoint}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <span className={styles.whyPointIcon}>✨</span>
                <span>Recently updated ({course.lastUpdated})</span>
              </motion.div>
              <motion.div 
                className={styles.whyPoint}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <span className={styles.whyPointIcon}>👥</span>
                <span>Active learning community</span>
              </motion.div>
              <motion.div 
                className={styles.whyPoint}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <span className={styles.whyPointIcon}>🎓</span>
                <span>Comprehensive curriculum</span>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}; 