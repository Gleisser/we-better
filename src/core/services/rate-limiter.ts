interface RateLimiterOptions {
  maxRequests: number;
  timeWindow: number;
  retryAfter?: number;
}

export class RateLimiter {
  private requests: number = 0;
  private resetTime: number;

  constructor(private options: RateLimiterOptions) {
    this.resetTime = Date.now() + options.timeWindow;
  }

  async checkLimit(): Promise<boolean> {
    const now = Date.now();
    if (now > this.resetTime) {
      this.requests = 0;
      this.resetTime = now + this.options.timeWindow;
    }

    if (this.requests >= this.options.maxRequests) {
      return false;
    }

    this.requests++;
    return true;
  }
} 