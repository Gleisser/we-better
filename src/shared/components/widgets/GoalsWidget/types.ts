export type GoalCategory = 'learning' | 'fitness' | 'career' | 'personal';

export interface Goal {
  id: string;
  title: string;
  category: GoalCategory;
  progress: number;
  targetDate: string;
  milestones: { id: string; title: string; completed: boolean }[];
}

export type NotificationMethod = 'email' | 'sms' | 'push' | 'none';
export type ReviewFrequency = 'daily' | 'weekly' | 'monthly';

export interface ReviewSettings {
  frequency: ReviewFrequency;
  notifications: NotificationMethod[];
  nextReviewDate: string;
  reminderDays: number;
}
