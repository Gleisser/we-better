# IndexedDB Implementation for Habits Feature

This module provides a robust offline storage solution for the Habits feature, using IndexedDB via the Dexie.js library.

## Structure

- `db.ts` - Database schema definition and configuration
- `habitsStorage.ts` - Storage service with CRUD operations for habits data
- `migrations.ts` - Database migration utilities for schema upgrades
- `index.ts` - Entry point that initializes the database and exports functionality
- `tests/databaseTests.ts` - Test utilities for manual testing

## Features

- **Offline Data Storage**: Persistent local storage for habits, logs, and statistics
- **TTL-based Caching**: Time-based cache expiration for optimal data freshness
- **Migration Support**: Versioned database schema with upgrade paths
- **Sync Status Tracking**: Flag system to track which data needs to be synced
- **Batch Operations**: Methods for efficient bulk updates

## Usage

### Database Initialization

The database is automatically initialized at application startup in `main.tsx`:

```typescript
import { initializeDatabase } from './core/database';

// Initialize the database
initializeDatabase()
  .then(() => {
    console.log('Database initialized successfully');
  })
  .catch(error => {
    console.error('Failed to initialize database:', error);
  });
```

### Using the Storage Service

```typescript
import { habitsStorage } from '@/core/database';

// Get habits for a user
const habits = await habitsStorage.getHabits(userId, {
  category: 'health',
  active: true,
});

// Save a habit
await habitsStorage.saveHabit(habit);

// Get logs for a habit
const logs = await habitsStorage.getHabitLogs(habitId, {
  startDate: '2023-01-01',
  endDate: '2023-01-31',
});
```

### Caching Data

```typescript
// Cache data with a specified TTL
await habitsStorage.cacheSet('stats_key', statsData, 3600000); // 1 hour TTL

// Retrieve cached data
const cachedStats = await habitsStorage.cacheGet('stats_key');
```

## Testing

For manual testing in development, you can use the test utilities:

```typescript
// In a component, import:
import { runDatabaseTests } from '@/core/database/tests/databaseTests';

// Then call in useEffect:
useEffect(() => {
  runDatabaseTests().catch(console.error);
}, []);

// Or in browser console:
dbTests.run();
```

## Next Steps

Now that the IndexedDB storage layer is implemented, the remaining steps for offline support are:

1. **Create Network Status Detection**

   - Implement `useOnlineStatus` hook
   - Add connectivity change listeners
   - Create visual indicator for offline state

2. **Build Request Queue System**

   - Implement queue for storing offline API requests
   - Create processor for syncing when back online
   - Handle conflicts and retry logic

3. **Integrate with React Query**

   - Modify existing hooks to use React Query
   - Add optimistic updates support
   - Configure query invalidation logic

4. **Service Worker Implementation**
   - Add background sync support
   - Create service worker for improved network detection
   - Implement push notification capabilities

## Known Limitations

- IndexedDB is not available in all private browsing modes
- Limited storage capacity on some mobile browsers
- Schema changes require careful migration handling
