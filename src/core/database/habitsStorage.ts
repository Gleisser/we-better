import { Habit, HabitLog, HabitStreak, HabitStats } from '@/core/services/habitsService';
import { db, LocalHabit, LocalHabitLog } from './db';

/**
 * Default TTL values (in milliseconds)
 */
const DEFAULT_CACHE_TTL = {
  HABITS: 24 * 60 * 60 * 1000, // 24 hours
  LOGS: 12 * 60 * 60 * 1000, // 12 hours
  STATS: 6 * 60 * 60 * 1000, // 6 hours
  STREAKS: 12 * 60 * 60 * 1000, // 12 hours
};

/**
 * Convert a server habit to a local habit
 */
export const toLocalHabit = (habit: Habit, synced = true): LocalHabit => {
  if (!habit || typeof habit !== 'object') {
    console.error('Invalid habit object provided to toLocalHabit:', habit);
    throw new Error('Invalid habit object provided');
  }

  // Ensure the habit has the required fields
  if (!habit.id) {
    console.warn('Habit missing ID, generating a temporary one');
    habit.id = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  return {
    ...habit,
    _synced: synced,
    _deleted: false,
    _version: 1,
    _modified: Date.now(),
  };
};

/**
 * Convert a local habit to a server habit
 */
export const toServerHabit = (habit: LocalHabit): Habit => {
  // Extract only the fields that should be in the server model
  const {
    id,
    user_id,
    name,
    category,
    streak,
    start_date,
    active,
    archived,
    archive_date,
    created_at,
    updated_at,
  } = habit;

  return {
    id,
    user_id,
    name,
    category,
    streak,
    start_date,
    active,
    archived,
    archive_date,
    created_at,
    updated_at,
  };
};

/**
 * Convert a server habit log to a local habit log
 */
export const toLocalHabitLog = (log: HabitLog, synced = true): LocalHabitLog => ({
  ...log,
  _synced: synced,
  _deleted: false,
  _modified: Date.now(),
  _version: 1,
});

/**
 * Convert a local habit log to a server habit log
 */
export const toServerHabitLog = (log: LocalHabitLog): HabitLog => {
  const { _synced, _deleted, _modified, _version, ...serverLog } = log;
  return serverLog as HabitLog;
};

/**
 * Habits Storage Service
 * Provides methods for working with habits data in IndexedDB
 */
export const habitsStorage = {
  /**
   * HABIT OPERATIONS
   */

  /**
   * Save a habit to the database
   * @param habit The habit to save
   * @param synced Whether this habit is synced with the server
   */
  async saveHabit(habit: Habit, synced = true): Promise<string> {
    const localHabit = toLocalHabit(habit, synced);
    const id = await db.habits.put(localHabit);
    return id.toString();
  },

  /**
   * Save multiple habits to the database
   * @param habits The habits to save
   * @param synced Whether these habits are synced with the server
   */
  async saveHabits(habits: Habit[], synced = true): Promise<void> {
    if (!habits || !Array.isArray(habits) || habits.length === 0) {
      console.warn('saveHabits called with invalid or empty habits array');
      return;
    }
    const localHabits = habits.map(habit => toLocalHabit(habit, synced));
    await db.habits.bulkPut(localHabits);
  },

  /**
   * Get a habit by ID
   * @param id The habit ID
   */
  async getHabit(id: string): Promise<Habit | undefined> {
    const habit = await db.habits.get(id);
    if (!habit || habit._deleted) return undefined;
    return toServerHabit(habit);
  },

  /**
   * Get habits with optional filtering
   * @param userId The user ID
   * @param filters Optional filters
   */
  async getHabits(
    userId: string,
    filters: {
      category?: string;
      archived?: boolean;
      active?: boolean;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<Habit[]> {
    let query = db.habits
      .where('user_id')
      .equals(userId)
      .and(h => !h._deleted);

    if (filters.category) {
      query = query.and(h => h.category === filters.category);
    }

    if (filters.archived !== undefined) {
      query = query.and(h => h.archived === filters.archived);
    }

    if (filters.active !== undefined) {
      query = query.and(h => h.active === filters.active);
    }

    const habits = await query.toArray();
    return habits.map(toServerHabit);
  },

  /**
   * Mark a habit as deleted locally
   * @param id The habit ID
   */
  async markHabitAsDeleted(id: string): Promise<void> {
    const habit = await db.habits.get(id);
    if (habit) {
      habit._deleted = true;
      habit._synced = false;
      habit._modified = Date.now();
      await db.habits.put(habit);
    }
  },

  /**
   * Get all unsynced habits
   */
  async getUnsyncedHabits(): Promise<LocalHabit[]> {
    return db.habits.where('_synced').equals(0).toArray();
  },

  /**
   * Mark a habit as synced
   * @param id The habit ID
   */
  async markHabitAsSynced(id: string): Promise<void> {
    const habit = await db.habits.get(id);
    if (habit) {
      habit._synced = true;
      await db.habits.put(habit);
    }
  },

  /**
   * Permanently delete a habit
   * @param id The habit ID
   */
  async deleteHabit(id: string): Promise<void> {
    await db.habits.delete(id);
  },

  /**
   * HABIT LOGS OPERATIONS
   */

  /**
   * Save a habit log
   * @param log The log to save
   * @param synced Whether this log is synced with the server
   */
  async saveHabitLog(log: HabitLog, synced = true): Promise<string> {
    const localLog: LocalHabitLog = {
      ...log,
      _synced: synced,
      _deleted: false,
      _version: 1,
      _modified: Date.now(),
    };
    const id = await db.habitLogs.put(localLog);
    return id.toString();
  },

  /**
   * Save multiple habit logs
   * @param logs The logs to save
   * @param synced Whether these logs are synced with the server
   */
  async saveHabitLogs(logs: HabitLog[], synced = true): Promise<void> {
    const localLogs: LocalHabitLog[] = logs.map(log => ({
      ...log,
      _synced: synced,
      _deleted: false,
      _version: 1,
      _modified: Date.now(),
    }));
    await db.habitLogs.bulkPut(localLogs);
  },

  /**
   * Get logs for a habit
   * @param habitId The habit ID
   * @param startDate Optional start date
   * @param endDate Optional end date
   */
  async getHabitLogs(habitId: string, startDate?: string, endDate?: string): Promise<HabitLog[]> {
    let query = db.habitLogs
      .where('habit_id')
      .equals(habitId)
      .and(log => !log._deleted);

    if (startDate && endDate) {
      query = query.and(log => log.date >= startDate && log.date <= endDate);
    } else if (startDate) {
      query = query.and(log => log.date >= startDate);
    } else if (endDate) {
      query = query.and(log => log.date <= endDate);
    }

    const logs = await query.toArray();

    // Convert to server format (remove local properties)
    return logs.map(log => {
      const { _synced, _deleted, _version, _modified, ...serverLog } = log;
      return serverLog;
    });
  },

  /**
   * Mark a log as deleted locally
   * @param id The log ID
   */
  async markLogAsDeleted(id: string): Promise<void> {
    const log = await db.habitLogs.get(id);
    if (log) {
      log._deleted = true;
      log._synced = false;
      log._modified = Date.now();
      await db.habitLogs.put(log);
    }
  },

  /**
   * Get all unsynced logs
   */
  async getUnsyncedLogs(): Promise<LocalHabitLog[]> {
    return db.habitLogs.where('_synced').equals(0).toArray();
  },

  /**
   * Mark a log as synced
   * @param id The log ID
   */
  async markLogAsSynced(id: string): Promise<void> {
    const log = await db.habitLogs.get(id);
    if (log) {
      log._synced = true;
      await db.habitLogs.put(log);
    }
  },

  /**
   * HABIT STREAKS OPERATIONS
   */

  /**
   * Save a habit streak
   * @param streak The streak to save
   */
  async saveHabitStreak(streak: HabitStreak): Promise<string> {
    const id = await db.habitStreaks.put(streak);
    return id.toString();
  },

  /**
   * Get a streak for a habit
   * @param habitId The habit ID
   * @param userId The user ID
   */
  async getHabitStreak(habitId: string, userId: string): Promise<HabitStreak | undefined> {
    return db.habitStreaks.where('[habit_id+user_id]').equals([habitId, userId]).first();
  },

  /**
   * CACHE OPERATIONS
   */

  /**
   * Save an item to the cache
   * @param key Cache key
   * @param data Data to cache
   * @param ttl Time to live in milliseconds
   */
  async cacheSet<T>(key: string, data: T, ttl = DEFAULT_CACHE_TTL.HABITS): Promise<void> {
    const cacheItem = {
      id: key,
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
    };

    await db.cache.put(cacheItem);
  },

  /**
   * Get an item from the cache
   * @param key Cache key
   */
  async cacheGet<T>(key: string): Promise<T | null> {
    const cacheItem = await db.cache.get(key);

    if (!cacheItem) return null;

    // Check if cache is still valid
    if (cacheItem.expiresAt < Date.now()) {
      await db.cache.delete(key);
      return null;
    }

    return cacheItem.data as T;
  },

  /**
   * Delete an item from the cache
   * @param key Cache key
   */
  async cacheDelete(key: string): Promise<void> {
    await db.cache.delete(key);
  },

  /**
   * STATS OPERATIONS
   */

  /**
   * Cache habit stats
   * @param userId The user ID
   * @param stats The stats to cache
   */
  async cacheHabitStats(userId: string, stats: HabitStats): Promise<void> {
    await this.cacheSet(`stats_${userId}`, stats, DEFAULT_CACHE_TTL.STATS);
  },

  /**
   * Get cached habit stats
   * @param userId The user ID
   */
  async getCachedHabitStats(userId: string): Promise<HabitStats | null> {
    return this.cacheGet<HabitStats>(`stats_${userId}`);
  },

  /**
   * Clear all data for testing/development
   */
  async clearAllData(): Promise<void> {
    await db.habits.clear();
    await db.habitLogs.clear();
    await db.habitStreaks.clear();
    await db.cache.clear();
  },
};
