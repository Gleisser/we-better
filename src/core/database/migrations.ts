import { db } from './db';

/**
 * Database migration utilities
 */
export const migrations = {
  /**
   * Register database version upgrades
   * This allows us to modify the database schema over time
   */
  registerUpgrades(): void {
    /**
     * Initial schema (v1) already defined in db.ts
     */
    /**
     * Version 2: Add new fields to habits table
     * This is a template for future migrations
     */
    /*
    db.version(2).stores({
      // Keep the schema for previously existing tables
      habits: '++id, user_id, category, active, archived, [user_id+category], _synced, _localId, newField',
      habitLogs: '++id, habit_id, user_id, date, status, [habit_id+date], [user_id+date], _synced, _localId',
      habitStreaks: '++id, habit_id, user_id, [habit_id+user_id]',
      requestQueue: '++id, endpoint, method, createdAt, attempts, priority',
      cache: 'id, timestamp, expiresAt',
    }).upgrade(tx => {
      // This function will be called when upgrading from v1 to v2
      return tx.table('habits').toCollection().modify(habit => {
        // Set default values for new fields
        habit.newField = 'default value';
      });
    });
    */
    /**
     * Example Version 3: Add new logs table
     */
    /*
    db.version(3).stores({
      // Keep the schema for previously existing tables
      habits: '++id, user_id, category, active, archived, [user_id+category], _synced, _localId, newField',
      habitLogs: '++id, habit_id, user_id, date, status, [habit_id+date], [user_id+date], _synced, _localId',
      habitStreaks: '++id, habit_id, user_id, [habit_id+user_id]',
      requestQueue: '++id, endpoint, method, createdAt, attempts, priority',
      cache: 'id, timestamp, expiresAt',
      // Add new table
      syncLog: '++id, timestamp, operation, entityId, success'
    });
    */
  },

  /**
   * Check database health and repair if needed
   * This can be called on application startup
   */
  async checkDatabaseHealth(): Promise<boolean> {
    try {
      // Verify we can access the database
      await db.habits.count();
      await db.habitLogs.count();
      await db.habitStreaks.count();
      await db.requestQueue.count();
      await db.cache.count();

      // Database is healthy
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);

      // Attempt to repair the database
      try {
        await db.delete();
        console.info('Database deleted, will be recreated on next access');
        return false;
      } catch (deleteError) {
        console.error('Failed to delete corrupted database:', deleteError);
        return false;
      }
    }
  },

  /**
   * Initialize the database and run any pending migrations
   * This should be called early in your application startup
   */
  async initialize(): Promise<void> {
    try {
      // Register upgrade paths
      this.registerUpgrades();

      // Verify database health
      const isHealthy = await this.checkDatabaseHealth();

      if (!isHealthy) {
        console.info('Database was reset, initializing...');
      }

      // Open the database to trigger any pending migrations
      await db.open();

      console.info('IndexedDB initialized successfully');
    } catch (error) {
      console.error('Failed to initialize IndexedDB:', error);
      throw error;
    }
  },
};
