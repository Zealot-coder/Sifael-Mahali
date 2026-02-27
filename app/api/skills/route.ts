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
import { deleteByIdSchema, skillCreateSchema, skillUpdateSchema } from '@/lib/validations';

export const runtime = 'nodejs';

const skillsQuerySchema = z.object({
  category: z.string().min(1).max(80).optional(),
  isFeatured: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => value === 'true'),
  search: z.string().min(1).max(80).optional()
});

function sanitizeForIlike(value: string) {
  return value.replace(/[%_]/g, '').trim();
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const { page, pageSize } = parsePagination(searchParams);
    const filters = skillsQuerySchema.parse({
      category: searchParams.get('category') ?? undefined,
      isFeatured: searchParams.get('isFeatured') ?? undefined,
      search: searchParams.get('search') ?? undefined
    });
    const { from, to } = rangeFromPagination(page, pageSize);
    const supabase = createSupabaseServerClient();

    let query = supabase
      .from('skills')
      .select('*', { count: 'exact' })
      .order('category', { ascending: true })
      .order('display_order', { ascending: true })
      .order('name', { ascending: true });

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (searchParams.has('isFeatured')) {
      query = query.eq('is_featured', filters.isFeatured);
    }

    if (filters.search) {
      const term = sanitizeForIlike(filters.search);
      query = query.or(`name.ilike.%${term}%,category.ilike.%${term}%`);
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
    const body = skillCreateSchema.parse(await readJsonBody(request));
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.from('skills').insert(body).select('*').single();

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
    const { id, ...updates } = skillUpdateSchema.parse(await readJsonBody(request));
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from('skills')
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
    const { error } = await supabase.from('skills').delete().eq('id', id);

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
