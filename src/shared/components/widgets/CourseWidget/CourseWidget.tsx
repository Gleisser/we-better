import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InfoIcon, SkillsIcon, ArrowTopRight, BookmarkIcon } from '@/shared/components/common/icons';
import { useTimeBasedTheme } from '@/shared/hooks/useTimeBasedTheme';
import { Course } from './types';
import { MOCK_COURSES, PLATFORM_CONFIG } from './config';
import styles from './CourseWidget.module.css';
import { CourseDetailsModal } from './CourseDetailsModal';
import { Tooltip } from '@/shared/components/common/Tooltip';
import { useBookmarkedCourses } from '@/shared/hooks/useBookmarkedCourses';

const CourseWidget = () => {
  const [currentCourse] = useState<Course>(MOCK_COURSES[0]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'skills' | 'why'>('skills');
  const { theme } = useTimeBasedTheme();
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarkedCourses();

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
        className={styles.container}
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
          </div>
        </div>

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
                  <Tooltip content={isBookmarked(currentCourse.id) ? "Remove bookmark" : "Bookmark course"}>
                    <button
                      className={`${styles.iconButton} ${isBookmarked(currentCourse.id) ? styles.bookmarked : ''}`}
                      onClick={() => {
                        if (isBookmarked(currentCourse.id)) {
                          removeBookmark(currentCourse.id);
                        } else {
                          addBookmark(currentCourse);
                        }
                      }}
                      aria-label={isBookmarked(currentCourse.id) ? "Remove bookmark" : "Bookmark course"}
                    >
                      <BookmarkIcon 
                        className={styles.actionIcon} 
                        filled={isBookmarked(currentCourse.id)}
                      />
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
      </div>

      <CourseDetailsModal
        course={currentCourse}
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </>
  );
};

export default CourseWidget; 