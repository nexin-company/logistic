/**
 * Rate Limiting in-memory
 * 
 * NOTA: Esta implementación funciona bien para:
 * - Desarrollo
 * - Producción con una sola instancia
 * 
 * Para producción con múltiples instancias, considerar usar:
 * - @upstash/ratelimit (Redis-based)
 * - Vercel Edge Config
 * - Otra solución distribuida
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

function cleanupExpiredEntries() {
  const now = Date.now();
  rateLimitStore.forEach((entry, key) => {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  });
}

if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredEntries, 5 * 60 * 1000);
}

export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions
): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || entry.resetAt < now) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetAt: now + options.windowMs,
    };
    rateLimitStore.set(identifier, newEntry);
    return {
      success: true,
      limit: options.maxRequests,
      remaining: options.maxRequests - 1,
      reset: newEntry.resetAt,
    };
  }

  if (entry.count >= options.maxRequests) {
    return {
      success: false,
      limit: options.maxRequests,
      remaining: 0,
      reset: entry.resetAt,
    };
  }

  entry.count++;
  rateLimitStore.set(identifier, entry);

  return {
    success: true,
    limit: options.maxRequests,
    remaining: options.maxRequests - entry.count,
    reset: entry.resetAt,
  };
}

export const rateLimit = {
  get: (identifier: string) =>
    checkRateLimit(identifier, {
      windowMs: 60 * 1000,
      maxRequests: 100,
    }),

  mutation: (identifier: string) =>
    checkRateLimit(identifier, {
      windowMs: 60 * 1000,
      maxRequests: 20,
    }),
};

