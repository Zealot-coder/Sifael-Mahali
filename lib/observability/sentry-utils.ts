type UnknownRecord = Record<string, unknown>;

const sensitiveKeyPattern =
  /(authorization|cookie|token|secret|password|api[-_]?key|service[-_]?role|session|credential)/i;

function sanitizeRecord(value: unknown, depth = 0): unknown {
  if (depth > 3) return undefined;

  if (Array.isArray(value)) {
    return value.slice(0, 40).map((item) => sanitizeRecord(item, depth + 1));
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  const record = value as UnknownRecord;
  const output: UnknownRecord = {};

  for (const [key, item] of Object.entries(record)) {
    if (sensitiveKeyPattern.test(key)) {
      output[key] = '[redacted]';
      continue;
    }
    output[key] = sanitizeRecord(item, depth + 1);
  }

  return output;
}

export function sanitizeSentryEvent<T>(event: T): T {
  if (!event || typeof event !== 'object') return event;

  const mutable = event as UnknownRecord;
  const request = mutable.request as UnknownRecord | undefined;
  if (request && typeof request === 'object') {
    if ('cookies' in request) {
      request.cookies = '[redacted]';
    }
    if ('headers' in request) {
      request.headers = sanitizeRecord(request.headers);
    }
    if ('data' in request) {
      request.data = sanitizeRecord(request.data);
    }
  }

  const user = mutable.user as UnknownRecord | undefined;
  if (user && typeof user === 'object') {
    if ('email' in user) user.email = '[redacted]';
    if ('ip_address' in user) user.ip_address = undefined;
  }

  if ('extra' in mutable) {
    mutable.extra = sanitizeRecord(mutable.extra);
  }

  if ('contexts' in mutable) {
    mutable.contexts = sanitizeRecord(mutable.contexts);
  }

  return event;
}

export function resolveSentryEnvironment() {
  return (
    process.env.SENTRY_ENVIRONMENT ??
    process.env.VERCEL_ENV ??
    process.env.NODE_ENV ??
    'development'
  );
}

export function resolveSentryRelease() {
  return process.env.SENTRY_RELEASE ?? process.env.VERCEL_GIT_COMMIT_SHA;
}

export function resolveTracesSampleRate(defaultRate: number) {
  const rawValue = process.env.SENTRY_TRACES_SAMPLE_RATE;
  if (!rawValue) return defaultRate;

  const value = Number(rawValue);
  if (!Number.isFinite(value)) return defaultRate;
  if (value < 0 || value > 1) return defaultRate;
  return value;
}
