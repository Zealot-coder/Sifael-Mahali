'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';

let browserClient: ReturnType<typeof createBrowserClient<Database, 'public'>> | undefined;

function validateSupabaseUrl(url: string) {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error('Invalid NEXT_PUBLIC_SUPABASE_URL. Use your project API URL.');
  }

  const isDashboardUrl =
    parsed.host === 'supabase.com' && parsed.pathname.startsWith('/dashboard/');

  if (isDashboardUrl) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL is using a dashboard URL. Use your project URL like https://<project-ref>.supabase.co'
    );
  }
}

function getPublicSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }

  validateSupabaseUrl(url);

  return { url, anonKey };
}

export function createSupabaseBrowserClient() {
  if (browserClient) return browserClient;

  const { url, anonKey } = getPublicSupabaseEnv();
  browserClient = createBrowserClient<Database, 'public'>(url, anonKey);
  return browserClient;
}
