import { failure } from "./api";

export type RateLimitPolicy = {
  name: string;
  limit: number;
  windowMs: number;
};

type Bucket = { count: number; resetAt: number };

export function createFixedWindowLimiter() {
  const buckets = new Map<string, Bucket>();

  function check(key: string, policy: RateLimitPolicy, now = Date.now()) {
    const bucketKey = `${policy.name}:${key}`;
    const existing = buckets.get(bucketKey);
    if (!existing || existing.resetAt <= now) {
      const resetAt = now + policy.windowMs;
      buckets.set(bucketKey, { count: 1, resetAt });
      return { allowed: true, remaining: policy.limit - 1, retryAfterSeconds: 0 };
    }
    if (existing.count >= policy.limit) {
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
      };
    }
    existing.count += 1;
    return { allowed: true, remaining: policy.limit - existing.count, retryAfterSeconds: 0 };
  }

  return { check };
}

const globalStore = globalThis as typeof globalThis & {
  ecsRateLimiter?: ReturnType<typeof createFixedWindowLimiter>;
};
const limiter = (globalStore.ecsRateLimiter ??= createFixedWindowLimiter());

function clientKey(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "anonymous"
  );
}

export function enforceRateLimit(request: Request, policy: RateLimitPolicy) {
  const result = limiter.check(clientKey(request), policy);
  if (result.allowed) return null;
  const response = failure("RATE_LIMITED", "Too many requests. Please try again shortly.", 429);
  response.headers.set("Retry-After", String(result.retryAfterSeconds));
  response.headers.set("X-RateLimit-Limit", String(policy.limit));
  response.headers.set("X-RateLimit-Remaining", "0");
  return response;
}
