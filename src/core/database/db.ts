import Dexie, { Table } from 'dexie';
import { Habit, HabitLog, HabitStreak } from '@/core/services/habitsService';

// Define additional types for our database
export interface CachedItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export interface QueuedRequest {
  id: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: Record<string, unknown>;
  createdAt: number;
  attempts: number;
  priority: number; // Higher number = higher priority
}

// Extend Habit type for optimistic updates
export interface LocalHabit extends Habit {
  _localId?: string; // Local identifier for optimistic updates
  _synced: boolean; // Whether this habit has been synced with server
  _deleted?: boolean; // Soft delete flag for sync
}

// Extend HabitLog type for optimistic updates
export interface LocalHabitLog extends HabitLog {
  _localId?: string;
  _synced: boolean;
  _deleted?: boolean;
}

// Define the database
class HabitsDatabase extends Dexie {
  // Define tables
  habits!: Table<LocalHabit>;
  habitLogs!: Table<LocalHabitLog>;
  habitStreaks!: Table<HabitStreak>;
  requestQueue!: Table<QueuedRequest>;
  cache!: Table<CachedItem<unknown>>;

  constructor() {
    super('HabitsOfflineDB');

    // Define schema with version number
    this.version(1).stores({
      // Define tables with schema and indexes
      habits: '++id, user_id, category, active, archived, [user_id+category], _synced, _localId',
      habitLogs:
        '++id, habit_id, user_id, date, status, [habit_id+date], [user_id+date], _synced, _localId',
      habitStreaks: '++id, habit_id, user_id, [habit_id+user_id]',
      requestQueue: '++id, endpoint, method, createdAt, attempts, priority',
      cache: 'id, timestamp, expiresAt',
    });
  }
}

// Create and export a single instance of the database
export const db = new HabitsDatabase();

// Export a type for our database
export type HabitsDB = HabitsDatabase;
