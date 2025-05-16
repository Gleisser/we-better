import { v4 as uuidv4 } from 'uuid';
import { db, QueuedRequest, RequestPriority, RequestStatus } from './db';

/**
 * Service for managing the request queue.
 * Handles adding, processing, and monitoring requests in the queue.
 */
export const queueService = {
  /**
   * Add a request to the queue
   *
   * @param endpoint API endpoint to call
   * @param method HTTP method
   * @param body Request body (for POST/PUT)
   * @param options Additional options for the request
   * @returns The ID of the queued request
   */
  async addToQueue(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    body?: Record<string, unknown>,
    options: {
      priority?: RequestPriority;
      groupId?: string;
      tags?: string[];
    } = {}
  ): Promise<string> {
    const request: QueuedRequest = {
      id: uuidv4(),
      endpoint,
      method,
      body,
      createdAt: Date.now(),
      attempts: 0,
      priority: options.priority ?? RequestPriority.MEDIUM,
      status: RequestStatus.PENDING,
      tags: options.tags || [],
      groupId: options.groupId,
    };

    await db.requestQueue.add(request);
    return request.id;
  },

  /**
   * Get the next request to process from the queue
   * Prioritizes requests by priority and then by creation time
   *
   * @returns The next request to process or null if queue is empty
   */
  async getNextRequest(): Promise<QueuedRequest | null> {
    const now = Date.now();

    // First try to get requests that are ready to retry
    const pendingRequest = await db.requestQueue
      .where('status')
      .equals(RequestStatus.PENDING)
      .filter(req => !req.retryAfter || req.retryAfter <= now)
      .sortBy('priority');

    if (pendingRequest && pendingRequest.length) {
      // Sort by priority (highest first) and then by creation time (oldest first)
      return pendingRequest.sort((a, b) => {
        if (b.priority !== a.priority) {
          return b.priority - a.priority;
        }
        return a.createdAt - b.createdAt;
      })[0];
    }

    return null;
  },

  /**
   * Mark a request as being processed
   *
   * @param requestId ID of the request
   */
  async markAsProcessing(requestId: string): Promise<void> {
    const request = await db.requestQueue.get(requestId);
    if (!request) return;

    await db.requestQueue.update(requestId, {
      status: RequestStatus.PROCESSING,
      lastAttempt: Date.now(),
      attempts: (request.attempts || 0) + 1,
    });
  },

  /**
   * Mark a request as completed and remove it from the queue
   *
   * @param requestId ID of the request
   */
  async markAsCompleted(requestId: string): Promise<void> {
    await db.requestQueue.update(requestId, {
      status: RequestStatus.COMPLETED,
    });

    // Optionally, you can choose to delete completed requests
    // await db.requestQueue.delete(requestId);
  },

  /**
   * Mark a request as failed and apply exponential backoff for retry
   *
   * @param requestId ID of the request
   * @param error Error message or object
   * @param options Additional options
   */
  async markAsFailed(
    requestId: string,
    error: unknown,
    options: { maxRetries?: number; noRetry?: boolean } = {}
  ): Promise<void> {
    const request = await db.requestQueue.get(requestId);
    if (!request) return;

    const errorMessage = error instanceof Error ? error.message : String(error);
    const maxRetries = options.maxRetries ?? 5;

    // If max retries reached or no retry requested, mark as permanently failed
    if (request.attempts >= maxRetries || options.noRetry) {
      await db.requestQueue.update(requestId, {
        status: RequestStatus.FAILED,
        errorMessage,
      });
      return;
    }

    // Apply exponential backoff: 2^attempts * 1000ms (1s, 2s, 4s, 8s, 16s)
    const backoffMs = Math.min(Math.pow(2, request.attempts) * 1000, 30000); // Max 30 seconds
    const retryAfter = Date.now() + backoffMs;

    await db.requestQueue.update(requestId, {
      status: RequestStatus.PENDING, // Reset to pending for retry
      errorMessage,
      retryAfter,
    });
  },

  /**
   * Get all requests in the queue matching the specified filters
   *
   * @param options Filter options
   * @returns Array of matching requests
   */
  async getRequests(
    options: {
      status?: RequestStatus;
      groupId?: string;
      tag?: string;
      limit?: number;
    } = {}
  ): Promise<QueuedRequest[]> {
    let collection = db.requestQueue.toCollection();

    if (options.status) {
      collection = db.requestQueue.where('status').equals(options.status);
    }

    const requests = await collection.toArray();
    let filteredRequests = [...requests];

    if (options.groupId) {
      filteredRequests = filteredRequests.filter(req => req.groupId === options.groupId);
    }

    if (options.tag) {
      filteredRequests = filteredRequests.filter(req => req.tags?.includes(options.tag as string));
    }

    return options.limit ? filteredRequests.slice(0, options.limit) : filteredRequests;
  },

  /**
   * Get count of requests in the queue by status
   *
   * @returns Object with counts by status
   */
  async getQueueStats(): Promise<Record<RequestStatus, number>> {
    const allRequests = await db.requestQueue.toArray();

    return {
      [RequestStatus.PENDING]: allRequests.filter(r => r.status === RequestStatus.PENDING).length,
      [RequestStatus.PROCESSING]: allRequests.filter(r => r.status === RequestStatus.PROCESSING)
        .length,
      [RequestStatus.FAILED]: allRequests.filter(r => r.status === RequestStatus.FAILED).length,
      [RequestStatus.COMPLETED]: allRequests.filter(r => r.status === RequestStatus.COMPLETED)
        .length,
    };
  },

  /**
   * Retry failed requests
   *
   * @param options Options for retrying
   * @returns Number of requests reset for retry
   */
  async retryFailedRequests(
    options: {
      groupId?: string;
      tag?: string;
      all?: boolean;
    } = {}
  ): Promise<number> {
    const failedRequests = await this.getRequests({
      status: RequestStatus.FAILED,
      groupId: options.groupId,
      tag: options.tag,
    });

    if (!options.all && !options.groupId && !options.tag) {
      return 0; // Don't retry all failed requests unless explicitly requested
    }

    let resetCount = 0;

    for (const request of failedRequests) {
      await db.requestQueue.update(request.id, {
        status: RequestStatus.PENDING,
        attempts: 0,
        errorMessage: undefined,
        retryAfter: undefined,
      });
      resetCount++;
    }

    return resetCount;
  },

  /**
   * Clear completed requests from the queue
   *
   * @returns Number of requests cleared
   */
  async clearCompletedRequests(): Promise<number> {
    const completedRequests = await db.requestQueue
      .where('status')
      .equals(RequestStatus.COMPLETED)
      .toArray();

    await db.requestQueue.where('status').equals(RequestStatus.COMPLETED).delete();

    return completedRequests.length;
  },
};
