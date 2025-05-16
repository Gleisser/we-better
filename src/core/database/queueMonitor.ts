import { EventEmitter } from 'events';
import { db, RequestStatus } from './db';

/**
 * Interface for queue status metrics
 */
export interface QueueStatusMetrics {
  pending: number;
  processing: number;
  failed: number;
  completed: number;
  total: number;
  oldestPendingTimestamp?: number;
  newestPendingTimestamp?: number;
  failureRate: number;
  avgProcessingTime?: number;
  byEndpoint: Record<string, number>;
  byPriority: Record<number, number>;
}

/**
 * Interface for queue health status
 */
export interface QueueHealthStatus {
  isHealthy: boolean;
  issues: string[];
  pendingCount: number;
  failedCount: number;
  stuckCount: number;
  oldestPendingAge?: number;
}

/**
 * Events emitted by the queue monitor
 */
export enum QueueMonitorEvent {
  QUEUE_STATUS_UPDATED = 'queue_status_updated',
  QUEUE_HEALTH_CHANGED = 'queue_health_changed',
  REQUEST_STUCK = 'request_stuck',
  REQUEST_FAILED = 'request_failed',
  HIGH_FAILURE_RATE = 'high_failure_rate',
}

/**
 * Service for monitoring the status and health of the request queue
 */
