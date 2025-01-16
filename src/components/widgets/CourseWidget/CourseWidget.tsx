import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, InfoIcon, SkillsIcon, ArrowTopRight } from '@/components/common/icons';
import { useTimeBasedTheme } from '@/hooks/useTimeBasedTheme';
import { Course } from './types';
import { MOCK_COURSES, PLATFORM_CONFIG } from './config';
import styles from './CourseWidget.module.css';
import { CourseDetailsModal } from './CourseDetailsModal';
import { Tooltip } from '@/components/common/Tooltip';

const CourseWidget = () => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return window.innerWidth <= 768;
  });
  const [currentCourse] = useState<Course>(MOCK_COURSES[0]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'skills' | 'why'>('skills');
  const { theme } = useTimeBasedTheme();

  const formatStudentCount = (count: number): string => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const calculateDiscount = (original: number, current: number): number => {
    return Math.round(((original - current) / original) * 100);
  };

  return (
    <>
      <div 
        className={`${styles.container} ${isCollapsed ? styles.collapsed : ''}`}
        style={{
          '--gradient-start': theme.gradientStart,
          '--gradient-middle': theme.gradientMiddle,
          '--gradient-end': theme.gradientEnd,
        } as React.CSSProperties}
      >
        <div className={styles.header}>
          <div className={styles.headerMain}>
            <div className={styles.headerLeft}>
              <span className={styles.headerIcon}>📚</span>
              <span className={styles.headerText}>Recommended Course</span>
            </div>

            <button
              className={`${styles.collapseButton} ${isCollapsed ? styles.collapsed : ''}`}
              onClick={() => setIsCollapsed(!isCollapsed)}
              aria-label={isCollapsed ? "Expand course widget" : "Collapse course widget"}
            >
              <ChevronDownIcon className={styles.collapseIcon} />
            </button>
          </div>
        </div>

        <motion.div
          className={styles.collapsibleContent}
          animate={{
            height: isCollapsed ? 0 : "auto",
            opacity: isCollapsed ? 0 : 1
          }}
          transition={{
            duration: 0.3,
            ease: "easeInOut"
          }}
        >
          <div className={styles.content}>
            <div className={styles.courseCard}>
              {/* Thumbnail Section */}
              <div className={styles.thumbnailSection}>
                <img 
                  src={currentCourse.thumbnail} 
                  alt={currentCourse.title}
                  className={styles.thumbnail}
                />
                <div className={styles.platformBadge}
                  style={{
                    backgroundColor: PLATFORM_CONFIG[currentCourse.platform].bgColor,
                    color: PLATFORM_CONFIG[currentCourse.platform].color
                  }}
                >
                  <span className={styles.platformIcon}>
                    {PLATFORM_CONFIG[currentCourse.platform].icon}
                  </span>
                  {PLATFORM_CONFIG[currentCourse.platform].name}
                </div>
              </div>

              {/* Course Info Section */}
              <div className={styles.courseInfo}>
                <h3 className={styles.courseTitle}>{currentCourse.title}</h3>
                
                <div className={styles.instructorRow}>
                  <span className={styles.instructorName}>
                    by {currentCourse.instructor}
                  </span>
                </div>

                <div className={styles.statsRow}>
                  <div className={styles.rating}>
                    ⭐ {currentCourse.rating.toFixed(1)}
                  </div>
                  <div className={styles.students}>
                    👥 {formatStudentCount(currentCourse.studentsCount)} students
                  </div>
                  <div className={styles.duration}>
                    ⏱️ {currentCourse.duration}
                  </div>
                </div>

                <div className={styles.bottomRow}>
                  <div className={styles.actionButtons}>
                    <Tooltip content="Skills you'll gain">
                      <button
                        className={styles.iconButton}
                        onClick={() => {
                          setActiveTab('skills');
                          setShowDetailsModal(true);
                        }}
                        aria-label="View skills"
                      >
                        <SkillsIcon className={styles.actionIcon} />
                      </button>
                    </Tooltip>
                    <Tooltip content="Why this course?">
                      <button
                        className={styles.iconButton}
                        onClick={() => {
                          setActiveTab('why');
                          setShowDetailsModal(true);
                        }}
                        aria-label="Why this course"
                      >
                        <InfoIcon className={styles.actionIcon} />
                      </button>
                    </Tooltip>
                  </div>

                  <div className={styles.priceSection}>
                    <span className={styles.currentPrice}>
                      ${currentCourse.price.current}
                    </span>
                    <span className={styles.discountBadge}>
                      {calculateDiscount(currentCourse.price.original, currentCourse.price.current)}% OFF
                    </span>
                  </div>
                </div>

                <a 
                  href={currentCourse.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.goToCourseButton}
                >
                  <span>Go to the Course</span>
                  <ArrowTopRight className={styles.goToCourseIcon} />
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showDetailsModal && (
          <CourseDetailsModal
            course={currentCourse}
            isOpen={showDetailsModal}
            onClose={() => setShowDetailsModal(false)}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default CourseWidget; 