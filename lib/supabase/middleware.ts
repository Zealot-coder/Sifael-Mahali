import { type CookieOptions, createServerClient } from '@supabase/ssr';
import type { User } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import type { Database } from '@/types/supabase';

interface MiddlewareSessionResult {
  response: NextResponse;
  user: User | null;
  envMissing: boolean;
}

export async function getSupabaseUserForMiddleware(
  request: NextRequest
): Promise<MiddlewareSessionResult> {
  const fallbackResponse = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Fail open so missing env does not take down the entire app at middleware level.
  if (!url || !anonKey) {
    return {
      response: fallbackResponse,
      user: null,
      envMissing: true
    };
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

    const {
      data: { user }
    } = await supabase.auth.getUser();

    return {
      response,
      user,
      envMissing: false
    };
  } catch {
    return {
      response: fallbackResponse,
      user: null,
      envMissing: false
    };
  }
}

export async function updateSupabaseSession(request: NextRequest) {
  const { response } = await getSupabaseUserForMiddleware(request);
  return response;
}
