import { v4 as uuidv4 } from 'uuid';
import { queueService } from './queueService';
import { queueProcessor } from './queueProcessor';
import { RequestPriority, QueuedRequest } from './db';
import { requestSerializer } from './requestSerializer';
import { queueMonitor, QueueMonitorEvent } from './queueMonitor';

/**
 * Helper utilities for working with the request queue.
 * Simplifies common queue operations for use throughout the application.
 */
export const queueUtils = {
  /**
   * Initialize the queue system
   * This should be called during application startup
   *
   * @param options Configuration options
   */
  initialize(
    options: {
      autoStart?: boolean;
      processingInterval?: number;
      maxConcurrent?: number;
      monitoringEnabled?: boolean;
      monitorInterval?: number;
      healthCheckThresholds?: {
        maxHealthyPendingCount?: number;
        maxHealthyFailedCount?: number;
        stuckRequestThresholdMs?: number;
        highFailureRateThreshold?: number;
      };
    } = {}
  ): void {
    const {
      autoStart = true,
      processingInterval,
      maxConcurrent,
      monitoringEnabled = true,
      monitorInterval = 30000,
      healthCheckThresholds = {},
    } = options;

    // Auto-start the queue processor if requested
    if (autoStart) {
      queueProcessor.start({
        interval: processingInterval,
        maxConcurrent,
      });
    }

    // Initialize monitoring if enabled
    if (monitoringEnabled) {
      queueMonitor.initialize({
        monitorInterval,
        ...healthCheckThresholds,
      });

      // Setup monitoring event listeners
      this._setupMonitoringListeners();
    }

    console.info('Queue system initialized');
  },

  /**
   * Set up event listeners for monitoring events
   */
  _setupMonitoringListeners(): void {
    // Listen for health status changes
    queueMonitor.events.on(QueueMonitorEvent.QUEUE_HEALTH_CHANGED, health => {
      if (!health.isHealthy) {
        console.warn('Queue health issues detected:', health.issues);
      }
    });

    // Listen for stuck requests
    queueMonitor.events.on(QueueMonitorEvent.REQUEST_STUCK, request => {
      console.warn(`Request stuck in processing: ${request.id} (${request.endpoint})`);

      // Optionally auto-recover stuck requests
      this.recoverStuckRequests();
    });

    // Listen for high failure rate
    queueMonitor.events.on(QueueMonitorEvent.HIGH_FAILURE_RATE, rate => {
      console.error(`High request failure rate detected: ${(rate * 100).toFixed(1)}%`);
    });
  },

  /**
   * Get current queue status metrics
   *
   * @returns Current queue status
   */
  async getQueueStatus() {
    return queueMonitor.updateQueueStatus();
  },

  /**
   * Check queue health
   *
   * @returns Queue health status
   */
  async checkQueueHealth() {
    return queueMonitor.checkQueueHealth();
  },

  /**
   * Recover stuck requests
   *
   * @returns Number of requests recovered
   */
  async recoverStuckRequests() {
    return queueMonitor.recoverStuckRequests();
  },

  /**
   * Get detailed statistics about retry attempts
   *
   * @returns Retry statistics
   */
  async getRetryStats() {
    return queueMonitor.getRetryStats();
  },

  /**
   * Queue a GET request
   *
   * @param endpoint The API endpoint
   * @param options Request options
   * @returns The ID of the queued request
   */
  async queueGet(
    endpoint: string,
    options: {
      priority?: RequestPriority;
      groupId?: string;
      tags?: string[];
    } = {}
  ): Promise<string> {
    return queueService.addToQueue(endpoint, 'GET', undefined, options);
  },

  /**
   * Queue a POST request
   *
   * @param endpoint The API endpoint
   * @param body The request body
   * @param options Request options
   * @returns The ID of the queued request
   */
  async queuePost(
    endpoint: string,
    body: Record<string, unknown>,
    options: {
      priority?: RequestPriority;
      groupId?: string;
      tags?: string[];
    } = {}
  ): Promise<string> {
    return queueService.addToQueue(endpoint, 'POST', body, options);
  },

  /**
   * Queue a PUT request
   *
   * @param endpoint The API endpoint
   * @param body The request body
   * @param options Request options
   * @returns The ID of the queued request
   */
  async queuePut(
    endpoint: string,
    body: Record<string, unknown>,
    options: {
      priority?: RequestPriority;
      groupId?: string;
      tags?: string[];
    } = {}
  ): Promise<string> {
    return queueService.addToQueue(endpoint, 'PUT', body, options);
  },

  /**
   * Queue a DELETE request
   *
   * @param endpoint The API endpoint
   * @param options Request options
   * @returns The ID of the queued request
   */
  async queueDelete(
    endpoint: string,
    options: {
      priority?: RequestPriority;
      groupId?: string;
      tags?: string[];
    } = {}
  ): Promise<string> {
    return queueService.addToQueue(endpoint, 'DELETE', undefined, options);
  },

  /**
   * Enqueue a native fetch Request
   * Converts a fetch Request to a QueuedRequest and adds it to the queue
   *
   * @param request The fetch Request object
   * @param options Additional options
   * @returns The ID of the queued request
   */
  async enqueueFetchRequest(
    request: Request,
    options: {
      priority?: RequestPriority;
      groupId?: string;
      tags?: string[];
    } = {}
  ): Promise<string> {
    const queuedRequest = await requestSerializer.fromFetchRequest(request, options);
    return queueService.enqueue(queuedRequest);
  },

  /**
   * Enqueue a serialized request string
   *
   * @param serialized The serialized request string
   * @returns The ID of the queued request
   */
  async enqueueFromSerialized(serialized: string): Promise<string> {
    const request = requestSerializer.deserialize(serialized);
    return queueService.enqueue(request);
  },

  /**
   * Enqueue multiple serialized requests
   *
   * @param serializedRequests Array of serialized request strings
   * @returns Array of queued request IDs
   */
  async enqueueBatchFromSerialized(serializedRequests: string[]): Promise<string[]> {
    const requests = requestSerializer.deserializeBatch(serializedRequests);
    return queueService.enqueueBatch(requests);
  },

  /**
   * Dequeue a request from the queue
   *
   * @param options Options for dequeuing
   * @returns The dequeued request or null if none available
   */
  async dequeue(
    options: {
      priority?: RequestPriority;
      groupId?: string;
      tag?: string;
      markAsProcessing?: boolean;
    } = {}
  ): Promise<QueuedRequest | null> {
    return queueService.dequeue(options);
  },

  /**
   * Dequeue multiple requests from the queue
   *
   * @param count Maximum number of requests to dequeue
   * @param options Options for dequeuing
   * @returns Array of dequeued requests
   */
  async dequeueBatch(
    count: number,
    options: {
      priority?: RequestPriority;
      groupId?: string;
      tag?: string;
      markAsProcessing?: boolean;
    } = {}
  ): Promise<QueuedRequest[]> {
    return queueService.dequeueBatch(count, options);
  },

  /**
   * Serialize a queued request
   *
   * @param request The request to serialize
   * @returns Serialized request string
   */
  serializeRequest(request: QueuedRequest): string {
    return requestSerializer.serialize(request);
  },

  /**
   * Deserialize a request string
   *
   * @param serialized The serialized request string
   * @returns Deserialized request object
   */
  deserializeRequest(serialized: string): QueuedRequest {
    return requestSerializer.deserialize(serialized);
  },

  /**
   * Store a request in localStorage for later recovery
   *
   * @param key The storage key
   * @param request The request to store
   */
  storeRequestLocally(key: string, request: QueuedRequest): void {
    const serialized = requestSerializer.serializeForStorage(request);
    localStorage.setItem(key, serialized);
  },

  /**
   * Retrieve a request from localStorage
   *
   * @param key The storage key
   * @returns The retrieved request or null if not found
   */
  retrieveRequestLocally(key: string): QueuedRequest | null {
    const encoded = localStorage.getItem(key);
    if (!encoded) return null;

    try {
      return requestSerializer.deserializeFromStorage(encoded);
    } catch (error) {
      console.error('Failed to deserialize stored request:', error);
      return null;
    }
  },

  /**
   * Create a new group ID for related requests
   *
   * @returns A unique group ID
   */
  createGroupId(): string {
    return uuidv4();
  },

  /**
   * Get current queue statistics
   */
  async getQueueStats(): Promise<{
    stats: Awaited<ReturnType<typeof queueService.getQueueStats>>;
    processor: ReturnType<typeof queueProcessor.getStatus>;
  }> {
    const stats = await queueService.getQueueStats();
    const processor = queueProcessor.getStatus();

    return { stats, processor };
  },

  /**
   * Clear all completed requests
   *
   * @returns Number of requests cleared
   */
  async clearCompleted(): Promise<number> {
    return queueService.clearCompletedRequests();
  },

  /**
   * Retry all failed requests in a group
   *
   * @param groupId The group ID to retry
   * @returns Number of requests reset for retry
   */
  async retryGroup(groupId: string): Promise<number> {
    return queueService.retryFailedRequests({ groupId });
  },

  /**
   * Convert a QueuedRequest to a native fetch Request
   *
   * @param queuedRequest The QueuedRequest to convert
   * @returns A fetch Request object
   */
  toFetchRequest(queuedRequest: QueuedRequest): Request {
    return requestSerializer.toFetchRequest(queuedRequest);
  },
};
