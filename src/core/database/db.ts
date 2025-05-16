import Dexie, { Table } from 'dexie';
import { Habit, HabitLog, HabitStreak } from '@/core/services/habitsService';

// Define additional types for our database
export interface CachedItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export enum RequestPriority {
  LOW = 0,
  MEDIUM = 5,
  HIGH = 10,
  CRITICAL = 15,
}

export enum RequestStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  FAILED = 'failed',
  COMPLETED = 'completed',
}

export interface QueuedRequest {
  id: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: Record<string, unknown>;
  createdAt: number;
  attempts: number;
  priority: RequestPriority; // Using the enum for priority
  status: RequestStatus; // Current status of the request
  lastAttempt?: number; // Timestamp of the last attempt
  errorMessage?: string; // Last error message if failed
  retryAfter?: number; // Timestamp to retry after (for backoff)
  tags?: string[]; // Optional tags for categorizing requests
  groupId?: string; // Group ID for related requests
}

/**
 * Extended habit type with local tracking fields
 */
export interface LocalHabit extends Habit {
  _synced: boolean;
  _deleted: boolean;
  _modified: number;
  _version: number;
}

/**
 * Extended log type with local tracking fields
 */
export interface LocalHabitLog extends HabitLog {
  _synced: boolean;
  _deleted: boolean;
  _modified: number;
  _version: number;
}

/**
 * Cache item type
 */
interface CacheItem {
  id: string;
  data: unknown;
  timestamp: number;
  expiresAt: number;
}

/**
 * Class representing the offline database
 */
class HabitsDatabase extends Dexie {
  habits!: Table<LocalHabit>;
  habitLogs!: Table<LocalHabitLog>;
  habitStreaks!: Table<HabitStreak>;
  cache!: Table<CacheItem>;

  constructor() {
    super('HabitsDB');
    this.version(1).stores({
      habits: 'id, user_id, category, [user_id+category], active, archived, _synced, _deleted',
      habitLogs: 'id, habit_id, user_id, date, [habit_id+date], [user_id+date], _synced, _deleted',
      habitStreaks: 'id, habit_id, user_id, [habit_id+user_id]',
      cache: 'id, timestamp, expiresAt',
    });
  }
}

// Create and export the database instance
export const db = new HabitsDatabase();

/**
 * Initialize the database
 */
export const initializeDatabase = async (): Promise<void> => {
  try {
    await db.open();
    console.info('IndexedDB initialized successfully');
    return Promise.resolve();
  } catch (error) {
    console.error('Failed to initialize IndexedDB:', error);
    return Promise.reject(error);
  }
};

// Export a type for our database
export type HabitsDB = HabitsDatabase;
