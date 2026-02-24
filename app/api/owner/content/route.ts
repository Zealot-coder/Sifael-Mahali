import { NextRequest, NextResponse } from 'next/server';
import type { PortfolioContent } from '@/content/content';
import { isOwnerAuthenticated } from '@/lib/owner-auth';
import {
  getContentStorageMode,
  getPortfolioContent,
  savePortfolioContent
} from '@/lib/portfolio-store';

export const runtime = 'nodejs';

function unauthorized() {
  return NextResponse.json(
    {
      ok: false,
      error: 'Unauthorized'
    },
    { status: 401 }
  );
}

export async function GET(request: NextRequest) {
  if (!isOwnerAuthenticated(request)) return unauthorized();

  const content = await getPortfolioContent();
  return NextResponse.json({
    ok: true,
    storage: getContentStorageMode(),
    content
  });
}

export async function PUT(request: NextRequest) {
  if (!isOwnerAuthenticated(request)) return unauthorized();

  try {
    const body = (await request.json()) as { content?: PortfolioContent };
    if (!body.content || typeof body.content !== 'object') {
      return NextResponse.json(
        {
          ok: false,
          error: 'Invalid content payload.'
        },
        { status: 400 }
      );
    }

    const result = await savePortfolioContent(body.content);
    return NextResponse.json({
      ok: true,
      storage: result.storage
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: 'Unable to save content.'
      },
      { status: 500 }
    );
  }
}
