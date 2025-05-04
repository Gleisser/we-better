import { format, differenceInDays } from 'date-fns';
import styles from './ReviewTimer.module.css';

interface ReviewTimerProps {
  nextReviewDate: Date;
}

export const ReviewTimer = ({ nextReviewDate }: ReviewTimerProps): JSX.Element => {
  const daysUntilReview = differenceInDays(nextReviewDate, new Date());
  const isToday = daysUntilReview === 0;

  return (
    <div className={`${styles.reviewTimer} ${isToday ? styles.active : ''}`}>
      <div className={styles.timerIcon}>⏰</div>
      <div className={styles.timerInfo}>
        <span className={styles.timerLabel}>Next Goals Review</span>
        <span className={styles.timerValue}>
          {daysUntilReview > 0 ? <>in {daysUntilReview} days</> : <>Today</>}
        </span>
        <span className={styles.timerDate}>{format(nextReviewDate, 'MMM d, yyyy')}</span>
      </div>
    </div>
  );
};
