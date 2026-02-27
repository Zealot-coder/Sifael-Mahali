import { type NextRequest } from 'next/server';
import { z } from 'zod';
import {
  apiError,
  apiSuccess,
  buildPaginationMeta,
  normalizeError,
  parsePagination,
  rangeFromPagination,
  readJsonBody,
  requireOwner,
  statusFromErrorCode
} from '@/lib/api';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { deleteByIdSchema, deleteByKeySchema, settingUpsertSchema } from '@/lib/validations';

export const runtime = 'nodejs';

const settingsQuerySchema = z.object({
  key: z.string().min(1).max(120).optional(),
  search: z.string().min(1).max(120).optional()
});

function sanitizeForIlike(value: string) {
  return value.replace(/[%_]/g, '').trim();
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filters = settingsQuerySchema.parse({
      key: searchParams.get('key') ?? undefined,
      search: searchParams.get('search') ?? undefined
    });
    const supabase = createSupabaseServerClient();

    if (filters.key) {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', filters.key)
        .maybeSingle();
      if (error) throw error;
      return apiSuccess(data ?? null);
    }

    const { page, pageSize } = parsePagination(searchParams);
    const { from, to } = rangeFromPagination(page, pageSize);
    let query = supabase
      .from('site_settings')
      .select('*', { count: 'exact' })
      .order('key', { ascending: true });

    if (filters.search) {
      const term = sanitizeForIlike(filters.search);
      query = query.or(`key.ilike.%${term}%,description.ilike.%${term}%`);
    }

    const { data, count, error } = await query.range(from, to);
    if (error) throw error;

    return apiSuccess(data ?? [], {
      pagination: buildPaginationMeta(page, pageSize, count)
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

async function upsertSetting(request: NextRequest) {
  const owner = await requireOwner();
  if (owner.errorResponse) return owner.errorResponse;

  try {
    const payload = settingUpsertSchema.parse(await readJsonBody(request));
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from('site_settings')
      .upsert(payload, { onConflict: 'key' })
      .select('*')
      .single();

    if (error) throw error;
    return apiSuccess(data);
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
  return upsertSetting(request);
}

export async function PATCH(request: NextRequest) {
  return upsertSetting(request);
}

export async function DELETE(request: NextRequest) {
  const owner = await requireOwner();
  if (owner.errorResponse) return owner.errorResponse;

  try {
    const queryKey = request.nextUrl.searchParams.get('key');
    const queryId = request.nextUrl.searchParams.get('id');
    const body = queryKey
      ? { key: queryKey }
      : queryId
        ? { id: queryId }
        : await readJsonBody(request);
    const keyCandidate = typeof body.key === 'string' ? deleteByKeySchema.parse(body) : null;
    const idCandidate = keyCandidate ? null : deleteByIdSchema.parse(body);
    const supabase = createSupabaseServerClient();

    const deleteQuery = supabase.from('site_settings').delete();
    const { error } = keyCandidate
      ? await deleteQuery.eq('key', keyCandidate.key)
      : await deleteQuery.eq('id', idCandidate?.id ?? '');

    if (error) throw error;
    return apiSuccess({
      deleted: true,
      ...(keyCandidate ? { key: keyCandidate.key } : { id: idCandidate?.id })
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
