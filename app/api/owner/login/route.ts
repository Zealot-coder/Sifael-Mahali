import { type NextRequest, NextResponse } from 'next/server';
import {
  createOwnerSessionToken,
  getOwnerSessionCookieMaxAge,
  hasOwnerPasswordConfigured,
  isOwnerPasswordValid,
  OWNER_SESSION_COOKIE
} from '@/lib/owner-auth';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  if (!hasOwnerPasswordConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error: 'OWNER_PASSWORD is not configured.'
      },
      { status: 503 }
    );
  }

  try {
    const body = (await request.json()) as { password?: string };
    const password = body.password?.trim() ?? '';

    if (!password || !isOwnerPasswordValid(password)) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Invalid credentials.'
        },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set({
      name: OWNER_SESSION_COOKIE,
      value: createOwnerSessionToken(),
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: getOwnerSessionCookieMaxAge(),
      path: '/'
    });
    return response;
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: 'Unable to process login request.'
      },
      { status: 400 }
    );
  }
}
