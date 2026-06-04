// Lightweight in-memory rate limiter (per server instance). Good baseline
// protection against abuse/brute-force on public API routes. For multi-region
// scale, swap for Upstash Redis (UPSTASH_REDIS_REST_URL/TOKEN) later.

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

// Occasional cleanup so the map doesn't grow unbounded.
let lastSweep = Date.now();
function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [k, b] of buckets) if (now > b.resetAt) buckets.delete(k);
}

export function rateLimit(key: string, limit = 20, windowMs = 60_000) {
  const now = Date.now();
  sweep(now);
  const b = buckets.get(key);
  if (!b || now > b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfter: 0 };
  }
  b.count += 1;
  if (b.count > limit) {
    return { ok: false, remaining: 0, retryAfter: Math.ceil((b.resetAt - now) / 1000) };
  }
  return { ok: true, remaining: limit - b.count, retryAfter: 0 };
}

export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
