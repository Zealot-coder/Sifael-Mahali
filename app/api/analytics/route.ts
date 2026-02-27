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
      .select('event_type, page_path, created_at')
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
    const parsed = analyticsEventSchema.parse({
      ...body,
      session_id:
        typeof body.session_id === 'string'
          ? body.session_id
          : request.headers.get('x-session-id') ?? body.session_id
    });
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from('analytics_events')
      .insert(parsed)
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
