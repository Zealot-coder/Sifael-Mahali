import {
  resolveSentryEnvironment,
  resolveSentryRelease,
  resolveTracesSampleRate,
  sanitizeSentryEvent
} from '@/lib/observability/sentry-utils';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
type RouterTransitionStart = (...args: unknown[]) => void;
let sentryRouterTransitionStart: RouterTransitionStart | null = null;

if (dsn) {
  void import('@sentry/nextjs').then((Sentry) => {
    Sentry.init({
      dsn,
      enabled: true,
      environment: resolveSentryEnvironment(),
      release: resolveSentryRelease(),
      tracesSampleRate: resolveTracesSampleRate(0.08),
      beforeSend(event) {
        return sanitizeSentryEvent(event);
      }
    });
    sentryRouterTransitionStart = Sentry.captureRouterTransitionStart as RouterTransitionStart;
  });
}

export const onRouterTransitionStart = (...args: unknown[]) => {
  if (sentryRouterTransitionStart) {
    sentryRouterTransitionStart(...args);
  }
};