export const queueMonitor = {
  events: new EventEmitter(),
  status: {} as QueueStatusMetrics,
  health: {
    isHealthy: true,
    issues: [],
    pendingCount: 0,
    failedCount: 0,
    stuckCount: 0,
  } as QueueHealthStatus,
  monitorInterval: null as NodeJS.Timeout | null,
  lastHistoryUpdate: 0,
  processingTimeHistory: [] as number[],

  /**
   * Initialize the queue monitor
   *
   * @param options Configuration options
   */
  initialize(
    options: {
      monitorInterval?: number;
      healthCheckInterval?: number;
      maxHealthyPendingCount?: number;
      maxHealthyFailedCount?: number;
      stuckRequestThresholdMs?: number;
      highFailureRateThreshold?: number;
    } = {}
  ): void {
    const {
      monitorInterval = 30000, // Default to 30 seconds
      maxHealthyPendingCount = 100,
      maxHealthyFailedCount = 20,
      stuckRequestThresholdMs = 5 * 60 * 1000, // 5 minutes
      highFailureRateThreshold = 0.25, // 25%
    } = options;

    // Store health thresholds as instance variables for health checks
    this._maxHealthyPendingCount = maxHealthyPendingCount;
    this._maxHealthyFailedCount = maxHealthyFailedCount;
    this._stuckRequestThresholdMs = stuckRequestThresholdMs;
    this._highFailureRateThreshold = highFailureRateThreshold;

    // Register event listeners for completed requests to track processing time
    this.events.on(QueueMonitorEvent.QUEUE_STATUS_UPDATED, this.checkQueueHealth.bind(this));

    // Start monitoring
    this.startMonitoring(monitorInterval);

    console.info('Queue monitor initialized');
  },

  /**
   * Start the monitoring cycle
   *
   * @param interval How often to update status (ms)
   */
  startMonitoring(interval: number = 30000): void {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
    }

    // Do an initial status update
    this.updateQueueStatus();

    // Set up regular monitoring
    this.monitorInterval = setInterval(() => {
      this.updateQueueStatus();
    }, interval);
  },

  /**
   * Stop the monitoring cycle
   */
  stopMonitoring(): void {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
  },

  /**
   * Update the current queue status metrics
   */
  async updateQueueStatus(): Promise<QueueStatusMetrics> {
    try {
      const allRequests = await db.requestQueue.toArray();
      const pendingRequests = allRequests.filter(r => r.status === RequestStatus.PENDING);
      const processingRequests = allRequests.filter(r => r.status === RequestStatus.PROCESSING);
      const failedRequests = allRequests.filter(r => r.status === RequestStatus.FAILED);
      const completedRequests = allRequests.filter(r => r.status === RequestStatus.COMPLETED);

      // Track processing times for completed requests
      if (this.lastHistoryUpdate > 0) {
        const recentlyCompleted = completedRequests.filter(
          r => r.lastAttempt && r.lastAttempt > this.lastHistoryUpdate
        );

        for (const req of recentlyCompleted) {
          if (req.lastAttempt && req.createdAt) {
            this.processingTimeHistory.push(req.lastAttempt - req.createdAt);
            // Keep history to last 100 requests
            if (this.processingTimeHistory.length > 100) {
              this.processingTimeHistory.shift();
            }
          }
        }
      }

      this.lastHistoryUpdate = Date.now();

      // Calculate queue metrics
      const pendingTimes = pendingRequests.map(r => r.createdAt).sort((a, b) => a - b);

      const oldestPendingTimestamp = pendingTimes[0];
      const newestPendingTimestamp = pendingTimes[pendingTimes.length - 1];

      // Calculate average processing time
      const avgProcessingTime =
        this.processingTimeHistory.length > 0
          ? this.processingTimeHistory.reduce((sum, time) => sum + time, 0) /
            this.processingTimeHistory.length
          : undefined;

      // Calculate failure rate (failed / total attempted)
      const attemptedCount = completedRequests.length + failedRequests.length;
      const failureRate = attemptedCount > 0 ? failedRequests.length / attemptedCount : 0;

      // Group by endpoint and priority
      const byEndpoint: Record<string, number> = {};
      const byPriority: Record<number, number> = {};

      for (const request of allRequests) {
        // Count by endpoint
        if (!byEndpoint[request.endpoint]) {
          byEndpoint[request.endpoint] = 0;
        }
        byEndpoint[request.endpoint]++;

        // Count by priority
        if (!byPriority[request.priority]) {
          byPriority[request.priority] = 0;
        }
        byPriority[request.priority]++;
      }

      // Update status
      this.status = {
        pending: pendingRequests.length,
        processing: processingRequests.length,
        failed: failedRequests.length,
        completed: completedRequests.length,
        total: allRequests.length,
        oldestPendingTimestamp,
        newestPendingTimestamp,
        failureRate,
        avgProcessingTime,
        byEndpoint,
        byPriority,
      };

      // Emit status update event
      this.events.emit(QueueMonitorEvent.QUEUE_STATUS_UPDATED, this.status);

      return this.status;
    } catch (error) {
      console.error('Error updating queue status:', error);
      throw error;
    }
  },

  /**
   * Check the health of the queue based on current status
   */
  async checkQueueHealth(): Promise<QueueHealthStatus> {
    const now = Date.now();
    const issues: string[] = [];

    // 1. Check for stuck requests (processing for too long)
    const processingRequests = await db.requestQueue
      .where('status')
      .equals(RequestStatus.PROCESSING)
      .toArray();

    const stuckRequests = processingRequests.filter(
      req => req.lastAttempt && now - req.lastAttempt > this._stuckRequestThresholdMs
    );

    if (stuckRequests.length > 0) {
      issues.push(`${stuckRequests.length} requests appear to be stuck in processing`);

      // Emit events for each stuck request
      for (const req of stuckRequests) {
        this.events.emit(QueueMonitorEvent.REQUEST_STUCK, req);
      }
    }

    // 2. Check for too many pending requests
    if (this.status.pending > this._maxHealthyPendingCount) {
      issues.push(`High number of pending requests: ${this.status.pending}`);
    }

    // 3. Check for too many failed requests
    if (this.status.failed > this._maxHealthyFailedCount) {
      issues.push(`High number of failed requests: ${this.status.failed}`);
    }

    // 4. Check for high failure rate
    if (this.status.failureRate > this._highFailureRateThreshold) {
      issues.push(`High failure rate: ${(this.status.failureRate * 100).toFixed(1)}%`);
      this.events.emit(QueueMonitorEvent.HIGH_FAILURE_RATE, this.status.failureRate);
    }

    // 5. Check for old pending requests
    let oldestPendingAge: number | undefined;
    if (this.status.oldestPendingTimestamp) {
      oldestPendingAge = now - this.status.oldestPendingTimestamp;
      const maxAgeMins = 30; // 30 minutes
      if (oldestPendingAge > maxAgeMins * 60 * 1000) {
        issues.push(
          `Oldest pending request is ${Math.round(oldestPendingAge / 60000)} minutes old`
        );
      }
    }

    // Update health status
    const prevHealth = { ...this.health };
    this.health = {
      isHealthy: issues.length === 0,
      issues,
      pendingCount: this.status.pending,
      failedCount: this.status.failed,
      stuckCount: stuckRequests.length,
      oldestPendingAge,
    };

    // Emit health changed event if health status changed
    if (
      prevHealth.isHealthy !== this.health.isHealthy ||
      JSON.stringify(prevHealth.issues) !== JSON.stringify(this.health.issues)
    ) {
      this.events.emit(QueueMonitorEvent.QUEUE_HEALTH_CHANGED, this.health);
    }

    return this.health;
  },

  /**
   * Get detailed information about failed requests
   */
  async getFailedRequestsDetails(): Promise<
    Array<{
      id: string;
      endpoint: string;
      attempts: number;
      errorMessage?: string;
      createdAt: number;
      age: number;
    }>
  > {
    const failedRequests = await db.requestQueue
      .where('status')
      .equals(RequestStatus.FAILED)
      .toArray();

    const now = Date.now();

    return failedRequests.map(req => ({
      id: req.id,
      endpoint: req.endpoint,
      attempts: req.attempts,
      errorMessage: req.errorMessage,
      createdAt: req.createdAt,
      age: now - req.createdAt,
    }));
  },

  /**
   * Get statistics about retry attempts and failures
   */
  async getRetryStats(): Promise<{
    avgAttemptsBeforeSuccess: number;
    avgAttemptsBeforeFailure: number;
    maxAttemptsObserved: number;
    successRateAfterRetry: number;
  }> {
    const [completed, failed] = await Promise.all([
      db.requestQueue.where('status').equals(RequestStatus.COMPLETED).toArray(),
      db.requestQueue.where('status').equals(RequestStatus.FAILED).toArray(),
    ]);

    // Filter out requests with no retries
    const completedWithRetries = completed.filter(req => req.attempts > 1);
    const failedWithRetries = failed.filter(req => req.attempts > 1);

    // Calculate statistics
    const avgAttemptsBeforeSuccess = completedWithRetries.length
      ? completedWithRetries.reduce((sum, req) => sum + req.attempts, 0) /
        completedWithRetries.length
      : 0;

    const avgAttemptsBeforeFailure = failedWithRetries.length
      ? failedWithRetries.reduce((sum, req) => sum + req.attempts, 0) / failedWithRetries.length
      : 0;

    const allAttempts = [...completed, ...failed].map(req => req.attempts);
    const maxAttemptsObserved = allAttempts.length ? Math.max(...allAttempts) : 0;

    // Requests that were retried and eventually succeeded
    const retriedRequests = [...completedWithRetries, ...failedWithRetries];
    const successRateAfterRetry = retriedRequests.length
      ? completedWithRetries.length / retriedRequests.length
      : 0;

    return {
      avgAttemptsBeforeSuccess,
      avgAttemptsBeforeFailure,
      maxAttemptsObserved,
      successRateAfterRetry,
    };
  },

  /**
   * Auto-recover stuck requests that have been in processing state too long
   *
   * @returns The number of requests recovered
   */
  async recoverStuckRequests(): Promise<number> {
    const now = Date.now();
    const processingRequests = await db.requestQueue
      .where('status')
      .equals(RequestStatus.PROCESSING)
      .toArray();

    const stuckRequests = processingRequests.filter(
      req => req.lastAttempt && now - req.lastAttempt > this._stuckRequestThresholdMs
    );

    if (stuckRequests.length === 0) return 0;

    // Mark stuck requests as pending again so they can be retried
    await db.transaction('rw', db.requestQueue, async () => {
      for (const req of stuckRequests) {
        await db.requestQueue.update(req.id, {
          status: RequestStatus.PENDING,
          retryAfter: now + 5000, // Wait 5 seconds before retrying
          errorMessage: `Auto-recovered from stuck processing state after ${Math.round(
            (now - (req.lastAttempt || 0)) / 1000
          )} seconds`,
        });
      }
    });

    return stuckRequests.length;
  },

  // Internal health thresholds
  _maxHealthyPendingCount: 100,
  _maxHealthyFailedCount: 20,
  _stuckRequestThresholdMs: 5 * 60 * 1000,
  _highFailureRateThreshold: 0.25,
};
