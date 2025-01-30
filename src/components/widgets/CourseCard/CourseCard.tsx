import React, { useState } from 'react';
import { ArrowTopRight, BookmarkIcon, ChevronUpIcon, ChevronDownIcon } from '@/components/common/icons';
import { Tooltip } from '@/components/common/Tooltip';
import { useBookmarkedCourses } from '@/hooks/useBookmarkedCourses';
import { PLATFORM_CONFIG } from '../CourseWidget/config';
import styles from './CourseCard.module.css';
import type { Course } from '@/pages/Courses/mockCourses';

interface CourseCardProps {
  course: Course;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [votes, setVotes] = useState(0);
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarkedCourses();

  const formatStudentCount = (count: number): string => {
    return count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count.toString();
  };

  const calculateDiscount = (original: number, current: number): number => {
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
            backgroundColor: PLATFORM_CONFIG[course.platform].bgColor,
            color: PLATFORM_CONFIG[course.platform].color
          }}
        >
          <span className={styles.platformIcon}>
            {PLATFORM_CONFIG[course.platform].icon}
          </span>
          {PLATFORM_CONFIG[course.platform].name}
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
            ⭐ {course.rating.toFixed(1)}
          </div>
          <div className={styles.students}>
            👥 {formatStudentCount(course.studentsCount)} students
          </div>
          <div className={styles.duration}>
            ⏱️ {course.duration}
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
              ${course.price.current}
            </span>
            <span className={styles.discountBadge}>
              {calculateDiscount(course.price.original, course.price.current)}% OFF
            </span>
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