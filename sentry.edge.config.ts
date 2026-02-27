import * as Sentry from '@sentry/nextjs';
import {
  resolveSentryEnvironment,
  resolveSentryRelease,
  resolveTracesSampleRate,
  sanitizeSentryEvent
} from '@/lib/observability/sentry-utils';

const dsn = process.env.SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  environment: resolveSentryEnvironment(),
  release: resolveSentryRelease(),
  tracesSampleRate: resolveTracesSampleRate(0.05),
  beforeSend(event) {
    return sanitizeSentryEvent(event);
  }
});
