
import config from '@/config/environment';

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

// Global rate limiter instance
export const globalRateLimiter = new RateLimiter({
  windowMs: config.security.rateLimitWindow,
  maxRequests: config.security.rateLimitMax
});

// API-specific rate limiter
export const apiRateLimiter = new RateLimiter({
  windowMs: 60000, // 1 minute
  maxRequests: 60   // 60 requests per minute
});

// Authentication rate limiter
export const authRateLimiter = new RateLimiter({
  windowMs: 300000, // 5 minutes
  maxRequests: 5    // 5 login attempts per 5 minutes
});

// Rate limiting middleware function
export const withRateLimit = <T extends any[], R>(
  fn: (...args: T) => R,
  rateLimiter: RateLimiter,
  identifier: string,
  action?: string
) => {
  return (...args: T): R => {
    if (!rateLimiter.isAllowed(identifier, action)) {
      const resetTime = rateLimiter.getResetTime(identifier, action);
      const waitTime = Math.ceil((resetTime - Date.now()) / 1000);
      
      throw new Error(`Rate limit exceeded. Try again in ${waitTime} seconds.`);
    }
    
    return fn(...args);
  };
};

// Utility functions for common rate limiting scenarios
export const rateLimitByUser = (userId: string, action?: string): boolean => {
  return globalRateLimiter.isAllowed(userId, action);
};

export const rateLimitByIP = (ipAddress: string, action?: string): boolean => {
  return globalRateLimiter.isAllowed(ipAddress, action);
};

export const rateLimitAuth = (identifier: string): boolean => {
  return authRateLimiter.isAllowed(identifier, 'auth');
};

export default {
  globalRateLimiter,
  apiRateLimiter,
  authRateLimiter,
  withRateLimit,
  rateLimitByUser,
  rateLimitByIP,
  rateLimitAuth
};
