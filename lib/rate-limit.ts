import { headers } from "next/headers";

type Bucket = { count: number; resetAt: number };

// In-memory, per-server-instance rate limiting. Fine for a single dev/small
// deployment; if this ever runs across multiple instances (serverless,
// multi-replica), move this to a shared store (e.g. Upstash Redis) instead —
// each instance would otherwise track its own counts independently.
const buckets = new Map<string, Bucket>();

/** Occasionally sweep expired entries so the map doesn't grow unbounded. */
function sweep(now: number) {
  if (buckets.size < 500) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export type RateLimitResult = { ok: true } | { ok: false; retryAfterSeconds: number };

export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (bucket.count >= limit) {
    return { ok: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { ok: true };
}

/** Best-effort client IP from standard proxy headers — falls back to a shared
 * bucket if none are present (still rate-limits everyone behind that proxy
 * together, which is better than no limit at all). */
export async function getClientIp(): Promise<string> {
  const store = await headers();
  const forwardedFor = store.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return store.get("x-real-ip") ?? "unknown";
}
