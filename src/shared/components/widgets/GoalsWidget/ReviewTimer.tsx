import { format, differenceInDays, isToday as isTodayFn, isPast } from 'date-fns';
import styles from './ReviewTimer.module.css';

interface ReviewTimerProps {
  nextReviewDate: Date;
  onCompleteReview?: () => void;
}

export const ReviewTimer = ({
  nextReviewDate,
  onCompleteReview,
}: ReviewTimerProps): JSX.Element => {
  const daysUntilReview = differenceInDays(nextReviewDate, new Date());
  const isToday = isTodayFn(nextReviewDate);
  const isOverdue = isPast(nextReviewDate) && !isToday;

  const getTimerDisplay = (): string => {
    if (isOverdue) {
      const daysPast = Math.abs(daysUntilReview);
      return `Overdue by ${daysPast} day${daysPast === 1 ? '' : 's'}`;
    } else if (isToday) {
      return 'Due Today';
    } else if (daysUntilReview === 1) {
      return 'Tomorrow';
    } else {
      return `in ${daysUntilReview} days`;
    }
  };

  const getTimerIcon = (): string => {
    if (isOverdue) return '🔴';
    if (isToday) return '⚡';
    if (daysUntilReview <= 3) return '⚠️';
    return '⏰';
  };

  const getTimerClass = (): string => {
    if (isOverdue) return `${styles.reviewTimer} ${styles.overdue}`;
    if (isToday) return `${styles.reviewTimer} ${styles.today}`;
    if (daysUntilReview <= 3) return `${styles.reviewTimer} ${styles.soon}`;
    return styles.reviewTimer;
  };

  const handleClick = (): void => {
    if ((isToday || isOverdue) && onCompleteReview) {
      onCompleteReview();
    }
  };

  return (
    <div
      className={getTimerClass()}
      onClick={handleClick}
      style={{ cursor: (isToday || isOverdue) && onCompleteReview ? 'pointer' : 'default' }}
      title={(isToday || isOverdue) && onCompleteReview ? 'Click to complete review' : undefined}
    >
      <div className={styles.timerIcon}>{getTimerIcon()}</div>
      <div className={styles.timerInfo}>
        <span className={styles.timerLabel}>Goals Review</span>
        <span className={styles.timerValue}>{getTimerDisplay()}</span>
        <span className={styles.timerDate}>{format(nextReviewDate, 'MMM d, yyyy')}</span>
      </div>
    </div>
  );
};
