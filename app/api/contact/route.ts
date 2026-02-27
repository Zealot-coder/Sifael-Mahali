import { type NextRequest } from 'next/server';
import { Resend } from 'resend';
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
import { createSupabaseServerClient, createSupabaseServiceRoleClient } from '@/lib/supabase/server';
import { contactMessageUpdateSchema, contactSubmitSchema } from '@/lib/validations';

export const runtime = 'nodejs';

const contactQuerySchema = z.object({
  status: z.enum(['unread', 'read', 'replied', 'archived']).optional(),
  search: z.string().min(1).max(120).optional()
});

function sanitizeForIlike(value: string) {
  return value.replace(/[%_]/g, '').trim();
}

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() ?? null;
  }
  return request.headers.get('x-real-ip');
}

async function sendContactNotificationEmail(input: {
  email: string;
  message: string;
  name: string;
  subject: string | null;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL;
  const fromEmail =
    process.env.CONTACT_FROM_EMAIL ?? 'Portfolio Contact <onboarding@resend.dev>';

  if (!apiKey || !toEmail) {
    return { attempted: false, delivered: false };
  }

  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: fromEmail,
    to: [toEmail],
    replyTo: input.email,
    subject: input.subject?.trim() || `Portfolio message from ${input.name}`,
    text: `${input.message}\n\nFrom: ${input.name} <${input.email}>`
  });

  return { attempted: true, delivered: true };
}

export async function GET(request: NextRequest) {
  const owner = await requireOwner();
  if (owner.errorResponse) return owner.errorResponse;

  try {
    const searchParams = request.nextUrl.searchParams;
    const { page, pageSize } = parsePagination(searchParams);
    const filters = contactQuerySchema.parse({
      status: searchParams.get('status') ?? undefined,
      search: searchParams.get('search') ?? undefined
    });
    const { from, to } = rangeFromPagination(page, pageSize);
    const supabase = createSupabaseServiceRoleClient();

    let query = supabase
      .from('contact_messages')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.search) {
      const term = sanitizeForIlike(filters.search);
      query = query.or(`name.ilike.%${term}%,email.ilike.%${term}%,subject.ilike.%${term}%`);
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
  try {
    const payload = contactSubmitSchema.parse(await readJsonBody(request));
    const supabase = createSupabaseServerClient();
    const ipAddress = getClientIp(request);
    const userAgent = request.headers.get('user-agent');
    const { data, error } = await supabase
      .from('contact_messages')
      .insert({
        email: payload.email,
        ip_address: ipAddress,
        message: payload.message,
        name: payload.name,
        status: 'unread',
        subject: payload.subject ?? null,
        user_agent: userAgent
      })
      .select('id, created_at')
      .single();

    if (error) throw error;

    let emailResult: { attempted: boolean; delivered: boolean } = {
      attempted: false,
      delivered: false
    };
    try {
      emailResult = await sendContactNotificationEmail({
        ...payload,
        subject: payload.subject ?? null
      });
    } catch {
      emailResult = { attempted: true, delivered: false };
    }

    return apiSuccess(
      {
        ...data,
        emailNotification: emailResult
      },
      { accepted: true }
    );
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
    const { id, ...updates } = contactMessageUpdateSchema.parse(await readJsonBody(request));
    const supabase = createSupabaseServiceRoleClient();
    const { data, error } = await supabase
      .from('contact_messages')
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
