import { type CookieOptions, createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import type { Database } from '@/types/supabase';

export async function updateSupabaseSession(request: NextRequest) {
  const fallbackResponse = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Fail open so missing env does not take down the entire app at middleware level.
  if (!url || !anonKey) {
    return fallbackResponse;
  }

  let response = fallbackResponse;

  try {
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
  } catch {
    return fallbackResponse;
  }
}
