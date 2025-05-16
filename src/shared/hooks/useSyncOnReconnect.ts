import { useEffect, useCallback } from 'react';
import { useNetworkStatus } from './useNetworkStatus';
import { useQueryClient } from '@tanstack/react-query';
import { habitsStorage } from '@/core/database';
import * as serviceWorker from '@/core/serviceWorker/register';

/**
 * Hook to handle data synchronization when the app reconnects to the internet
 *
 * @param options Configuration options
 * @returns Functions to trigger manual sync
 */
export const useSyncOnReconnect = (
  options: {
    syncHabits?: boolean;
    syncHabitLogs?: boolean;
    enableBackgroundSync?: boolean;
  } = {}
): {
  syncHabitsData: () => Promise<number>;
  syncHabitLogsData: () => Promise<number>;
  syncAllData: () => Promise<{ habits: number; logs: number }>;
  isOnline: boolean;
  wasOffline: boolean;
} => {
  const { status: networkStatus } = useNetworkStatus();
  const queryClient = useQueryClient();

  const { syncHabits = true, syncHabitLogs = true, enableBackgroundSync = true } = options;

  /**
   * Sync habits data
   */
  const syncHabitsData = useCallback(async () => {
    if (!networkStatus.isOnline) return 0;

    try {
      console.info('Syncing habits data...');

      // Get unsynced habits from IndexedDB
      const unsyncedHabits = await habitsStorage.getUnsyncedHabits();

      if (unsyncedHabits.length > 0) {
        console.info(`Found ${unsyncedHabits.length} unsynced habits to sync`);

        // Invalidate habits queries to trigger a refresh
        queryClient.invalidateQueries({ queryKey: ['habits'] });
      } else {
        console.info('No unsynced habits found');
      }

      return unsyncedHabits.length;
    } catch (error) {
      console.error('Error syncing habits data:', error);
      return 0;
    }
  }, [networkStatus.isOnline, queryClient]);

  /**
   * Sync habit logs data
   */
  const syncHabitLogsData = useCallback(async () => {
    if (!networkStatus.isOnline) return 0;

    try {
      console.info('Syncing habit logs data...');

      // Get unsynced logs from IndexedDB
      const unsyncedLogs = await habitsStorage.getUnsyncedLogs();

      if (unsyncedLogs.length > 0) {
        console.info(`Found ${unsyncedLogs.length} unsynced logs to sync`);

        // Invalidate logs queries to trigger a refresh
        queryClient.invalidateQueries({ queryKey: ['habitLogs'] });
      } else {
        console.info('No unsynced habit logs found');
      }

      return unsyncedLogs.length;
    } catch (error) {
      console.error('Error syncing habit logs data:', error);
      return 0;
    }
  }, [networkStatus.isOnline, queryClient]);

  /**
   * Sync all data
   */
  const syncAllData = useCallback(async () => {
    if (!networkStatus.isOnline) {
      console.info('Cannot sync data while offline');
      return { habits: 0, logs: 0 };
    }

    const results = {
      habits: 0,
      logs: 0,
    };

    if (syncHabits) {
      results.habits = (await syncHabitsData()) || 0;
    }

    if (syncHabitLogs) {
      results.logs = (await syncHabitLogsData()) || 0;
    }

    // Register for background sync if enabled
    if (enableBackgroundSync) {
      const registered = await serviceWorker.registerBackgroundSync('habits-sync');
      console.info('Background sync registration:', registered ? 'successful' : 'failed');
    }

    console.info('Data synchronization complete', results);

    return results;
  }, [
    networkStatus.isOnline,
    syncHabits,
    syncHabitLogs,
    enableBackgroundSync,
    syncHabitsData,
    syncHabitLogsData,
  ]);

  // Automatically sync data when coming back online
  useEffect(() => {
    if (networkStatus.isOnline && networkStatus.wasOffline) {
      console.info('Network reconnected, starting data sync...');
      syncAllData().catch(err => {
        console.error('Error during auto-sync:', err);
      });
    }
  }, [networkStatus.isOnline, networkStatus.wasOffline, syncAllData]);

  return {
    syncHabitsData,
    syncHabitLogsData,
    syncAllData,
    isOnline: networkStatus.isOnline,
    wasOffline: networkStatus.wasOffline,
  };
};
