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
import {
  deleteByIdSchema,
  testimonialCreateSchema,
  testimonialUpdateSchema
} from '@/lib/validations';

export const runtime = 'nodejs';

const testimonialsQuerySchema = z.object({
  isFeatured: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => value === 'true'),
  search: z.string().min(1).max(120).optional()
});

function sanitizeForIlike(value: string) {
  return value.replace(/[%_]/g, '').trim();
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const { page, pageSize } = parsePagination(searchParams);
    const filters = testimonialsQuerySchema.parse({
      isFeatured: searchParams.get('isFeatured') ?? undefined,
      search: searchParams.get('search') ?? undefined
    });
    const { from, to } = rangeFromPagination(page, pageSize);
    const supabase = createSupabaseServerClient();

    let query = supabase
      .from('testimonials')
      .select('*', { count: 'exact' })
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (searchParams.has('isFeatured')) {
      query = query.eq('is_featured', filters.isFeatured);
    }

    if (filters.search) {
      const term = sanitizeForIlike(filters.search);
      query = query.or(`author_name.ilike.%${term}%,content.ilike.%${term}%`);
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

export async function POST(request: NextRequest) {
  const owner = await requireOwner();
  if (owner.errorResponse) return owner.errorResponse;

  try {
    const body = testimonialCreateSchema.parse(await readJsonBody(request));
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.from('testimonials').insert(body).select('*').single();

    if (error) throw error;
    return apiSuccess(data, { created: true });
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

export async function PATCH(request: NextRequest) {
  const owner = await requireOwner();
  if (owner.errorResponse) return owner.errorResponse;

  try {
    const { id, ...updates } = testimonialUpdateSchema.parse(await readJsonBody(request));
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from('testimonials')
      .update(updates)
      .eq('id', id)
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

export async function DELETE(request: NextRequest) {
  const owner = await requireOwner();
  if (owner.errorResponse) return owner.errorResponse;

  try {
    const searchId = request.nextUrl.searchParams.get('id');
    const body = searchId ? { id: searchId } : await readJsonBody(request);
    const { id } = deleteByIdSchema.parse(body);
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from('testimonials').delete().eq('id', id);

    if (error) throw error;
    return apiSuccess({ id, deleted: true });
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
