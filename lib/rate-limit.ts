// Fixed-window in-memory rate limiter — used by admin login. No
// rate-limiting library/Redis layer exists in this app (only MySQL via
// Prisma), so an in-memory Map is the simplest thing that works. Known
// tradeoff: counters reset on server restart and aren't shared across
// instances if this ever runs on more than one.
type Bucket = { count: number; resetAt: number };

// Cached on globalThis, same reasoning as lib/db.ts's Prisma singleton — so
// `next dev`'s hot reload doesn't spin up a duplicate sweep interval on
// every file save.
const globalForRateLimit = globalThis as unknown as {
  rateLimitBuckets?: Map<string, Bucket>;
  rateLimitSweepStarted?: boolean;
};

const buckets = globalForRateLimit.rateLimitBuckets ?? new Map<string, Bucket>();
globalForRateLimit.rateLimitBuckets = buckets;

const SWEEP_INTERVAL_MS = 10 * 60 * 1000;

if (!globalForRateLimit.rateLimitSweepStarted) {
  globalForRateLimit.rateLimitSweepStarted = true;
  setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(key);
    }
  }, SWEEP_INTERVAL_MS).unref();
}

export type RateLimitResult = { allowed: true } | { allowed: false; retryAfterSeconds: number };

export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (bucket.count >= limit) {
    return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) };
  }

  bucket.count += 1;
  return { allowed: true };
}
