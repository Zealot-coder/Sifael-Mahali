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
import { blogCreateSchema, blogUpdateSchema, deleteByIdSchema, slugSchema } from '@/lib/validations';

export const runtime = 'nodejs';

const blogQuerySchema = z.object({
  slug: z.string().min(1).max(200).optional(),
  tag: z.string().min(1).max(40).optional(),
  search: z.string().min(1).max(160).optional(),
  isPublished: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => value === 'true'),
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
    const filters = blogQuerySchema.parse({
      slug: searchParams.get('slug') ?? undefined,
      tag: searchParams.get('tag') ?? undefined,
      search: searchParams.get('search') ?? undefined,
      isPublished: searchParams.get('isPublished') ?? undefined,
      includeDeleted: searchParams.get('includeDeleted') ?? undefined
    });
    const ownerUser = await getOwnerSessionUser();
    const supabase = createSupabaseServerClient();

    if (filters.slug) {
      const slug = slugSchema.parse(slugify(filters.slug));
      let singleQuery = supabase.from('blog_posts').select('*').eq('slug', slug);

      if (!ownerUser) {
        singleQuery = singleQuery.eq('is_published', true).is('deleted_at', null);
      } else if (!filters.includeDeleted) {
        singleQuery = singleQuery.is('deleted_at', null);
      }

      const { data, error } = await singleQuery.maybeSingle();
      if (error) throw error;
      return apiSuccess(data ?? null);
    }

    const { page, pageSize } = parsePagination(searchParams);
    const { from, to } = rangeFromPagination(page, pageSize);
    let query = supabase
      .from('blog_posts')
      .select('*', { count: 'exact' })
      .order('published_at', { ascending: false })
      .order('created_at', { ascending: false });

    if (filters.tag) {
      query = query.contains('tags', [filters.tag]);
    }

    if (filters.search) {
      const term = sanitizeForIlike(filters.search);
      query = query.or(`title.ilike.%${term}%,excerpt.ilike.%${term}%`);
    }

    if (!ownerUser) {
      query = query.eq('is_published', true).is('deleted_at', null);
    } else {
      if (searchParams.has('isPublished')) {
        query = query.eq('is_published', filters.isPublished);
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
    const parsed = blogCreateSchema.parse({
      ...rawBody,
      slug:
        typeof rawBody.slug === 'string' && rawBody.slug.trim()
          ? slugify(rawBody.slug)
          : slugify(String(rawBody.title ?? ''))
    });
    const payload = {
      ...parsed,
      published_at:
        parsed.is_published && !parsed.published_at
          ? new Date().toISOString()
          : parsed.published_at ?? null
    };
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.from('blog_posts').insert(payload).select('*').single();

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
    const parsed = blogUpdateSchema.parse({
      ...rawBody,
      ...(typeof rawBody.slug === 'string' ? { slug: slugify(rawBody.slug) } : {})
    });
    const { deleted, id, ...updates } = parsed;
    const nextUpdates = {
      ...updates,
      ...(deleted === true ? { deleted_at: new Date().toISOString() } : {}),
      ...(deleted === false ? { deleted_at: null } : {})
    };

    if (nextUpdates.is_published === true && !nextUpdates.published_at) {
      nextUpdates.published_at = new Date().toISOString();
    }
    if (nextUpdates.is_published === false && nextUpdates.published_at === undefined) {
      nextUpdates.published_at = null;
    }

    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from('blog_posts')
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
    const searchId = request.nextUrl.searchParams.get('id');
    const body = searchId ? { id: searchId } : await readJsonBody(request);
    const { id } = deleteByIdSchema.parse(body);
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from('blog_posts')
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
