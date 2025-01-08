export type GoalCategory = 'learning' | 'fitness' | 'career' | 'personal' | 'financial';

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
}

export interface Goal {
  id: string;
  title: string;
  category: GoalCategory;
  progress: number;
  targetDate: string;
  milestones: Milestone[];
}

export type NotificationMethod = 'email' | 'sms' | 'push' | 'none';
export type ReviewFrequency = 'weekly' | 'biweekly' | 'monthly' | 'quarterly';

export interface ReviewSettings {
  frequency: ReviewFrequency;
  notifications: NotificationMethod[];
  nextReviewDate: string;
  reminderDays: number; // days before review to start showing reminders
} 