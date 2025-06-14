export type TimeFrame = 'short-term' | 'mid-term' | 'long-term';

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  date?: string; // ISO date string
}

export interface Resource {
  id: string;
  title: string;
  type: 'article' | 'course' | 'video' | 'podcast' | 'tool' | 'book';
  link: string;
  relevantDreamIds: string[];
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  dreamId: string | null;
  duration: number; // in days
  frequency: 'daily' | 'weekly' | 'custom';
  selectedDays: number[];
  difficultyLevel: 'easy' | 'medium' | 'hard';
  enableReminders: boolean;
  reminderTime: string | null;
  startDate: string; // ISO date string
  currentDay: number;
  completed: boolean;
}

export interface Dream {
  id: string;
  title: string;
  description: string;
  category: string;
  timeframe: TimeFrame;
  progress: number; // 0 to 1
  createdAt: string; // ISO date string
  imageUrl?: string;
  milestones: Milestone[];
  isShared: boolean;
  sharedWith?: string[]; // user IDs
  voiceMemo?: string; // URL to voice memo

  // Visual positioning data for dream board (optional)
  position?: Position;
  size?: Size;
  rotation?: number;
}

export interface DreamboardState {
  dreams: Dream[];
  challenges: Challenge[];
  resources: Resource[];
  categories: string[];
}

export interface AI_Insight {
  id: string;
  type: 'pattern' | 'suggestion' | 'balance' | 'progress';
  title: string;
  description: string;
  relatedCategories?: string[];
}

export interface WeatherStatus {
  overall: 'sunny' | 'partly-cloudy' | 'cloudy' | 'stormy';
  categoryStatus: Record<string, 'sunny' | 'partly-cloudy' | 'cloudy' | 'stormy'>;
  message: string;
}

export interface NotificationItem {
  id: string;
  type: 'milestone' | 'challenge' | 'reminder' | 'inspiration';
  title: string;
  description: string;
  date: string; // ISO date string
  dreamId?: string;
  read: boolean;
}

export interface DashboardData {
  insights: AI_Insight[];
  weather: WeatherStatus;
  notifications: NotificationItem[];
  upcomingMilestones: Milestone[];
  activeChallenges: Challenge[];
}

import { LifeCategory } from '@/features/life-wheel/types';

// Content types
export enum DreamBoardContentType {
  IMAGE = 'image',
}

// Position interface
export interface Position {
  x: number;
  y: number;
}

// Size interface
export interface Size {
  width: number;
  height: number;
}

// Board Content interface
export interface DreamBoardContent {
  id: string;
  type: DreamBoardContentType;
  position: Position;
  size: Size;
  rotation: number;
  categoryId?: string;

  // Image specific properties
  src?: string;
  alt?: string;
  caption?: string;

  // AI specific properties
  prompt?: string;
}
// Dream Board Data interface
export interface DreamBoardData {
  id?: string;
  title: string;
  description?: string;
  categories: string[];
  content: DreamBoardContent[];
  createdAt?: string;
  updatedAt?: string;
  userId?: string;
}

// Toolbar modes
export enum ToolbarMode {
  ADD = 'add',
  FILTER = 'filter',
  ARRANGE = 'arrange',
}

// Dream Board Props
export interface DreamBoardProps {
  lifeWheelCategories: LifeCategory[];
  data?: DreamBoardData;
  loading?: boolean;
  error?: string;
  onSave: (data: DreamBoardData) => Promise<boolean>;
  onShare?: (data: DreamBoardData) => void;
  onComplete?: () => void;
  onDelete?: () => void;
  className?: string;
  readOnly?: boolean;
}
