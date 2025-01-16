import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDownIcon } from '@/components/common/icons';
import { useTimeBasedTheme } from '@/hooks/useTimeBasedTheme';
import { Course } from './types';
import { MOCK_COURSES, PLATFORM_CONFIG } from './config';
import styles from './CourseWidget.module.css';

const CourseWidget = () => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return window.innerWidth <= 768;
  });
  const [currentCourse] = useState<Course>(MOCK_COURSES[0]);
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

  const getMatchDescription = (matchScore: number): string => {
    if (matchScore >= 90) return "Perfect match for your interests!";
    if (matchScore >= 80) return "Highly relevant to your goals";
    if (matchScore >= 70) return "Aligns with your learning path";
    return "Recommended based on your profile";
  };

  return (
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
                <div className={styles.levelBadge}
                  data-level={currentCourse.level}
                >
                  {currentCourse.level.charAt(0).toUpperCase() + currentCourse.level.slice(1)}
                </div>

                <div className={styles.priceSection}>
                  <span className={styles.currentPrice}>
                    ${currentCourse.price.current}
                  </span>
                  <span className={styles.originalPrice}>
                    ${currentCourse.price.original}
                  </span>
                  <span className={styles.discountBadge}>
                    {calculateDiscount(currentCourse.price.original, currentCourse.price.current)}% OFF
                  </span>
                </div>
              </div>
            </div>

            {/* Skills Section */}
            <div className={styles.skillsSection}>
              <div className={styles.sectionTitle}>
                <span className={styles.sectionIcon}>🎯</span>
                Skills you'll gain
              </div>
              <div className={styles.skillsTags}>
                {currentCourse.skills.map((skill, index) => (
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

            {/* Why This Course Section */}
            <div className={styles.whySection}>
              <div className={styles.sectionTitle}>
                <span className={styles.sectionIcon}>💡</span>
                Why this course?
              </div>
              
              <div className={styles.whyContent}>
                <div className={styles.matchScore}>
                  <div className={styles.matchScoreCircle}
                    style={{
                      background: `conic-gradient(#8B5CF6 ${currentCourse.matchScore}%, transparent ${currentCourse.matchScore}%)`
                    }}
                  >
                    <span className={styles.matchScoreText}>
                      {currentCourse.matchScore}%
                    </span>
                  </div>
                  <span className={styles.matchDescription}>
                    {getMatchDescription(currentCourse.matchScore)}
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
                    <span>Recently updated ({currentCourse.lastUpdated})</span>
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
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CourseWidget; 