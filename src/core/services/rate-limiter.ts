interface RateLimiterOptions {
  maxRequests: number;
  timeWindow: number; // in milliseconds
  key?: string;
}

interface RateLimiterState {
  requests: number;
  resetTime: number;
  lockedUntil?: number;
}

export class RateLimiter {
  private state: RateLimiterState;
  private storageKey: string;

  constructor(private options: RateLimiterOptions) {
    this.storageKey = `rate_limiter_${options.key || 'default'}`;
    this.state = this.loadState();
  }

  private loadState(): RateLimiterState {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      requests: 0,
      resetTime: Date.now() + this.options.timeWindow,
    };
  }

  private saveState(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.state));
  }

  async checkLimit(): Promise<boolean> {
    const now = Date.now();

    // Check if account is locked
    if (this.state.lockedUntil && now < this.state.lockedUntil) {
      return false;
    }

    // Reset counter if time window has passed
    if (now > this.state.resetTime) {
      this.state.requests = 0;
      this.state.resetTime = now + this.options.timeWindow;
      this.state.lockedUntil = undefined;
      this.saveState();
    }

    // Check if limit exceeded
    if (this.state.requests >= this.options.maxRequests) {
      // Lock for 30 minutes after too many attempts
      this.state.lockedUntil = now + 30 * 60 * 1000;
      this.saveState();
      return false;
    }

    this.state.requests++;
    this.saveState();
    return true;
  }

  getRemainingAttempts(): number {
    return Math.max(0, this.options.maxRequests - this.state.requests);
  }

  getTimeUntilReset(): number {
    const now = Date.now();
    if (this.state.lockedUntil && now < this.state.lockedUntil) {
      return this.state.lockedUntil - now;
    }
    return Math.max(0, this.state.resetTime - now);
  }

  isLocked(): boolean {
    return !!this.state.lockedUntil && Date.now() < this.state.lockedUntil;
  }

  reset(): void {
    this.state = {
      requests: 0,
      resetTime: Date.now() + this.options.timeWindow,
    };
    this.saveState();
  }
}

// Create a singleton instance for 2FA verification
export const twoFactorLimiter = new RateLimiter({
  maxRequests: 5, // 5 attempts
  timeWindow: 5 * 60 * 1000, // 5 minutes
  key: '2fa_verification',
});
