/**
 * Database Test Utilities - FOR DEVELOPMENT USE ONLY
 *
 * This file contains helper functions to manually test the IndexedDB implementation
 * via the browser console. These should not be imported in production code.
 *
 * Usage:
 * 1. Import this file in a component temporarily:
 *    import { runDatabaseTests } from '@/core/database/tests/databaseTests';
 *
 * 2. Call the test function in a useEffect or from a button click:
 *    useEffect(() => {
 *      runDatabaseTests().catch(console.error);
 *    }, []);
 */

import { db, habitsStorage } from '../index';
import { Habit, HabitLog, HabitStatus } from '@/core/services/habitsService';

/**
 * Generate a test habit
 */
function createTestHabit(index = 1): Habit {
  return {
    id: `test_habit_${index}`,
    user_id: 'test_user',
    name: `Test Habit ${index}`,
    category: index % 2 === 0 ? 'health' : 'productivity',
    streak: index,
    start_date: new Date().toISOString().split('T')[0],
    active: true,
    archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/**
 * Generate a test habit log
 */
function createTestLog(habitId: string, daysAgo = 0): HabitLog {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const dateStr = date.toISOString().split('T')[0];

  const statuses: HabitStatus[] = [
    'completed',
    'partial',
    'missed',
    'skipped',
    'rescheduled',
    'sick',
  ];

  return {
    id: `log_${habitId}_${dateStr}`,
    habit_id: habitId,
    user_id: 'test_user',
    date: dateStr,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    notes: `Test log for ${daysAgo} days ago`,
    created_at: date.toISOString(),
    updated_at: date.toISOString(),
  };
}

/**
 * Test database operations
 */
export async function runDatabaseTests(): Promise<void> {
  console.info('⚙️ Running IndexedDB Tests');

  try {
    // Clear existing data
    console.info('Clearing database...');
    await habitsStorage.clearAllData();

    // Test habit operations
    console.info('Testing habit operations');

    // Create test habits
    console.info('Creating test habits...');
    const habits: Habit[] = [];
    for (let i = 1; i <= 5; i++) {
      const habit = createTestHabit(i);
      habits.push(habit);
      await habitsStorage.saveHabit(habit);
      console.info(`Created habit: ${habit.name}`);
    }

    // Test fetching habits
    console.info('Fetching all habits...');
    const allHabits = await habitsStorage.getHabits('test_user');
    console.info(`Found ${allHabits.length} habits`, allHabits);

    // Test filtering
    console.info('Fetching habits by category (health)...');
    const healthHabits = await habitsStorage.getHabits('test_user', { category: 'health' });
    console.info(`Found ${healthHabits.length} health habits`, healthHabits);

    console.info('Testing habit logs operations');

    // Test habit logs
    console.info('Testing habit logs operations');

    // Create test logs
    console.info('Creating test logs...');
    const logs: HabitLog[] = [];

    for (const habit of habits) {
      // Create logs for the past week
      for (let daysAgo = 0; daysAgo < 7; daysAgo++) {
        const log = createTestLog(habit.id, daysAgo);
        logs.push(log);
        await habitsStorage.saveHabitLog(log);
      }
    }

    console.info(`Created ${logs.length} logs`);

    // Test fetching logs
    const habitId = habits[0].id;
    console.info(`Fetching logs for habit: ${habitId}`);
    const habitLogs = await habitsStorage.getHabitLogs(habitId);
    console.info(`Found ${habitLogs.length} logs for habit`, habitLogs);

    // Test date filtering
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = await habitsStorage.getHabitLogsByDate('test_user', today);
    console.info(`Found ${todayLogs.length} logs for today`, todayLogs);

    console.info('Testing cache operations');

    // Cache some data
    console.info('Caching test data...');
    const testData = { foo: 'bar', count: 42 };
    await habitsStorage.cacheSet('test_key', testData, 10000); // 10 seconds TTL

    // Retrieve cached data
    console.info('Retrieving cached data...');
    const cachedData = await habitsStorage.cacheGet('test_key');
    console.info('Cached data:', cachedData);

    // Test expired cache
    console.info('Testing expired cache...');
    await habitsStorage.cacheSet('expired_key', { expired: true }, 1); // 1ms TTL

    // Wait for expiration
    await new Promise(resolve => setTimeout(resolve, 10));

    const expiredData = await habitsStorage.cacheGet('expired_key');
    console.info('Expired data (should be null):', expiredData);

    console.info('✅ All tests completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Make test functions available in the browser console for manual testing
if (typeof window !== 'undefined') {
  // Define test utilities interface
  const dbTests = {
    run: runDatabaseTests,
    db,
    storage: habitsStorage,
    createTestHabit,
    createTestLog,
  };

  // Add to window object
  (window as unknown as Record<string, typeof dbTests>).dbTests = dbTests;

  console.info('Database test utilities loaded. Run tests with: dbTests.run()');
}
