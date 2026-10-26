import { describe, expect, it } from "vitest";
import { createFixedWindowLimiter, type RateLimitPolicy } from "./security";

const policy: RateLimitPolicy = { name: "test", limit: 2, windowMs: 60_000 };

describe("fixed window rate limiter", () => {
  it("limits only the configured key within a window", () => {
    const limiter = createFixedWindowLimiter();
    expect(limiter.check("first", policy, 1_000).allowed).toBe(true);
    expect(limiter.check("first", policy, 1_001).allowed).toBe(true);
    expect(limiter.check("first", policy, 1_002).allowed).toBe(false);
    expect(limiter.check("other", policy, 1_002).allowed).toBe(true);
  });

  it("resets a key after the policy window", () => {
    const limiter = createFixedWindowLimiter();
    limiter.check("first", policy, 1_000);
    limiter.check("first", policy, 1_001);
    expect(limiter.check("first", policy, 61_000).allowed).toBe(true);
  });
});
