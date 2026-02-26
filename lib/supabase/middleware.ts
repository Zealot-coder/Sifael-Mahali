import { type CookieOptions, createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import type { Database } from '@/types/supabase';

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export async function updateSupabaseSession(request: NextRequest) {
  let response = NextResponse.next({
    request
  });

  const url = getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL');
  const anonKey = getRequiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({
          request
        });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: '', ...options });
        response = NextResponse.next({
          request
        });
        response.cookies.set({ name, value: '', ...options, maxAge: 0 });
      }
    }
  });

  await supabase.auth.getUser();
  return response;
}
