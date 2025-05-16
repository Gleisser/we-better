import { queueService } from './queueService';
import { QueuedRequest } from './db';

/**
 * Queue processor handles the actual execution of queued requests.
 * It can be started/stopped and will process requests according to their priorities.
 */
export const queueProcessor = {
  isRunning: false,
  processingInterval: 2000, // Process queue every 2 seconds
  maxConcurrent: 3, // Maximum number of concurrent requests
  activeRequests: 0, // Current number of active requests
  intervalId: 0 as unknown as NodeJS.Timeout, // TypeScript type for interval ID

  /**
   * Start the queue processor
   * @param options Configuration options
   */
  start(options: { interval?: number; maxConcurrent?: number } = {}): void {
    if (this.isRunning) return;

    this.processingInterval = options.interval ?? this.processingInterval;
    this.maxConcurrent = options.maxConcurrent ?? this.maxConcurrent;
    this.isRunning = true;

    // Start processing the queue at regular intervals
    this.intervalId = setInterval(() => {
      this.processNextBatch();
    }, this.processingInterval);

    console.info('Queue processor started');
  },

  /**
   * Stop the queue processor
   */
  stop(): void {
    if (!this.isRunning) return;

    clearInterval(this.intervalId);
    this.isRunning = false;
    console.info('Queue processor stopped');
  },

  /**
   * Process the next batch of requests from the queue
   */
  async processNextBatch(): Promise<void> {
    if (!this.isRunning) return;

    // If we're already at max capacity, don't process more
    if (this.activeRequests >= this.maxConcurrent) return;

    // Calculate how many more requests we can process
    const capacity = this.maxConcurrent - this.activeRequests;

    // Get next requests to process based on available capacity
    for (let i = 0; i < capacity; i++) {
      const nextRequest = await queueService.getNextRequest();
      if (!nextRequest) break; // No more requests to process

      // Process the request without awaiting to allow parallel processing
      this.activeRequests++;
      this.processRequest(nextRequest).finally(() => {
        this.activeRequests--;
      });
    }
  },

  /**
   * Process a single request
   * @param request The request to process
   */
  async processRequest(request: QueuedRequest): Promise<void> {
    try {
      // Mark as processing
      await queueService.markAsProcessing(request.id);

      // Perform the actual API request
      await this.performApiRequest(request);

      // If successful, mark as completed
      await queueService.markAsCompleted(request.id);

      console.info(`Request ${request.id} processed successfully`);
      return;
    } catch (error) {
      // If failed, mark as failed with the error
      console.error(`Request ${request.id} failed:`, error);
      await queueService.markAsFailed(request.id, error);
    }
  },

  /**
   * Perform the actual API request
   * @param request The request to perform
   * @returns The response from the API
   */
  async performApiRequest(request: QueuedRequest): Promise<Response> {
    const { endpoint, method, body } = request;

    // Basic fetch options
    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for authentication
    };

    // Add body for POST/PUT requests
    if (body && (method === 'POST' || method === 'PUT')) {
      fetchOptions.body = JSON.stringify(body);
    }

    // Execute the API request
    const response = await fetch(endpoint, fetchOptions);

    // Handle non-2xx responses as errors
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error (${response.status}): ${errorText}`);
    }

    return response;
  },

  /**
   * Get current status of the queue processor
   */
  getStatus(): {
    isRunning: boolean;
    activeRequests: number;
    maxConcurrent: number;
    processingInterval: number;
  } {
    return {
      isRunning: this.isRunning,
      activeRequests: this.activeRequests,
      maxConcurrent: this.maxConcurrent,
      processingInterval: this.processingInterval,
    };
  },
};
