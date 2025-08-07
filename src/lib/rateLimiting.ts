
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

class RateLimiter {
  private storage = new Map<string, RateLimitEntry>();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
    
    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.storage.entries()) {
      if (now > entry.resetTime) {
        this.storage.delete(key);
      }
    }
  }

  private getKey(identifier: string, action?: string): string {
    return action ? `${identifier}:${action}` : identifier;
  }

  public isAllowed(identifier: string, action?: string): boolean {
    const key = this.getKey(identifier, action);
    const now = Date.now();
    const entry = this.storage.get(key);

    if (!entry || now > entry.resetTime) {
      // First request or window expired
      this.storage.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs
      });
      return true;
    }

    if (entry.count >= this.config.maxRequests) {
      return false;
    }

    entry.count++;
    return true;
  }

  public getRemainingRequests(identifier: string, action?: string): number {
    const key = this.getKey(identifier, action);
    const entry = this.storage.get(key);
    
    if (!entry || Date.now() > entry.resetTime) {
      return this.config.maxRequests;
    }
    
    return Math.max(0, this.config.maxRequests - entry.count);
  }

  public getResetTime(identifier: string, action?: string): number {
    const key = this.getKey(identifier, action);
    const entry = this.storage.get(key);
    
    if (!entry || Date.now() > entry.resetTime) {
      return Date.now() + this.config.windowMs;
    }
    
    return entry.resetTime;
  }
}

// Authentication rate limiter
export const authRateLimiter = new RateLimiter({
  windowMs: 300000, // 5 minutes
  maxRequests: 5    // 5 login attempts per 5 minutes
});

// Global rate limiter for general use
export const globalRateLimiter = new RateLimiter({
  windowMs: 60000, // 1 minute
  maxRequests: 100 // 100 requests per minute
});

// Utility functions for common rate limiting scenarios
export const rateLimitAuth = (identifier: string): boolean => {
  return authRateLimiter.isAllowed(identifier, 'auth');
};

export default {
  authRateLimiter,
  globalRateLimiter,
  rateLimitAuth
};
