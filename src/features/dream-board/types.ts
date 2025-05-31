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
}

export interface DreamboardState {
  dreams: Dream[];
  journalEntries: JournalEntry[];
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
export enum VisionBoardContentType {
  IMAGE = 'image',
  AI_GENERATED = 'ai_generated',
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
export interface VisionBoardContent {
  id: string;
  type: VisionBoardContentType;
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
// Vision Board Data interface
export interface VisionBoardData {
  id?: string;
  title: string;
  description?: string;
  categories: string[];
  content: VisionBoardContent[];
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

// Vision Board Props
export interface VisionBoardProps {
  lifeWheelCategories: LifeCategory[];
  data?: VisionBoardData;
  loading?: boolean;
  error?: string;
  onSave: (data: VisionBoardData) => Promise<boolean>;
  onShare?: (data: VisionBoardData) => void;
  onComplete?: () => void;
  className?: string;
  readOnly?: boolean;
}
