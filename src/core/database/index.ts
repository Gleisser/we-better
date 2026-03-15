import { db } from './db';
import { habitsStorage } from './habitsStorage';
import { migrations } from './migrations';
import {
  configureDatabaseCleanup,
  ensureDatabaseReady,
  resetDatabaseReadyForTests,
} from './runtime';

configureDatabaseCleanup(() => habitsStorage.clearExpiredCache());

export { ensureDatabaseReady, resetDatabaseReadyForTests };
export * from './db';
export * from './habitsStorage';
export * from './migrations';

export default {
  ensureReady: ensureDatabaseReady,
  db,
  habitsStorage,
  migrations,
};
