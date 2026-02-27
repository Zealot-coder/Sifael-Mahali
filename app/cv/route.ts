import { NextResponse } from 'next/server';
import { createSupabaseServiceRoleClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

function isHttpUrl(value: string) {
  return value.startsWith('http://') || value.startsWith('https://');
}

function parseSupabaseUri(value: string) {
  if (!value.startsWith('supabase://')) return null;
  const withoutScheme = value.replace('supabase://', '');
  const slashIndex = withoutScheme.indexOf('/');
  if (slashIndex <= 0) return null;
  return {
    bucket: withoutScheme.slice(0, slashIndex),
    path: withoutScheme.slice(slashIndex + 1)
  };
}

export async function GET() {
  try {
    const supabase = createSupabaseServiceRoleClient();

    const [{ data: profile }, { data: settings }] = await Promise.all([
      supabase
        .from('profiles')
        .select('cv_url')
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle(),
      supabase.from('site_settings').select('key, value').eq('key', 'cv_storage_path').maybeSingle()
    ]);

    const profileCv = profile?.cv_url ?? '';
    const settingCv =
      settings && typeof settings.value === 'string' ? settings.value : '';
    const candidate = (profileCv || settingCv || '').trim();

    if (!candidate) {
      return NextResponse.json(
        {
          ok: false,
          error: 'CV is not configured yet.'
        },
        { status: 404 }
      );
    }

    if (isHttpUrl(candidate)) {
      return NextResponse.redirect(candidate, { status: 302 });
    }

    const parsed = parseSupabaseUri(candidate);
    const bucket = parsed?.bucket || process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'portfolio-assets';
    const path = parsed?.path || candidate;

    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 60);
    if (error || !data?.signedUrl) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Unable to generate CV download link.'
        },
        { status: 404 }
      );
    }

    return NextResponse.redirect(data.signedUrl, { status: 302 });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: 'CV download route failed.'
      },
      { status: 500 }
    );
  }
}
