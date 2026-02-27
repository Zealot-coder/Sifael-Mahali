'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';

let browserClient: ReturnType<typeof createBrowserClient<Database, 'public'>> | undefined;

function getPublicSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }

  return { url, anonKey };
}

export function createSupabaseBrowserClient() {
  if (browserClient) return browserClient;

  const { url, anonKey } = getPublicSupabaseEnv();
  browserClient = createBrowserClient<Database, 'public'>(url, anonKey);
  return browserClient;
}
