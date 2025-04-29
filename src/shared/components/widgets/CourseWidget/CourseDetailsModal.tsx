import { motion } from 'framer-motion';
import { Course } from './types';
import styles from './CourseDetailsModal.module.css';
import { XIcon } from '@/shared/components/common/icons';
import { Modal } from '@/shared/components/common/Modal';

/**
 * Props interface for the CourseDetailsModal component.
 * @interface CourseDetailsModalProps
 * @property {Course} course - The course object containing details to display
 * @property {boolean} isOpen - Controls the visibility of the modal
 * @property {() => void} onClose - Callback function to close the modal
 * @property {'skills' | 'why'} activeTab - Currently active tab in the modal
 * @property {(tab: 'skills' | 'why') => void} onTabChange - Callback function when tab is changed
 */
interface CourseDetailsModalProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
  activeTab: 'skills' | 'why';
  onTabChange: (tab: 'skills' | 'why') => void;
}

/**
 * A modal component that displays detailed information about a course.
 * Features:
 * - Tabbed interface for skills and course benefits
 * - Animated skill tags using Framer Motion
 * - Visual match score representation
 * - Dynamic match description based on score
 * - Animated benefit points
 * 
 * The modal has two main sections:
 * 1. Skills Tab: Displays animated tags of skills gained from the course
 * 2. Why Tab: Shows match score, course relevance, and key benefits
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Course} props.course - Course data to display
 * @param {boolean} props.isOpen - Controls modal visibility
 * @param {() => void} props.onClose - Handler for closing the modal
 * @param {'skills' | 'why'} props.activeTab - Active tab selection
 * @param {(tab: 'skills' | 'why') => void} props.onTabChange - Tab change handler
 * 
 * @example
 * ```tsx
 * function CourseView({ course }) {
 *   const [isModalOpen, setIsModalOpen] = useState(false);
 *   const [activeTab, setActiveTab] = useState<'skills' | 'why'>('skills');
 * 
 *   return (
 *     <>
 *       <button onClick={() => setIsModalOpen(true)}>
 *         View Course Details
 *       </button>
 *       <CourseDetailsModal
 *         course={course}
 *         isOpen={isModalOpen}
 *         onClose={() => setIsModalOpen(false)}
 *         activeTab={activeTab}
 *         onTabChange={setActiveTab}
 *       />
 *     </>
 *   );
 * }
 * ```
 */
export const CourseDetailsModal = ({ 
  course, 
  isOpen, 
  onClose, 
  activeTab,
  onTabChange 
}: CourseDetailsModalProps) => {
  /**
   * Generates a descriptive message based on the course match score.
   * Higher scores result in more enthusiastic recommendations.
   * 
   * @param {number} matchScore - The course match score (0-100)
   * @returns {string} A descriptive message about the course match
   */
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