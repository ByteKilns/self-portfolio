export function createRateLimiter(opts: { limit: number; windowMs: number; now?: () => number }): {
  check(key: string): { allowed: boolean; retryAfterMs: number };
} {
  const now = opts.now ?? Date.now;
  const hits = new Map<string, number[]>();

  return {
    check(key: string) {
      const at = now();
      const cutoff = at - opts.windowMs;
      const timestamps = (hits.get(key) ?? []).filter((timestamp) => timestamp > cutoff);

      if (timestamps.length >= opts.limit) {
        hits.set(key, timestamps);
        const oldest = timestamps[0];
        return { allowed: false, retryAfterMs: Math.max(1, oldest + opts.windowMs - at) };
      }

      timestamps.push(at);
      hits.set(key, timestamps);
      return { allowed: true, retryAfterMs: 0 };
    }
  };
}
