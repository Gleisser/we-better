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