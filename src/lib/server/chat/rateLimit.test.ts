import { describe, expect, it } from 'vitest';
import { createRateLimiter } from './rateLimit';

describe('createRateLimiter', () => {
  it('allows 10 checks per window, then blocks with a retry time', () => {
    let now = 0;
    const limiter = createRateLimiter({ limit: 10, windowMs: 60_000, now: () => now });

    for (let i = 0; i < 10; i++) {
      expect(limiter.check('ip')).toEqual({ allowed: true, retryAfterMs: 0 });
    }

    const blocked = limiter.check('ip');
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterMs).toBeGreaterThan(0);
  });

  it('keeps keys independent', () => {
    let now = 0;
    const limiter = createRateLimiter({ limit: 1, windowMs: 60_000, now: () => now });

    expect(limiter.check('a').allowed).toBe(true);
    expect(limiter.check('a').allowed).toBe(false);
    expect(limiter.check('b').allowed).toBe(true);
  });

  it('allows the key again once the window has passed', () => {
    let now = 0;
    const limiter = createRateLimiter({ limit: 1, windowMs: 60_000, now: () => now });

    expect(limiter.check('ip').allowed).toBe(true);
    expect(limiter.check('ip').allowed).toBe(false);

    now += 60_001;
    expect(limiter.check('ip').allowed).toBe(true);
  });
});
