/**
 * Hybrid Distributed & In-Memory Rate Limiter
 * Supports Upstash Redis REST API in serverless cloud environments (Vercel/AWS)
 * with automatic fallback to high-performance in-memory sliding window for local dev.
 */

interface RateLimitRecord {
  count: number;
  firstAttempt: number;
  lockedUntil: number | null;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Cleanup stale local records every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    rateLimitStore.forEach((record, key) => {
      if (record.lockedUntil && record.lockedUntil > now) return;
      if (now - record.firstAttempt > 60 * 60 * 1000) {
        rateLimitStore.delete(key);
      }
    });
  }, 10 * 60 * 1000);
}

export interface RateLimitOptions {
  maxAttempts: number; // e.g. 5 attempts
  windowMs: number;    // e.g. 15 minutes (15 * 60 * 1000)
  lockoutMs?: number;  // e.g. 15 minutes lockout on violation
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  lockedUntil?: number | null;
  retryAfterSeconds?: number;
}

/**
 * Synchronous local sliding-window rate limit checker
 */
export function checkRateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  // 1. Check if currently locked out
  if (record?.lockedUntil && record.lockedUntil > now) {
    const retryAfterSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      lockedUntil: record.lockedUntil,
      retryAfterSeconds,
    };
  }

  // 2. No record exists or window expired
  if (!record || now - record.firstAttempt > options.windowMs) {
    rateLimitStore.set(key, {
      count: 1,
      firstAttempt: now,
      lockedUntil: null,
    });
    return {
      allowed: true,
      remaining: options.maxAttempts - 1,
      lockedUntil: null,
    };
  }

  // 3. Increment attempts
  record.count += 1;

  if (record.count > options.maxAttempts) {
    const lockout = options.lockoutMs || options.windowMs;
    record.lockedUntil = now + lockout;
    const retryAfterSeconds = Math.ceil(lockout / 1000);
    return {
      allowed: false,
      remaining: 0,
      lockedUntil: record.lockedUntil,
      retryAfterSeconds,
    };
  }

  return {
    allowed: true,
    remaining: options.maxAttempts - record.count,
    lockedUntil: null,
  };
}

/**
 * Asynchronous cloud rate limiter (connects to Upstash Redis if configured in .env)
 */
export async function checkRateLimitAsync(key: string, options: RateLimitOptions): Promise<RateLimitResult> {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (redisUrl && redisToken) {
    try {
      const windowSec = Math.ceil(options.windowMs / 1000);
      const res = await fetch(`${redisUrl}/pipeline`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${redisToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([
          ['INCR', `ratelimit:${key}`],
          ['EXPIRE', `ratelimit:${key}`, windowSec],
        ]),
      });

      if (res.ok) {
        const data = await res.json();
        const count = data[0]?.result || 1;

        if (count > options.maxAttempts) {
          return {
            allowed: false,
            remaining: 0,
            retryAfterSeconds: windowSec,
          };
        }

        return {
          allowed: true,
          remaining: Math.max(0, options.maxAttempts - count),
        };
      }
    } catch (err) {
      console.warn('Redis rate limit query failed, falling back to in-memory limiter:', err);
    }
  }

  return checkRateLimit(key, options);
}

export function resetRateLimit(key: string) {
  rateLimitStore.delete(key);
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return '127.0.0.1';
}
