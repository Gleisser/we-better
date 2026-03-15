import { migrations } from './migrations';

type IdleCallbackHandle = number;

let databaseReadyPromise: Promise<void> | null = null;
let cleanupScheduled = false;
let cleanupRunner: (() => Promise<void>) | null = null;

const scheduleIdleCleanup = (): void => {
  if (cleanupScheduled || !cleanupRunner) {
    return;
  }

  cleanupScheduled = true;

  const runCleanup = (): void => {
    cleanupRunner?.().catch(error => {
      console.error('Failed to clear expired cache items:', error);
    });
  };

  const requestIdleCallback = (
    window as Window & {
      requestIdleCallback?: (
        callback: IdleRequestCallback,
        options?: IdleRequestOptions
      ) => IdleCallbackHandle;
    }
  ).requestIdleCallback;

  if (typeof window !== 'undefined' && typeof requestIdleCallback === 'function') {
    requestIdleCallback(() => {
      window.setTimeout(runCleanup, 0);
    });
    return;
  }

  setTimeout(runCleanup, 2000);
};

export function configureDatabaseCleanup(runCleanup: () => Promise<void>): void {
  cleanupRunner = runCleanup;
}

export async function ensureDatabaseReady(): Promise<void> {
  if (!databaseReadyPromise) {
    databaseReadyPromise = (async () => {
      await migrations.initialize();
      scheduleIdleCleanup();
      console.info('IndexedDB initialized successfully');
    })().catch(error => {
      databaseReadyPromise = null;
      cleanupScheduled = false;
      console.error('Failed to initialize database:', error);
      throw error;
    });
  }

  return databaseReadyPromise;
}

export function resetDatabaseReadyForTests(): void {
  databaseReadyPromise = null;
  cleanupScheduled = false;
}
