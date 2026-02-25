import {
  BellIcon,
  CalendarIcon,
  CheckmarkIcon,
  DreamBoardIcon,
  FlagIcon,
  SparklesIcon,
  StarIcon,
} from '@/shared/components/common/icons';
import type { NotificationEventType } from '@/core/services/notificationsService';
import styles from './NotificationEventAvatar.module.css';

interface NotificationEventAvatarProps {
  eventType: NotificationEventType;
  className?: string;
}

type VisualConfig = {
  Icon: ({ className }: { className?: string }) => JSX.Element;
  toneClass: string;
};

const VISUAL_BY_EVENT: Record<NotificationEventType, VisualConfig> = {
  habit_daily_reminder: {
    Icon: CheckmarkIcon,
    toneClass: styles.habit,
  },
  goal_review_reminder: {
    Icon: CalendarIcon,
    toneClass: styles.goal,
  },
  dream_challenge_reminder: {
    Icon: DreamBoardIcon,
    toneClass: styles.dream,
  },
  dream_milestone_due_soon: {
    Icon: FlagIcon,
    toneClass: styles.milestone,
  },
  dream_milestone_due_today: {
    Icon: FlagIcon,
    toneClass: styles.milestone,
  },
  dream_milestone_overdue: {
    Icon: FlagIcon,
    toneClass: styles.milestone,
  },
  affirmation_reminder: {
    Icon: SparklesIcon,
    toneClass: styles.affirmation,
  },
  habit_streak_milestone: {
    Icon: StarIcon,
    toneClass: styles.achievement,
  },
  goal_milestone_completed: {
    Icon: CheckmarkIcon,
    toneClass: styles.achievement,
  },
};

const NotificationEventAvatar = ({
  eventType,
  className = '',
}: NotificationEventAvatarProps): JSX.Element => {
  const visual = VISUAL_BY_EVENT[eventType] ?? {
    Icon: BellIcon,
    toneClass: styles.defaultTone,
  };
  const Icon = visual.Icon;

  return (
    <span className={`${styles.avatar} ${visual.toneClass} ${className}`} aria-hidden="true">
      <Icon className={styles.icon} />
    </span>
  );
};

export default NotificationEventAvatar;
