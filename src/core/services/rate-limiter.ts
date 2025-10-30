interface RateLimiterOptions {
  maxRequests: number;
  timeWindow: number;
  retryAfter?: number;
}

export class RateLimiter {
  private requests: number = 0;
  private resetTime: number;
  private pendingReset: Promise<void> | null = null;

  constructor(private options: RateLimiterOptions) {
    this.resetTime = Date.now() + options.timeWindow;
  }

  async checkLimit(): Promise<boolean> {
    while (true) {
      const now = Date.now();

      if (now >= this.resetTime) {
        this.requests = 0;
        this.resetTime = now + this.options.timeWindow;
      }

      if (this.requests < this.options.maxRequests) {
        this.requests += 1;
        return true;
      }

      const waitDuration = Math.max(this.resetTime - now, this.options.retryAfter ?? 0);

      if (!this.pendingReset) {
        // Reuse a single timer so concurrent callers wait on the same reset cycle.
        this.pendingReset = new Promise(resolve => {
          setTimeout(() => {
            this.requests = 0;
            this.resetTime = Date.now() + this.options.timeWindow;
            this.pendingReset = null;
            resolve();
          }, waitDuration);
        });
      }

      await this.pendingReset;
    }
  }
}
