import React, { useState } from 'react';
import { ArrowTopRight, BookmarkIcon, ChevronUpIcon, ChevronDownIcon } from '@/shared/components/common/icons';
import { Tooltip } from '@/shared/components/common/Tooltip';
import { useBookmarkedCourses } from '@/hooks/useBookmarkedCourses';
import { PLATFORM_CONFIG } from '../CourseWidget/config';
import styles from './CourseCard.module.css';
import type { Course } from '@/services/courseService';

interface CourseCardProps {
  course: Course;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [votes, setVotes] = useState(0);
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarkedCourses();

  const formatStudentCount = (count: number | undefined): string => {
    if (!count) return '0';
    return count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count.toString();
  };

  const calculateDiscount = (original: number, current: number): number => {
    if (!original || !current) return 0;
    return Math.round(((original - current) / original) * 100);
  };

  const handleVote = (vote: 'up' | 'down') => {
    if (userVote === vote) {
      setUserVote(null);
      setVotes(vote === 'up' ? votes - 1 : votes + 1);
    } else {
      if (userVote) {
        // Change vote
        setVotes(vote === 'up' ? votes + 2 : votes - 2);
      } else {
        // New vote
        setVotes(vote === 'up' ? votes + 1 : votes - 1);
      }
      setUserVote(vote);
    }
  };

  const platformConfig = PLATFORM_CONFIG[course.platform] || {
    name: course.platform,
    bgColor: 'rgba(0, 0, 0, 0.15)',
    color: '#ffffff'
  };

  return (
    <div className={styles.courseCard}>
      <div className={styles.thumbnailSection}>
        <img 
          src={course.thumbnail} 
          alt={course.title}
          className={styles.thumbnail}
        />
        <div className={styles.platformBadge}
          style={{
            backgroundColor: platformConfig.bgColor,
            color: platformConfig.color
          }}
        >
          {platformConfig.name}
        </div>
      </div>

      <div className={styles.courseInfo}>
        <h3 className={styles.courseTitle}>{course.title}</h3>
        
        <div className={styles.instructorRow}>
          <span className={styles.instructorName}>
            by {course.instructor}
          </span>
        </div>

        <div className={styles.statsRow}>
          <div className={styles.rating}>
            ⭐ {course.rating ? course.rating.toFixed(1) : 'N/A'}
          </div>
          <div className={styles.students}>
            👥 {formatStudentCount(course.studentsCount)} students
          </div>
          <div className={styles.duration}>
            ⏱️ {course.duration || 'N/A'}
          </div>
        </div>

        <div className={styles.bottomRow}>
          <div className={styles.actionButtons}>
            <Tooltip content={isBookmarked(course.id) ? "Remove bookmark" : "Bookmark course"}>
              <button
                className={`${styles.iconButton} ${isBookmarked(course.id) ? styles.bookmarked : ''}`}
                onClick={() => {
                  if (isBookmarked(course.id)) {
                    removeBookmark(course.id);
                  } else {
                    addBookmark(course);
                  }
                }}
              >
                <BookmarkIcon 
                  className={styles.actionIcon} 
                  filled={isBookmarked(course.id)}
                />
              </button>
            </Tooltip>
          </div>

          <div className={styles.priceSection}>
            <span className={styles.currentPrice}>
              ${course.price?.current || 0}
            </span>
            {course.price?.original > course.price?.current && (
              <span className={styles.discountBadge}>
                {calculateDiscount(course.price.original, course.price.current)}% OFF
              </span>
            )}
          </div>
        </div>

        <a 
          href={course.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className={styles.goToCourseButton}
        >
          <span>Go to the Course</span>
          <ArrowTopRight className={styles.goToCourseIcon} />
        </a>

        <div className={styles.voteContainer}>
          <Tooltip content="Upvote">
            <button
              className={`${styles.voteButton} ${styles.upvoteButton} ${
                userVote === 'up' ? styles.votedUp : ''
              }`}
              onClick={() => handleVote('up')}
              aria-label="Upvote"
            >
              <ChevronUpIcon className={styles.voteIcon} />
              <span className={styles.voteCount}>{votes > 0 ? votes : ''}</span>
            </button>
          </Tooltip>
          
          <Tooltip content="Downvote">
            <button
              className={`${styles.voteButton} ${styles.downvoteButton} ${
                userVote === 'down' ? styles.votedDown : ''
              }`}
              onClick={() => handleVote('down')}
              aria-label="Downvote"
            >
              <ChevronDownIcon className={styles.voteIcon} />
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default CourseCard; 