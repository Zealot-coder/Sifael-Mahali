import { type NextRequest } from 'next/server';
import {
  apiError,
  apiSuccess,
  normalizeError,
  readJsonBody,
  requireOwner,
  statusFromErrorCode
} from '@/lib/api';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { idSchema, profileUpdateSchema } from '@/lib/validations';
import type { Database } from '@/types/supabase';

export const runtime = 'nodejs';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

async function getFirstProfileId() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data?.id ?? null;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    const requestedId = request.nextUrl.searchParams.get('id');

    if (requestedId) {
      const id = idSchema.parse(requestedId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle<ProfileRow>();

      if (error) throw error;
      return apiSuccess(data ?? null);
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle<ProfileRow>();

    if (error) throw error;
    return apiSuccess(data ?? null);
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

async function updateProfile(request: NextRequest) {
  const owner = await requireOwner();
  if (owner.errorResponse) return owner.errorResponse;

  try {
    const body = await readJsonBody(request);
    const requestedId = typeof body.id === 'string' ? body.id : request.nextUrl.searchParams.get('id');
    const updates = profileUpdateSchema.parse(body);
    const targetId = requestedId ? idSchema.parse(requestedId) : await getFirstProfileId();

    if (!targetId) {
      return apiError(404, 'NOT_FOUND', 'No profile record exists yet.');
    }

    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', targetId)
      .select('*')
      .single<ProfileRow>();

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

export async function PATCH(request: NextRequest) {
  return updateProfile(request);
}

export async function PUT(request: NextRequest) {
  return updateProfile(request);
}
