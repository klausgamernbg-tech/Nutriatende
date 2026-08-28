// ============================================================
// Nutri Atende — Rate Limiter
// Simple in-memory rate limiter for API routes
// ============================================================

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export function createRateLimiter(
  maxRequests: number,
  windowMs: number
) {
  return function rateLimiter(key: string): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now();
    const entry = rateLimitStore.get(key);

    if (!entry || now > entry.resetAt) {
      // First request or window expired
      rateLimitStore.set(key, {
        count: 1,
        resetAt: now + windowMs,
      });
      return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
    }

    if (entry.count >= maxRequests) {
      return { allowed: false, remaining: 0, resetAt: entry.resetAt };
    }

    entry.count++;
    return { allowed: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt };
  };
}

// Pre-configured limiters
export const authLimiter = createRateLimiter(5, 15 * 60 * 1000); // 5 requests per 15 minutes
export const apiLimiter = createRateLimiter(100, 60 * 1000); // 100 requests per minute
export const strictLimiter = createRateLimiter(10, 60 * 1000); // 10 requests per minute

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000); // Clean every 5 minutes