import { format, differenceInDays, isToday as isTodayFn, isPast } from 'date-fns';
import { enUS, ptBR } from 'date-fns/locale';
import { useCommonTranslation } from '@/shared/hooks/useTranslation';
import styles from './ReviewTimer.module.css';

interface ReviewTimerProps {
  nextReviewDate: Date;
  onCompleteReview?: () => void;
}

export const ReviewTimer = ({
  nextReviewDate,
  onCompleteReview,
}: ReviewTimerProps): JSX.Element => {
  const { t, currentLanguage } = useCommonTranslation();
  const daysUntilReview = differenceInDays(nextReviewDate, new Date());
  const isToday = isTodayFn(nextReviewDate);
  const isOverdue = isPast(nextReviewDate) && !isToday;

  // Get the appropriate locale for date formatting
  const dateLocale = currentLanguage === 'pt' ? ptBR : enUS;

  const getTimerDisplay = (): string => {
    if (isOverdue) {
      const daysPast = Math.abs(daysUntilReview);
      return t('widgets.goals.reviewTimer.overdue', { count: daysPast }) as string;
    } else if (isToday) {
      return t('widgets.goals.reviewTimer.dueToday') as string;
    } else if (daysUntilReview === 1) {
      return t('widgets.goals.reviewTimer.tomorrow') as string;
    } else {
      return t('widgets.goals.reviewTimer.inDays', { count: daysUntilReview }) as string;
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
      title={
        (isToday || isOverdue) && onCompleteReview
          ? (t('widgets.goals.reviewTimer.clickToComplete') as string)
          : undefined
      }
    >
      <div className={styles.timerIcon}>{getTimerIcon()}</div>
      <div className={styles.timerInfo}>
        <span className={styles.timerLabel}>{t('widgets.goals.reviewTimer.label')}</span>
        <span className={styles.timerValue}>{getTimerDisplay()}</span>
        <span className={styles.timerDate}>
          {format(nextReviewDate, 'MMM d, yyyy', { locale: dateLocale })}
        </span>
      </div>
    </div>
  );
};
