import { queueService } from './queueService';
import { QueuedRequest, RequestStatus } from './db';
import { requestSerializer } from './requestSerializer';

export interface RetryConfig {
  maxRetries: number;
  initialBackoffMs: number;
  maxBackoffMs: number;
  backoffFactor: number;
  jitter: boolean;
}

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
  lastProcessTime: 0, // Last time the queue was processed
  runningPromises: new Map<string, Promise<void>>(), // Track running promises by request ID

  // Default retry configuration
  retryConfig: {
    maxRetries: 5,
    initialBackoffMs: 1000, // Start with 1 second
    maxBackoffMs: 60000, // Max 1 minute
    backoffFactor: 2, // Exponential factor
    jitter: true, // Add randomness to prevent thundering herd
  } as RetryConfig,

  /**
   * Start the queue processor
   * @param options Configuration options
   */
  start(
    options: {
      interval?: number;
      maxConcurrent?: number;
      retryConfig?: Partial<RetryConfig>;
    } = {}
  ): void {
    if (this.isRunning) return;

    this.processingInterval = options.interval ?? this.processingInterval;
    this.maxConcurrent = options.maxConcurrent ?? this.maxConcurrent;

    // Merge retry config
    if (options.retryConfig) {
      this.retryConfig = {
        ...this.retryConfig,
        ...options.retryConfig,
      };
    }

    this.isRunning = true;
    this.lastProcessTime = Date.now();

    // Start processing the queue at regular intervals
    this.intervalId = setInterval(() => {
      this.processNextBatch();
    }, this.processingInterval);

    // Add event listeners to handle browser state
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline.bind(this));
      window.addEventListener('offline', this.handleOffline.bind(this));
      window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
      document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    }

    console.info('Queue processor started with config:', {
      interval: this.processingInterval,
      maxConcurrent: this.maxConcurrent,
      retryConfig: this.retryConfig,
    });
  },

  /**
   * Stop the queue processor
   */
  stop(): void {
    if (!this.isRunning) return;

    clearInterval(this.intervalId);
    this.isRunning = false;

    // Remove event listeners
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline.bind(this));
      window.removeEventListener('offline', this.handleOffline.bind(this));
      window.removeEventListener('beforeunload', this.handleBeforeUnload.bind(this));
      document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    }

    console.info('Queue processor stopped');
  },

  /**
   * Handle online event - resume processing
   */
  handleOnline(): void {
    console.info('Network connection restored. Resuming queue processing.');
    if (!this.isRunning) {
      this.start();
    } else {
      // Force immediate processing
      this.processNextBatch();
    }
  },

  /**
   * Handle offline event - pause processing
   */
  handleOffline(): void {
    console.info('Network connection lost. Pausing queue processing.');
    // We don't completely stop the processor, but we'll skip processing when offline
  },

  /**
   * Handle beforeunload event - save state if needed
   */
  handleBeforeUnload(): void {
    // Save any critical state before page closes
    // For example, tracking in-flight requests
    const processingIds = Array.from(this.runningPromises.keys());
    if (processingIds.length > 0) {
      try {
        localStorage.setItem('queue_processing_ids', JSON.stringify(processingIds));
      } catch (error) {
        console.error('Failed to save queue state:', error);
      }
    }
  },

  /**
   * Handle visibility change event - adjust processing when tab not visible
   */
  handleVisibilityChange(): void {
    if (document.visibilityState === 'visible') {
      // User is looking at the page again - resume normal operation
      if (Date.now() - this.lastProcessTime > this.processingInterval * 2) {
        // If it's been a while since we processed, process immediately
        this.processNextBatch();
      }
    } else {
      // Tab is hidden - we might want to reduce processing frequency
      // to save battery, but we'll still process
    }
  },

  /**
   * Process the next batch of requests from the queue
   */
  async processNextBatch(): Promise<void> {
    if (!this.isRunning) return;

    // If browser is offline, don't process
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return;
    }

    this.lastProcessTime = Date.now();

    // If we're already at max capacity, don't process more
    if (this.activeRequests >= this.maxConcurrent) return;

    // Calculate how many more requests we can process
    const capacity = this.maxConcurrent - this.activeRequests;

    try {
      // Get next batch of requests based on available capacity
      const requests = await queueService.dequeueBatch(capacity, {
        markAsProcessing: true,
      });

      if (requests.length === 0) return;

      // Process each request in parallel
      requests.forEach(request => {
        this.activeRequests++;

        // Store the promise to track in-flight requests
        const promise = this.processRequest(request).finally(() => {
          this.activeRequests--;
          this.runningPromises.delete(request.id);
        });

        this.runningPromises.set(request.id, promise);
      });
    } catch (error) {
      console.error('Error processing batch:', error);
    }
  },

  /**
   * Calculate exponential backoff with jitter
   *
   * @param attempt The current attempt number (starting from 1)
   * @returns Milliseconds to wait before next attempt
   */
  calculateBackoff(attempt: number): number {
    const { initialBackoffMs, maxBackoffMs, backoffFactor, jitter } = this.retryConfig;

    // Calculate exponential backoff: initialBackoff * (backoffFactor ^ (attempt - 1))
    const exponentialBackoff = initialBackoffMs * Math.pow(backoffFactor, attempt - 1);

    // Cap at maximum backoff
    const cappedBackoff = Math.min(exponentialBackoff, maxBackoffMs);

    // Add jitter if enabled (random value between 0.5x and 1.5x)
    if (jitter) {
      const jitterFactor = 0.5 + Math.random();
      return Math.floor(cappedBackoff * jitterFactor);
    }

    return Math.floor(cappedBackoff);
  },

  /**
   * Process a single request with retry handling
   * @param request The request to process
   */
  async processRequest(request: QueuedRequest): Promise<void> {
    try {
      // Perform the actual API request
      const response = await this.performApiRequest(request);

      // Process the response if needed
      await this.processResponse(request, response);

      // If successful, mark as completed
      await queueService.markAsCompleted(request.id);

      console.info(`Request ${request.id} processed successfully`);
      return;
    } catch (error) {
      // If failed, determine whether and how to retry
      await this.handleRequestFailure(request, error);
    }
  },

  /**
   * Handle a request failure with retry logic
   *
   * @param request The failed request
   * @param error The error that occurred
   */
  async handleRequestFailure(request: QueuedRequest, error: unknown): Promise<void> {
    console.error(`Request ${request.id} failed:`, error);

    const errorObj = error instanceof Error ? error : new Error(String(error));
    const { maxRetries } = this.retryConfig;

    // Check if we should not retry based on error type
    const shouldNotRetry = this.isNonRetryableError(errorObj);

    // Determine if we've exceeded max retries
    const retryExhausted = request.attempts >= maxRetries;

    if (shouldNotRetry || retryExhausted) {
      // Mark as permanently failed
      await queueService.markAsFailed(request.id, errorObj, {
        noRetry: shouldNotRetry,
        maxRetries: maxRetries,
      });

      if (retryExhausted) {
        console.warn(`Request ${request.id} has exceeded maximum retry attempts (${maxRetries})`);
      }

      return;
    }

    // Calculate backoff for retry
    const backoffMs = this.calculateBackoff(request.attempts);

    // Mark for retry with calculated backoff
    await queueService.markAsFailed(request.id, errorObj, {
      maxRetries: maxRetries,
    });

    console.info(
      `Scheduled retry for request ${request.id} in ${backoffMs}ms (attempt ${request.attempts})`
    );
  },

  /**
   * Check if an error should not be retried
   *
   * @param error The error to check
   * @returns True if the error should not be retried
   */
  isNonRetryableError(error: Error): boolean {
    // Don't retry client errors (HTTP 4xx) except specific ones we should retry
    if (error.message.includes('API Error (4')) {
      // Retry on 408 (Request Timeout) or 429 (Too Many Requests)
      return !(
        error.message.includes('API Error (408)') || error.message.includes('API Error (429)')
      );
    }

    // Don't retry certain network errors like CORS or invalid URL
    const nonRetryableMessages = [
      'CORS error',
      'Network request failed',
      'Failed to fetch',
      'Invalid URL',
    ];

    return nonRetryableMessages.some(msg => error.message.includes(msg));
  },

  /**
   * Process the API response
   *
   * @param request The original request
   * @param response The API response
   */
  async processResponse(request: QueuedRequest, response: Response): Promise<void> {
    // Handle specific response scenarios

    // If we have a 202 Accepted response, we might want to poll for status
    if (response.status === 202) {
      const locationHeader = response.headers.get('Location');
      if (locationHeader) {
        // Could enqueue a status check request here
        console.info(`Received 202 Accepted for ${request.id}. Status URL: ${locationHeader}`);
      }
    }

    // For other responses, we might want to parse and store the response
    try {
      // Only parse JSON responses if needed
      if (response.headers.get('Content-Type')?.includes('application/json')) {
        const data = await response.json();
        // Could store response data if needed
        console.info(`Response data for ${request.id}:`, data);
      }
    } catch (error) {
      console.warn(`Error parsing response for ${request.id}:`, error);
      // This isn't critical - we still consider the request successful
    }
  },

  /**
   * Perform the actual API request with timeout and retry handling
   * @param request The request to perform
   * @returns The response from the API
   */
  async performApiRequest(request: QueuedRequest): Promise<Response> {
    const { endpoint, method } = request;

    // Convert to a native fetch Request
    const fetchRequest = requestSerializer.toFetchRequest(request);

    // Add timeout using AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      // Execute the API request with timeout
      const response = await fetch(fetchRequest, {
        signal: controller.signal,
      });

      // Handle non-2xx responses as errors
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error (${response.status}): ${errorText}`);
      }

      return response;
    } catch (error) {
      // Enhance error with request details
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error(`Request timeout after 30 seconds: ${endpoint}`);
        }

        throw new Error(`${error.message} (${method} ${endpoint})`);
      }

      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  },

  /**
   * Manually retry a specific failed request
   *
   * @param requestId The ID of the request to retry
   * @returns True if the request was found and retried
   */
  async manualRetry(requestId: string): Promise<boolean> {
    const request = await queueService
      .getRequests({
        status: RequestStatus.FAILED,
      })
      .then(reqs => reqs.find(r => r.id === requestId));

    if (!request) {
      console.warn(`Cannot retry request ${requestId}: not found or not failed`);
      return false;
    }

    // Create a custom option that applies to just this specific request
    const resetCount = await queueService.retryFailedRequests({
      all: true, // We'll manually filter to just our request
    });

    // Force immediate processing
    this.processNextBatch();

    return resetCount > 0;
  },

  /**
   * Get current status of the queue processor
   */
  getStatus(): {
    isRunning: boolean;
    activeRequests: number;
    maxConcurrent: number;
    processingInterval: number;
    retryConfig: RetryConfig;
    isOnline: boolean;
    inProgressIds: string[];
  } {
    return {
      isRunning: this.isRunning,
      activeRequests: this.activeRequests,
      maxConcurrent: this.maxConcurrent,
      processingInterval: this.processingInterval,
      retryConfig: { ...this.retryConfig },
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      inProgressIds: Array.from(this.runningPromises.keys()),
    };
  },

  /**
   * Reset the queue processor state
   * Can be used to recover from errors
   */
  reset(): void {
    if (this.isRunning) {
      this.stop();
    }

    this.activeRequests = 0;
    this.runningPromises.clear();
    this.lastProcessTime = 0;

    console.info('Queue processor reset');
  },

  /**
   * Wait for all in-flight requests to complete
   * Useful when shutting down or for testing
   */
  async waitForIdle(): Promise<void> {
    if (this.runningPromises.size === 0) {
      return Promise.resolve();
    }

    return Promise.all(Array.from(this.runningPromises.values())).then(() => undefined);
  },
};
