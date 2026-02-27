import 'server-only';

import { type CookieOptions, createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

function createCookieAdapter() {
  const cookieStore = cookies();

  return {
    get(name: string) {
      return cookieStore.get(name)?.value;
    },
    set(name: string, value: string, options: CookieOptions) {
      try {
        cookieStore.set({ name, value, ...options });
      } catch {
        // Server Components cannot always write cookies; middleware refreshes auth state.
      }
    },
    remove(name: string, options: CookieOptions) {
      try {
        cookieStore.set({ name, value: '', ...options, maxAge: 0 });
      } catch {
        // Server Components cannot always write cookies; middleware refreshes auth state.
      }
    }
  };
}

export function createSupabaseServerClient() {
  const url = getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL');
  const anonKey = getRequiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

  return createServerClient<Database, 'public'>(url, anonKey, {
    cookies: createCookieAdapter()
  }) as ReturnType<typeof createServerClient>;
}

export function createSupabaseServiceRoleClient() {
  const url = getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL');
  const serviceRoleKey = getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY');

  return createServerClient<Database, 'public'>(url, serviceRoleKey, {
    cookies: {
      get() {
        return undefined;
      },
      set() {},
      remove() {}
    }
  }) as ReturnType<typeof createServerClient>;
}
