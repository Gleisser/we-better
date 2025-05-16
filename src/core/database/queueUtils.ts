import { v4 as uuidv4 } from 'uuid';
import { queueService } from './queueService';
import { queueProcessor } from './queueProcessor';
import { RequestPriority } from './db';

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
    } = {}
  ): void {
    const { autoStart = true, processingInterval, maxConcurrent } = options;

    // Auto-start the queue processor if requested
    if (autoStart) {
      queueProcessor.start({
        interval: processingInterval,
        maxConcurrent,
      });
    }

    console.info('Queue system initialized');
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
};
