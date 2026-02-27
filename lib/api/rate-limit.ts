import type { NextRequest } from 'next/server';

interface RateLimitRule {
  keyPrefix: string;
  limit: number;
  windowMs: number;
}

interface Bucket {
  count: number;
  resetAt: number;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
}

const buckets = new Map<string, Bucket>();
let lastSweepAt = 0;

function sweepExpiredBuckets(now: number) {
  if (now - lastSweepAt < 60_000) return;
  lastSweepAt = now;

  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

export function getRequestIp(request: NextRequest) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() ?? 'unknown';
  }
  return request.headers.get('x-real-ip')?.trim() || 'unknown';
}

export function buildRateLimitKey(prefix: string, parts: Array<string | null | undefined>) {
  const normalized = parts
    .map((part) => (part ?? '').trim())
    .filter(Boolean)
    .map((part) => part.toLowerCase().slice(0, 120));

  if (normalized.length === 0) {
    return `${prefix}:anon`;
  }

  return `${prefix}:${normalized.join(':')}`;
}

export function applyRateLimit(rule: RateLimitRule, key: string): RateLimitResult {
  const now = Date.now();
  sweepExpiredBuckets(now);

  let bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    bucket = {
      count: 0,
      resetAt: now + rule.windowMs
    };
  }

  bucket.count += 1;
  buckets.set(key, bucket);

  const allowed = bucket.count <= rule.limit;
  const remaining = Math.max(0, rule.limit - bucket.count);
  const retryAfterSeconds = allowed ? 0 : Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));

  return {
    allowed,
    limit: rule.limit,
    remaining,
    resetAt: bucket.resetAt,
    retryAfterSeconds
  };
}

export const RATE_LIMIT_RULES = {
  analytics: {
    keyPrefix: 'analytics',
    limit: 180,
    windowMs: 60_000
  },
  contact: {
    keyPrefix: 'contact',
    limit: 4,
    windowMs: 10 * 60_000
  }
} as const;
