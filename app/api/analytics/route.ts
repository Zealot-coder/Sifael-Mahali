import { type NextRequest } from 'next/server';
import { z } from 'zod';
import {
  apiError,
  apiSuccess,
  normalizeError,
  readJsonBody,
  requireOwner,
  statusFromErrorCode
} from '@/lib/api';
import { applyRateLimit, buildRateLimitKey, getRequestIp, RATE_LIMIT_RULES } from '@/lib/api/rate-limit';
import { createSupabaseServerClient, createSupabaseServiceRoleClient } from '@/lib/supabase/server';
import { analyticsEventSchema } from '@/lib/validations';

export const runtime = 'nodejs';

const analyticsQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).default(30),
  eventType: z.enum(['page_view', 'project_view', 'cv_download', 'contact_open']).optional()
});

interface EventAggregate {
  count: number;
  key: string;
}

const piiKeyRegex = /(email|phone|name|address|ip|contact)/i;
const emailPattern = /[^\s@]+@[^\s@]+\.[^\s@]+/;

function aggregateCounts(values: string[]) {
  const map = new Map<string, number>();
  for (const value of values) {
    map.set(value, (map.get(value) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count);
}

function toIsoDate(iso: string) {
  return new Date(iso).toISOString().slice(0, 10);
}

function sanitizePagePath(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '/';
  if (trimmed.startsWith('/')) {
    return trimmed.split('?')[0].split('#')[0].slice(0, 500) || '/';
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.pathname.slice(0, 500) || '/';
  } catch {
    return '/';
  }
}

function sanitizeReferrer(value: string | null | undefined) {
  if (!value) return null;
  try {
    const parsed = new URL(value);
    return `${parsed.origin}${parsed.pathname}`.slice(0, 2048);
  } catch {
    return null;
  }
}

function sanitizeCountryCode(value: string | null | undefined) {
  if (!value) return null;
  const code = value.trim().toUpperCase();
  return /^[A-Z]{2}$/.test(code) ? code : null;
}

function sanitizeSessionId(value: string | null | undefined) {
  if (!value) return null;
  const sessionId = value.trim().slice(0, 120);
  return /^[a-zA-Z0-9_-]{4,120}$/.test(sessionId) ? sessionId : null;
}

function resolveDeviceType(
  value: 'desktop' | 'mobile' | 'tablet' | null | undefined,
  userAgent: string | null
) {
  if (value === 'desktop' || value === 'mobile' || value === 'tablet') return value;
  const ua = (userAgent ?? '').toLowerCase();
  if (ua.includes('mobile')) return 'mobile';
  if (ua.includes('tablet') || ua.includes('ipad')) return 'tablet';
  return 'desktop';
}

function sanitizeMetadata(
  metadata: Record<string, unknown>
): Record<string, string | number | boolean | null> {
  const output: Record<string, string | number | boolean | null> = {};
  let count = 0;

  for (const [rawKey, rawValue] of Object.entries(metadata)) {
    if (count >= 12) break;
    const key = rawKey.trim().slice(0, 60);
    if (!key || piiKeyRegex.test(key)) continue;

    if (
      rawValue === null ||
      typeof rawValue === 'number' ||
      typeof rawValue === 'boolean'
    ) {
      output[key] = rawValue;
      count += 1;
      continue;
    }

    if (typeof rawValue === 'string') {
      const value = rawValue.trim().slice(0, 180);
      if (!value || emailPattern.test(value)) continue;
      output[key] = value;
      count += 1;
    }
  }

  return output;
}

export async function GET(request: NextRequest) {
  const owner = await requireOwner();
  if (owner.errorResponse) return owner.errorResponse;

  try {
    const searchParams = request.nextUrl.searchParams;
    const { days, eventType } = analyticsQuerySchema.parse({
      days: searchParams.get('days') ?? undefined,
      eventType: searchParams.get('eventType') ?? undefined
    });

    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const supabase = createSupabaseServiceRoleClient();
    let query = supabase
      .from('analytics_events')
      .select('event_type, page_path, created_at, session_id')
      .gte('created_at', since);

    if (eventType) {
      query = query.eq('event_type', eventType);
    }

    const { data, error } = await query;
    if (error) throw error;

    const rows = data ?? [];
    const eventTypes = aggregateCounts(rows.map((item) => item.event_type));
    const pages = aggregateCounts(rows.map((item) => item.page_path)).slice(0, 10);
    const daily = aggregateCounts(rows.map((item) => toIsoDate(item.created_at))).sort((a, b) =>
      a.key.localeCompare(b.key)
    );
    const uniqueSessions = new Set(
      rows
        .map((item) => item.session_id)
        .filter((item): item is string => typeof item === 'string' && item.length > 0)
    ).size;

    const byType = eventTypes.reduce<Record<string, number>>((acc, item) => {
      acc[item.key] = item.count;
      return acc;
    }, {});

    return apiSuccess({
      days,
      series: {
        byDay: daily as EventAggregate[],
        byType: eventTypes as EventAggregate[],
        topPages: pages as EventAggregate[]
      },
      totals: {
        events: rows.length,
        uniqueSessions,
        byType
      }
    });
  } catch (error) {
    const normalized = normalizeError(error);
    return apiError(
      statusFromErrorCode(normalized.code),
      normalized.code,
      normalized.message,
      normalized.details
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await readJsonBody(request);
    const sessionFromBody =
      typeof body.session_id === 'string' ? body.session_id : request.headers.get('x-session-id');
    const rateLimitKey = buildRateLimitKey(RATE_LIMIT_RULES.analytics.keyPrefix, [
      sessionFromBody,
      getRequestIp(request)
    ]);
    const limitResult = applyRateLimit(RATE_LIMIT_RULES.analytics, rateLimitKey);
    if (!limitResult.allowed) {
      return apiError(
        429,
        'RATE_LIMITED',
        'Analytics rate limit exceeded. Please retry shortly.',
        {
          retryAfterSeconds: limitResult.retryAfterSeconds
        }
      );
    }

    const parsed = analyticsEventSchema.parse({
      ...body,
      session_id:
        typeof body.session_id === 'string'
          ? body.session_id
          : request.headers.get('x-session-id') ?? body.session_id
    });
    const sanitizedPayload = {
      country_code: sanitizeCountryCode(parsed.country_code),
      device_type: resolveDeviceType(parsed.device_type, request.headers.get('user-agent')),
      event_type: parsed.event_type,
      metadata: sanitizeMetadata(parsed.metadata),
      page_path: sanitizePagePath(parsed.page_path),
      referrer: sanitizeReferrer(parsed.referrer),
      session_id: sanitizeSessionId(parsed.session_id)
    };

    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from('analytics_events')
      .insert(sanitizedPayload)
      .select('id, created_at')
      .single();

    if (error) throw error;
    return apiSuccess(data, { accepted: true });
  } catch (error) {
    const normalized = normalizeError(error);
    return apiError(
      statusFromErrorCode(normalized.code),
      normalized.code,
      normalized.message,
      normalized.details
    );
  }
}
