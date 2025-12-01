/**
 * Rate limiting utilities using Upstash Redis
 * Falls back to in-memory rate limiting for development
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// In-memory cache for development when Upstash is not configured
class MemoryCache {
  private cache = new Map<string, { count: number; reset: number }>();

  async limit(identifier: string, limit: number, window: number) {
    const now = Date.now();
    const key = identifier;
    const record = this.cache.get(key);

    if (!record || now > record.reset) {
      this.cache.set(key, { count: 1, reset: now + window });
      return {
        success: true,
        limit,
        remaining: limit - 1,
        reset: new Date(now + window),
        pending: Promise.resolve(),
      };
    }

    if (record.count >= limit) {
      return {
        success: false,
        limit,
        remaining: 0,
        reset: new Date(record.reset),
        pending: Promise.resolve(),
      };
    }

    record.count++;
    return {
      success: true,
      limit,
      remaining: limit - record.count,
      reset: new Date(record.reset),
      pending: Promise.resolve(),
    };
  }

  // Cleanup old entries periodically
  cleanup() {
    const now = Date.now();
    for (const [key, record] of this.cache.entries()) {
      if (now > record.reset) {
        this.cache.delete(key);
      }
    }
  }
}

// Create rate limiter instance
function createRateLimiter(requests: number, window: string) {
  // Check if Upstash is configured
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(requests, window),
      analytics: true,
      prefix: '@ratlist/ratelimit',
    });
  }

  // Fallback to in-memory for development
  console.warn('Upstash Redis not configured, using in-memory rate limiting');
  const cache = new MemoryCache();
  
  // Cleanup every 60 seconds
  setInterval(() => cache.cleanup(), 60000);

  const windowMs = window.endsWith('s')
    ? parseInt(window) * 1000
    : window.endsWith('m')
    ? parseInt(window) * 60000
    : window.endsWith('h')
    ? parseInt(window) * 3600000
    : parseInt(window) * 1000;

  return {
    limit: (identifier: string) => cache.limit(identifier, requests, windowMs),
  };
}

/**
 * Rate limiters for different endpoint types
 */

// Public endpoints - strict limits
export const publicRateLimiter = createRateLimiter(10, '10 s');

// Search endpoints - moderate limits
export const searchRateLimiter = createRateLimiter(20, '1 m');

// Authenticated endpoints - generous limits
export const authenticatedRateLimiter = createRateLimiter(100, '1 m');

// Mutation endpoints - strict limits to prevent abuse
export const mutationRateLimiter = createRateLimiter(10, '1 m');

// Admin endpoints - very generous limits
export const adminRateLimiter = createRateLimiter(1000, '1 m');

/**
 * Apply rate limiting to a request
 * @param request - Next.js request object
 * @param limiter - Rate limiter instance to use
 * @returns true if request is allowed, false if rate limited
 */
export async function rateLimit(request: Request, limiter: typeof publicRateLimiter) {
  // Get identifier from IP or user ID
  const ip = request.headers.get('x-forwarded-for') ?? 
             request.headers.get('x-real-ip') ?? 
             '127.0.0.1';
  
  const { success } = await limiter.limit(ip);
  return success;
}

/**
 * Create a rate-limited Response
 */
export function rateLimitedResponse() {
  return new Response(
    JSON.stringify({ 
      error: 'Too Many Requests',
      message: 'You have exceeded the rate limit. Please try again later.' 
    }),
    { 
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': '60',
      },
    }
  );
}

// Legacy functions for backward compatibility
const userCooldowns = new Map<string, number>();
const userDailyCounts = new Map<string, { date: string; count: number }>();

export function checkRateLimit(userId: string): { ok: boolean; reason?: string } {
  const now = Date.now();
  const today = new Date().toISOString().split('T')[0];

  // Check cooldown (30 seconds)
  const lastSubmit = userCooldowns.get(userId);
  if (lastSubmit && now - lastSubmit < 30_000) {
    return { ok: false, reason: 'Please wait 30 seconds between submissions' };
  }

  // Check daily limit (10 per day)
  const dailyRecord = userDailyCounts.get(userId);
  if (dailyRecord?.date === today && dailyRecord.count >= 10) {
    return { ok: false, reason: 'Daily submission limit reached (10/day)' };
  }

  return { ok: true };
}

export function recordSubmission(userId: string) {
  const now = Date.now();
  const today = new Date().toISOString().split('T')[0];

  userCooldowns.set(userId, now);

  const dailyRecord = userDailyCounts.get(userId);
  if (dailyRecord?.date === today) {
    dailyRecord.count++;
  } else {
    userDailyCounts.set(userId, { date: today, count: 1 });
  }
}
