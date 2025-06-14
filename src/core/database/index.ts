import { db } from './db';
import { habitsStorage } from './habitsStorage';
import { migrations } from './migrations';

/**
 * Initialize database and all related services
 */
export async function initializeDatabase(): Promise<void> {
  try {
    // Initialize the database
    await migrations.initialize();

    // Clean up expired cache items
    setTimeout(() => {
      habitsStorage.clearExpiredCache().catch(error => {
        console.error('Failed to clear expired cache items check:', error);
      });
    }, 2000); // Give the app a chance to settle before running cleanup
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

// Re-export database-related modules
export * from './db';
export * from './habitsStorage';
export * from './migrations';

// Default export for easy importing
export default {
  initialize: initializeDatabase,
  db,
  habitsStorage,
  migrations,
};
