'use client';

export type AnalyticsEventType =
  | 'page_view'
  | 'project_view'
  | 'cv_download'
  | 'contact_open';

interface SessionState {
  id: string;
  ts: number;
}

interface TrackEventOptions {
  metadata?: Record<string, unknown>;
  pagePath?: string;
  referrer?: string | null;
}

const SESSION_KEY = 'sifael_portfolio_session_id';
const SESSION_TTL_MS = 1000 * 60 * 60 * 12;

function randomId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getSessionId() {
  if (typeof window === 'undefined') return null;

  try {
    const now = Date.now();
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as SessionState;
      if (parsed?.id && now - parsed.ts < SESSION_TTL_MS) {
        return parsed.id;
      }
    }

    const nextId = randomId();
    const state: SessionState = { id: nextId, ts: now };
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(state));
    return nextId;
  } catch {
    return randomId();
  }
}

function normalizePath(path: string | undefined) {
  const candidate =
    path && path.trim().length > 0
      ? path.trim()
      : typeof window !== 'undefined'
        ? window.location.pathname
        : '/';

  if (candidate.startsWith('/')) {
    return candidate.split('?')[0].split('#')[0] || '/';
  }

  try {
    const url = new URL(candidate);
    return url.pathname || '/';
  } catch {
    return '/';
  }
}

function detectDeviceType(): 'desktop' | 'mobile' | 'tablet' {
  if (typeof window === 'undefined') return 'desktop';
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

function safeMetadata(value: Record<string, unknown> | undefined) {
  if (!value) return {};
  const output: Record<string, unknown> = {};
  Object.entries(value)
    .slice(0, 12)
    .forEach(([key, item]) => {
      if (!key) return;
      if (
        item === null ||
        typeof item === 'string' ||
        typeof item === 'number' ||
        typeof item === 'boolean'
      ) {
        output[key] = item;
      }
    });
  return output;
}

function sendPayload(payload: Record<string, unknown>) {
  const body = JSON.stringify(payload);

  if (
    typeof navigator !== 'undefined' &&
    typeof navigator.sendBeacon === 'function'
  ) {
    const blob = new Blob([body], { type: 'application/json' });
    navigator.sendBeacon('/api/analytics', blob);
    return;
  }

  void fetch('/api/analytics', {
    body,
    credentials: 'omit',
    headers: { 'Content-Type': 'application/json' },
    keepalive: true,
    method: 'POST'
  });
}

export function trackEvent(eventType: AnalyticsEventType, options?: TrackEventOptions) {
  if (typeof window === 'undefined') return;

  const payload = {
    device_type: detectDeviceType(),
    event_type: eventType,
    metadata: safeMetadata(options?.metadata),
    page_path: normalizePath(options?.pagePath),
    referrer:
      options?.referrer !== undefined
        ? options.referrer
        : document.referrer || null,
    session_id: getSessionId()
  };

  sendPayload(payload);
}

