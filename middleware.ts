import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getSupabaseUserForMiddleware } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { response, user } = await getSupabaseUserForMiddleware(request);
  const { pathname } = request.nextUrl;
  const isOwnerRoute = pathname.startsWith('/owner');
  const isOwnerLoginRoute = pathname === '/owner/login';

  if (!isOwnerRoute) {
    return response;
  }

  if (isOwnerLoginRoute) {
    if (!user) return response;

    const nextUrl = request.nextUrl.clone();
    nextUrl.pathname = '/owner';
    nextUrl.search = '';
    return NextResponse.redirect(nextUrl);
  }

  if (user) {
    return response;
  }

  const nextUrl = request.nextUrl.clone();
  nextUrl.pathname = '/owner/login';
  nextUrl.search = `next=${encodeURIComponent(pathname)}`;
  return NextResponse.redirect(nextUrl);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
};
