import { type NextRequest } from 'next/server';
import { z } from 'zod';
import {
  apiError,
  apiSuccess,
  buildPaginationMeta,
  getOwnerSessionUser,
  normalizeError,
  parsePagination,
  rangeFromPagination,
  readJsonBody,
  requireOwner,
  statusFromErrorCode
} from '@/lib/api';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { slugify } from '@/lib/utils/slugify';
import { deleteByIdSchema, projectCreateSchema, projectUpdateSchema } from '@/lib/validations';

export const runtime = 'nodejs';

const projectsQuerySchema = z.object({
  category: z.string().min(1).max(40).optional(),
  search: z.string().min(1).max(120).optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  includeDeleted: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => value === 'true')
});

function sanitizeForIlike(value: string) {
  return value.replace(/[%_]/g, '').trim();
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const { page, pageSize } = parsePagination(searchParams);
    const filters = projectsQuerySchema.parse({
      category: searchParams.get('category') ?? undefined,
      search: searchParams.get('search') ?? undefined,
      status: searchParams.get('status') ?? undefined,
      includeDeleted: searchParams.get('includeDeleted') ?? undefined
    });
    const { from, to } = rangeFromPagination(page, pageSize);
    const ownerUser = await getOwnerSessionUser();
    const supabase = createSupabaseServerClient();

    let query = supabase
      .from('projects')
      .select('*', { count: 'exact' })
      .order('is_pinned', { ascending: false })
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (filters.category) {
      query = query.contains('categories', [filters.category]);
    }

    if (filters.search) {
      const term = sanitizeForIlike(filters.search);
      query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%`);
    }

    if (!ownerUser) {
      query = query.eq('status', 'published').is('deleted_at', null);
    } else {
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (!filters.includeDeleted) {
        query = query.is('deleted_at', null);
      }
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
    const rawBody = await readJsonBody(request);
    const payload = projectCreateSchema.parse({
      ...rawBody,
      slug:
        typeof rawBody.slug === 'string' && rawBody.slug.trim()
          ? slugify(rawBody.slug)
          : slugify(String(rawBody.title ?? ''))
    });
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.from('projects').insert(payload).select('*').single();

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
    const rawBody = await readJsonBody(request);
    const parsed = projectUpdateSchema.parse({
      ...rawBody,
      ...(typeof rawBody.slug === 'string' ? { slug: slugify(rawBody.slug) } : {})
    });
    const { deleted, id, ...updates } = parsed;
    const nextUpdates = {
      ...updates,
      ...(deleted === true ? { deleted_at: new Date().toISOString() } : {}),
      ...(deleted === false ? { deleted_at: null } : {})
    };
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from('projects')
      .update(nextUpdates)
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
    const queryId = request.nextUrl.searchParams.get('id');
    const rawBody = queryId ? { id: queryId } : await readJsonBody(request);
    const { id } = deleteByIdSchema.parse(rawBody);
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from('projects')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .select('id, deleted_at')
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
