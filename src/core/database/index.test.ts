import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const initializeMock = vi.fn();
const clearExpiredCacheMock = vi.fn();

vi.mock('./migrations', () => ({
  migrations: {
    initialize: initializeMock,
  },
}));

vi.mock('./habitsStorage', () => ({
  habitsStorage: {
    clearExpiredCache: clearExpiredCacheMock,
  },
}));

describe('ensureDatabaseReady', () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.useFakeTimers();
    vi.clearAllTimers();
    initializeMock.mockReset();
    clearExpiredCacheMock.mockReset();
    clearExpiredCacheMock.mockResolvedValue(undefined);
    initializeMock.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('initializes the database only once for concurrent callers', async () => {
    let resolveInitialize: (() => void) | null = null;
    initializeMock.mockImplementation(
      () =>
        new Promise<void>(resolve => {
          resolveInitialize = resolve;
        })
    );

    const databaseModule = await import('./index');
    const firstCall = databaseModule.ensureDatabaseReady();
    const secondCall = databaseModule.ensureDatabaseReady();

    expect(initializeMock).toHaveBeenCalledTimes(1);

    resolveInitialize?.();
    await expect(firstCall).resolves.toBeUndefined();
    await expect(secondCall).resolves.toBeUndefined();
  });

  it('schedules cache cleanup through requestIdleCallback after initialization', async () => {
    const requestIdleCallbackMock = vi
      .fn<(callback: IdleRequestCallback) => number>()
      .mockImplementation(callback => {
        callback({
          didTimeout: false,
          timeRemaining: () => 50,
        } as IdleDeadline);

        return 1;
      });

    Object.defineProperty(window, 'requestIdleCallback', {
      configurable: true,
      value: requestIdleCallbackMock,
    });

    const databaseModule = await import('./index');
    await databaseModule.ensureDatabaseReady();

    expect(requestIdleCallbackMock).toHaveBeenCalledTimes(1);

    await vi.runAllTimersAsync();

    expect(clearExpiredCacheMock).toHaveBeenCalledTimes(1);
  });
});
