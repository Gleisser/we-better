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
export const toLocalHabit = (habit: Habit, synced = true): LocalHabit => ({
  ...habit,
  _synced: synced,
});

/**
 * Convert a local habit to a server habit
 */
export const toServerHabit = (habit: LocalHabit): Habit => {
  const { _synced, _localId, _deleted, ...serverHabit } = habit;
  return serverHabit as Habit;
};

/**
 * Convert a server habit log to a local habit log
 */
export const toLocalHabitLog = (log: HabitLog, synced = true): LocalHabitLog => ({
  ...log,
  _synced: synced,
});

/**
 * Convert a local habit log to a server habit log
 */
export const toServerHabitLog = (log: LocalHabitLog): HabitLog => {
  const { _synced, _localId, _deleted, ...serverLog } = log;
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
   * Get all habits for a user
   * @param userId The user ID
   * @param options Query options
   */
  async getHabits(
    userId: string,
    options: {
      category?: string;
      active?: boolean;
      archived?: boolean;
      includeDeleted?: boolean;
    } = {}
  ): Promise<Habit[]> {
    let query = db.habits.where('user_id').equals(userId);

    // Apply filters
    if (options.category) {
      query = db.habits.where('[user_id+category]').equals([userId, options.category]);
    }

    // Execute query
    let habits = await query.toArray();

    // Apply additional filters
    if (options.active !== undefined) {
      habits = habits.filter(h => h.active === options.active);
    }

    if (options.archived !== undefined) {
      habits = habits.filter(h => h.archived === options.archived);
    }

    // Exclude deleted items unless specifically requested
    if (!options.includeDeleted) {
      habits = habits.filter(h => !h._deleted);
    }

    // Convert to server format
    return habits.map(toServerHabit);
  },

  /**
   * Get all unsynced habits
   */
  async getUnsyncedHabits(): Promise<LocalHabit[]> {
    return db.habits.where('_synced').equals(0).toArray();
  },

  /**
   * Mark a habit as deleted (for sync)
   * @param id The habit ID
   */
  async markHabitAsDeleted(id: string): Promise<void> {
    const habit = await db.habits.get(id);
    if (habit) {
      await db.habits.update(id, {
        _deleted: true,
        _synced: false,
      });
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
    const localLog = toLocalHabitLog(log, synced);
    const id = await db.habitLogs.put(localLog);
    return id.toString();
  },

  /**
   * Save multiple habit logs
   * @param logs The logs to save
   * @param synced Whether these logs are synced with the server
   */
  async saveHabitLogs(logs: HabitLog[], synced = true): Promise<void> {
    const localLogs = logs.map(log => toLocalHabitLog(log, synced));
    await db.habitLogs.bulkPut(localLogs);
  },

  /**
   * Get a habit log by ID
   * @param id The log ID
   */
  async getHabitLog(id: string): Promise<HabitLog | undefined> {
    const log = await db.habitLogs.get(id);
    if (!log || log._deleted) return undefined;
    return toServerHabitLog(log);
  },

  /**
   * Get logs for a habit
   * @param habitId The habit ID
   * @param options Query options
   */
  async getHabitLogs(
    habitId: string,
    options: {
      startDate?: string;
      endDate?: string;
      includeDeleted?: boolean;
    } = {}
  ): Promise<HabitLog[]> {
    const query = db.habitLogs.where('habit_id').equals(habitId);

    // Execute query
    let logs = await query.toArray();

    // Apply date filters
    if (options.startDate !== undefined) {
      const startDate = options.startDate;
      logs = logs.filter(log => log.date >= startDate);
    }

    if (options.endDate !== undefined) {
      const endDate = options.endDate;
      logs = logs.filter(log => log.date <= endDate);
    }

    // Exclude deleted items unless specifically requested
    if (!options.includeDeleted) {
      logs = logs.filter(log => !log._deleted);
    }

    // Convert to server format
    return logs.map(toServerHabitLog);
  },

  /**
   * Get logs for a user on a specific date
   * @param userId The user ID
   * @param date The date string (YYYY-MM-DD)
   */
  async getHabitLogsByDate(userId: string, date: string): Promise<HabitLog[]> {
    const logs = await db.habitLogs
      .where('[user_id+date]')
      .equals([userId, date])
      .filter(log => !log._deleted)
      .toArray();

    return logs.map(toServerHabitLog);
  },

  /**
   * Get all unsynced habit logs
   */
  async getUnsyncedHabitLogs(): Promise<LocalHabitLog[]> {
    return db.habitLogs.where('_synced').equals(0).toArray();
  },

  /**
   * Mark a habit log as deleted (for sync)
   * @param id The log ID
   */
  async markHabitLogAsDeleted(id: string): Promise<void> {
    const log = await db.habitLogs.get(id);
    if (log) {
      await db.habitLogs.update(id, {
        _deleted: true,
        _synced: false,
      });
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
    const item = await db.cache.get(key);

    // Return null if item doesn't exist or is expired
    if (!item || item.expiresAt < Date.now()) {
      return null;
    }

    return item.data as T;
  },

  /**
   * Delete an item from the cache
   * @param key Cache key
   */
  async cacheDelete(key: string): Promise<void> {
    await db.cache.delete(key);
  },

  /**
   * Clear expired cache items
   */
  async clearExpiredCache(): Promise<void> {
    const now = Date.now();
    await db.cache.where('expiresAt').below(now).delete();
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
